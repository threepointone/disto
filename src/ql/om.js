export function exprToKey(expr) {

}

export function mutationKey(expr) {

}

export function joinKey(expr) {

}

export function joinEntry(expr) {

}

export function joinValue(expr) {

}

export function isJoin(expr) {

}

// a bunch of focus stuff
// focussedJoin(expr, ks)
// focusQuery(query, path)
// focusPath()


// Ident
// IQuery
// IQueryParams
// ILocalState

export function replaceVar(expr, params) {

}

export function bindQuery(query, params) {

}

export function getLocalQueryData(component) {

}

export function getUnboundQuery(component) {

}

export function getParams(component) {

}

// iquery?

export function getQuery(component) {

}

export function tag(x, klass) {

}

export function computeReactKey(cl, props) {

}

export function getReconciler(c) {

}

// computed properties?

export function gatherSends(env, key, remotes) {

}

export function transformReads(r, txns) {

}

export function setQuery(x, paramsAndOrQuery) {

}

export function updateQuery(x, paramsAndOrQuery) {

}

export function subquery(x, ref, klass) {

}

export function addRoot() {

}

export function removeRoot() {

}

// ITxIntercept !!!

export function annotateMutations() {

}


export function transact(x, tx) {

}


export function parser({ read, mutate }) {

}

// dispatch helper

export function queryToAst() {

}

export function astToQuery() {

}

// Indexer
// @indexes
export class Indexer {
  indexRoot() {

  }
  indexComponent() {

  }
  dropComponent() {

  }
  keyToComponents() {

  }
}

// "Given a function (Component -> Ref), return an indexer."
export function indexer() {

}

export function getIndexer() {

}


export function refToComponents() {

}

export function refToAny() {

}

export function classToAny() {

}

export function classPathToQueries() {

}

export function fullQuery() {

}

export function normalize(query, data, refs, unionSeen) {
  if(query.node='*')

}

export function treeToDb(x, data, mergeIdents) {

}

export function siftIdents() {

}

export function reduceQueryDepth() {

}

export function reduceUnionRecursionDepth() {

}

export function denormalize(query, data, refs, mapIdent, identsSeen, unionExpr, recurseKey) {

}

export function dbToTree(query, data, refs) {

}

export function mergeIdents() {

}

export function mergeNovelty(r, state, res, query) {

}

export function defaultMerge(r, state, res, query) {

}

export function merge(){

}

class Reconciler {
  // IDeref
  addRoot(root, rootKlass, target, options) {

  }
  removeRoot(target) {

  }
  reindex() {

  }
  queue(ks) {

  }
  scheduleRender(sends) {

  }
  scheduleSends() {

  }
  reconcile() {

  }
  send() {

  }



}


export function defaultUiProps() {

}

export function defaultMergeIdent() {

}

export function defaultMergeTree() {

}

export function defaultMigrate() {

}

export function defaultExtractErrors(r, res, query) {

}

export function reconciler({ state, shared, sharedFn, }) {

}

