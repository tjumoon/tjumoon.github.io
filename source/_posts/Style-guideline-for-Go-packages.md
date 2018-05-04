---
title: 【译】Go包风格指南
date: 2018-05-04 11:56:15
tags:
	- Go
---

本文翻译至[Style guideline for Go packages](https://rakyll.org/style-packages/)

GO与语言中的所有其他事物一样命名和组织。结构良好的Go代码可以很容易被发现，使用和阅读。一个结构良好的代码如同与一个设计良好的API接口一样重要。位置、命名、以及包结构是你的用户首先看到并与其打交道的。

本文的目标是用一些最佳实践来指导你而不是设置规则。读者可以根据自己的判断来选择最优雅的方案来应对特殊的场景。

### 包

所有Go代码都是以包的形式组织在一起的。Go语言中的包就是一个简单的`目录/文件夹`，里面包含一个或多个`.go`文件。Go语言使用包来管理、组织代码，就如同计算机通过`目录/文件夹`来组织文件一样。

所有的Go代码都是放在包里的，Go语言的包是访问Go代码的入口。理解和建立良好的包组织实践对于写出高效的Go代码是非常重要的

### 包组织

让我们从如何组织Go代码以及解释如何设置Go包开始。

#### 使用多文件

一个包就是一个里面包含一个或者多个Go文件的目录。尽情将你的代码按照逻辑划分到多个文件中以获得最佳的可读性。

例如，一个`HTTP`包可以根据`HTTP`功能方面划分到不同文件中。在下面的例子中，一个`HTTP`包被划分为多个文件：`header类型和代码`，`cookie类型和代码`，`HTTP实现`以及`包的文档`。

```go
- doc.go       // package documentation
- headers.go   // HTTP headers types and code
- cookies.go   // HTTP cookies types and code
- http.go      // HTTP client implementation, request and response types, etc.
```

####保持类型靠近

一般来说，我们要让类型定义靠近他使用的地方。这可以很方便维护人员（不仅仅是原始作者）发现类型。对于一个`Header`类型，一个好的实现是把他放在`header.go`文件中。

```go
$ cat headers.go
package http

// Header represents an HTTP header.
type Header struct {...}
```

尽管，Go语言不限制你在何处定义你的类型，通常我们最好是将核心类型放在文件的顶部。

#### 根据功能组织代码

通常在其他语言中，我们将类型放在一个叫做`models`或者`types`的包中。但在Go语言中，我们依据他的功能来组织代码

```go
package models // DON'T DO IT!!!

// User represents a user in the system.
type User struct {...}
```

`User`类型应该放在服务层包中，而不是创建一个`models`包，然后让将所有实体类型定义在其中。

```go
package mngtservice

// User represents a user in the system.
type User struct {...}

func UsersByQuery(ctx context.Context, q *Query) ([]*User, *Iterator, error)

func UserIDByEmail(ctx context.Context, email string) (int64, error)
```

#### 使用godoc

一个比较好的做法是，在设计你的包接口阶段，用godoc来定义你将要设计的概念。有时，可视化对设计也有影响。Godoc是用户使用一个包的一个方式，因此，你需要稍作调整让他们更容易被接受。运行`godoc -http=<hostport>`来本地启动一个godoc服务

#### 提供一些范列

很多时候，你不可能将所有相关的类型放在一个包中。您可能希望从单独的包发布公用接口的具体实现，或者这些类型可能被第三方包所拥有。提供一些例子可以帮助用户去发现、理解如何使用他们。

```go
$ godoc cloud.google.com/go/datastore
func NewClient(ctx context.Context, projectID string, opts ...option.ClientOption) (*Client, error)
...
```

NewClient works with option.ClientOptions but it is neither the datastore package nor the option package that export all the option types.

```go
$ godoc google.golang.org/extraoption
func WithCustomValue(v string) option.ClientOption
...
```

如果你的API需要引入许多非标准的包，通常提供一些可运行的代码是一个比较好的做法。



### 包命名

包的名称和路径即是包的重要标识同时也表示包中所含内容。规范的命名不仅能提高你的代码质量而且可以提供你的用户的代码质量。

#### 小写

包名必须小写。不要使用`下划线`、`驼峰`在你的包名中。[comprehensive guide](https://blog.golang.org/package-names)这边博客有许多关于包命名的范例。

#### 简短，但是语意明确

包名应该比较简单，但是是唯一且语意明确的。用户可以通过报名就能了解到他的用途。

避免过于宽泛的包名，如：`common`、`util`。

```go
import "pkgs.org/common" // DON'T!!!
```

在可能导入相同包的情况下避免重复的命名。

如果你不能避免糟糕的命名，那么很可能你的代码组织结构出现了问题。

#### 导入路径简洁

避免将自定义存储结构暴露给用户。像`GOPATH`一样。避免在你的导入路径中出现`src/`、`pkg/`等。

```go
github.com/user/repo/src/httputil   // DON'T DO IT, AVOID SRC!!

github.com/user/repo/gosrc/httputil // DON'T DO IT, AVOID GOSRC!!
```

#### 不要使用复数

在Go语言中，包名不要使用复数。对于许多其他语言的开发人员来说，这很惊讶，他们一直使用复数来命名。不是使用~~`httputils`~~，而用`httputil`。

```go
package httputils  // DON'T DO IT, USE SINGULAR FORM!!
```

#### 重命名需要遵循相同的规则

假如你导入多个具有相同名字的包，你可以重命名包的名字。重命名应该使用相同的规则。关于重命名没有具体的规则。假如你重命名一个标准库名，最好在前面加上`go`以标识这是Go标准库的包。如：`gourl`，`goioutil`。

```go
import (
    gourl "net/url"

    "myother.com/url"
)
```

