<h1 align="center"> pc-mock </h1>

[![NPM version][npm-url]

## 介绍

挺久以前，学了点 node，就利用它搭建了个很简陋的本地服务器，用来做专题调试接口，很简陋，但是很方便。

很多童鞋喜欢在专题 js 文件里加上接口的数据代码进行调试，那把代码搞得太乱了，另外也很容易把接口的数据逻辑暴露出去，不大安全。

于是乎，这两天重构了下代码，封装了一下，发布到 npm 上。

使用 pc-mock，会在你本地创建一个服务器，数据将使用 json 文件，利用开发给的接口文档，可以很方便的转换出 json 文件。

我很懒，所以对我来说，工具一定要方便简单。相信我，只要花几分钟看完 readme，你绝对就会使用了。

这几分钟之后，你的开发效率将会大大的提高，会减少很多调试接口带来的麻烦。


## 快速开始

全局安装 pc-mock（不能科学上网的，用cnpm安装）

```javscript
npm install -g pc-mock
```

或

```javscript
yarn global add pc-mock
```

根据开发提供的接口文档，创建一个 project.json 文件。
其中，文件名为项目名，键名为接口名，值为接口返回内容。

```json
{
  "getUserInfo": {
    "code": 1,
    "msg": "获取成功",
    "id":2, //用户id
    "chance":1, //剩余抽奖次数
    "lotteryTimes":1, //已抽次数
  },
  "lottery": {
    "code": 1,
    "msg":"恭喜中奖/未中奖",
    "isAward": 1, //是否中奖0否1是
    "amount": 8.88, //红包金额
  }
}
```

开启 pc-mock

```bash
pcmock --port 8080
```

链接将参照你的本地文件路径，假如是在 project.json 所在文件夹执行的命令

那么现在打开浏览器，输入[http://localhost:8080/project/getUserInfo.jsp](http://localhost:8080/project/getUserInfo.jsp),你就可以获取到相应的数据了

```json
{
  "code": 1,
  "msg": "获取成功",
  "id":2, //用户id
  "chance":1, //剩余抽奖次数
  "lotteryTimes":1, //已抽次数
}
```

最好再了解以下几点：

- json 格式本身是不能包含注释的，但接口文档一般带注释，并且注释还是有点作用的，于是我就允许了注释的存在，然后在访问接口的时候，使用一些代码去消除它。

- 另外，工具提供了将接口文档转换为 json 文件的功能，只需传入接口文档的链接，就能生成相应的 json 文件。注意：接口文档并不完全规范，所以处理完之后，有必要去进行一些检查改正。

## Mock

内置了 mock.js， 支持使用 mock 模版，可以更加方便的伪造各种数据。示例：[http://mockjs.com/examples.html](http://mockjs.com/examples.html)

```bash
pcmock [options] <source>

选项：
  --port, -p     设置端口                                        [默认值: 3000]
  --delay, -d    Add delay to responses (ms)
  --turnDoc, -t  传入开发文档的链接和json文件名（可选，默认以第一级目录名），自动将其转换为json文件

  --help, -h     显示帮助信息                                             [布尔]
  --version, -v  显示版本号                                               [布尔]
```

## 分页加载

创建的接口支持分页功能，按照公司规范，参数名分别为 pageNo 和 pageSize。

```json
"getLottery": {
  "code":1,
  "msg":"获取成功!",
  "awardList|10":[ {
      "name":"测试",//中奖人名字
      "awardName":"8.88红包"//奖品名
      "headImgUrl":"https://tfs.alipayobjects.com/images/partner/T1SGRfXgJbXXXXXXXX",//头像
    }
  ]
}
```

从上面的 json 文件中，为了能让工具知道哪个是列表参数，使用了 mock 的数据模版进行定义，其中 10 是列表默认的数量，即默认的 pageSize

```javscript
'name|count': array
```

另外，还可以在 json 文件中使用 $pn 和 $ps 占位符， 接口返回时，将会使用 pageNo 和 pageSize 进行替换。

```json
"getLottery": {
  "code":1,
  "msg":"获取成功!",
  "awardList|10":[ {
      "name":"测试$ps",//中奖人名字
      "awardName":"8.88红包$pn"//奖品名
      "headImgUrl":"https://tfs.alipayobjects.com/images/partner/T1SGRfXgJbXXXXXXXX",//头像
    }
  ]
}
```

## 命令行使用

```bash
pcmock [options] <source>

选项：
  --port, -p     设置端口号                                       [默认值: 3000]
  --delay, -d   延迟接口响应的时间
  --turnDoc, -t  传入开发文档的链接和json文件名（可选，默认以第一级目录名），自动将其转换为json文件

  --help, -h     显示帮助信息                                             [布尔]
  --version, -v  显示版本号                                               [布尔]

示例：
  pcmock --port 8080
  pcmock -p 8080 -d 1000
  pcmock -t http://dev58.pcauto.com.cn/auto180610/action/help.jsp bmw.json

https://github.com/vdorchan/pc-mock
```

## License

MIT - [Typicode](https://github.com/typicode) - [Patreon](https://www.patreon.com/typicode)

[npm-url]: https://www.npmjs.com/package/pc-mock