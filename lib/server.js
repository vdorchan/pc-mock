module.exports = function (argv) {
  const Koa = require('koa')
  const bodyPaser = require('koa-bodyparser')
  const cors = require('@koa/cors')
  const jsonp = require('koa-jsonp')

  const { promisify } = require('util')
  const fs = require('fs')
  const { URL } = require('url')
  const path = require('path')

  const { mock } = require('mockjs')

  const {
    sleep
  } = require('./util')

  const app = new Koa()

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
        const data = await promisify(fs.readFile)(`${path.join(process.cwd(), _pathname, project)}.json`, 'utf8')
        const objData = JSON.parse(removeComments(data))
        let result = objData[jsp]

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

        resolve(result)
      } catch (error) {
        if(error) reject(error)
      }

    })

  }

  app.use(async(ctx, next) => {
    const start = Date.now()
    delay && await sleep(delay)
    let pageNo, pageSize

    if (ctx.method === 'GET' || ctx.method === 'POST') {
      ({pageNo, pageSize} = ctx.method === 'post' ? ctx.request.body : ctx.query)
      try {
        let result = await getResult(ctx.path, pageNo, pageSize)
        ctx.body = result
      } catch (error) {
        ctx.status = 404
        ctx.body = `404 \n${error.message}`
        console.log(error.message)
      }
    } else {
      ctx.status = 405
      ctx.body = 'Method Not Allowed'
    }


    console.log(`${ctx.method.padEnd(4)} ${ctx.url} - ${ctx.status} ${Date.now() - start}ms`)
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

  const server = app
    .use(cors({
      credentials: true
    }))
    .use(bodyPaser())
    .use(jsonp())
    .listen(port)

  console.log('\nmock server is starting at `http://localhost:%s`\n', server.address().port)
}