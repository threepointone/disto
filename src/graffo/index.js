import { parse } from './parser'

function ƒ(strings, ...values) {
  return parse('[' + strings.reduce((arr, s, i) => [ ...arr, s, values[i] ], []).join('') + ']')
}

function log() {
  console.log(this) // eslint-disable-line no-console
}

function print() {
  return JSON.stringify(this, null, ' ')::log()
}

// prop
ƒ`foo`::log()

// prop + params
ƒ`'foo {arg 123}`::print()

// join + sub-select
ƒ`{key [sub1 sub2 sub3]}`::print()

// // recursive join
// ƒ`key1 key2 {some ...}`::print()

// // join + params
// ƒ`'{somekey [subkey]} { arg 1 }`::print()

// // reference / ident
// ƒ`[post 1234]`::print()

// // union
// ƒ`{ items {photo : [id title image] post: [id title post] } }`::print()

// ƒ`{[byId 1] [age]}{[byId 3] [name]}`::print()

// ;; Reads
// [:some/key] ;; property read
// [(:some/key {:some/param 42})] ;; parameterized property read

// [{:some/key [:subkey/one :subkey/two]}] ;; join
// '[{:some/key [*]}] ;; join (read all subkeys)
// [({:some/key [:subkey/one :subkey/two]} {:some/param 42})] ;; parameterized join

// [[:item/by-id 0]] ;; ident reference
// '[[:active/panel _]] ;; link reference

// [{:items/list {:foo [:item/id :item/type :foo/value]
//                :bar [:item/id :item/type :bar/value]}}] ;; union query

// '[{:tree [:id :value {:children ...}]}] ;; recursive query
// [{:tree [:id :value {:children 5}]}] ;; recursive query with recursion limit

// '[{:tree {:node/foo [:id :node/type :foo/value {:children ...}]
//           :node/bar [:id :node/type :bar/value {:children ...}]}}] ;; recursive union query
// [{:tree {:node/foo [:id :node/type :foo/value {:children 5}]
//          :node/bar [:id :node/type :bar/value {:children 5}]}}] ;; recursive union query with recursion limit



let data = {
  items: [ { id: 1, text: 'lorem' }, { id: 2, text: 'ipsum' } ]
}

function parser({ read = () => {}, mutate = () => {}, elidePaths = false } = {}) {
  let toRet = {}
  if(typeof read !== 'function') {
    // map
    let _reads = read
    read = function (env, query, target) {
      return _reads[query.type](env, query.dispatch, query.params)
    }
  }
  // query.
  return function (env, query, target) {
    // assume all reads for now
    // get entity
    // recurse on join with entity
    let entity = reads(type)

  }
}

function read(env, query, params) {
  if(query.type === 'prop') {
    return reader(env, query, query.params)
  }
  if(query.type === 'join') {
    return reader(env, { key: query.key, dispatch: query.dispatch })
  }

}


// read(data, ƒ`items`)::log()

// [(fire-missiles!)]                       ;;mutation
// [(fire-missiles! {:target :foo})]        ;;mutation + params
// { :photo [...subquery...]
//   :video [...subquery...]
//   :comment [...subquery...] }



// ƒ('')










// parser = function({read, mutate}){
//   return function(query, {state}, ){
//     // if vector, read
//     // else, mutation
//   }
// }












// export class Db{

// }


// export function treeToDb(Component, tree, db = new Db()) {
//   let entitys = db.entitys

//   let q = Component.query()
//   let Entity = { key: q.dispatch }
//   Entity.fields = q.fields
//   if(q.type === 'prop'){
//     // no more information
//     // and we can just put the data into the db
//     db = db.set(q.dispatch, '_', tree)
//   }
//   else if(q.type === 'ident') {
//     // like prop, but with a possible id
//     // return db.set(q.dispatch, q.ident[1], data)
//     // can't set data just yet, but we know it's a collection
//     Entity.type = 'collection'
//     // do we know if it's a reference? not yet

//     // what is id attribute though?
//     // dunno yet frankly
//     // db = db.set(q.ident[0], '_', tree)
//     for( let el, i of tree) {
//       db = db.set(q.ident[0], i, el)
//     }
//   }

//   else if(q.type === 'join'){
//     Entity.type === 'collection'
//     if !isComponent(q.children){
//       for( let el, i of tree) {
//         db = db.set(q.ident[0], i, el)
//       }
//       else {
//         // recurse
//         for(let el, i of tree) {
//           db = db.set(q.ident[0], i, q.children.ident(el))
//           db = treeToDb(q.children, el, db)

//         }


//       }


//     }

//   }


//   // Entitys[q.dispatch]  =


// }

// export function dbToTree(Component, tree){

// }