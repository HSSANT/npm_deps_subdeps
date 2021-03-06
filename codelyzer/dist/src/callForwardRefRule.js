"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var sprintf_js_1 = require('sprintf-js');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new ExpressionCallMetadataWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'In the class "%s" you are calling forwardRef,' +
        ' which is considered a bad practice ' +
        'and indicates either a cyclic dependency or ' +
        'inconsistency in the services declaration';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var ExpressionCallMetadataWalker = (function (_super) {
    __extends(ExpressionCallMetadataWalker, _super);
    function ExpressionCallMetadataWalker() {
        _super.apply(this, arguments);
    }
    ExpressionCallMetadataWalker.prototype.visitCallExpression = function (node) {
        this.validateCallExpression(node);
        _super.prototype.visitCallExpression.call(this, node);
    };
    ExpressionCallMetadataWalker.prototype.validateCallExpression = function (callExpression) {
        if (callExpression.expression.text === 'forwardRef') {
            var currentNode = callExpression;
            while (currentNode.parent.parent) {
                currentNode = currentNode.parent;
            }
            var failureConfig = [currentNode.name.text];
            failureConfig.unshift(Rule.FAILURE_STRING);
            this.addFailure(this.createFailure(callExpression.getStart(), callExpression.getWidth(), sprintf_js_1.sprintf.apply(this, failureConfig)));
        }
    };
    return ExpressionCallMetadataWalker;
}(Lint.RuleWalker));
exports.ExpressionCallMetadataWalker = ExpressionCallMetadataWalker;
