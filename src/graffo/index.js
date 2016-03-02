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

// recursive join
ƒ`key1 key2 {some ...}`::print()

// join + params
ƒ`'{somekey [subkey]} { arg 1 }`::print()

// reference / ident
ƒ`[foo 0]`::print()

// union
ƒ`{ items {photo : [id title image] post: [id title post] } }`::print()
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