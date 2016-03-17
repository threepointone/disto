import React, { Component } from 'react'
import { log, ql, application, decorator as disto, subquery } from '../../src'

function goTo(x, route) {
  // you might also trigegr a side effect here? history.push, etc
  return x.props.transact({ type : 'change/route', payload: route })
}

@disto()
class Home extends Component {
  static query = () => ql`[ home/title home/content ]`

  render() {
    return <div >
      <h3>{this.props['home/title']}</h3>
      <p>{this.props['home/content']}</p>
      <a onClick={() => goTo(this, [ 'app/about', '_' ])}> go to about page </a>
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
      <a onClick={() => goTo(this, [ 'app/home', '_' ])}> go home </a>
    </div>
  }
}


@disto()
class Root extends Component {
  static query = (ctx) => {

    let subqRef = ctx instanceof Component ?
        ctx.props['app/route'][0] :
        'app/home',
      subqClass = routes[subqRef]

    return ql`[ app/route { route/data ${subquery(ctx, subqRef, subqClass)} } ]`
  }
  render() {
    let route = this.props['app/route'][0]
    let C = routes[route]
    return <div>
      <C refer={this.props.makeRef(route)} {...this.props['route/data']}/>
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
    return {
      value: env.get()[env.get()['app/route'][0]]
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
