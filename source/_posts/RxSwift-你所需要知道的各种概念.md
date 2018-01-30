---
title: 【转载】RxSwift-你所需要知道的各种概念
date: 2018-01-30 16:50:18
tags: RxSwift | Swift
---



> 此文转载至【[田腾飞的博客](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/)】



相信大家很早就听说过函数式响应编程概念，我是去年面试的时候接触到函数式响应编程的，当时也是第一次接触到MVVM这个概念，转眼都一年过去了，我却没有在函数式响应编程上做深入的研究，说来还真是惭愧。

不过最近由于想要使用RxSwift，所以趁这个时候好好接触和研究一下传说中的函数式响应编程，由于网上关于RxSwift的教程资料很少，这篇文章其实就是最RxSwift官方文档和一些概念做一些解读。算是大家学习的参考文章吧！ **先挖个坑，这可能会是一个RxSwift系列，希望大家在学习的时候有所参考。**

## RxSwift是什么

RxSwif是[ReactiveX](http://reactivex.io/)的Swift版本，也就是一个函数式响应编程的框架。对，就这一句话。想要知道他做什么的，我们先来了解一下观察者模式。

## 观察者模式

关于观察者模式我想大伙应该都很了解了吧，什么KVO，通知等都是观察者模式，在设计模式中他可是一个重中之重的设计模式啊！比如一个宝宝在睡觉，爸爸妈妈，爷爷奶奶总不能在那边一只看着吧？那样子太累了。他们该做啥事就做啥事呗，只要听到宝宝的哭声，他们就给宝宝喂奶就行了。这就是一个典型的观察者模式。宝宝是被观察者，爸爸妈妈等是观察者也称作订阅者，只要被观察者发出了某些事件比如宝宝哭声、叫声都是一个事件，通知到订阅者，订阅者们就可以做相应的处理工作。哈哈，观察者模式很简单吧？

## RxSwift做了什么

RxSwift把我们程序中每一个操作都看成一个事件，比如一个TextField中的文本改变，一个按钮被点击，或者一个网络请求结束等，每一个事件源就可以看成一个管道，也就是sequence，比如TextField，当我们改变里面的文本的时候，这个TextField就会不断的发出事件，从他的这个sequence中不断的流出，我们只需要监听这个sequence，每流出一个事件就做相应的处理。同理，Button也是一个sequence，每点击一次就流出一个事件。也就是我们把每一步都想成是一个事件就好去理解RxSwift了。看下图是不是很好理解了？
[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/sequence.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/sequence.png)

## Observable和Observer

理解了观察者模式这两个概念就很好理解了，Observable就是可被观察的，也就是我们说的宝宝，他也是事件源。而Observer就是我们的观察者，也就是当收到事件的时候去做某些处理的爸爸妈妈。观察者需要去订阅(subscribe)被观察者，才能收到Observable的事件通知消息。

**下面开始一些基本概念解读，通读一遍你会对RxSwift有非常深刻的认识了，其实也就是对整理了一下官方文档和加上自己的一些理解**

## 创建和订阅被观察者

下面创建被观察者其实就是创建一个Obserable的sequence，就是创建一个流，然后就可以被订阅subscribe，这样被观察者发出事件消息，我们就能做相应的处理

### DisposeBag

DisposeBag其实就相当于iOS中的ARC，会在适当的时候销毁观察者，相当于内存管理者吧。

### subscribe

subscribe是订阅sequence发出的事件，比如next事件，error事件等。而subscribe(onNext:)是监听sequence发出的next事件中的element进行处理，他会忽略error和completed事件。相对应的还有subscribe(onError:) 和 subscribe(onCompleted:)

### never

never就是创建一个sequence，但是不发出任何事件信号。

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/never.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/never.png)

```swift
let disposeBag = DisposeBag()
let neverSequence = Observable<String>.never()
    
let neverSequenceSubscription = neverSequence
    .subscribe { _ in
        print("This will never be printed")
}.addDisposableTo(disposeBag)
```

```
结果是什么都不打印
```

### empty

empty就是创建一个空的sequence,只能发出一个completed事件

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/empty.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/empty.png)

```swift
let disposeBag = DisposeBag()
   
   Observable<Int>.empty()
       .subscribe { event in
           print(event)
       }
       .addDisposableTo(disposeBag)
```

```
completed
```

### just

just是创建一个sequence只能发出一种特定的事件，能正常结束

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/just.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/just.png)

```swift
let disposeBag = DisposeBag()
    
Observable.just("🔴")
    .subscribe { event in
        print(event)
    }
    .addDisposableTo(disposeBag)
```

```
next(🔴)
completed
```

### of

of是创建一个sequence能发出很多种事件信号

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐶", "🐱", "🐭", "🐹")
    .subscribe(onNext: { element in
        print(element)
    })
    .addDisposableTo(disposeBag)
```

```
🐶
🐱
🐭
🐹
```

如果把上面的onNext:去掉的话，结果会是这样子，也正好对应了我们subscribe中，subscribe只监听事件。

```
next(🐶)
next(🐱)
next(🐭)
next(🐹)
completed
```

### from

from就是从集合中创建sequence，例如数组，字典或者Set

```
let disposeBag = DisposeBag()
    
Observable.from(["🐶", "🐱", "🐭", "🐹"])
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

### create

我们也可以自定义可观察的sequence，那就是使用create

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/create.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/create.png)

create操作符传入一个观察者observer，然后调用observer的onNext，onCompleted和onError方法。返回一个可观察的obserable序列。

```swift
let disposeBag = DisposeBag()
    
let myJust = { (element: String) -> Observable<String> in
    return Observable.create { observer in
        observer.on(.next(element))
        observer.on(.completed)
        return Disposables.create()
    }
}
    
myJust("🔴")
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

```swift
next(🔴)
completed
```

### range

range就是创建一个sequence，他会发出这个范围中的从开始到结束的所有事件

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/range.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/range.png)

```swift
let disposeBag = DisposeBag()
    
Observable.range(start: 1, count: 10)
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

```swift
next(1)
next(2)
next(3)
next(4)
next(5)
next(6)
next(7)
next(8)
next(9)
next(10)
completed
```

### repeatElement

创建一个sequence，发出特定的事件n次

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/repeat.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/repeat.png)

```swift
let disposeBag = DisposeBag()
    
Observable.repeatElement("🔴")
    .take(3)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🔴
🔴
🔴
```

### generate

generate是创建一个可观察sequence，当初始化的条件为true的时候，他就会发出所对应的事件

```swift
let disposeBag = DisposeBag()
    
Observable.generate(
        initialState: 0,
        condition: { $0 < 3 },
        iterate: { $0 + 1 }
    )
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
0
1
2
```

### deferred

deferred会为每一为订阅者observer创建一个新的可观察序列

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/defered.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/defered.png)

下面例子中每次进行subscribe的时候都会去创建一个新的deferredSequence，所以Emitting会打印两遍。

```swift
let disposeBag = DisposeBag()
var count = 1
    
let deferredSequence = Observable<String>.deferred {
    print("Creating \(count)")
    count += 1
    
    return Observable.create { observer in
        print("Emitting...")
        observer.onNext("🐶")
        observer.onNext("🐱")
        observer.onNext("🐵")
        return Disposables.create()
    }
}
    
deferredSequence
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
deferredSequence
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
Creating 1
Emitting...
🐶
🐱
🐵
Creating 2
Emitting...
🐶
🐱
🐵
```

### error

创建一个可观察序列，但不发出任何正常的事件，只发出error事件并结束

```swift
let disposeBag = DisposeBag()
    
Observable<Int>.error(TestError.test)
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

```swift
error(test)
```

### doOn

doOn我感觉就是在直接onNext处理时候，先执行某个方法，doOnNext(* :)方法就是在subscribe(onNext:)前调用，doOnCompleted(*:)就是在subscribe(onCompleted:)前面调用的。

```swift
let disposeBag = DisposeBag()
    
Observable.of("🍎", "🍐", "🍊", "🍋")
    .do(onNext: { print("Intercepted:", $0) }, onError: { print("Intercepted error:", $0) }, onCompleted: { print("Completed")  })
    .subscribe(onNext: { print($0) },onCompleted: { print("结束") })
    .addDisposableTo(disposeBag)
```

```swift
Intercepted: 🍎
🍎
Intercepted: 🍐
🍐
Intercepted: 🍊
🍊
Intercepted: 🍋
🍋
Completed
结束
```

## 学会使用Subjects

Subjet是observable和Observer之间的桥梁，一个Subject既是一个Obserable也是一个Observer，他既可以发出事件，也可以监听事件。

### PublishSubject

当你订阅PublishSubject的时候，你只能接收到订阅他之后发生的事件。subject.onNext()发出onNext事件，对应的还有onError()和onCompleted()事件

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/publishsubject.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/publishsubject.png)

```swift
let disposeBag = DisposeBag()
let subject = PublishSubject<String>()
    
subject.addObserver("1").addDisposableTo(disposeBag)
subject.onNext("🐶")
subject.onNext("🐱")
    
subject.addObserver("2").addDisposableTo(disposeBag)
subject.onNext("🅰️")
subject.onNext("🅱️")
```

```swift
Subscription: 1 Event: next(🐶)
Subscription: 1 Event: next(🐱)
Subscription: 1 Event: next(🅰️)
Subscription: 2 Event: next(🅰️)
Subscription: 1 Event: next(🅱️)
Subscription: 2 Event: next(🅱️)
```

### ReplaySubject

当你订阅ReplaySubject的时候，你可以接收到订阅他之后的事件，但也可以接受订阅他之前发出的事件，接受几个事件取决与bufferSize的大小

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/replaysubject.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/replaysubject.png)

```swift
let disposeBag = DisposeBag()
let subject = ReplaySubject<String>.create(bufferSize: 1)
    
subject.addObserver("1").addDisposableTo(disposeBag)
subject.onNext("🐶")
subject.onNext("🐱")
    
subject.addObserver("2").addDisposableTo(disposeBag)
subject.onNext("🅰️")
subject.onNext("🅱️")
```

```swift
Subscription: 1 Event: next(🐶)
Subscription: 1 Event: next(🐱)
Subscription: 2 Event: next(🐱) //订阅之后还可以接受一次前面发出的事件
Subscription: 1 Event: next(🅰️)
Subscription: 2 Event: next(🅰️)
Subscription: 1 Event: next(🅱️)
Subscription: 2 Event: next(🅱️)
```

### BehaviorSubject

当你订阅了BehaviorSubject，你会接受到订阅之前的最后一个事件。

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/behaviorsubject.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/behaviorsubject.png)

```swift
let disposeBag = DisposeBag()
let subject = BehaviorSubject(value: "🔴")
    
subject.addObserver("1").addDisposableTo(disposeBag)
subject.onNext("🐶")
subject.onNext("🐱")
    
subject.addObserver("2").addDisposableTo(disposeBag)
subject.onNext("🅰️")
subject.onNext("🅱️")
    
subject.addObserver("3").addDisposableTo(disposeBag)
subject.onNext("🍐")
subject.onNext("🍊")
```

```swift
Subscription: 1 Event: next(🔴)
Subscription: 1 Event: next(🐶)
Subscription: 1 Event: next(🐱)
Subscription: 2 Event: next(🐱)	//订阅之前的最后一个事件
Subscription: 1 Event: next(🅰️)
Subscription: 2 Event: next(🅰️)
Subscription: 1 Event: next(🅱️)
Subscription: 2 Event: next(🅱️)
Subscription: 3 Event: next(🅱️) //订阅之前的最后一个事件
Subscription: 1 Event: next(🍐)
Subscription: 3 Event: next(🍐)
Subscription: 2 Event: next(🍐)
Subscription: 1 Event: next(🍊)
Subscription: 3 Event: next(🍊)
Subscription: 2 Event: next(🍊)
```

PublishSubject, ReplaySubject和BehaviorSubject是不会自动发出completed事件的。

### Variable

Variable是BehaviorSubject一个包装箱，就像是一个箱子一样，使用的时候需要调用asObservable()拆箱，里面的value是一个BehaviorSubject，他不会发出error事件，但是会自动发出completed事件。

```swift
let disposeBag = DisposeBag()
let variable = Variable("🔴")
    
variable.asObservable().addObserver("1").addDisposableTo(disposeBag)
variable.value = "🐶"
variable.value = "🐱"
    
variable.asObservable().addObserver("2").addDisposableTo(disposeBag)
variable.value = "🅰️"
variable.value = "🅱️"
```

```swift
Subscription: 1 Event: next(🔴)
Subscription: 1 Event: next(🐶)
Subscription: 1 Event: next(🐱)
Subscription: 2 Event: next(🐱)
Subscription: 1 Event: next(🅰️)
Subscription: 2 Event: next(🅰️)
Subscription: 1 Event: next(🅱️)
Subscription: 2 Event: next(🅱️)
Subscription: 1 Event: completed
Subscription: 2 Event: completed
```

## 联合操作

联合操作就是把多个Observable流合成单个Observable流

### startWith

在发出事件消息之前，先发出某个特定的事件消息。比如发出事件2 ，3然后我startWith(1)，那么就会先发出1，然后2 ，3.

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/startwith.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/startwith.png)

```swift
let disposeBag = DisposeBag()
    
Observable.of("2", "3")
    .startWith("1")
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
1
2
3
```

### merge

合并两个Observable流合成单个Observable流，根据时间轴发出对应的事件

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/merge.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/merge.png)

```swift
let disposeBag = DisposeBag()
    
let subject1 = PublishSubject<String>()
let subject2 = PublishSubject<String>()
    
Observable.of(subject1, subject2)
    .merge()
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
subject1.onNext("🅰️")
    
subject1.onNext("🅱️")
    
subject2.onNext("①")
    
subject2.onNext("②")
    
subject1.onNext("🆎")
    
subject2.onNext("③")
```

```swift
🅰️
🅱️
①
②
🆎
③
```

### zip

绑定超过最多不超过8个的Observable流，结合在一起处理。注意Zip是一个事件对应另一个流一个事件。

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/zip.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/zip.png)

```swift
let disposeBag = DisposeBag()
    
let stringSubject = PublishSubject<String>()
let intSubject = PublishSubject<Int>()
    
Observable.zip(stringSubject, intSubject) { stringElement, intElement in
    "\(stringElement) \(intElement)"
    }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
stringSubject.onNext("🅰️")
stringSubject.onNext("🅱️")
    
intSubject.onNext(1)
    
intSubject.onNext(2)
    
stringSubject.onNext("🆎")
intSubject.onNext(3)
```

```swift
🅰️ 1	将stringSubject和intSubject压缩到一起共同处理
🅱️ 2
🆎 3
```

### combineLatest

绑定超过最多不超过8个的Observable流，结合在一起处理。和Zip不同的是combineLatest是一个流的事件对应另一个流的最新的事件，两个事件都会是最新的事件，可将下图与Zip的图进行对比。

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/combinlatest.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/combinlatest.png)

```swift
let disposeBag = DisposeBag()
    
let stringSubject = PublishSubject<String>()
let intSubject = PublishSubject<Int>()
    
Observable.combineLatest(stringSubject, intSubject) { stringElement, intElement in
        "\(stringElement) \(intElement)"
    }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
stringSubject.onNext("🅰️")
    
stringSubject.onNext("🅱️")
intSubject.onNext(1)
    
intSubject.onNext(2)
    
stringSubject.onNext("🆎")
```

```swift
🅱️ 1
🅱️ 2
🆎 2
```

### switchLatest

switchLatest可以对事件流进行转换，本来监听的subject1，我可以通过更改variable里面的value更换事件源。变成监听subject2了

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/switch.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/switch.png)

```swift
let disposeBag = DisposeBag()
    
let subject1 = BehaviorSubject(value: "⚽️")
let subject2 = BehaviorSubject(value: "🍎")
    
let variable = Variable(subject1)
    
variable.asObservable()
    .switchLatest()
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
subject1.onNext("🏈")
subject1.onNext("🏀")
    
variable.value = subject2
    
subject1.onNext("⚾️")
    
subject2.onNext("🍐")
variable.value = subject1
subject2.onNext("田腾飞")
subject1.onNext("沸腾天")
```

```swift
⚽️
🏈
🏀
🍎
🍐
⚾️
沸腾天
```

## 变换操作

### map

通过传入一个函数闭包把原来的sequence转变为一个新的sequence的操作

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/transform.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/transform.png)

```swift
let disposeBag = DisposeBag()
Observable.of(1, 2, 3)
    .map { $0 * $0 }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
1	每一个元素自己相乘
4
9
```

### flatMap

将一个sequence转换为一个sequences，当你接收一个sequence的事件，你还想接收其他sequence发出的事件的话可以使用flatMap，她会将每一个sequence事件进行处理以后，然后再以一个新的sequence形式发出事件。和Swift中的意思差不多。

[![img](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/flatmap.png)](http://www.codertian.com/2016/11/27/RxSwift-ru-keng-ji-read-document/flatmap.png)

```swift
let disposeBag = DisposeBag()
    
struct Player {
    var score: Variable<Int>		//里面是一个Variable
}
    
let 👦🏻 = Player(score: Variable(80))		
let 👧🏼 = Player(score: Variable(90))
let 😂 = Player(score: Variable(550))
    
let player = Variable(👦🏻)  //将player转为Variable
    
player.asObservable()		
    .flatMap { $0.score.asObservable() }//转换成了一个新的序列
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
👦🏻.score.value = 85
    
player.value = 👧🏼 //更换了value，相当于又添加了一个sequence，两个sequence都可以接收
    
👦🏻.score.value = 95
👦🏻.score.value = 222
player.value = 😂
    
👧🏼.score.value = 100
```

```swift
80
85
90
95
222
550
100
```

### flatMapLatest

flatMapLatest只会接收最新的value事件，将上例改为flatMapLatest。结果为

```swift
80
85
90
550
```

### scan

scan就是给一个初始化的数，然后不断的拿前一个结果和最新的值进行处理操作。

```swift
let disposeBag = DisposeBag()
    
Observable.of(10, 100, 1000)
    .scan(1) { aggregateValue, newValue in
        aggregateValue + newValue
    }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
11
111
1111
```

## 过滤和约束

### filter

filter很好理解，就是过滤掉某些不符合要求的事件

```swift
let disposeBag = DisposeBag()
    
Observable.of(
    "🐱", "🐰", "🐶",
    "🐸", "🐱", "🐰",
    "🐹", "🐸", "🐱")
    .filter {
        $0 == "🐱"
    }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐱
🐱
🐱
```

### distinctUntilChanged

distinctUntilChanged就是当下一个事件与前一个事件是不同事件的事件才进行处理操作

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐱", "🐷", "🐱", "🐱", "🐱", "🐵", "🐱")
    .distinctUntilChanged()
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐱
🐷
🐱
🐵
🐱
```

### elementAt

只处理在指定位置的事件

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .elementAt(3)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐸
```

### single

找出在sequence只发出一次的事件，如果超过一个就会发出error错误

```swift
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .single()
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐱	//单一信号超过了一个
Received unhandled error: /var/folders/hz/v15ld5mj0nqf83d21j13y0tw0000gn/T/./lldb/7229/playground107.swift:69:__lldb_expr_107 -> Sequence contains more than one element.
```

```swift
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .single { $0 == "🐸" }		//青蛙只有一个，completed
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

```swift
Observable.of("🐱", "🐰", "🐶", "🐱", "🐰", "🐶")
    .single { $0 == "🐰" } //兔子有两个，会发出error
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

```swift
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .single { $0 == "🔵" } //没有蓝色球，会发出error
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

### take

只处理前几个事件信号,

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .take(3)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐱
🐰
🐶
```

### takeLast

只处理后几个事件信号

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .takeLast(3)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐸
🐷
🐵
```

### takeWhile

当条件满足的时候进行处理

```swift
let disposeBag = DisposeBag()
    
Observable.of(1, 2, 3, 4, 5, 6)
    .takeWhile { $0 < 4 }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
1
2
3
```

### takeUntil

接收事件消息，直到另一个sequence发出事件消息的时候。

```swift
let disposeBag = DisposeBag()
    
let sourceSequence = PublishSubject<String>()
let referenceSequence = PublishSubject<String>()
    
sourceSequence
    .takeUntil(referenceSequence)
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
    
sourceSequence.onNext("🐱")
sourceSequence.onNext("🐰")
sourceSequence.onNext("🐶")
    
referenceSequence.onNext("🔴")	//停止接收消息
    
sourceSequence.onNext("🐸")
sourceSequence.onNext("🐷")
sourceSequence.onNext("🐵")
```

```swift
next(🐱)
next(🐰)
next(🐶)
completed
```

### skip

取消前几个事件

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .skip(2)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
🐶
🐸
🐷
🐵
```

### skipWhile

满足条件的事件消息都取消

```swift
let disposeBag = DisposeBag()
    
Observable.of(1, 2, 3, 4, 5, 6)
    .skipWhile { $0 < 4 }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
4
5
6
```

### skipWhileWithIndex

满足条件的都被取消，传入的闭包同skipWhile有点区别而已

```swift
let disposeBag = DisposeBag()
    
Observable.of("🐱", "🐰", "🐶", "🐸", "🐷", "🐵")
    .skipWhileWithIndex { element, index in
        index < 3
    }
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

### skipUntil

直到某个sequence发出了事件消息，才开始接收当前sequence发出的事件消息

```swift
let disposeBag = DisposeBag()
    
let sourceSequence = PublishSubject<String>()
let referenceSequence = PublishSubject<String>()
    
sourceSequence
    .skipUntil(referenceSequence)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
    
sourceSequence.onNext("🐱")
sourceSequence.onNext("🐰")
sourceSequence.onNext("🐶")
    
referenceSequence.onNext("🔴")
    
sourceSequence.onNext("🐸")
sourceSequence.onNext("🐷")
sourceSequence.onNext("🐵")
}
```

## 数学操作

### toArray

将sequence转换成一个array，并转换成单一事件信号，然后结束

```swift
let disposeBag = DisposeBag()
    
Observable.range(start: 1, count: 10)
    .toArray()
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
```

```swift
next([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
completed
```

### reduce

用一个初始值，对事件数据进行累计操作。reduce接受一个初始值，和一个操作符号

```swift
let disposeBag = DisposeBag()
    
Observable.of(10, 100, 1000)
    .reduce(1, accumulator: +)
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

```swift
1111
```

### concat

concat会把多个sequence和并为一个sequence，并且当前面一个sequence发出了completed事件，才会开始下一个sequence的事件。

在第一sequence完成之前，第二个sequence发出的事件都会被忽略，但会接收一完成之前的二发出的最后一个事件。不好解释，看例子说明

```swift
let disposeBag = DisposeBag()
    
let subject1 = BehaviorSubject(value: "🍎")
let subject2 = BehaviorSubject(value: "🐶")
    
let variable = Variable(subject1)
    
variable.asObservable()
    .concat()
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
    
subject1.onNext("🍐")
subject1.onNext("🍊")
    
variable.value = subject2
    

subject2.onNext("🐱")	//1完成前，会被忽略
subject2.onNext("teng") //1完成前，会被忽略
subject2.onNext("fei")	//1完成前的最后一个，会被接收
    
subject1.onCompleted()
    
subject2.onNext("🐭")
```

```swift
next(🍎)
next(🍐)
next(🍊)
next(fei)
next(🐭)
```

## 连接性操作

Connectable Observable有订阅时不开始发射事件消息，而是仅当调用它们的connect（）方法时。这样就可以等待所有我们想要的订阅者都已经订阅了以后，再开始发出事件消息，这样能保证我们想要的所有订阅者都能接收到事件消息。其实也就是等大家都就位以后，开始发出消息。

### publish

将一个正常的sequence转换成一个connectable sequence

```swift
let intSequence = Observable<Int>.interval(1, scheduler: MainScheduler.instance)
    .publish()
    
_ = intSequence
    .subscribe(onNext: { print("Subscription 1:, Event: \($0)") })
    
delay(2) { _ = intSequence.connect() } //相当于把事件消息推迟了两秒
    
delay(4) {
    _ = intSequence
        .subscribe(onNext: { print("Subscription 2:, Event: \($0)") })
}
    
delay(6) {
    _ = intSequence
        .subscribe(onNext: { print("Subscription 3:, Event: \($0)") })
}
```

```swift
Subscription 1:, Event: 0
Subscription 1:, Event: 1
Subscription 2:, Event: 1
Subscription 1:, Event: 2
Subscription 2:, Event: 2
Subscription 1:, Event: 3
Subscription 3:, Event: 3
Subscription 2:, Event: 3
Subscription 1:, Event: 4
Subscription 3:, Event: 4
```

### replay

将一个正常的sequence转换成一个connectable sequence，然后和replaySubject相似，能接收到订阅之前的事件消息。

```swift
let intSequence = Observable<Int>.interval(1, scheduler: MainScheduler.instance)
    .replay(5)	//接收到订阅之前的5条事件消息
    
_ = intSequence
    .subscribe(onNext: { print("Subscription 1:, Event: \($0)") })
    
delay(2) { _ = intSequence.connect() }
    
delay(4) {
    _ = intSequence
        .subscribe(onNext: { print("Subscription 2:, Event: \($0)") })
}
    
delay(8) {
    _ = intSequence
        .subscribe(onNext: { print("Subscription 3:, Event: \($0)") })
}
```

### multicast

将一个正常的sequence转换成一个connectable sequence，并且通过特性的subject发送出去，比如PublishSubject，或者replaySubject，behaviorSubject等。不同的Subject会有不同的结果。

```swift
let subject = PublishSubject<Int>()
    
_ = subject
    .subscribe(onNext: { print("Subject: \($0)") })
    
let intSequence = Observable<Int>.interval(1, scheduler: MainScheduler.instance)
    .multicast(subject)
    
_ = intSequence
    .subscribe(onNext: { print("\tSubscription 1:, Event: \($0)") })
    
delay(2) { _ = intSequence.connect() }
    
delay(4) {
    _ = intSequence
        .subscribe(onNext: { print("\tSubscription 2:, Event: \($0)") })
}
```

## 错误处理

### catchErrorJustReturn

遇到error事件的时候，就return一个值，然后结束

```swift
let disposeBag = DisposeBag()
    
let sequenceThatFails = PublishSubject<String>()
    
sequenceThatFails
    .catchErrorJustReturn("😊")
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
    
sequenceThatFails.onNext("😬")
sequenceThatFails.onNext("😨")
sequenceThatFails.onNext("😡")
sequenceThatFails.onNext("🔴")
sequenceThatFails.onError(TestError.test)
```

```swift
next(😬)
next(😨)
next(😡)
next(🔴)
next(😊)
completed
```

### catchError

捕获error进行处理，可以返回另一个sequence进行订阅

```swift
let disposeBag = DisposeBag()
    
let sequenceThatFails = PublishSubject<String>()
let recoverySequence = PublishSubject<String>()
    
sequenceThatFails
    .catchError {
        print("Error:", $0)
        return recoverySequence
    }
    .subscribe { print($0) }
    .addDisposableTo(disposeBag)
    
sequenceThatFails.onNext("😬")
sequenceThatFails.onNext("😨")
sequenceThatFails.onNext("😡")
sequenceThatFails.onNext("🔴")
sequenceThatFails.onError(TestError.test)
    
recoverySequence.onNext("😊")
```

```swift
next(😬)
next(😨)
next(😡)
next(🔴)
Error: test
next(😊)
```

### retry

遇见error事件可以进行重试，比如网络请求失败，可以进行重新连接

```swift
let disposeBag = DisposeBag()
var count = 1
    
let sequenceThatErrors = Observable<String>.create { observer in
    observer.onNext("🍎")
    observer.onNext("🍐")
    observer.onNext("🍊")
    
    if count == 1 {
        observer.onError(TestError.test)
        print("Error encountered")
        count += 1
    }
    
    observer.onNext("🐶")
    observer.onNext("🐱")
    observer.onNext("🐭")
    observer.onCompleted()
    
    return Disposables.create()
}
    
sequenceThatErrors
    .retry(3)		//不传入数字的话，只会重试一次
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

## debug

### debug

打印所有的订阅, 事件和disposals

```swift
sequenceThatErrors
    .retry(3)
    .debug()
    .subscribe(onNext: { print($0) })
    .addDisposableTo(disposeBag)
```

### RxSwift.Resources.total

查看RxSwift所有资源的占用

```swift
print(RxSwift.Resources.total)
```

啊，文章终于结束，这篇文章比较长，基本上涵盖了官方文档所有的概念，其中不免有些错误与疏漏，希望能在你学习RxSwift的时候能有一些参考价值吧！！！