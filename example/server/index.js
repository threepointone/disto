import http from 'http'
import { makeReconciler } from '../../src'

import express from 'express'
const app = express()

app.get('/api', (req, res) => {
  let andThen = (err, res) => {
    if(err) {
      return res.error(err)
    }
  }
  let r = makeReconciler()
  r.run(function*() {
    r.read
  })
  // r.read(req.query__, true)

  // let {}
})

app.post('/api', (req, res) => {
  // let {}
})


let router

router.get('key', function*(send) {

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

const server = http.createServer(app)

server.listen(port).on('listening', () => {
  const addr = server.address()
  console.log('Listening on ' + (addr.port || addr))  // eslint-disable-line no-console
})

