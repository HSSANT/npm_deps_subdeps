"use strict";

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var utils_1 = require('./utils');
var ps = require('ps-node');
function getCheckerRuntimeProcess() {
    var opts = {
        command: /node/,
        arguments: /checker-runtime/,
        psargs: 'aux'
    };
    return new Promise(function (resolve, reject) {
        ps.lookup(opts, function (err, resultList) {
            resolve(resultList[0]);
        });
    });
}
;
function kill(p) {
    return new Promise(function (resolve, reject) {
        ps.kill(p.pid, resolve);
    });
}
;
function sleep(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(resolve, time);
    });
}
;
describe('checker test', function () {
    this.timeout(5000);
    var fixture = utils_1.fixturePath(['checker', 'to-check.ts']);
    var config = utils_1.createConfig({
        entry: fixture
    }, {
        watch: true,
        forkChecker: true,
        loaderParams: '&+forkChecker'
    });
    it('should fork checker in separate process', function () {
        return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
            var watcher, pid;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return utils_1.cleanOutputDir();

                        case 2:
                            _context.next = 4;
                            return utils_1.watch(config, function () {});

                        case 4:
                            watcher = _context.sent;
                            _context.next = 7;
                            return getCheckerRuntimeProcess();

                        case 7:
                            pid = _context.sent;

                            utils_1.expect(pid).ok;
                            watcher.close();
                            _context.next = 12;
                            return kill(pid);

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
    });
    it('should fork only one checker after multiple changes', function () {
        return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
            var watcher, pid, i;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return utils_1.cleanOutputDir();

                        case 2:
                            _context2.next = 4;
                            return utils_1.watch(config, function () {});

                        case 4:
                            watcher = _context2.sent;
                            _context2.next = 7;
                            return getCheckerRuntimeProcess();

                        case 7:
                            pid = _context2.sent;

                            utils_1.expect(pid).ok;
                            i = 10;

                        case 10:
                            if (! i--) {
                                _context2.next = 17;
                                break;
                            }

                            _context2.next = 13;
                            return utils_1.touchFile(fixture);

                        case 13:
                            _context2.next = 15;
                            return sleep(50);

                        case 15:
                            _context2.next = 10;
                            break;

                        case 17:
                            _context2.next = 19;
                            return sleep(2000);

                        case 19:
                            watcher.close();
                            _context2.next = 22;
                            return kill(pid);

                        case 22:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
    });
});
//# sourceMappingURL=checker.js.map
//# sourceMappingURL=checker.js.map