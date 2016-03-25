import { ql, application, getQuery, decorator as disto, log, treeToDb } from '../../src'
import './normalize.css'
import styles from './style.css'

import React, { Component } from 'react'

// a couple of functional helpers
function toObject() {
  // converts an array of [k: string, v] entries into an object
  return this.reduce((o, [k, v]) => (o[k] = v, o), {}); // eslint-disable-line
}

function updateIn(o, [ head, ...tail ], fn) {
  // deep update a nested object at path
  if(tail.length === 0) {
    return { ...o, [head] : fn(o[head]) }
  }
  return { ...o, [head]: updateIn(o[head], tail, fn) }
}

@disto()
class App extends Component {
  static variables = () => ({ type: 'all' })
  static query = () => ql`[
    ( { todos ${getQuery(Item)} } { type ?type } )
    length
    remaining
  ]`
  onSelect = type =>
    this.props.setVariables({ type })
  render() {
    let { todos, length, remaining, variables } = this.props
    return <div className={styles.app}>
      <Input {...{ remaining, length }} />
      { Object.entries(todos).map(([ k, v ]) =>
        <Item key={k} {...v} />) }
      <Footer selected={variables.type}
        length={length}
        remaining={remaining}
        onSelect={this.onSelect} />
    </div>
  }
}

@disto()
class Input extends Component {
  state = { input: '' }
  onChange = ({ target: { value } }) =>
    this.setState({ input: value })
  onKeyPress = e => {
    if(e.keyCode === 13) {
      this.props.transact({ type: 'add:todo', payload: { text: this.state.input } })
      this.setState({ input: '' })
    }
  }
  toggleAll = () =>
    this.props.transact({ type: 'toggle:all' })
  render() {
    let { remaining, length } = this.props
    return <div className={styles['input-cnt']}>
      <button className={styles['input-cnt_toggle-all']}
        disabled={!(length > 1 && (remaining === 0 || remaining === length))}
        onClick={this.toggleAll}>
          v
      </button>
      <input className={styles['input-cnt_input']}
        onChange={this.onChange}
        onKeyUp={this.onKeyPress}
        value={this.state.input} />
    </div>
  }
}

@disto()
class Item extends Component {
  static ident = x => [ 'byId', x.id ]
  static query = () => ql`[id text done]`
  onToggle = () =>
    this.props.transact({ type: 'toggle:todo', payload: { id: this.props.id } })
  onRemove = () =>
    this.props.transact({ type: 'remove:todo', payload: { id: this.props.id } })
  render() {
    let { id, text, done } = this.props
    return <div className={styles.item}>
      <div className={styles.item_content}>
        <input className={styles.item_content_checkbox}
          id={`todo-${id}`}
          type="checkbox"
          checked={done}
          onChange={this.onToggle} />
        <label className={styles.item_content_label}
          htmlFor={`todo-${id}`}>
            {text}
        </label>
      </div>
      <div className={styles.item_remove} onClick={this.onRemove}>x</div>
    </div>
  }
}

function capitalize() {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

@disto()
class Footer extends Component {
  onSelect = e =>
    this.props.onSelect(e.target.getAttribute('data-type'))
  onClearCompleted = () =>
    this.props.transact({ type: 'clear:completed' })
  render() {
    let { remaining, selected, length } = this.props
    return <div className={styles.footer}>
      <div className={styles['footer_left']}>
        {remaining} item{remaining !== 1 ? 's' : ''} left
      </div>
      <div className={styles['footer_types']}>
        {[ 'all', 'completed', 'active' ].map(type =>
          <span key={type}
            data-type={type}
            onClick={this.onSelect}
            className={ styles.footer_type + ' ' +  (selected === type ? styles['footer_selected'] : null) }>
              {type::capitalize()}
          </span>)}
      </div>
      { length - remaining > 0 ?
        <div className={styles['footer_clear-completed']} onClick={this.onClearCompleted}>
          clear completed
        </div> :
        null }
    </div>
  }
}


function read(env, key, params) {
  let entries = Object.entries(env.get().byId)
  switch(key) {
    case 'todos':
      return {
        value: entries.filter(([ k, v ]) => { // eslint-disable-line
          switch (params.type) {
            case 'active': return !v.done
            case 'completed': return !!v.done
            default: return true
          }
        })::toObject()
      }
    case 'length':
      return {
        value: entries.length
      }
    case 'remaining':
      return {
        value: entries.filter(([ k, v ]) => !v.done).length // eslint-disable-line
      }
  }
}

let ctr = 5
function create(coll, payload) {
  let id = ctr++
  return { ...coll, [id]: { ...payload, id } }
}

function toggle(coll, payload) {
  return updateIn(coll, [ payload.id, 'done' ], x => !x)
}

function clearCompleted(coll) {
  return Object.entries(coll)
    .filter(([ k, v ]) => !v.done)::toObject() //eslint-disable-line
}

function remove(coll, payload) {
  return Object.entries(coll)
    .filter(([ k, v ]) => v.id !== payload.id)::toObject() //eslint-disable-line
}

function toggleAll(coll) {
  // should we first check if all are of same `done`?
  return Object.entries(coll)
    .map(([ k, v ]) => [ k, { ...v, done: !v.done } ])::toObject()
}

// keepin' it dry
function todoMutation(env, func, payload) {
  return {
    value: { keys: [ 'byId' ] },
    effect: () => env.store.swap(x => ({
      ...x, byId: func(x.byId, payload)
    }))
  }
}

function mutate(env, { type, payload }) {
  switch(type) {
    case 'add:todo':
      return todoMutation(env, create, payload)
    case 'toggle:todo':
      return todoMutation(env, toggle, payload)
    case 'clear:completed':
      return todoMutation(env, clearCompleted)
    case 'remove:todo':
      return todoMutation(env, remove, payload)
    case 'toggle:all':
      return todoMutation(env, toggleAll)
  }
}

// we use this to populate our db
// then whenever a 'read' to 'todos' occurs,
// we intercept and use our normalized data instead

const initial = {
  todos: [
    { id: 0, text: 'asdsad', done: true },
    { id: 1, text: 'sadfsdf' },
    { id: 2, text: 'sdfdsf' },
    { id: 3, text: 'sdfsdf' }
  ]
}

const store = treeToDb(getQuery(App), initial)::log()
application({ read, mutate, store }).add(App, window.app)
