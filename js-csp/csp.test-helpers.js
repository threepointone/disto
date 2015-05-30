"use strict";

var csp = require("./csp");
var chan = csp.chan;
var go = csp.go;
var put = csp.put;
var take = csp.take;

var mocha = require("mocha");
var it = mocha.it;

function identity_chan(x) {
  var ch = chan(1);
  go(regeneratorRuntime.mark(function callee$1$0() {
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.next = 2;
          return put(ch, x);

        case 2:
          ch.close();

        case 3:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  }));
  return ch;
}

function check(f, done) {
  return (function () {
    try {
      f();
      done();
    } catch (e) {
      done(e);
    }
  })();
}

// it("", g(function*() {
// }));
function g(f) {
  return function (done) {
    go(f, [done]);
  };
};

function gg(f) {
  return g(regeneratorRuntime.mark(function callee$1$0(done) {
    var ch;
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          context$2$0.prev = 0;
          ch = go(f, []);
          context$2$0.next = 4;
          return take(ch);

        case 4:
          done();
          context$2$0.next = 10;
          break;

        case 7:
          context$2$0.prev = 7;
          context$2$0.t0 = context$2$0["catch"](0);

          done(context$2$0.t0);

        case 10:
        case "end":
          return context$2$0.stop();
      }
    }, callee$1$0, this, [[0, 7]]);
  }));
}

module.exports = {
  identity_chan: identity_chan,
  check: check,
  goAsync: g,
  go: gg,

  // f must be a generator function. For now assertions should be inside f's
  // top-level, not functions f may call (that works but a failing test
  // may break following tests).
  it: function it(desc, f) {
    return mocha.it(desc, gg(f));
  },

  beforeEach: function beforeEach(f) {
    return mocha.beforeEach(gg(f));
  },

  afterEach: function afterEach(f) {
    return mocha.afterEach(gg(f));
  },

  before: function before(f) {
    return mocha.before(gg(f));
  },

  after: function after(f) {
    return mocha.after(gg(f));
  }
};