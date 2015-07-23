'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _reduxThunk = require('redux-thunk');

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

// import { devTools, persistState } from 'redux-devtools';

function combine(stores) {
  return (0, _redux.compose)((0, _redux.applyMiddleware)(_reduxThunk2['default']),
  // devTools(),
  // persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  _redux.createStore)((0, _redux.combineReducers)(stores));
}

var Flux = (function (_React$Component) {
  _inherits(Flux, _React$Component);

  function Flux() {
    _classCallCheck(this, Flux);

    _get(Object.getPrototypeOf(Flux.prototype), 'constructor', this).apply(this, arguments);

    this.state = {
      store: this.props.store || combine(this.props.stores)
    };
  }

  _createClass(Flux, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState({ store: nextProps.store || combine(nextProps.stores) });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      return _react2['default'].createElement(
        _reactRedux.Provider,
        { store: this.state.store },
        function () {
          return _react2['default'].createElement(
            _reactRedux.Connector,
            null,
            function (state) {
              return _this.props.children(state, (0, _redux.bindActionCreators)(_this.props.actions || {}, state.dispatch), _this.state.store);
            }
          );
        }
      );
    }
  }]);

  return Flux;
})(_react2['default'].Component);

exports.Flux = Flux;

var Connect = (function (_React$Component2) {
  _inherits(Connect, _React$Component2);

  function Connect() {
    _classCallCheck(this, Connect);

    _get(Object.getPrototypeOf(Connect.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Connect, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2['default'].createElement(
        _reactRedux.Connector,
        { select: this.props.select },
        function (state) {
          return _this2.props.children(state, (0, _redux.bindActionCreators)(_this2.props.actions || {}, state.dispatch));
        }
      );
    }
  }], [{
    key: 'defaultProps',
    value: {
      select: function select(x) {
        return x;
      }
    },
    enumerable: true
  }]);

  return Connect;
})(_react2['default'].Component);

exports.Connect = Connect;