"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require('source-map-support').install();
require('babel-polyfill');
const promisify = require('es6-promisify');
const _ = require('lodash');
const path = require('path');
const deps_1 = require('./deps');
const cache_1 = require('./cache');
const helpers = require('./helpers');
const instance_1 = require('./instance');
let loaderUtils = require('loader-utils');
let cachePromise = promisify(cache_1.cache);
function loader(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield compiler.call(undefined, this, text);
        }
        catch (e) {
            console.error(e, e.stack);
            throw e;
        }
    });
}
function compiler(webpack, text) {
    return __awaiter(this, void 0, void 0, function* () {
        if (webpack.cacheable) {
            webpack.cacheable();
        }
        let options = loaderUtils.parseQuery(webpack.query);
        let instanceName = options.instanceName || 'default';
        let instance = instance_1.ensureInstance(webpack, options, instanceName);
        let state = instance.tsState;
        let callback = webpack.async();
        let fileName = state.normalizePath(webpack.resourcePath);
        let resolver = deps_1.createResolver(webpack._compiler.options.externals, state.options.exclude || [], webpack.resolve);
        let depsInjector = {
            add: (depFileName) => webpack.addDependency(depFileName),
            clear: webpack.clearDependencies.bind(webpack)
        };
        let applyDeps = _.once(() => {
            depsInjector.clear();
            depsInjector.add(fileName);
            state.fileAnalyzer.dependencies.applyCompiledFiles(fileName, depsInjector);
            if (state.options.reEmitDependentFiles) {
                state.fileAnalyzer.dependencies.applyChain(fileName, depsInjector);
            }
        });
        if (instance.options.externals && !instance.externalsInvoked) {
            if (instance.externalsInvocation) {
                yield instance.externalsInvocation;
            }
            else {
                let promises = instance.options.externals.map((external) => __awaiter(this, void 0, void 0, function* () {
                    yield state.fileAnalyzer.checkDependencies(resolver, external);
                }));
                instance.externalsInvocation = Promise.all(promises).then(() => {
                    instance.externalsInvoked = true;
                });
                yield instance.externalsInvocation;
            }
        }
        instance.compiledFiles[fileName] = true;
        let doUpdate = false;
        if (instance.options.useWebpackText) {
            if (state.updateFile(fileName, text, true)) {
                doUpdate = true;
            }
        }
        try {
            let wasChanged = yield state.fileAnalyzer.checkDependencies(resolver, fileName);
            if (wasChanged || doUpdate) {
                state.updateProgram();
            }
            let compiledModule;
            if (instance.options.usePrecompiledFiles) {
                compiledModule = cache_1.findCompiledModule(fileName);
            }
            let transformation = null;
            if (compiledModule) {
                state.fileAnalyzer.dependencies.addCompiledModule(fileName, compiledModule.fileName);
                transformation = {
                    text: compiledModule.text,
                    map: compiledModule.map
                        ? JSON.parse(compiledModule.map)
                        : null
                };
            }
            else {
                function transform() {
                    let resultText;
                    let resultSourceMap = null;
                    let output = state.emit(fileName);
                    let result = helpers.findResultFor(output, fileName);
                    if (result.text === undefined) {
                        throw new Error('No output found for ' + fileName);
                    }
                    resultText = result.text;
                    let sourceFileName = fileName.replace(process.cwd() + '/', '');
                    if (result.sourceMap) {
                        resultSourceMap = JSON.parse(result.sourceMap);
                        resultSourceMap.sources = [sourceFileName];
                        resultSourceMap.file = sourceFileName;
                        resultSourceMap.sourcesContent = [text];
                        resultText = resultText.replace(/^\/\/# sourceMappingURL=[^\r\n]*/gm, '');
                    }
                    if (instance.options.useBabel) {
                        let defaultOptions = {
                            inputSourceMap: resultSourceMap,
                            sourceRoot: process.cwd(),
                            filename: fileName,
                            sourceMap: true
                        };
                        let babelResult = instance.babelImpl.transform(resultText, defaultOptions);
                        resultText = babelResult.code;
                        resultSourceMap = babelResult.map;
                    }
                    return {
                        text: resultText,
                        map: resultSourceMap
                    };
                }
                if (instance.options.useCache) {
                    transformation = yield cachePromise({
                        source: text,
                        identifier: instance.cacheIdentifier,
                        directory: instance.options.cacheDirectory,
                        options: webpack.query,
                        transform: transform
                    });
                }
                else {
                    transformation = transform();
                }
            }
            let resultText = transformation.text;
            let resultSourceMap = transformation.map;
            if (resultSourceMap) {
                let sourcePath = path.relative(instance.options.sourceRoot, loaderUtils.getRemainingRequest(webpack));
                resultSourceMap.sources = [sourcePath];
                resultSourceMap.file = fileName;
                resultSourceMap.sourcesContent = [text];
            }
            try {
                callback(null, resultText, resultSourceMap);
            }
            catch (e) {
                console.error('Error in bail mode:', e, e.stack.join
                    ? e.stack.join('\n')
                    : e.stack);
                process.exit(1);
            }
        }
        catch (err) {
            console.error(err.toString(), err.stack.toString());
            callback(err, helpers.codegenErrorReport([err]));
        }
        finally {
            applyDeps();
        }
    });
}
class ForkCheckerPlugin {
    apply(compiler) {
        compiler.plugin("watch-run", function (params, callback) {
            compiler._tsFork = true;
            callback();
        });
    }
}
loader.ForkCheckerPlugin = ForkCheckerPlugin;
module.exports = loader;
//# sourceMappingURL=index.js.map