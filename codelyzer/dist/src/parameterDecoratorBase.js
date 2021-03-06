"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var ts = require('typescript');
var sprintf_js_1 = require('sprintf-js');
var UseParameterDecorator = (function (_super) {
    __extends(UseParameterDecorator, _super);
    function UseParameterDecorator(config, ruleName, value, disabledIntervals) {
        _super.call(this, ruleName, value, disabledIntervals);
        this.config = config;
        config.errorMessage = config.errorMessage || UseParameterDecorator.FAILURE_STRING;
    }
    UseParameterDecorator.formatFailureString = function (config, decoratorName, className) {
        var decorators = config.decoratorName;
        if (decorators instanceof Array) {
            decorators = decorators.map(function (d) { return ("\"@" + d + "\""); }).join(', ');
        }
        else {
            decorators = "\"@" + decorators + "\"";
        }
        return sprintf_js_1.sprintf(config.errorMessage, decoratorName, className, config.propertyName, decorators);
    };
    UseParameterDecorator.prototype.apply = function (sourceFile) {
        var documentRegistry = ts.createDocumentRegistry();
        var languageServiceHost = Lint.createLanguageServiceHost('file.ts', sourceFile.getFullText());
        return this.applyWithWalker(new DirectiveMetadataWalker(sourceFile, this.getOptions(), ts.createLanguageService(languageServiceHost, documentRegistry), this.config));
    };
    UseParameterDecorator.FAILURE_STRING = 'In the "@%s" class decorator of the class "%s"' +
        ' you are using the "%s" property, this is considered bad practice. Use %s property decorator instead.';
    return UseParameterDecorator;
}(Lint.Rules.AbstractRule));
exports.UseParameterDecorator = UseParameterDecorator;
var DirectiveMetadataWalker = (function (_super) {
    __extends(DirectiveMetadataWalker, _super);
    function DirectiveMetadataWalker(sourceFile, options, languageService, config) {
        _super.call(this, sourceFile, options);
        this.config = config;
        this.languageService = languageService;
        this.typeChecker = languageService.getProgram().getTypeChecker();
    }
    DirectiveMetadataWalker.prototype.visitClassDeclaration = function (node) {
        (node.decorators || []).forEach(this.validateDecorator.bind(this, node.name.text));
        _super.prototype.visitClassDeclaration.call(this, node);
    };
    DirectiveMetadataWalker.prototype.validateDecorator = function (className, decorator) {
        var baseExpr = decorator.expression || {};
        var expr = baseExpr.expression || {};
        var name = expr.text;
        var args = baseExpr.arguments || [];
        var arg = args[0];
        if (/^(Component|Directive)$/.test(name) && arg) {
            this.validateProperty(className, name, arg);
        }
    };
    DirectiveMetadataWalker.prototype.validateProperty = function (className, decoratorName, arg) {
        var _this = this;
        if (arg.kind === ts.SyntaxKind.ObjectLiteralExpression) {
            arg.properties.filter(function (prop) { return prop.name.text === _this.config.propertyName; })
                .forEach(function (prop) {
                var p = prop;
                _this.addFailure(_this.createFailure(p.getStart(), p.getWidth(), UseParameterDecorator.formatFailureString(_this.config, decoratorName, className)));
            });
        }
    };
    return DirectiveMetadataWalker;
}(Lint.RuleWalker));
