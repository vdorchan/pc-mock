export default const turnHelpDoc = url => {
  const {pathname} = new URL(url)
  const projectName = pathname.split('/')[1]
  return new Promise((resolve, reject) => {  
    try {
      http.get('http://dev58.pcauto.com.cn/auto180610/action/help.jsp', res => {
        let data = "";
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

          await promisify(fs.writeFile)(path.join(__dirname, `/${projectName}.json`), jsonStr)
          resolve()
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}