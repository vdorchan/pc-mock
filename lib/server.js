module.exports = function (argv) {
  const Koa = require('koa')
  const bodyPaser = require('koa-bodyparser')
  const cors = require('@koa/cors')
  const jsonp = require('koa-jsonp')

  const portfinder = require('portfinder')

  const { promisify } = require('util')
  const fs = require('fs')
  const { URL } = require('url')
  const path = require('path')

  const { mock } = require('mockjs')
  const chalk = require('chalk')

  const {
    sleep,
    purgeCache
  } = require('./util')

  const app = new Koa()

  app.use(cors({
      credentials: true
    }))
    .use(bodyPaser())
    .use(jsonp())

  const {
    port,
    delay
  } = argv



  const removeComments = code => code.replace(/"([^"]*)\/\/(.+)"/g,'"$1\\/\\/$2"').replace(/(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg, '$3')

  const repalcePlaceholder = (str, pageNo) => typeof str === 'string' ? str.replace(/\$pn/g, pageNo) : str

  const getResult = (pathname, pageNo, pageSize) => {
    return new Promise(async (resolve, reject) => {
      const arrPath = pathname.split('/')
      const jsp = arrPath.pop().replace('.jsp', '')
      const project = arrPath.pop()
      const _pathname = arrPath.join('/')

      try {
        const dataFileName = `${path.join(process.cwd(), _pathname, project)}`
        let data
        try {
          data = require(`${dataFileName}`)
          purgeCache(`${dataFileName}`) // 清除缓存
        } catch (error) {
        }

        if (typeof data !== 'object' || !Object.keys(data).length) {
          data = await promisify(fs.readFile)(`${dataFileName}.json`, 'utf8')
          data = JSON.parse(removeComments(data))
        }
        let result = data[jsp]

        if (!result) {
          throw Error(`在 ${project}.json 文件中找不到${jsp}参数！`)
        }

        let listKey
        if (pageNo) {
          for (const key in result) {
            if (/\S+\|[+-]?\d/.test(key)) {
              listKey = key.replace(/\|\S*/, '')
            }
          }
        }

        result = mock(result)

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

        resolve(result)
      } catch (error) {
        if(error) reject(error)
      }

    })

  }

  app.use(async(ctx, next) => {
    if (ctx.path === '/favicon.ico') {
      return
    }
    const start = Date.now()
    delay && await sleep(delay)
    let pageNo, pageSize, errorMsg

    if (ctx.method === 'GET' || ctx.method === 'POST') {
      ({pageNo, pageSize} = ctx.method === 'POST' ? ctx.request.body : ctx.query)
      try {
        let result = await getResult(ctx.path, pageNo, pageSize)
        ctx.body = result
      } catch (error) {
        errorMsg = `${chalk.red('error')}: ${error.message}`
        ctx.status = 404
        ctx.body = `404 \n${error.message}`
      }
    } else {
      ctx.status = 405
      ctx.body = 'Method Not Allowed'
    }


    console.log(`${chalk.blue(ctx.method.padEnd(4))} ${ctx.url} - ${ctx.status === 200 ? chalk.green(ctx.status) : chalk.red(ctx.status)} ${chalk.yellow(`${Date.now() - start}ms`)}`)
    errorMsg && console.log(`${errorMsg}\n`)

  })

  // router.get('/', async (ctx) => {
  //   const {pageNo, pageSize} = ctx.query

  //   let result = await getResult(ctx.url, pageNo, pageSize)

  //   ctx.body = result
  // })

  // router.post('/:project/action/:jsp.jsp', async (ctx) => {
  //   const {pageNo, pageSize} = ctx.request.body

  //   let result = await getResult(ctx.url, pageNo, pageSize)

  //   ctx.body = result
  // })

  portfinder.basePort = port
  portfinder.getPortPromise().then((port) => {
    const server = app.listen(port)

    console.log('\nmock server is starting at `http://localhost:%s`\n', server.address().port)
  })
}
