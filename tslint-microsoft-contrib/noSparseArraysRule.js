"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var ErrorTolerantWalker_1 = require('./utils/ErrorTolerantWalker');
var SyntaxKind_1 = require('./utils/SyntaxKind');
var Utils_1 = require('./utils/Utils');
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoSparseArraysRuleWalker(sourceFile, this.getOptions()));
    };
    Rule.FAILURE_STRING = 'Unexpected comma in middle of array';
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoSparseArraysRuleWalker = (function (_super) {
    __extends(NoSparseArraysRuleWalker, _super);
    function NoSparseArraysRuleWalker() {
        _super.apply(this, arguments);
    }
    NoSparseArraysRuleWalker.prototype.visitNode = function (node) {
        if (node.kind === SyntaxKind_1.SyntaxKind.current().ArrayLiteralExpression) {
            if (this.isSparseArray(node)) {
                this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
            }
        }
        _super.prototype.visitNode.call(this, node);
    };
    NoSparseArraysRuleWalker.prototype.isSparseArray = function (node) {
        return Utils_1.Utils.exists(node.elements, function (element) {
            return element.kind === SyntaxKind_1.SyntaxKind.current().OmittedExpression;
        });
    };
    return NoSparseArraysRuleWalker;
}(ErrorTolerantWalker_1.ErrorTolerantWalker));
//# sourceMappingURL=noSparseArraysRule.js.map