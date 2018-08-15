#!/usr/bin/env node

const path = require('path')
const yargs = require('yargs')

const server = require('./lib/server')

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
    }
  })
  .help('help')
  .alias('help', 'h')
  .version(pkg.version)
  .alias('version', 'v').argv

server(argv)