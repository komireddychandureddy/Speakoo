"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchTutorsDto = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var SearchTutorsDto = function () {
    var _a;
    var _language_decorators;
    var _language_initializers = [];
    var _language_extraInitializers = [];
    var _minCents_decorators;
    var _minCents_initializers = [];
    var _minCents_extraInitializers = [];
    var _maxCents_decorators;
    var _maxCents_initializers = [];
    var _maxCents_extraInitializers = [];
    var _page_decorators;
    var _page_initializers = [];
    var _page_extraInitializers = [];
    var _limit_decorators;
    var _limit_initializers = [];
    var _limit_extraInitializers = [];
    return _a = /** @class */ (function () {
            function SearchTutorsDto() {
                this.language = __runInitializers(this, _language_initializers, void 0);
                this.minCents = (__runInitializers(this, _language_extraInitializers), __runInitializers(this, _minCents_initializers, void 0));
                this.maxCents = (__runInitializers(this, _minCents_extraInitializers), __runInitializers(this, _maxCents_initializers, void 0));
                this.page = (__runInitializers(this, _maxCents_extraInitializers), __runInitializers(this, _page_initializers, 1));
                this.limit = (__runInitializers(this, _page_extraInitializers), __runInitializers(this, _limit_initializers, 10));
                __runInitializers(this, _limit_extraInitializers);
            }
            SearchTutorsDto._OPENAPI_METADATA_FACTORY = function () {
                return { language: { required: false, type: function () { return String; } }, minCents: { required: false, type: function () { return Number; }, minimum: 1 }, maxCents: { required: false, type: function () { return Number; }, maximum: 100000, minimum: 1 }, page: { required: false, type: function () { return Number; }, default: 1, minimum: 1 }, limit: { required: false, type: function () { return Number; }, default: 10, minimum: 1, maximum: 50 } };
            };
            return SearchTutorsDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _language_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _minCents_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.IsPositive)(), (0, class_transformer_1.Type)(function () { return Number; })];
            _maxCents_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.IsPositive)(), (0, class_validator_1.Max)(100000), (0, class_transformer_1.Type)(function () { return Number; })];
            _page_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_transformer_1.Type)(function () { return Number; })];
            _limit_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(1), (0, class_validator_1.Max)(50), (0, class_transformer_1.Type)(function () { return Number; })];
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: function (obj) { return "language" in obj; }, get: function (obj) { return obj.language; }, set: function (obj, value) { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            __esDecorate(null, null, _minCents_decorators, { kind: "field", name: "minCents", static: false, private: false, access: { has: function (obj) { return "minCents" in obj; }, get: function (obj) { return obj.minCents; }, set: function (obj, value) { obj.minCents = value; } }, metadata: _metadata }, _minCents_initializers, _minCents_extraInitializers);
            __esDecorate(null, null, _maxCents_decorators, { kind: "field", name: "maxCents", static: false, private: false, access: { has: function (obj) { return "maxCents" in obj; }, get: function (obj) { return obj.maxCents; }, set: function (obj, value) { obj.maxCents = value; } }, metadata: _metadata }, _maxCents_initializers, _maxCents_extraInitializers);
            __esDecorate(null, null, _page_decorators, { kind: "field", name: "page", static: false, private: false, access: { has: function (obj) { return "page" in obj; }, get: function (obj) { return obj.page; }, set: function (obj, value) { obj.page = value; } }, metadata: _metadata }, _page_initializers, _page_extraInitializers);
            __esDecorate(null, null, _limit_decorators, { kind: "field", name: "limit", static: false, private: false, access: { has: function (obj) { return "limit" in obj; }, get: function (obj) { return obj.limit; }, set: function (obj, value) { obj.limit = value; } }, metadata: _metadata }, _limit_initializers, _limit_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.SearchTutorsDto = SearchTutorsDto;
