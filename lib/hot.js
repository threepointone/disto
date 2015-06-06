// todo - unregister on unload

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.register = register;
exports.act = act;
exports.hot = hot;

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

function register(dis, m) {
  if (!m.hot) {
    return dis.register;
  }
  var fn = dis.register;
  m.hot.data = m.hot.data || {};
  m.hot.data.dhl = m.hot.data.dhl || {};
  var dhl = m.hot.data.dhl;
  m.hot.sIndex = m.hot.sIndex || 0;

  dhl.reduceFns = dhl.reduceFns || [];
  dhl.stores = dhl.stores || [];
  var couched = function couched(initial, reduce, compare) {
    return (function (i) {
      dhl.reduceFns[i] = reduce;
      if (!dhl.stores[i]) {
        dhl.stores[i] = fn(initial, function () {
          return dhl.reduceFns[i].apply(null, arguments);
        }, compare);
      }
      m.hot.sIndex++;
      return dhl.stores[i];
    })(m.hot.sIndex);
  };

  if (!m.hot.sAttached) {
    m.hot.sAttached = true;
    m.hot.addDisposeHandler(function (data) {
      Object.assign(data, {
        dhl: _extends({}, data.dhl, {
          reduceFns: dhl.reduceFns,
          stores: dhl.stores
        })
      });
    });
  }
  return couched;
}

function act(dis, m) {
  if (!m.hot) {
    return dis.act;
  }
  var fn = dis.act;
  m.hot.data = m.hot.data || {};
  m.hot.data.dhl = m.hot.data.dhl || {};
  var dhl = m.hot.data.dhl;
  m.hot.aIndex = m.hot.aIndex || 0;

  dhl.acts = dhl.acts || [];
  dhl.maps = dhl.maps || [];

  var couched = function couched(map, prefix) {
    return (function (i) {
      dhl.maps[i] = map;
      if (!dhl.acts[i]) {
        dhl.acts[i] = fn(Object.keys(map).reduce(function (o, key) {
          return Object.assign(o, _defineProperty({}, key, function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            if (dhl.maps[i][key]) {
              var _dhl$maps$i;

              return (_dhl$maps$i = dhl.maps[i])[key].apply(_dhl$maps$i, args);
            }
          }));
        }, {}), prefix);
      }

      m.hot.aIndex++;
      return dhl.acts[i];
    })(m.hot.aIndex);
  };

  if (!m.hot.aAttached) {
    m.hot.aAttached = true;
    m.hot.addDisposeHandler(function (data) {
      return Object.assign(data, {
        dhl: _extends({}, data.dhl, {
          acts: dhl.acts,
          maps: dhl.maps
        })
      });
    });
  }
  return couched;
}

function hot(dis, m) {
  return {
    register: register(dis, m),
    act: act(dis, m)
  };
}