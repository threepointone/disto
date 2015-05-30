'use strict';

var csp = require('./csp.core');

function pipelineInternal(n, to, from, close, taskFn) {
  if (n <= 0) {
    throw new Error('n must be positive');
  }

  var jobs = csp.chan(n);
  var results = csp.chan(n);

  for (var _ = 0; _ < n; _++) {
    csp.go(regeneratorRuntime.mark(function callee$1$0(taskFn, jobs, results) {
      var job;
      return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!true) {
              context$2$0.next = 9;
              break;
            }

            context$2$0.next = 3;
            return csp.take(jobs);

          case 3:
            job = context$2$0.sent;

            if (taskFn(job)) {
              context$2$0.next = 7;
              break;
            }

            results.close();
            return context$2$0.abrupt('break', 9);

          case 7:
            context$2$0.next = 0;
            break;

          case 9:
          case 'end':
            return context$2$0.stop();
        }
      }, callee$1$0, this);
    }), [taskFn, jobs, results]);
  }

  csp.go(regeneratorRuntime.mark(function callee$1$0(jobs, from, results) {
    var v, p;
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (!true) {
            context$2$0.next = 16;
            break;
          }

          context$2$0.next = 3;
          return csp.take(from);

        case 3:
          v = context$2$0.sent;

          if (!(v === csp.CLOSED)) {
            context$2$0.next = 9;
            break;
          }

          jobs.close();
          return context$2$0.abrupt('break', 16);

        case 9:
          p = csp.chan(1);
          context$2$0.next = 12;
          return csp.put(jobs, [v, p]);

        case 12:
          context$2$0.next = 14;
          return csp.put(results, p);

        case 14:
          context$2$0.next = 0;
          break;

        case 16:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  }), [jobs, from, results]);

  csp.go(regeneratorRuntime.mark(function callee$1$0(results, close, to) {
    var p, res, v;
    return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
      while (1) switch (context$2$0.prev = context$2$0.next) {
        case 0:
          if (!true) {
            context$2$0.next = 26;
            break;
          }

          context$2$0.next = 3;
          return csp.take(results);

        case 3:
          p = context$2$0.sent;

          if (!(p === csp.CLOSED)) {
            context$2$0.next = 9;
            break;
          }

          if (close) {
            to.close();
          }
          return context$2$0.abrupt('break', 26);

        case 9:
          context$2$0.next = 11;
          return csp.take(p);

        case 11:
          res = context$2$0.sent;

        case 12:
          if (!true) {
            context$2$0.next = 24;
            break;
          }

          context$2$0.next = 15;
          return csp.take(res);

        case 15:
          v = context$2$0.sent;

          if (!(v !== csp.CLOSED)) {
            context$2$0.next = 21;
            break;
          }

          context$2$0.next = 19;
          return csp.put(to, v);

        case 19:
          context$2$0.next = 22;
          break;

        case 21:
          return context$2$0.abrupt('break', 24);

        case 22:
          context$2$0.next = 12;
          break;

        case 24:
          context$2$0.next = 0;
          break;

        case 26:
        case 'end':
          return context$2$0.stop();
      }
    }, callee$1$0, this);
  }), [results, close, to]);

  return to;
}

function pipeline(to, xf, from, keepOpen, exHandler) {

  function taskFn(job) {
    if (job === csp.CLOSED) {
      return null;
    } else {
      var v = job[0];
      var p = job[1];
      var res = csp.chan(1, xf, exHandler);

      csp.go(regeneratorRuntime.mark(function callee$2$0(res, v) {
        return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
          while (1) switch (context$3$0.prev = context$3$0.next) {
            case 0:
              context$3$0.next = 2;
              return csp.put(res, v);

            case 2:
              res.close();

            case 3:
            case 'end':
              return context$3$0.stop();
          }
        }, callee$2$0, this);
      }), [res, v]);

      csp.putAsync(p, res);

      return true;
    }
  }

  return pipelineInternal(1, to, from, !keepOpen, taskFn);
}

function pipelineAsync(n, to, af, from, keepOpen) {

  function taskFn(job) {
    if (job === csp.CLOSED) {
      return null;
    } else {
      var v = job[0];
      var p = job[1];
      var res = csp.chan(1);
      af(v, res);
      csp.putAsync(p, res);
      return true;
    }
  }

  return pipelineInternal(n, to, from, !keepOpen, taskFn);
}

module.exports = {
  pipeline: pipeline,
  pipelineAsync: pipelineAsync
};