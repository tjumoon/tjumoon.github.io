---
title: Hexo建站之路
date: 2018-02-06 10:32:58
tags:
 	- Hexo
---

## 前因

前一段时间，折腾了一下，搞了个自己的博客。基于`Hexo`，网上有一大堆教程，一步步教你怎么来搭建一个自己的博客，有需要的小伙伴可以自行百度，当然其中也遇到了一些问题。先说下我的最终方案把`Hexo + Next主题 + Travis CI自动化部署 + GitHubPages & CodingPages双托管`。

## Travis CI自动化部署

`Travis CI`可以自动监听代码变化，并自动编译，发布。所以说，每次，我们只需要将源代码`push`到`github`，`Travis CI`会自动帮我们发布，非常方便。

所以，我们需要两个分支：

* `blog-source`——用于托管我们源代码
* `master`——用于发布代码

不清楚的同学可以自行百度如何用`Travis CI`自动化发布`Hexo`博客，网上有一些`Travis`脚本，比如：

```js
language: node_js
node_js: stable

# S: Build Lifecycle
install:
  - npm install


#before_script:
 # - npm install -g gulp

script:
  - hexo g

after_script:
  - cd ./public
  - git init
  - git config user.name "lifengsofts"
  - git config user.email "lifengsofts@gmail.com"
  - git add .
  - git commit -m "Update docs"
  - git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:master
# E: Build LifeCycle

branches:
  only:
    - blog-source
env:
 global:
   - GH_REF: github.com/lifengsofts/lifengsofts.github.io.git
```

简单解释下这段代码把：

```js
language: node_js
node_js: stable
```

* 这段是指定使用`node.js`版本

```js
# S: Build Lifecycle
install:
  - npm install
```

* 根据`package.json`安装`node.js`依赖

```js
branches:
  only:
    - blog-source
env:
 global:
   - GH_REF: github.com/lifengsofts/lifengsofts.github.io.git
```

* 指定需要编译的`source`分支

```js
script:
  - hexo g
```

* 执行命令，生成`Hexo`静态文件

```js
after_script:
  - cd ./public
  - git init
  - git config user.name "lifengsofts"
  - git config user.email "lifengsofts@gmail.com"
  - git add .
  - git commit -m "Update docs"
  - git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:master
# E: Build LifeCycle
```

* 这段复杂一点，意思是，进入`Hexo`静态发布文件，配置`github`信息，通过`git push`推送到`master`分支，这样就搞定了，完全没有问题

## 百度sitemap与优化

如上面所说，这样我们的博客就建立好了，可以正常访问，可以绑定自己的域名信息，可是遇到两个问题。

1. 既然我们做了博客，当然是希望可以让更多的人访问到，所以我们需要做`SEO`优化，我们希望自己的网站可以被`百度`，`Google`等搜索引擎收录
2. `GitHub`服务器是在国外的，国内访问很慢，有时候甚至需要翻墙才能打开

### SEO优化

百度有三种自动提交方式：`主动推送`, `自动推送`, `sitemap`，一个个说，每个里面都有坑

#### 主动提交

网上一位大神，写了一个`Hexo`的插件`hexo-baidu-url-submit`

##### 安装: Hexo根目录，安装此插件

```js
npm install hexo-baidu-url-submit --save
```

##### 配置: 同样在根目录下，把以下内容配置到_config.yml文件中

```js
baidu_url_submit:
  count: 3 ## 比如3，代表提交最新的三个链接
  host: simonblog.cn ## 在百度站长平台中注册的域名
  token: your_token ## 请注意这是您的秘钥， 请不要发布在公众仓库里!
  path: baidu_urls.txt ## 文本文档的地址， 新链接会保存在此文本文档里
```

##### 域名配置：同样在_config.yml文件中

```js
# URL
url: http://simonblog.cn
root: /
permalink: :year/:month/:day/:title/
```

**一定要注意，你配置的域名必须与你在百度站长平台中注册的域名一致，如果有`www`就都要有，如果没有就都没有** 

##### 最后，加入新的deployer

```js
# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  - type: git
    repo: 
      github: https://__GH_TOKEN__@github.com/tjumoon/tjumoon.github.io.git,master
  - type: baidu_url_submitter
```

执行`hexo deploy`的时候就会主动提交你的sitemap

但是，我试了半天，发现没有提交，什么原因，好忧伤，大神的代码有bug？查代码把！

在`hexo-baidu-url-submit`的`index.js`中，我们看到

```js
hexo.extend.generator.register('baidu_url_generator', require('./lib/generator'));
hexo.extend.deployer.register('baidu_url_submitter', require('./lib/submitter'));
```

在执行`hexo generator`时加载了`generator`模块

在执行`hexo deploy`时加载了`submitter`模块

继续看`generator`干了什么

```js
module.exports = function (locals) {
    var log = this.log;
    var config = this.config;
    var count = config.baidu_url_submit.count;
    var urlsPath = config.baidu_url_submit.path;

    log.info("Generating Baidu urls for last " + count + " posts");

    // get last posts
    var urls = [].concat(locals.posts.toArray())
                     .map(function(post) {
                       return {
                         "date": post.date,
                         "permalink": post.permalink
                       }
                     })
                     .sort(function(a, b) {
                       return b.date - a.date;
                     })
                     .slice(0, count)
                     .map(function(post) {
                       return post.permalink
                     })
                     .join('\n');

    log.info("Posts urls generated in " + urlsPath + "\n" + urls);

    return {
     path: urlsPath,
     data: urls
    };
};
```

其实就是读取你`_posts`里的文件，生成`baidu_urls.txt` 

再看`submitter`里做了什么

```js
var pathFn = require('path');
var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function(args) {
    var log = this.log;
    var config = this.config;

    var urlsPath = config.baidu_url_submit.path;
    var host = config.baidu_url_submit.host;
    var token = config.baidu_url_submit.token;

    var publicDir = this.public_dir;
    var baiduUrlsFile = pathFn.join(publicDir, 'baidu_urls.txt');
    var urls = fs.readFileSync(baiduUrlsFile, 'utf8');

    log.info("Submitting urls \n" + urls)

    var target = "http://data.zz.baidu.com/urls?site=" + host + "&token=" + token;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', target, false);
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.onload = function () {
        console.log(this.responseText);
    };
    xhr.send(urls);
};
```

就是读取`baidu_urls.txt`,通过`xhr`推送给百度。

好吧，问题找到了。

```js
script:
  - hexo g
  
after_script:
  - cd ./public
  - git init
  - git config user.name "lifengsofts"
  - git config user.email "lifengsofts@gmail.com"
  - git add .
  - git commit -m "Update docs"
  - git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:master
# E: Build LifeCycle
```

我们可以看到，我们只执行了`hexo g`，并没有执行`hexo deploy`，而是手动通过`git push`将代码提交到`master`分支，所以，并没有加载`submitter`模块，所以根本就没有提交。

最终我的配置文件

`_config.yml`

```js
# Baidu sitemap
baidu_url_submit:
  count: 10 ## 提交最新的一个链接
  host: simonblog.cn ## 在百度站长平台中注册的域名
  token: your-token ## 请注意这是您的秘钥， 所以请不要把博客源代码发布在公众仓库里!
  path: baidu_urls.txt ## 文本文档的地址， 新链接会保存在此文本文档里

# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  - type: git
    repo: 
      github: https://__GH_TOKEN__@github.com/tjumoon/tjumoon.github.io.git,master
  - type: baidu_url_submitter

```

我们来看下`hexo deploy`做了什么，其实做了两件事

* 提交本地文件到`master`分支
* 执行`baidu_url_submitter` 

`.travis.yml`

```js
language: node_js
node_js: stable

# S: Build Lifecycle
install:
  - npm install


before_script:
  - git config user.name "tjumoon"
  - git config user.email "simon_yang@aliyun.com"
  - sed -i "s/__GH_TOKEN__/${GH_TOKEN}/" _config.yml
  
script:
  - hexo clean
  - hexo g

after_success:
  - hexo deploy

branches:
  only:
    - blog-source
env:
 global:
   - GH_REF: github.com/tjumoon/tjumoon.github.io.git

```

#### 自动提交

自动提交比较简单，在`next`主题配置`_config.yml`中设置

```js
baidu_push: true
```

继续看代码：`themes\next\layout\_third-party\seo\baidu-push.swig`

```js
{% if theme.baidu_push %}
<script>
(function(){
    var bp = document.createElement('script');
    var curProtocol = window.location.protocol.split(':')[0];
    if (curProtocol === 'https') {
        bp.src = 'https://zz.bdstatic.com/linksubmit/push.js';        
    }
    else {
        bp.src = 'http://push.zhanzhang.baidu.com/push.js';
    }
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(bp, s);
})();
</script>
{% endif %}
```

这里添加了一段发送的`js`代码，一定要注意**你配置的域名必须要与你百度站长在的域名一致**

#### sitemap

百度站长平台，提交`sitemap`后，百度会自动去爬取你的`sitemap`

这里需要安装插件

```js
npm install hexo-generator-baidu-sitemap --save
npm install hexo-generator-sitemap --save
```

同样，这两个插件会在`hexo generator`的时候自动创建`baidusitemap.xml`，`sitemap.xml`

接下来，我们在百度站长上提交`sitemap`吧

但是，每次都是抓去失败，`403 Forbidden`，什么原因。百度了一下，发现`github`默认会屏蔽来自百度的爬虫。这怎么解决…..

好吧，既然`github`屏蔽百度，那我们就增加一个托管平台——`Coding`，基本配置思路和`github`一致，最终的配置脚本

`_config.yml`

```js
# Baidu sitemap
baidu_url_submit:
  count: 10 ## 提交最新的一个链接
  host: simonblog.cn ## 在百度站长平台中注册的域名
  token: your-token ## 请注意这是您的秘钥， 所以请不要把博客源代码发布在公众仓库里!
  path: baidu_urls.txt ## 文本文档的地址， 新链接会保存在此文本文档里

# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  - type: git
    repo: 
      github: https://__GH_TOKEN__@github.com/tjumoon/tjumoon.github.io.git,master
      coding: https://simon_yang:__CODING_TOKEN__@git.coding.net/simon_yang/Blog.git,master
  - type: baidu_url_submitter
```

`.travis.yml`

```js
language: node_js
node_js: stable

# S: Build Lifecycle
install:
  - npm install


before_script:
  - git config user.name "tjumoon"
  - git config user.email "simon_yang@aliyun.com"
  - sed -i "s/__GH_TOKEN__/${GH_TOKEN}/" _config.yml
  - sed -i "s/__CODING_TOKEN__/${CODING_TOKEN}/" _config.yml

script:
  - hexo clean
  - hexo g

after_success:
  - hexo deploy

branches:
  only:
    - blog-source
env:
 global:
   - GH_REF: github.com/tjumoon/tjumoon.github.io.git

```

然后，我们在域名服务器上配置，国内流量访问`CodingPage`，海外流量访问`GithubPage`，完美解决百度爬虫问题，同时网站的打开速度大大提升了

### 最后

本篇文章，不是一个搭建教程，只是在搭建过程中遇到的问题，以及如何解决的一些思路











