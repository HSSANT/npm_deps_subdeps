/// <reference path='../node_modules/typescript/lib/typescriptServices.d.ts' />
/// <reference path="./defines.d.ts"/>
/// <reference path='../typings/tsd.d.ts' />

require('source-map-support').install();
require('babel-polyfill');

import * as promisify from 'es6-promisify';
import * as _ from 'lodash';
import * as path from 'path';

import { ICompilerOptions } from './host';
import { createResolver } from './deps';
import { findCompiledModule, cache } from './cache';
import * as helpers from './helpers';
import { IWebPack, ensureInstance } from './instance';

let loaderUtils = require('loader-utils');
let cachePromise: any = promisify(cache);

async function loader(text) {
    try {
        await compiler.call(undefined, this, text);
    } catch(e) {
        console.error(e, e.stack);
        throw e;
    }
}

async function compiler(webpack: IWebPack, text: string): Promise<void> {
    if (webpack.cacheable) {
        webpack.cacheable();
    }

    let options = <ICompilerOptions>loaderUtils.parseQuery(webpack.query);
    let instanceName = options.instanceName || 'default';

    let instance = ensureInstance(webpack, options, instanceName);

    let state = instance.tsState;

    let callback = webpack.async();
    let fileName = state.normalizePath(webpack.resourcePath);

    let resolver = createResolver(
        webpack._compiler.options.externals,
        state.options.exclude || [],
        webpack.resolve
    );

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
            await instance.externalsInvocation;
        } else {
            let promises = instance.options.externals.map(async (external) => {
                await state.fileAnalyzer.checkDependencies(resolver, external);
            });

            instance.externalsInvocation = Promise.all(promises).then(() => {
                instance.externalsInvoked = true;
            });

            await instance.externalsInvocation;
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
        let wasChanged = await state.fileAnalyzer.checkDependencies(resolver, fileName);
        if (wasChanged || doUpdate) {
            state.updateProgram();
        }

        let compiledModule;
        if (instance.options.usePrecompiledFiles) {
            compiledModule = findCompiledModule(fileName);
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
        } else {

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
                    resultSourceMap.sources = [ sourceFileName ];
                    resultSourceMap.file = sourceFileName;
                    resultSourceMap.sourcesContent = [ text ];

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
                transformation = await cachePromise({
                    source: text,
                    identifier: instance.cacheIdentifier,
                    directory: instance.options.cacheDirectory,
                    options: webpack.query,
                    transform: transform
                } as any);
            } else {
                transformation = transform();
            }
        }

        let resultText = transformation.text;
        let resultSourceMap = transformation.map;

        if (resultSourceMap) {
            let sourcePath = path.relative(
                instance.options.sourceRoot,
                loaderUtils.getRemainingRequest(webpack)
            );

            resultSourceMap.sources = [ sourcePath ];
            resultSourceMap.file = fileName;
            resultSourceMap.sourcesContent = [ text ];
        }

        try {
            callback(null, resultText, resultSourceMap);
        } catch (e) {
            console.error('Error in bail mode:', e, e.stack.join
                ? e.stack.join ('\n')
                : e.stack
            );
            process.exit(1);
        }
    } catch (err) {
        console.error(err.toString(), err.stack.toString());
        callback(err, helpers.codegenErrorReport([err]));
    } finally {
        applyDeps();
    }
}

class ForkCheckerPlugin {
    apply(compiler) {
        compiler.plugin("watch-run", function(params, callback) {
            compiler._tsFork = true;
            callback();
        });
    }
}

(loader as any).ForkCheckerPlugin = ForkCheckerPlugin;

export = loader;
