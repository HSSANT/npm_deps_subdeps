"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var AstUtils_1 = require('./utils/AstUtils');
var SyntaxKind_1 = require('./utils/SyntaxKind');
var FAILURE_STRING_MANIPULATION = 'Replace HTML string manipulation with jQuery API: ';
var FAILURE_STRING_COMPLEX = 'Replace complex HTML strings with jQuery API: ';
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new NoJqueryRawElementsRuleWalker(sourceFile, this.getOptions()));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var NoJqueryRawElementsRuleWalker = (function (_super) {
    __extends(NoJqueryRawElementsRuleWalker, _super);
    function NoJqueryRawElementsRuleWalker() {
        _super.apply(this, arguments);
    }
    NoJqueryRawElementsRuleWalker.prototype.visitCallExpression = function (node) {
        var functionName = AstUtils_1.AstUtils.getFunctionName(node);
        if (AstUtils_1.AstUtils.isJQuery(functionName) && node.arguments.length > 0) {
            var firstArg = node.arguments[0];
            if (firstArg.kind === SyntaxKind_1.SyntaxKind.current().StringLiteral) {
                if (this.isComplexHtmlElement(firstArg)) {
                    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), FAILURE_STRING_COMPLEX + node.getText()));
                }
            }
            else {
                var finder = new HtmlLikeStringLiteralFinder(this.getSourceFile(), this.getOptions());
                finder.walk(node.arguments[0]);
                if (finder.isFound()) {
                    this.addFailure(this.createFailure(node.getStart(), node.getWidth(), FAILURE_STRING_MANIPULATION + node.getText()));
                }
            }
        }
        _super.prototype.visitCallExpression.call(this, node);
    };
    NoJqueryRawElementsRuleWalker.prototype.isComplexHtmlElement = function (literal) {
        var text = literal.text.trim();
        if (/^<.*>$/.test(text) === false) {
            return false;
        }
        if (/^<[A-Za-z]+\s*\/?>$/.test(text) === true) {
            return false;
        }
        if (/^<[A-Za-z]+\s*>\s*<\/[A-Za-z]+\s*>$/m.test(text) === true) {
            return false;
        }
        var match = text.match(/^<[A-Za-z]+\s*>(.*)<\/[A-Za-z]+\s*>$/m);
        if (match != null && match[1] != null) {
            var enclosedContent = match[1];
            if (enclosedContent.indexOf('<') === -1 && enclosedContent.indexOf('>') === -1) {
                return false;
            }
        }
        return true;
    };
    return NoJqueryRawElementsRuleWalker;
}(Lint.RuleWalker));
var HtmlLikeStringLiteralFinder = (function (_super) {
    __extends(HtmlLikeStringLiteralFinder, _super);
    function HtmlLikeStringLiteralFinder() {
        _super.apply(this, arguments);
        this.found = false;
    }
    HtmlLikeStringLiteralFinder.prototype.isFound = function () {
        return this.found;
    };
    HtmlLikeStringLiteralFinder.prototype.visitStringLiteral = function (node) {
        if (node.text.indexOf('<') > -1 || node.text.indexOf('>') > -1) {
            this.found = true;
        }
        else {
            _super.prototype.visitStringLiteral.call(this, node);
        }
    };
    return HtmlLikeStringLiteralFinder;
}(Lint.RuleWalker));
//# sourceMappingURL=noJqueryRawElementsRule.js.map