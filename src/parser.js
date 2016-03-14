
// export default function makeParser(config) {
//   return {
//     read(env, query, remote = false) {
//        // should read from normalized store
//        // should that include original data? probably not
//       return query.reduce((o, field) =>
//         (o[field.node] = config.read(env, field.node, field), o), {})
//     },
//     mutate(env, action) {
//       let keys = config.mutate(env, action)
//       env.store.dispatch(action)
//     }
//   }
// }


// transform-reads
//   "Given r (a reconciler) and a query expression including a mutation and
//    any simple reads, return the equivalent query expression where the simple
//    reads have been replaced by the full query for each component that cares about
//    the specified read."

import isPlainObject from 'lodash.isplainobject'

export function exprToAst(expr) {
  if(typeof expr === 'string') {
    return {
      type: 'prop',
      key: expr,
      dispatchKey: expr
    }
  }
  if(Array.isArray(expr)) {
    return {
      type: 'prop',
      key: expr,
      dispatchKey: expr[0]
    }
  }
  if(isPlainObject(expr)) {

  }


}

// `

// {[foo 0] [bar]}
//   (is (= (parser/expr->ast '(:foo {:bar 1}))
//          {:type :prop :key :foo :dispatch-key :foo :params {:bar 1}}))
//   (is (= (dissoc (parser/expr->ast '({:foo [:bar :baz]} {:woz 1})) :children)
//          {:type :join, :dispatch-key :foo, :key :foo, :query [:bar :baz]
//           :params {:woz 1}}))
//   (is (= (dissoc (parser/expr->ast '({[:foo 0] [:bar :baz]} {:woz 1})) :children)
//          {:type :join, :dispatch-key :foo, :key [:foo 0], :query [:bar :baz]
//           :params {:woz 1}}))
//   (is (= (parser/expr->ast '(do/it {:woz 1}))
//          {:type :call :key 'do/it :dispatch-key 'do/it :params {:woz 1}}))
//   (is (= (parser/expr->ast '(do/it))
//          {:type :call :key 'do/it :dispatch-key 'do/it :params {}})))

