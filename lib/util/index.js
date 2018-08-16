exports.turnHelpDoc = (url, projectName) => {
  const {URL} = require('url')
  const http = require('http')
  const path = require('path')
  const { promisify } = require('util')
  const fs = require('fs')

  const cheerio = require('cheerio')

  projectName = projectName || new URL(url).pathname.split('/')[1]
  projectName = projectName.replace(/\.json/, '')

  return new Promise((resolve, reject) => {  
    try {
      http.get(url, res => {
        let data = ""
        res.on('data', chunk => {
          data += chunk
        })

        res.on("end", async () => {
          // console.log(data)
          const $ = cheerio.load(data)
          let jsonStr = '{'
          $('p').each((idx, elem) => {
            var $p = $(elem)
            var $strong = $p.children()
            if ($strong.length) {  
              let jsp = $strong.text().replace(/(.jsp).+/, '$1')

              if (jsp.endsWith('.jsp')) {
                var value = $p.nextAll('pre').eq(0).text().replace(/返回成功[^{]*{/, '{').replace(/}[^{]*返回失败[\s\S]*/g, '}')
                jsonStr += `
                "${jsp.replace('.jsp', '')}": 
                  ${value},
                `
              }
            }
          })
          jsonStr = jsonStr.replace(/\,[^\,]*$/g, '')
          jsonStr += '}'

          const file = path.join(process.cwd(), `/${projectName}.json`)
          await promisify(fs.writeFile)(file, jsonStr)
          resolve(file)
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

exports.sleep = async (ms) => {
  return new Promise(function(resolve, reject) {
    setTimeout(function(){
      resolve()
    }, ms)
  })
}