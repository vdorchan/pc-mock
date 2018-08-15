module.exports = function (argv) {
  const Koa = require('koa')
  const Router = require('koa-router')
  const bodyPaser = require('koa-bodyparser')
  const cors = require('@koa/cors')
  const jsonp = require('koa-jsonp')

  const { promisify } = require('util')
  const fs = require('fs')
  const http = require('http')
  const path = require('path')
  const {URL} = require('url')

  const cheerio = require('cheerio')
  const { mock } = require('mockjs')

  const {
    sleep
  } = require('./util')

  const app = new Koa()
  const router = new Router()

  const {
    port,
    delay
  } = argv

  const removeComments = code => code.replace(/"\/\/(.+)"/g,'"\\/\\/$1"').replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, '')

  const repalcePlaceholder = (str, pageNo) => typeof str === 'string' ? str.replace(/\$pn/g, pageNo) : str

  const getResult = async (project, jsp, pageNo, pageSize) => {
    const data = await promisify(fs.readFile)(`${process.cwd()}/action/${project}.json`, 'utf8')
    const objData = JSON.parse(removeComments(data))
    let result = objData[jsp]

    let listKey
    if (pageNo) {
      for (const key in result) {
        if (/\S+\|[+-]?\d/.test(key)) {
          listKey = key.replace(/\|\S*/, '')
        }
      }
    }

    result = mock(objData[jsp])

    if (pageSize && listKey) {
      const list = result[listKey]
      list.forEach((elem, idx) => {
        list[idx] = repalcePlaceholder(elem, pageNo)

        if (typeof elem === 'object') {
          for (const key in elem) {
            const str = elem[key]
            elem[key] = repalcePlaceholder(str, pageNo)
          }
        }
      })
      while (result[listKey].length < pageSize) {
        result[listKey] = result[listKey].concat(list)
      }
      result[listKey] = result[listKey].slice(0, pageSize)
    }

    return result
  }

  app.use(async(ctx, next) => {
    const start = Date.now()
    delay && await sleep(delay)
    await next()
    console.log(`${ctx.method.padEnd(4)} ${ctx.url} - ${ctx.status} ${Date.now() - start}ms`)
  })

  router.get('/:project/action/:jsp.jsp', async (ctx) => {
    let {project, jsp} = ctx.params

    const {pageNo, pageSize} = ctx.query

    let result = await getResult(project, jsp, pageNo, pageSize)

    ctx.body = result
  })

  router.post('/:project/action/:jsp.jsp', async (ctx) => {
    let {project, jsp} = ctx.params

    const {pageNo, pageSize} = ctx.request.body

    let result = await getResult(project, jsp, pageNo, pageSize)

    ctx.body = result
  })

  const server = app
    .use(cors({
      credentials: true
    }))
    .use(bodyPaser())
    .use(jsonp())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port)

  console.log('\nmock server is starting at `http://localhost:%s`\n', server.address().port)
}