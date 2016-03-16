/* global describe, it */
import expect from 'expect'

import { ql } from '../src'
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
