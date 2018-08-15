#!/usr/bin/env node

const path = require('path')

const spawn = require('cross-spawn')

// const child = spawn('node', ['--version'], { stdio: 'inherit' })

// console.log(path.join(__dirname, './lib/server.js'))
const child = spawn('node', [path.join(__dirname, './lib/server.js')], {
  stdio: 'inherit'
})

// const child = spawn('pwd', {
//   stdio: 'inherit'
// })

// child.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`)
// })
// child.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`)
// })

// child.on('exit', function(code, signal) {
//   console.log('child process exited with ' +
//     `code ${code} and signal ${signal}`)
// })