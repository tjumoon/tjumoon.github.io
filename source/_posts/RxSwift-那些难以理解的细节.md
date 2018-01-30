---
title: 【转载】RxSwift-那些难以理解的细节
date: 2018-01-30 18:44:53
tags:
	- RxSwift
	- Swift
---



> 此文转载至【[田腾飞的博客](http://www.codertian.com/2016/12/01/RxSwift-ru-keng-ji-learn-the-difficulty/)】

上一篇文章[RxSwift-各种概念解读](http://simonblog.cn/2018/01/30/RxSwift-%E4%BD%A0%E6%89%80%E9%9C%80%E8%A6%81%E7%9F%A5%E9%81%93%E7%9A%84%E5%90%84%E7%A7%8D%E6%A6%82%E5%BF%B5/)内容比较多，文章简直是太长了，我都难以坚持看下去😂，建议大家粗略读一遍就行了，用到的时候来查一下，慢慢地就掌握了。

这篇文章接着[上篇](http://simonblog.cn/2018/01/30/RxSwift-%E4%BD%A0%E6%89%80%E9%9C%80%E8%A6%81%E7%9F%A5%E9%81%93%E7%9A%84%E5%90%84%E7%A7%8D%E6%A6%82%E5%BF%B5/)文章，主要来深入了解一些RxSwift实战中用到的一些重要知识点，这里面有很多自己的理解和思考，包含很多网上几乎收不到的内容，希望会是大家研究官方例子的一个重要参考资料，文章中不免会有些错误的地方，也请大家能多多留言交流，一起成长。这两篇文章过后，准备写实战教程，希望大家多多关注吧。let’s go

Rx系列的核心就是Observable Sequence这个相信大家心中已经有所了解了，这里不再啰嗦了，建议大家看看我都上一篇文章去了解一下。

## Disposing

当监听一个事件序列的时候，有消息事件来了，我们做某些事情。但是这个事件序列不再发出消息了，我们的监听也就没有什么存在价值了，所以我们需要释放我们这些监听资源，其实也就是每种编程语言中的内存资源释放。OC和Swift中也一样，在你不需要用某些变量的时候，你需要把这些变量所占用的内存空间释放掉。

释放某一个监听的时候我们可以手动调用释放方法，但是这个貌似一般不常用：

```swift
// 关于scheduler，我们会在下面讲到
let subscription = Observable<Int>.interval(0.3, scheduler: SerialDispatchQueueScheduler.init(internalSerialQueueName: "test"))
    .observeOn(MainScheduler.instance)	//observeOn也会在下面讲到
    .subscribe { event in
        print(event)
}
    
Thread.sleep(forTimeInterval: 2.0)
    
subscription.dispose()
```

```swift
next(0)
next(1)
next(2)
next(3)
next(4)
next(5)
```

比如上面这个例子，我们创建了一个subscription监听，在两秒以后我们不需要了，手动调用`dispose()`方法，就能释放监听资源，不再打印信息。上面的subscription不伦是在哪个线程中监听，就算在主线程中调用的`dispose()`方法一样会销毁资源。

## Dispose Bag

除了上面手动的方法，还有一种是自动的方式，推荐大家使用这种方式，这种方式就好像iOS中的ARC方式似得，会自动去释放资源。

```swift
let disposeBag = DisposeBag()
   
Observable<Int>.empty()
   .subscribe { event in
       print(event)
   }
   .addDisposableTo(disposeBag)
```

如上个例子，我们创建一个disposeBag来盛放我们需要管理的资源，然后把新建的监听都放进去，会在适当的时候销毁这些资源。如果你需要立即释放资源只需要新建一个DisposeBag()，那么上一个DisposeBag就会被销毁。

## observeOn()和subscribeOn()

这两个东西可能很多人看官方文档说的一头雾水，就知道最好多用observeOn()，但说明不了为啥。下面咱们就谈谈这俩货到底有啥区别。

区别其实我感觉其实就一句话，subscribeOn()设置起点在哪个线程，observeOn()设置了后续工作在哪个线程。例如：

```swift
someObservable 
    .doOneThing() 1
    .observeOn(MainRouteScheduler.instance) 2
    .subscribeOn(OtherScheduler.instance) 3
    .subscribeNext { 4
    	......
    }
    .addDisposableTo(disposeBag)
```

1. 所有动作都发生在当前的默认线程
2. observeOn转换线程到主线程，下面所有的操作都是在主线程中
3. subscribeOn规定动作一开始不是发生在默认线程了，而是在OtherScheduler了。
4. 如果我们之前没有调用observeOn，那么这边会在OtherScheduler发生，但是我们前面调用了observeOn，所以这个动作会在主线程中调用。

总结一下：subscribeOn只是影响事件链开始默认的线程，而observeOn规定了下一步动作发生在哪个线程中。

## shareReplay

可能你看官方demo的时候，会有迷惑，为啥很多序列后面会有shareReplay(1)呢？，想的头昏脑胀的。
请先看下面例子：

```swift
let testReplay = Observable.just("😂")
    .map {  print($0) }
    
testReplay
    .subscribe { event in
        print(event)
}.addDisposableTo(disposeBag)
    
testReplay
    .subscribe { event in
        print(event)
}.addDisposableTo(disposeBag)
```

```swift
😂
next(())
completed
😂
next(())
completed
```

大家发现没，map函数执行了两遍，但是有些时候我不需要map函数里的东西执行两遍，比如map函数里面如果执行的是网络请求，我只需要一次请求结果供大家使用就行了，多余的请求没啥用，浪费时间。所以这时候就需要shareReplay(1)了。这里面的数字一般都是1，只执行一次。你可以改为2，3看看结果有啥不同哦。

```swift
let testReplay = Observable.just("😂")
    .map {  print($0) }
    .shareReplay(1)
    
testReplay
    .subscribe { event in
        print(event)
}.addDisposableTo(disposeBag)
    
testReplay
    .subscribe { event in
        print(event)
}.addDisposableTo(disposeBag)
```

```swift
😂 //只执行了一次
next(())
completed
next(())
completed
```

## 自定义operator

自定义操作符很简单，官方推荐尽量用标准的操作符，但是你也可以自定义自己的操作符，文档上说有两种方法，这里我们只说一下最常用的一种方法。

例如我们自定义一个map操作符：

```swift
extension ObservableType {
    func myMap<R>(transform: E -> R) -> Observable<R> {
        return Observable.create { observer in
            let subscription = self.subscribe { e in
                    switch e {
                    case .next(let value):
                        let result = transform(value)
                        observer.on(.next(result))
                    case .error(let error):
                        observer.on(.error(error))
                    case .completed:
                        observer.on(.completed)
                    }
                }

            return subscription
        }
    }
}
```

参数是一个闭包，其中闭包参数是E类型返回值是R类型，map函数的返回值是一个Observable类型。

## Driver

Driver是啥东东？Driver功能很吊，讲解Driver之前我们现在看看下面的例子。

```swift
let results = query.rx.text
    .throttle(0.3, scheduler: MainScheduler.instance)
    .flatMapLatest { query in
        fetchAutoCompleteItems(query)
    }

results
    .map { "\($0.count)" }
    .bindTo(resultCount.rx.text)
    .addDisposableTo(disposeBag)

results
    .bindTo(resultsTableView.rx.items(cellIdentifier: "Cell")) { (_, result, cell) in
        cell.textLabel?.text = "\(result)"
    }
    .addDisposableTo(disposeBag)
```

- 首先创建一个可监听序列results，其中flatMapLatest怎么用我们下面讲
- 然后将results绑定到resultCount.rx.text上
- 将results绑定到resultsTableView上

上面程序会有下面几个异常情况

1. 如果上面fetchAutoCompleteItems出错了，那么他绑定的UI将不再收到任何事件消息
2. 如果上面fetchAutoCompleteItems是在后台某个线程中运行的，那么事件绑定也是发生在后台某个线程，这样更新UI的时候会造成crash
3. 有两次绑定fetchAutoCompleteItems会执行两次

当然针对上面问题我们也有解决方案，我们可以使用神器shareReplay(1)保证不会执行两次，可以使用observeOn()保证后面所有操作在主线程完成。

```swift
let results = query.rx.text
    .throttle(0.3, scheduler: MainScheduler.instance)
    .flatMapLatest { query in
        fetchAutoCompleteItems(query)
            .observeOn(MainScheduler.instance)
            .catchErrorJustReturn([])           
    }
    .shareReplay(1)                             

results
    .map { "\($0.count)" }
    .bindTo(resultCount.rx.text)
    .addDisposableTo(disposeBag)

results
    .bindTo(resultTableView.rx.items(cellIdentifier: "Cell")) { (_, result, cell) in
        cell.textLabel?.text = "\(result)"
    }
    .addDisposableTo(disposeBag)
```

但是你也可以使用Driver

```swift
let results = query.rx.text.asDriver()	//转换成一个Driver序列
    .throttle(0.3, scheduler: MainScheduler.instance)
    .flatMapLatest { query in
        fetchAutoCompleteItems(query)
            .asDriver(onErrorJustReturn: [])  //当遇见错误需要返回什么
    }	//不需要添加shareReplay(1)

results
    .map { "\($0.count)" }
    .drive(resultCount.rx.text)	//和bingTo()功能一样
    .addDisposableTo(disposeBag) 
                                             
results
    .drive(resultTableView.rx.items(cellIdentifier: "Cell")) { (_, result, cell) in
        cell.textLabel?.text = "\(result)"
    }
    .addDisposableTo(disposeBag)
```

drive方法只能在Driver序列中使用，Driver有以下特点：1 Driver序列不允许发出error，2 Driver序列的监听只会在主线程中。所以Driver是转为UI绑定量身打造的东西。以下情况你可以使用Driver替换BindTo:

1. 不能发出error
2. 在主线程中监听
3. 共享事件流

## map和flatMap何时使用

大家看官方Demo的时候，可能会迷惑为啥有的地方使用flatMapLatest为啥有些地方使用map呢？比如上面那个Driver所用的例子。

map函数，接受一个R类型的序列，返回一个R类型的序列，还是原来的序列

```swift
public func map<R>(_ transform: @escaping (Self.E) throws -> R) -> RxSwift.Observable<R>
```

flatMap函数，接收一个O类型的序列，返回一个O.E类型的序列，也就是有原来序列里元素组成的新序列。

```swift
public func flatMap<O : ObservableConvertibleType>(_ selector: @escaping (Self.E) throws -> O) -> RxSwift.Observable<O.E>
```

其实这里的map和flatMap在swift中的作用是一样的。map函数可以对原有序列里面的事件元素进行改造，返回的还是原来的序列。而flatMap对原有序列中的元素进行改造和处理，每一个元素返回一个新的sequence，然后把每一个元素对应的sequence合并为一个新的sequence序列。

看下面例子：

```swift
let test = Observable.of("1", "2", "3", "4", "5")
    .map { $0 + "TTF" }
    
test
    .subscribe(onNext: {
        print($0)
    })
    .addDisposableTo(disposeBag)
```

```swift
1TTF
2TTF
3TTF
4TTF
5TTF
```

我们使用map对序列中每一个元素进行了处理，返回的是一个元素，而使用flatMap需要返回的序列。那么使用map也返回一个序列看看。

```swift
let test = Observable.of("1", "2", "3", "4", "5")
    .map { Observable.just($0) }

test
    .subscribe(onNext: {
        print($0)
    })
    .addDisposableTo(disposeBag)
```

```swift
RxSwift.Just<Swift.String>
RxSwift.Just<Swift.String>
RxSwift.Just<Swift.String>
RxSwift.Just<Swift.String>
RxSwift.Just<Swift.String>
```

看到结果会打印出每一个序列，下面我们使用merge()方法将这几个序列进行合并

```swift
let test = Observable.of("1", "2", "3", "4", "5")
    .map { Observable.just($0) }
    .merge()
    
test
    .subscribe(onNext: {
        print($0)
    })
    .addDisposableTo(disposeBag)
```

```swift
1
2
3
4
5
```

合并为一个新序列后我们就可以正常打印元素了。下面看看使用faltMap()函数干这件事

```swift
let test = Observable.of("1", "2", "3", "4", "5")
    .flatMap { Observable.just($0) }
    
test
    .subscribe(onNext: {
        print($0)
    })
    .addDisposableTo(disposeBag)
```

```swift
1
2
3
4
5
```

看下对比是不是一样，这样子对比就清晰了吧。

- map函数只能返回原来的那一个序列，里面的参数的返回值被当做原来序列中所对应的元素。
- flatMap函数返回的是一个新的序列，将原来元素进行了处理，返回这些处理后的元素组成的新序列
- map函数 + 合并函数 = flatMap函数

flatMap函数在实际应用中有很多地方需要用到，比如网络请求，网络请求可能会发生错误，我们需要对这个请求过程进行监听，然后处理错误。只要继续他返回的是一个新的序列。

```swift
validatedUsername = input.username
            .flatMapLatest { username in
                return validationService.validateUsername(username)
                    .observeOn(MainScheduler.instance)
                    .catchErrorJustReturn(.failed(message: "Error contacting server"))
            }
            .shareReplay(1)
```

flatMapLatest其实就是flatMap的另一个方式，只发送最后一个合进来的序列事件。上面认证username是一个网络请求，我们需要对这个过程进行处理。

```swift
validatedPassword = input.password
    .map { password in
        return validationService.validatePassword(password)
    }
    .shareReplay(1)
```

这个password不需要后台联网认证，只需要返回password符合不符合要求就行了，还是原来的序列就行了。

flatMap也解决了内嵌多个subscribe的问题，官方不建议内嵌多个subscribe。比如：

```swift
textField.rx_text.subscribe(onNext: { text in
    performURLRequest(text).subscribe(onNext: { result in
        ...
    })
    .addDisposableTo(disposeBag)
})
.addDisposableTo(disposeBag)
```

改写为flatMap

```swift
textField.rx_text
    .flatMapLatest { text in
        return performURLRequest(text) //因为flatMap返回一个新的sequence
    }
    ...
    .addDisposableTo(disposeBag)
```

再举一个例子，当我们网络请求得到json数据的时候，我们可以使用flatmap进行序列转换，解析成Model序列，然后我们订阅这个带有Model的序列，代码就会变得很优雅。具体可以参考文章[Moya+RxSwift进行更优雅的网络请求](http://www.codertian.com/2016/12/01/RxSwift-ru-keng-ji-learn-the-difficulty/)

好了，相信大家对这俩货有了一个清晰的认识了吧。

## UIBindingObserver

UIBindingObserver这个东西很有用的，创建我们自己的监听者，有时候RxCocoa(RxSwiftz中对UIKit的一个扩展库)给的扩展不够我们使用，比如一个UITextField有个isEnabled属性，我想把这个isEnabled变为一个observer，我们可以这样做：

```swift
extension Reactive where Base: UITextField {
    var inputEnabled: UIBindingObserver<Base, Result> {
        return UIBindingObserver(UIElement: base) { textFiled, result in
            textFiled.isEnabled = result.isValid
        }
    }
}
```

UIBindingObserver是一个类，他的初始化方法中，有两个参数，第一个参数是一个元素本身，第一个参数是一个闭包，闭包参数是元素本身，还有他的一个属性。

```swift
public init(UIElement: UIElementType, binding: @escaping (UIElementType, Value) -> Swift.Void)
```

自定义了一个inputEnabled Observer里面关联的UITextField的isEnabled属性。

好了，文章到这里也差不多了，这篇文章中没有实战教程，但绝对都是干货，也许在你专研官方demo的时候看不懂某个写法，看了这篇文章你就会豁然开朗了呢？🙄