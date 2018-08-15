#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')

const server = require('./lib/server')

const pkg = require('./package.json')
const { turnHelpDoc } = require('./lib/util')

const argv = yargs
  .usage('$0 [options] <source>')
  .options({
    port: {
      alias: 'p',
      description: 'Set port',
      default: 3000
    },
    delay: {
      alias: 'd',
      description: 'Add delay to responses (ms)'
    },
    turnDoc: {
      alias: 't',
      description: '传入开发文档的链接和json文件名（可选，默认以第一级目录名），自动将其转换为json文件'
    }
  })
  .help('help')
  .alias('help', 'h')
  .version(pkg.version)
  .epilog('https://github.com/vdorchan/pc-mock')
  .alias('version', 'v').argv

const { turnDoc, source } = argv

if (turnDoc) { 
  turnHelpDoc(turnDoc, argv._[0]).then(file => {
    console.log('成功将目标文档转换为json文件，文件地址在：')
    console.log(file)
  })
} else {
  server(argv)
}