import { ql, log, bindParams, decorator as disto } from '../src'
import React, { Component } from 'react'

// let q = ql`[(foo {x ?xyz })]`::log()

// bindParams(q, { xyz: 123 })::log()


@disto()
class App extends Component {
  render() {

  }
}