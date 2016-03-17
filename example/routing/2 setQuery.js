import React, { Component } from 'react'
import { log, ql, getQuery, application, decorator as disto } from '../../src'

function getIn(o, head, ...tail) {
  if(tail.length === 0) {
    return o[head]
  }
  return getIn(o[head], ...tail)
}

@disto()
class Home extends Component {
  static query = () => ql`[ home/title home/content ]`
  render() {
    return <div >
      <h3>{this.props['home/title']}</h3>
      <p>{this.props['home/content']}</p>
      <a onClick={() => this.props.goTo([ 'app/about', '_' ])}> go to about page </a>
    </div>
  }
}

@disto()
class About extends Component {
  static query = () => ql`[ about/title about/content ]`
  render() {
    return <div>
      <h3>{this.props['about/title']}</h3>
      <p>{this.props['about/content']}</p>
    </div>
  }
}


@disto()
class Root extends Component {
  static params = () => ({ 'q': [] })
  static query = () => ql`[ app/route { route/data ?q } ]`
  componentWillMount() {
    let route = this.props['app/route'],
      initialQuery = getQuery(routes[route[0]])
    this.props.setParams({ 'q': initialQuery })

  }
  goTo = route => {
    this.props.transact({ type : 'change/route', payload: route })
    this.props.setParams({ 'q': getQuery(routes[route[0]]) })
  }
  render() {

    let C = routes[this.props['app/route'][0]]
    return <div>
      <C goTo={this.goTo} {...this.props['route/data']}/>
    </div>
  }
}

const routes = {
  'app/home': Home,
  'app/about': About
}


const initial = {
  'app/route': [ 'app/home', '_' ],
  'app/home': {
    'home/title': 'Home page',
    'home/content': 'This is the homepage. not a lot to see here.'
  },
  'app/about': {
    'about/title': 'about page',
    'about/content': 'This is the about page, the place where one might write things about their own self'
  }
}


function read(env, key) {
  if(key === 'route/data') {
    let route = env.get()['app/route']
    if(route[1] === '_') {
      route = [ route[0] ]
    }
    return {
      value: getIn(env.get(), ...route)
    }
  }
  return {
    value: env.get()[key]
  }
}

function reduce(state = initial, action) {
  switch(action.type) {
    case 'change/route': return { ...state, 'app/route': action.payload }
  }
  return state
}

application({ reduce, read }).add(Root, window.app)
