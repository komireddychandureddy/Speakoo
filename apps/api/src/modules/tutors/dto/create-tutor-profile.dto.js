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
exports.CreateTutorProfileDto = void 0;
var openapi = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreateTutorProfileDto = function () {
    var _a;
    var _languagesTaught_decorators;
    var _languagesTaught_initializers = [];
    var _languagesTaught_extraInitializers = [];
    var _hourlyRateCents_decorators;
    var _hourlyRateCents_initializers = [];
    var _hourlyRateCents_extraInitializers = [];
    var _cefrSpecialties_decorators;
    var _cefrSpecialties_initializers = [];
    var _cefrSpecialties_extraInitializers = [];
    var _introVideoUrl_decorators;
    var _introVideoUrl_initializers = [];
    var _introVideoUrl_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateTutorProfileDto() {
                this.languagesTaught = __runInitializers(this, _languagesTaught_initializers, void 0);
                this.hourlyRateCents = (__runInitializers(this, _languagesTaught_extraInitializers), __runInitializers(this, _hourlyRateCents_initializers, void 0));
                this.cefrSpecialties = (__runInitializers(this, _hourlyRateCents_extraInitializers), __runInitializers(this, _cefrSpecialties_initializers, void 0));
                this.introVideoUrl = (__runInitializers(this, _cefrSpecialties_extraInitializers), __runInitializers(this, _introVideoUrl_initializers, void 0));
                __runInitializers(this, _introVideoUrl_extraInitializers);
            }
            CreateTutorProfileDto._OPENAPI_METADATA_FACTORY = function () {
                return { languagesTaught: { required: true, type: function () { return [String]; } }, hourlyRateCents: { required: true, type: function () { return Number; }, minimum: 100, maximum: 100000 }, cefrSpecialties: { required: true, type: function () { return [String]; } }, introVideoUrl: { required: false, type: function () { return String; } } };
            };
            return CreateTutorProfileDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _languagesTaught_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMaxSize)(10)];
            _hourlyRateCents_decorators = [(0, class_validator_1.IsInt)(), (0, class_validator_1.Min)(100), (0, class_validator_1.Max)(100000)];
            _cefrSpecialties_decorators = [(0, class_validator_1.IsArray)(), (0, class_validator_1.ArrayMaxSize)(6)];
            _introVideoUrl_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsUrl)()];
            __esDecorate(null, null, _languagesTaught_decorators, { kind: "field", name: "languagesTaught", static: false, private: false, access: { has: function (obj) { return "languagesTaught" in obj; }, get: function (obj) { return obj.languagesTaught; }, set: function (obj, value) { obj.languagesTaught = value; } }, metadata: _metadata }, _languagesTaught_initializers, _languagesTaught_extraInitializers);
            __esDecorate(null, null, _hourlyRateCents_decorators, { kind: "field", name: "hourlyRateCents", static: false, private: false, access: { has: function (obj) { return "hourlyRateCents" in obj; }, get: function (obj) { return obj.hourlyRateCents; }, set: function (obj, value) { obj.hourlyRateCents = value; } }, metadata: _metadata }, _hourlyRateCents_initializers, _hourlyRateCents_extraInitializers);
            __esDecorate(null, null, _cefrSpecialties_decorators, { kind: "field", name: "cefrSpecialties", static: false, private: false, access: { has: function (obj) { return "cefrSpecialties" in obj; }, get: function (obj) { return obj.cefrSpecialties; }, set: function (obj, value) { obj.cefrSpecialties = value; } }, metadata: _metadata }, _cefrSpecialties_initializers, _cefrSpecialties_extraInitializers);
            __esDecorate(null, null, _introVideoUrl_decorators, { kind: "field", name: "introVideoUrl", static: false, private: false, access: { has: function (obj) { return "introVideoUrl" in obj; }, get: function (obj) { return obj.introVideoUrl; }, set: function (obj, value) { obj.introVideoUrl = value; } }, metadata: _metadata }, _introVideoUrl_initializers, _introVideoUrl_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateTutorProfileDto = CreateTutorProfileDto;
