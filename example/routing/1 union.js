import React, { Component } from 'react'
import { log, ql, getQuery, application, decorator as disto } from '../../src'

@disto()
class Home extends Component {
  static query = () => ql`[ home/title home/content ]`
  goToAbout = () => {
    this.props.transact({ type : 'change/route', payload: [ 'app/about', '_' ] })
  }
  render() {
    return <div >
      <h3>{this.props['home/title']}</h3>
      <p>{this.props['home/content']}</p>
      <a onClick={this.goToAbout}> go to about page </a>
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
  static query = () => ql`[
    app/route
    { route/data ${Object.entries(routes).reduce((o, [ k, v ]) =>
      (o[k] = getQuery(v), o), {})}
    }
  ]`
  render() {
    let C = routes[this.props['app/route'][0]]
    return <div>
      <C {...this.props['route/data']}/>
    </div>
  }
}

const routes = {
  'app/home': Home,
  'app/about': About
}


const store = {
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
    return {
      value: env.get()[env.get()['app/route'][0]]
    }
  }
  return {
    value: env.get()[key]
  }
}

function mutate(env, { type, payload }) {
  if(type === 'change/route') {
    return {
      keys: [ 'app/route' ],
      effect: () => env.store.swap(state => ({ ...state, 'app/route': payload }))
    }
  }
}

application({ mutate, read, store }).add(Root, window.app)
