/* global describe, it */

import expect from 'expect'
import { query, getQuery } from '../src'

import React from 'react'

class Component extends React.Component {
  static query = () => [ 'foo/bar', 'baz/woz' ]
}

class ComponentList extends React.Component {
  static query = () => [ { 'components/list' : '?component' }, 'app/title' ]
  static queryParams = () => ({ component: getQuery(Component) })
}

class ComponentWithParams extends React.Component {
  static query = () => [ { 'some/key': '?some/param' }, 'app/title' ]
  static queryParams = () => ({ 'some/param': 42 })
}


describe('queries', () => {
  it('query', () => {
    expect(query(Component) === [ 'foo/bar', 'baz/woz' ]).toEqual(true)
    expect(query(ComponentList) === [ 'foo/bar', 'baz/woz' ]).toEqual(true)
  })

  it('getQuery', () => {
    expect(getQuery(Component)).toEqual([ 'foo/bar', 'baz/woz' ])
    expect(getQuery(ComponentList)).toEqual([ { 'components/list': [ 'foo/bar', 'baz/woz' ] }, 'app/title' ])
    expect(getQuery(ComponentWithParams)).toEqual([ { 'some/key': 42 }, 'app/title' ])
  })

  it('focusQuery', () => {
    [ [ 'foo/bar' ], [], [ 'foo/bar' ],
      [ 'foo/bar', { 'baz/woz': [ 'goz/noz' ] } ], [ 'baz/woz' ], [ { 'baz/woz': [ 'goz/noz' ] } ]
       ]
  })

})
