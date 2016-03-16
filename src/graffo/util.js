
// let state = {
//   foo: [ 'abc' ],
//   woz: 'boz',
//   jayjay: [ { id: 0, xyz: '123a', type: 'one', a: 1123123 }, { id: 1, xyz: '456b', type: 'two' } ],
//   foofoo: [ { id: 'a', abc: 'hjhjhj' }, { id: 'b', xyz: 'uydusd' } ],
//   maca: {
//     rena: {
//       hola: 'poopoo'
//     }
//   }
// }

// let db = treeToDb(ƒ`
//   foo
//   {all [*]}
//   [iden 1]
//   {jayjay
//     {
//       one: [a b c]
//       two: [d e f]
//     }
//   }
//   {foofoo  [id abc]}
//   { maca [{rena [hola]} dance]}
//   woz
//   `, state)


// dbToTree(ƒ`{jayjay
//     {
//       one: [*]
//       two: [d e f]
//     }
//   }`, db.result, db)::log()

// ƒ`
//   foo
//   {all [*]}
//   [iden 1]
//   {jayjay
//     {
//       one: [a b c]
//       two: [d e f]
//     }
//   }
//   {foofoo  [id abc]}
//   { maca [{rena [hola]} dance]}
//   woz
//   `::log()

// dbToTree(ƒ`{foofoo [id abc]}`, db.result, db)::log()


// normalize(state, s)::print()

// function exec(remote) {
//   // console.log(this)
//   return p({ state }, this, remote)
// }
// let exec = (remote) => p({ state }, query, remote)

// ƒ`[foo 0]`::log()

// // prop
// astTo(queryTo(ƒ`foo`))::log()

// // prop + params
// astTo(queryTo(ƒ`'foo {arg 123}`))::log()

// // join + sub-select
// astTo(queryTo(ƒ`{key [sub]}`))::log()

// // recursive join
// astTo(queryTo(ƒ`key1 key2 {some ...}`))::log()

// // join + params
// astTo(queryTo(ƒ`'{somekey [subkey]} { arg 1 }`))::log()

// // reference / ident
// astTo(queryTo(ƒ`[post 1234]`))::log()

// // union
// astTo(queryTo(ƒ`{ items {photo : [id title image] post: [id title post] } }`))::log()

// astTo(queryTo(ƒ`{[byId 1] [age]}{[byId 3] [name]}`))::log()

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


// read(data, ƒ`items`)::log()

// [(fire-missiles!)]                       ;;mutation
// [(fire-missiles! {:target :foo})]        ;;mutation + params
// { :photo [...subquery...]
//   :video [...subquery...]
//   :comment [...subquery...] }


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

