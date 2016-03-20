import 'isomorphic-fetch'

import http from 'http'
import { application, exprToAst, astToExpr, ql, queryToAst, log } from '../src'

import express from 'express'
const app = express()

function sleep(period) {
  return new Promise(resolve => setTimeout(() => resolve(), period))
}

let ctr1 = 0
async function service1(key, params) {
  await sleep(Math.random() * 2000)
  return 'service1:' + key + ':' + (params.query || 'none') + ':' + ctr1++
}

let ctr2 = 0
async function service2(key, params) {
  await sleep(Math.random() * 1000)
  // this one randomly errors out
  if(Math.random() > 0.1) {
    throw new Error('two errored out!')
  }
  return 'service2:' + key + ':' + (params.query || 'none') + ':' + ctr2++
}

function read(env, key) {
  return {
    value: env.get()[key],
    remote: true
  }
}

function sender(done) {
  return async function send({ remote }, cb) {
  // you can call cb as many times as you want
  // so you could stream results, etc etc
  // fow now we do a simple serial resolve
    try{
      for(let expr of remote) {
        let { key, params = {} } = exprToAst(expr)
        let svc =
          key === 'one' ? service1 :
          key === 'two' ? service2 :
          null

        if(svc) { cb({ [key]: await svc(key, params) }) }
      }
    }
    catch(error) { cb({ error: error.message }) }

    done()
  }
}

// reads
app.get('/api', function (req, res) {
  let $ = application({
    read,
    remotes: [ 'remote' ],
    send: sender(() =>
      res.send($.get())) // just dump the db when done
  })

  $.read(astToExpr(JSON.parse(req.query.q)), true) // trigger remote

})

// for mutations, you'd do something similar, and transact in mutate actions to signal to the saga when 'done'


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
  console.error(new Date(), err.stack)  // eslint-disable-line no-console
  res.status(err.status || 500)
  res.send(err.send || {
    message: err.message,
    stack: app.get('env') === 'development' ? err.stack.split('\n') : null
  })
})

function normalizePort(val) {
  const p = parseInt(val, 10)
  if (isNaN(p)) { return val } // named pipe
  if (p >= 0) { return p } // port number
  return false
}

const port = normalizePort(process.env.PORT || 9123)
app.set('port', port)

// you'd call this from your client
function exec(q) {
  fetch('http://localhost:9123/api?q=' + JSON.stringify(queryToAst(q)),
    { method: 'get' })
  .then(res => res.json())
  .then(json => console.log('result!', json))   // eslint-disable-line no-console
  .catch(error => console.error(error)) // eslint-disable-line no-console
}


let queries = [
  ql`[one two]`,
  ql`[(one { query "xyz"})]`
]

const server = http.createServer(app)

server.listen(port).on('listening', () => {
  const addr = server.address()
  console.log('Listening on ' + (addr.port || addr))  // eslint-disable-line no-console

  queries.forEach(exec)

})
