import { ql, log, bindParams } from '../src'

let q = ql`[(foo {x ?xyz })]`::log()

bindParams(q, { xyz: 123 })::log()


