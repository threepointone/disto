import React, { Component } from 'react'
import { decorator as ann, parser, R } from '../src'
import { toString, parse as ƒ }  from '../src/ql'

function print() {
  return JSON.stringify(this, null, ' ')::log()
}

function log() {
  console.log(this) // eslint-disable-line no-console
  return this
}

R.make({
  parser: parser({
    read:
  })
}).add(App, window.app)

