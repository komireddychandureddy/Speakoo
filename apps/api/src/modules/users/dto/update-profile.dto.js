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
exports.UpdateProfileDto = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var UpdateProfileDto = function () {
    var _a;
    var _displayName_decorators;
    var _displayName_initializers = [];
    var _displayName_extraInitializers = [];
    var _timezone_decorators;
    var _timezone_initializers = [];
    var _timezone_extraInitializers = [];
    var _nativeLanguage_decorators;
    var _nativeLanguage_initializers = [];
    var _nativeLanguage_extraInitializers = [];
    var _bio_decorators;
    var _bio_initializers = [];
    var _bio_extraInitializers = [];
    var _countryCode_decorators;
    var _countryCode_initializers = [];
    var _countryCode_extraInitializers = [];
    var _avatarUrl_decorators;
    var _avatarUrl_initializers = [];
    var _avatarUrl_extraInitializers = [];
    var _phoneNumber_decorators;
    var _phoneNumber_initializers = [];
    var _phoneNumber_extraInitializers = [];
    return _a = /** @class */ (function () {
            function UpdateProfileDto() {
                this.displayName = __runInitializers(this, _displayName_initializers, void 0);
                this.timezone = (__runInitializers(this, _displayName_extraInitializers), __runInitializers(this, _timezone_initializers, void 0));
                this.nativeLanguage = (__runInitializers(this, _timezone_extraInitializers), __runInitializers(this, _nativeLanguage_initializers, void 0));
                this.bio = (__runInitializers(this, _nativeLanguage_extraInitializers), __runInitializers(this, _bio_initializers, void 0));
                this.countryCode = (__runInitializers(this, _bio_extraInitializers), __runInitializers(this, _countryCode_initializers, void 0));
                this.avatarUrl = (__runInitializers(this, _countryCode_extraInitializers), __runInitializers(this, _avatarUrl_initializers, void 0));
                this.phoneNumber = (__runInitializers(this, _avatarUrl_extraInitializers), __runInitializers(this, _phoneNumber_initializers, void 0));
                __runInitializers(this, _phoneNumber_extraInitializers);
            }
            UpdateProfileDto._OPENAPI_METADATA_FACTORY = function () {
                return { displayName: { required: false, type: function () { return String; }, maxLength: 60 }, timezone: { required: false, type: function () { return String; } }, nativeLanguage: { required: false, type: function () { return String; } }, bio: { required: false, type: function () { return String; }, maxLength: 500 }, countryCode: { required: false, type: function () { return String; } }, avatarUrl: { required: false, type: function () { return String; } }, phoneNumber: { required: false, type: function () { return String; }, pattern: "/^\\+[1-9]\\d{6,14}$/" } };
            };
            return UpdateProfileDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _displayName_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(60)];
            _timezone_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _nativeLanguage_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _bio_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.MaxLength)(500)];
            _countryCode_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _avatarUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            _phoneNumber_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)(), (0, class_validator_1.Matches)(/^\+[1-9]\d{6,14}$/, { message: 'phoneNumber must be E.164 format (e.g. +12125551234)' })];
            __esDecorate(null, null, _displayName_decorators, { kind: "field", name: "displayName", static: false, private: false, access: { has: function (obj) { return "displayName" in obj; }, get: function (obj) { return obj.displayName; }, set: function (obj, value) { obj.displayName = value; } }, metadata: _metadata }, _displayName_initializers, _displayName_extraInitializers);
            __esDecorate(null, null, _timezone_decorators, { kind: "field", name: "timezone", static: false, private: false, access: { has: function (obj) { return "timezone" in obj; }, get: function (obj) { return obj.timezone; }, set: function (obj, value) { obj.timezone = value; } }, metadata: _metadata }, _timezone_initializers, _timezone_extraInitializers);
            __esDecorate(null, null, _nativeLanguage_decorators, { kind: "field", name: "nativeLanguage", static: false, private: false, access: { has: function (obj) { return "nativeLanguage" in obj; }, get: function (obj) { return obj.nativeLanguage; }, set: function (obj, value) { obj.nativeLanguage = value; } }, metadata: _metadata }, _nativeLanguage_initializers, _nativeLanguage_extraInitializers);
            __esDecorate(null, null, _bio_decorators, { kind: "field", name: "bio", static: false, private: false, access: { has: function (obj) { return "bio" in obj; }, get: function (obj) { return obj.bio; }, set: function (obj, value) { obj.bio = value; } }, metadata: _metadata }, _bio_initializers, _bio_extraInitializers);
            __esDecorate(null, null, _countryCode_decorators, { kind: "field", name: "countryCode", static: false, private: false, access: { has: function (obj) { return "countryCode" in obj; }, get: function (obj) { return obj.countryCode; }, set: function (obj, value) { obj.countryCode = value; } }, metadata: _metadata }, _countryCode_initializers, _countryCode_extraInitializers);
            __esDecorate(null, null, _avatarUrl_decorators, { kind: "field", name: "avatarUrl", static: false, private: false, access: { has: function (obj) { return "avatarUrl" in obj; }, get: function (obj) { return obj.avatarUrl; }, set: function (obj, value) { obj.avatarUrl = value; } }, metadata: _metadata }, _avatarUrl_initializers, _avatarUrl_extraInitializers);
            __esDecorate(null, null, _phoneNumber_decorators, { kind: "field", name: "phoneNumber", static: false, private: false, access: { has: function (obj) { return "phoneNumber" in obj; }, get: function (obj) { return obj.phoneNumber; }, set: function (obj, value) { obj.phoneNumber = value; } }, metadata: _metadata }, _phoneNumber_initializers, _phoneNumber_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.UpdateProfileDto = UpdateProfileDto;
