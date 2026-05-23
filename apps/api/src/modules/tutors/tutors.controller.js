"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorsController = void 0;
var openapi = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var public_decorator_1 = require("../auth/decorators/public.decorator");
var TutorsController = function () {
    var _classDecorators = [(0, common_1.Controller)('tutors')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _search_decorators;
    var _getPublicProfile_decorators;
    var _upsertProfile_decorators;
    var _getMyProfile_decorators;
    var _createSlot_decorators;
    var _getMySlots_decorators;
    var TutorsController = _classThis = /** @class */ (function () {
        function TutorsController_1(tutorsService) {
            this.tutorsService = (__runInitializers(this, _instanceExtraInitializers), tutorsService);
        }
        TutorsController_1.prototype.search = function (dto) {
            return this.tutorsService.searchTutors(dto);
        };
        TutorsController_1.prototype.getPublicProfile = function (id) {
            return this.tutorsService.getPublicTutorProfile(id);
        };
        TutorsController_1.prototype.upsertProfile = function (user, dto) {
            return this.tutorsService.upsertProfile(user.id, dto);
        };
        TutorsController_1.prototype.getMyProfile = function (user) {
            return this.tutorsService.getMyProfile(user.id);
        };
        TutorsController_1.prototype.createSlot = function (user, dto) {
            return this.tutorsService.createSlot(user.id, dto);
        };
        TutorsController_1.prototype.getMySlots = function (user) {
            return this.tutorsService.getMySlots(user.id);
        };
        return TutorsController_1;
    }());
    __setFunctionName(_classThis, "TutorsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _search_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)(), openapi.ApiResponse({ status: 200 })];
        _getPublicProfile_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Get)(':id'), openapi.ApiResponse({ status: 200 })];
        _upsertProfile_decorators = [(0, roles_decorator_1.Roles)('tutor'), (0, common_1.Post)('profile'), openapi.ApiResponse({ status: 201 })];
        _getMyProfile_decorators = [(0, roles_decorator_1.Roles)('tutor'), (0, common_1.Get)('profile'), openapi.ApiResponse({ status: 200 })];
        _createSlot_decorators = [(0, roles_decorator_1.Roles)('tutor'), (0, common_1.Post)('slots'), openapi.ApiResponse({ status: 201 })];
        _getMySlots_decorators = [(0, roles_decorator_1.Roles)('tutor'), (0, common_1.Get)('slots'), openapi.ApiResponse({ status: 200 })];
        __esDecorate(_classThis, null, _search_decorators, { kind: "method", name: "search", static: false, private: false, access: { has: function (obj) { return "search" in obj; }, get: function (obj) { return obj.search; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPublicProfile_decorators, { kind: "method", name: "getPublicProfile", static: false, private: false, access: { has: function (obj) { return "getPublicProfile" in obj; }, get: function (obj) { return obj.getPublicProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upsertProfile_decorators, { kind: "method", name: "upsertProfile", static: false, private: false, access: { has: function (obj) { return "upsertProfile" in obj; }, get: function (obj) { return obj.upsertProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMyProfile_decorators, { kind: "method", name: "getMyProfile", static: false, private: false, access: { has: function (obj) { return "getMyProfile" in obj; }, get: function (obj) { return obj.getMyProfile; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createSlot_decorators, { kind: "method", name: "createSlot", static: false, private: false, access: { has: function (obj) { return "createSlot" in obj; }, get: function (obj) { return obj.createSlot; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMySlots_decorators, { kind: "method", name: "getMySlots", static: false, private: false, access: { has: function (obj) { return "getMySlots" in obj; }, get: function (obj) { return obj.getMySlots; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        TutorsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return TutorsController = _classThis;
}();
exports.TutorsController = TutorsController;
