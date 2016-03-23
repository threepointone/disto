/* global describe, it */
import expect from 'expect'

import { ql, makeStore, log } from '../src'
describe('ql', () => {
  describe('syntax', () => {
    it('prop', () => {
      expect(ql`[foo]`).toEqual([ 'foo' ])
    })

    it('join', () => {
      expect(ql`[ { foo [ id title ] } ]`).toEqual([ new Map([ [ 'foo', [ 'id', 'title' ] ] ]) ])
      // todo - nested
    })

    it('union', () => {
      // or with shorthand
      expect(ql`[ { foo {
        photo [ id title image ]
        post [ id title text ]
        graphic [ id image caption ]
      }}]`).toEqual([ new Map([ [ 'foo', {
        photo: [ 'id', 'title', 'image' ],
        post: [ 'id', 'title', 'text' ],
        graphic: [ 'id', 'image', 'caption' ]
      } ] ]) ])
    })

    it('params', () => {
      expect(ql`[(foo {p1 5 p2 "abc"})]`).toEqual([ new Set([ 'foo', { p1: 5, p2: "abc" } ]) ])
    })

    it('ident', () => {
      expect(ql`[[ide "nt"]]`).toEqual([ [ 'ide', 'nt' ] ])
    })
  })
})

describe('parser', () => {
  // read
  // mutate
})

// describe('reducer', () => {
//   it.only('optimistic updates', () => {
//     let s = makeStore({ _: { count: 0 } })

//     s.getState()._::log()
//     s.swap(x => ({ count: x.count + 1 }))
//     s.dispatch({ type: 'disto.optimistic.start', payload: { id: 0 } })
//     s.swap(x => ({ count: x.count + 1 }))
//     s.swap(x => ({ count: x.count + 1 }))
//     s.dispatch({ type: 'disto.optimistic.stop', payload: { id: 0 } })
//     s.swap(x => ({ count: x.count + 1 }))
//     s.dispatch({ type: 'disto.optimistic.revert', payload: { id: 0 } })
//     s.swap(x => ({ count: x.count + 1 }))
//     s.getState()._::log()

//   })
// })

