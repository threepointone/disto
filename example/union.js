import { ql, application, getQuery, dbToTree, astToExpr, treeToDb, log, withMeta, meta, decorator as disto } from '../src'
import React, { Component, PropTypes } from 'react'

// helper to do deep 'immutable' update
function updateIn(o, [ key, ...rest ], fn) {
  if(rest.length === 0) {
    return { ...o, [key]: fn(o[key]) }
  }
  return { ...o, [key]: updateIn(o[key], rest, fn) }
}

const initial = {
  'items': [
    {
      id: 0, type: 'post',
      author: 'Laura Smith',
      title: 'A Post!',
      content: 'Lorem ipsum dolor sit amet, quem atomorum te quo',
      favorites: 0
    }, {
      id: 1, type: 'photo',
      title: 'A Photo!',
      content: 'Lorem ipsum',
      favorites: 0
    },
    {
      id: 2, type: 'post',
      author: "Jim Jacobs",
      title: "Another Post!",
      content: "Lorem ipsum dolor sit amet, quem atomorum te quo",
      favorites: 0
    }, {
      id: 3, type: 'graphic',
      title: "Charts and Stufff!",
      image: "chart.jpg",
      favorites: 0
    }, {
      id: 4, type: 'post',
      author: "May Fields",
      title: "Yet Another Post!",
      content: "Lorem ipsum dolor sit amet, quem atomorum te quo",
      favorites: 0
    }
  ]
}

@disto()
class Post extends Component {
  static query = () => ql`[id type title author content]`
  render() {
    let { title, author, content } = this.props
    return <div>
      <h3>{title}</h3>
      <h4>{author}</h4>
      <p>{content}</p>
    </div>

  }
}

@disto()
class Photo extends Component {
  static query = () => ql`[id type title image caption]`
  render() {
    let { title, image, caption } = this.props
    return <div>
      <h3>Photo {title}</h3>
      <div>{image}</div>
      <p>Caption {caption}</p>
    </div>
  }
}

@disto()
class Graphic extends Component {
  static query = () => ql`[id type title image]`
  render() {
    let { title, image } = this.props
    return <div>
      <h3>Graphic {title}</h3>
      <div>{image}</div>
    </div>
  }
}

function andKey(key) {
  return withMeta([ ... this, key ], { component: meta(this, 'component') })
}

@disto()
class DashboardItem extends Component {
  static ident = ({ type, id }) => [ type, id ]
  static query = () => {
    return {
      post: getQuery(Post)::andKey('favorites'),
      photo: getQuery(Photo)::andKey('favorites'),
      graphic: getQuery(Graphic)::andKey('favorites')
    }
  }

  static contextTypes = {
    disto: PropTypes.object
  }

  renderItem() {
    let { type } = this.props
    switch(type) {
      case 'post': return <Post {...this.props} />
      case 'photo': return <Photo {...this.props} />
      case 'graphic': return <Graphic {...this.props} />
    }
  }
  onClick = () => this.context.disto.transact({
    type: 'favorite',
    payload: [ this.props.type, this.props.id ]
  })
  render() {
    let { favorites } = this.props
    return <div>
      {this.renderItem()}
      <p>{favorites} favorites</p>
      <button onClick={this.onClick}>favorite!</button>
    </div>
  }
}

@disto()
class Dashboard extends Component {
  static query = () => ql`[{items ${getQuery(DashboardItem)}}]`
  render() {
    let { items } = this.props
    return <div>
      {items.map(item =>
        <DashboardItem key={item.id} {...item}/>)}
    </div>
  }
}

function read(env, key /*, params */) {
  return {
    value: dbToTree([ astToExpr(env.ast) ], env.get())[key]
  }
}

const normalized = treeToDb(getQuery(Dashboard), initial)

function reduce(state = normalized, { type, payload }) {
  if(type === 'favorite') {
    return updateIn(state, [ payload[0], payload[1], 'favorites' ], v => v + 1)
  }
  return state
}

let app = application({
  read,
  reduce
})

app.add(Dashboard, window.app)
