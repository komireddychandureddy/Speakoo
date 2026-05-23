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
exports.CreateBookingDto = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreateBookingDto = function () {
    var _a;
    var _slotId_decorators;
    var _slotId_initializers = [];
    var _slotId_extraInitializers = [];
    var _tutorId_decorators;
    var _tutorId_initializers = [];
    var _tutorId_extraInitializers = [];
    var _language_decorators;
    var _language_initializers = [];
    var _language_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateBookingDto() {
                this.slotId = __runInitializers(this, _slotId_initializers, void 0);
                this.tutorId = (__runInitializers(this, _slotId_extraInitializers), __runInitializers(this, _tutorId_initializers, void 0));
                this.language = (__runInitializers(this, _tutorId_extraInitializers), __runInitializers(this, _language_initializers, void 0));
                __runInitializers(this, _language_extraInitializers);
            }
            CreateBookingDto._OPENAPI_METADATA_FACTORY = function () {
                return { slotId: { required: true, type: function () { return String; } }, tutorId: { required: true, type: function () { return String; } }, language: { required: true, type: function () { return String; } } };
            };
            return CreateBookingDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _slotId_decorators = [(0, class_validator_1.IsUUID)()];
            _tutorId_decorators = [(0, class_validator_1.IsUUID)()];
            _language_decorators = [(0, class_validator_1.IsString)()];
            __esDecorate(null, null, _slotId_decorators, { kind: "field", name: "slotId", static: false, private: false, access: { has: function (obj) { return "slotId" in obj; }, get: function (obj) { return obj.slotId; }, set: function (obj, value) { obj.slotId = value; } }, metadata: _metadata }, _slotId_initializers, _slotId_extraInitializers);
            __esDecorate(null, null, _tutorId_decorators, { kind: "field", name: "tutorId", static: false, private: false, access: { has: function (obj) { return "tutorId" in obj; }, get: function (obj) { return obj.tutorId; }, set: function (obj, value) { obj.tutorId = value; } }, metadata: _metadata }, _tutorId_initializers, _tutorId_extraInitializers);
            __esDecorate(null, null, _language_decorators, { kind: "field", name: "language", static: false, private: false, access: { has: function (obj) { return "language" in obj; }, get: function (obj) { return obj.language; }, set: function (obj, value) { obj.language = value; } }, metadata: _metadata }, _language_initializers, _language_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateBookingDto = CreateBookingDto;
