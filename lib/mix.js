// via @dan_abramov https://gist.github.com/gaearon/7d94c9f38fdd34a6e690

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

exports["default"] = {
  getInitialState: function getInitialState() {
    var _this = this;

    return Object.keys(this.props || {}).reduce(function (o, key) {
      return _extends({}, o, _defineProperty({}, key, _this.props[key].get()));
    }, {});
  },

  componentWillMount: function componentWillMount() {
    this.subscribe(this.props, this.context, this.setData);
  },

  componentWillReceiveProps: function componentWillReceiveProps(props, context) {
    this.subscribe(props, context, this.setData);
  },

  componentWillUnmount: function componentWillUnmount() {
    this.unsubscribe();
  },

  setData: function setData(key, value) {
    this.setState(function (prevState) {
      return { data: _extends({}, prevState.data, _defineProperty({}, key, value)) };
    });
  },

  subscribe: function subscribe(props, context, _onNext) {
    var newObservables = this.observe(props, context);
    var newSubscriptions = Object.keys(newObservables).reduce(function (o, key) {
      return _extends({}, o, _defineProperty({}, key, newObservables[key].subscribe({
        onNext: function onNext(value) {
          return _onNext(key, value);
        },
        onError: function onError() {},
        onCompleted: function onCompleted() {}
      })));
    }, {});

    this.unsubscribe();
    this.subscriptions = newSubscriptions;
  },

  unsubscribe: function unsubscribe() {
    var _this2 = this;

    Object.keys(this.subscriptions || {}).forEach(function (key) {
      return _this2.subscriptions[key].dispose();
    });
    this.subscriptions = {};
  }
};
module.exports = exports["default"];