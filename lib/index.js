'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reduxReact = require('redux/react');

var _redux = require('redux');

var _reduxLibMiddlewareThunk = require('redux/lib/middleware/thunk');

var _reduxLibMiddlewareThunk2 = _interopRequireDefault(_reduxLibMiddlewareThunk);

var Flux = (function (_React$Component) {
  function Flux() {
    _classCallCheck(this, Flux);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }

    this.state = {
      redux: this.props.redux || (0, _redux.createRedux)((0, _redux.createDispatcher)((0, _redux.composeStores)(this.props.stores), function (getState) {
        return [(0, _reduxLibMiddlewareThunk2['default'])(getState)];
      }))
    };
  }

  _inherits(Flux, _React$Component);

  _createClass(Flux, [{
    key: 'render',
    value: function render() {
      var _this = this;

      return _react2['default'].createElement(
        _reduxReact.Provider,
        { redux: this.state.redux },
        function () {
          return _react2['default'].createElement(
            _reduxReact.Connector,
            null,
            function (state) {
              return _this.props.children(state, (0, _redux.bindActionCreators)(_this.props.actions || {}, state.dispatch));
            }
          );
        }
      );
    }
  }]);

  return Flux;
})(_react2['default'].Component);

exports.Flux = Flux;