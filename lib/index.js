'use strict';

module.exports = Object.assign({}, require('./flux.js'), {
  hot: require('./hot.js').hot,
  record: require('./record'),
  mix: require('./mix.js')
});