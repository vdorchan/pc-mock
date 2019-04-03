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

/**
 * 从缓存中移除module
 */
exports.purgeCache = function (moduleName) {
  // 遍历缓存来找到通过指定模块名载入的文件
  searchCache(moduleName, function (mod) {
      delete require.cache[mod.id];
  });

  // 删除模块缓存的路径
  // 多谢@bentael指出这点
Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
      if (cacheKey.indexOf(moduleName)>0) {
          delete module.constructor._pathCache[cacheKey];
      }
  });
};

/**
* 遍历缓存来查找通过特定模块名缓存下的模块
*/
function searchCache(moduleName, callback) {
  //  通过指定的名字resolve模块
  var mod = require.resolve(moduleName);

  // 检查该模块在缓存中是否被resolved并且被发现
  if (mod && ((mod = require.cache[mod]) !== undefined)) {
      // 递归的检查结果
      (function traverse(mod) {
          // 检查该模块的子模块并遍历它们
          mod.children.forEach(function (child) {
              traverse(child);
          });

          // 调用指定的callback方法，并将缓存的module当做参数传入
          callback(mod);
      }(mod));
  }
};