import 'isomorphic-fetch'

import http from 'http'
import { application, exprTo, astTo, ql, queryTo, log } from '../src'

import { take } from 'redux-saga/effects'

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
    remote: env.ast
  }
}

async function send({ remote }, { merge, transact }) {
  try{
    for(let expr of remote) {
      let { key, params = {} } = exprTo(expr)
      let svc = key === 'one' ? service1 : key === 'two' ? service2 : null
      if(svc) {
        merge({ [key]: (await svc(key, params)) })
      }
    }
  }
  catch(error) {
    merge({ error: error.message })
  }

  transact({ type: 'over' })
}


app.get('/api', function (req, res) {
  let $ = application({ read, send, remotes: [ 'remote' ] })

  let task = $.run(function*() {
    yield take('over')
    res.send($.env.store.getState()._)
  })

  req.on('close', () => {
    task.cancel()
  })

  $.read(astTo(JSON.parse(req.query.q)), true)

})


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


function exec(q) {
  fetch('http://localhost:9123/api?q=' + JSON.stringify(queryTo(q)),
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

