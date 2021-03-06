"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
require('source-map-support').install();
require('babel-polyfill');
var promisify = require('es6-promisify');
var _ = require('lodash');
var path = require('path');
var deps_1 = require('./deps');
var cache_1 = require('./cache');
var helpers = require('./helpers');
var instance_1 = require('./instance');
var loaderUtils = require('loader-utils');
var cachePromise = promisify(cache_1.cache);
function loader(text) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.next = 3;
                        return compiler.call(undefined, this, text);

                    case 3:
                        _context.next = 9;
                        break;

                    case 5:
                        _context.prev = 5;
                        _context.t0 = _context['catch'](0);

                        console.error(_context.t0, _context.t0.stack);
                        throw _context.t0;

                    case 9:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 5]]);
    }));
}
function compiler(webpack, text) {
    return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee3() {
        var _this = this;

        var options, instanceName, instance, state, callback, fileName, resolver, depsInjector, applyDeps, promises, doUpdate, wasChanged, compiledModule, transformation, transform, resultText, resultSourceMap, sourcePath;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        if (webpack.cacheable) {
                            webpack.cacheable();
                        }
                        options = loaderUtils.parseQuery(webpack.query);
                        instanceName = options.instanceName || 'default';
                        instance = instance_1.ensureInstance(webpack, options, instanceName);
                        state = instance.tsState;
                        callback = webpack.async();
                        fileName = state.normalizePath(webpack.resourcePath);
                        resolver = deps_1.createResolver(webpack._compiler.options.externals, state.options.exclude || [], webpack.resolve);
                        depsInjector = {
                            add: function add(depFileName) {
                                return webpack.addDependency(depFileName);
                            },
                            clear: webpack.clearDependencies.bind(webpack)
                        };
                        applyDeps = _.once(function () {
                            depsInjector.clear();
                            depsInjector.add(fileName);
                            state.fileAnalyzer.dependencies.applyCompiledFiles(fileName, depsInjector);
                            if (state.options.reEmitDependentFiles) {
                                state.fileAnalyzer.dependencies.applyChain(fileName, depsInjector);
                            }
                        });

                        if (!(instance.options.externals && !instance.externalsInvoked)) {
                            _context3.next = 20;
                            break;
                        }

                        if (!instance.externalsInvocation) {
                            _context3.next = 16;
                            break;
                        }

                        _context3.next = 14;
                        return instance.externalsInvocation;

                    case 14:
                        _context3.next = 20;
                        break;

                    case 16:
                        promises = instance.options.externals.map(function (external) {
                            return __awaiter(_this, void 0, void 0, regeneratorRuntime.mark(function _callee2() {
                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _context2.next = 2;
                                                return state.fileAnalyzer.checkDependencies(resolver, external);

                                            case 2:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, this);
                            }));
                        });

                        instance.externalsInvocation = Promise.all(promises).then(function () {
                            instance.externalsInvoked = true;
                        });
                        _context3.next = 20;
                        return instance.externalsInvocation;

                    case 20:
                        instance.compiledFiles[fileName] = true;
                        doUpdate = false;

                        if (instance.options.useWebpackText) {
                            if (state.updateFile(fileName, text, true)) {
                                doUpdate = true;
                            }
                        }
                        _context3.prev = 23;
                        _context3.next = 26;
                        return state.fileAnalyzer.checkDependencies(resolver, fileName);

                    case 26:
                        wasChanged = _context3.sent;

                        if (wasChanged || doUpdate) {
                            state.updateProgram();
                        }
                        compiledModule = undefined;

                        if (instance.options.usePrecompiledFiles) {
                            compiledModule = cache_1.findCompiledModule(fileName);
                        }
                        transformation = null;

                        if (!compiledModule) {
                            _context3.next = 36;
                            break;
                        }

                        state.fileAnalyzer.dependencies.addCompiledModule(fileName, compiledModule.fileName);
                        transformation = {
                            text: compiledModule.text,
                            map: compiledModule.map ? JSON.parse(compiledModule.map) : null
                        };
                        _context3.next = 44;
                        break;

                    case 36:
                        transform = function transform() {
                            var resultText = undefined;
                            var resultSourceMap = null;
                            var output = state.emit(fileName);
                            var result = helpers.findResultFor(output, fileName);
                            if (result.text === undefined) {
                                throw new Error('No output found for ' + fileName);
                            }
                            resultText = result.text;
                            var sourceFileName = fileName.replace(process.cwd() + '/', '');
                            if (result.sourceMap) {
                                resultSourceMap = JSON.parse(result.sourceMap);
                                resultSourceMap.sources = [sourceFileName];
                                resultSourceMap.file = sourceFileName;
                                resultSourceMap.sourcesContent = [text];
                                resultText = resultText.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
                            }
                            if (instance.options.useBabel) {
                                var defaultOptions = {
                                    inputSourceMap: resultSourceMap,
                                    sourceRoot: process.cwd(),
                                    filename: fileName,
                                    sourceMap: true
                                };
                                var babelResult = instance.babelImpl.transform(resultText, defaultOptions);
                                resultText = babelResult.code;
                                resultSourceMap = babelResult.map;
                            }
                            return {
                                text: resultText,
                                map: resultSourceMap
                            };
                        };

                        if (!instance.options.useCache) {
                            _context3.next = 43;
                            break;
                        }

                        _context3.next = 40;
                        return cachePromise({
                            source: text,
                            identifier: instance.cacheIdentifier,
                            directory: instance.options.cacheDirectory,
                            options: webpack.query,
                            transform: transform
                        });

                    case 40:
                        transformation = _context3.sent;
                        _context3.next = 44;
                        break;

                    case 43:
                        transformation = transform();

                    case 44:
                        resultText = transformation.text;
                        resultSourceMap = transformation.map;

                        if (resultSourceMap) {
                            sourcePath = path.relative(instance.options.sourceRoot, loaderUtils.getRemainingRequest(webpack));

                            resultSourceMap.sources = [sourcePath];
                            resultSourceMap.file = fileName;
                            resultSourceMap.sourcesContent = [text];
                        }
                        try {
                            callback(null, resultText, resultSourceMap);
                        } catch (e) {
                            console.error('Error in bail mode:', e, e.stack.join ? e.stack.join('\n') : e.stack);
                            process.exit(1);
                        }
                        _context3.next = 54;
                        break;

                    case 50:
                        _context3.prev = 50;
                        _context3.t0 = _context3['catch'](23);

                        console.error(_context3.t0.toString(), _context3.t0.stack.toString());
                        callback(_context3.t0, helpers.codegenErrorReport([_context3.t0]));

                    case 54:
                        _context3.prev = 54;

                        applyDeps();
                        return _context3.finish(54);

                    case 57:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[23, 50, 54, 57]]);
    }));
}

var ForkCheckerPlugin = function () {
    function ForkCheckerPlugin() {
        _classCallCheck(this, ForkCheckerPlugin);
    }

    _createClass(ForkCheckerPlugin, [{
        key: 'apply',
        value: function apply(compiler) {
            compiler.plugin("watch-run", function (params, callback) {
                compiler._tsFork = true;
                callback();
            });
        }
    }]);

    return ForkCheckerPlugin;
}();

loader.ForkCheckerPlugin = ForkCheckerPlugin;
module.exports = loader;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map