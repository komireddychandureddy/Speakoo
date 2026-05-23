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
exports.PaymentsController = void 0;
var openapi = require("@nestjs/swagger");
var common_1 = require("@nestjs/common");
var public_decorator_1 = require("../auth/decorators/public.decorator");
var roles_decorator_1 = require("../auth/decorators/roles.decorator");
var PaymentsController = function () {
    var _classDecorators = [(0, common_1.Controller)('payments')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createIntent_decorators;
    var _handleWebhook_decorators;
    var _getWalletBalance_decorators;
    var _purchaseCredits_decorators;
    var PaymentsController = _classThis = /** @class */ (function () {
        function PaymentsController_1(paymentsService) {
            this.paymentsService = (__runInitializers(this, _instanceExtraInitializers), paymentsService);
        }
        PaymentsController_1.prototype.createIntent = function (bookingId, user) {
            return this.paymentsService.createPaymentIntent(bookingId, user.id);
        };
        PaymentsController_1.prototype.handleWebhook = function (req, sig) {
            return this.paymentsService.handleWebhook(req.rawBody, sig);
        };
        PaymentsController_1.prototype.getWalletBalance = function (user) {
            return this.paymentsService.getWalletBalance(user.id);
        };
        PaymentsController_1.prototype.purchaseCredits = function (user, dto) {
            return this.paymentsService.purchaseCredits(user.id, dto.bundleId);
        };
        return PaymentsController_1;
    }());
    __setFunctionName(_classThis, "PaymentsController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createIntent_decorators = [(0, common_1.Post)('bookings/:bookingId/intent'), openapi.ApiResponse({ status: 201 })];
        _handleWebhook_decorators = [(0, public_decorator_1.Public)(), (0, common_1.Post)('webhooks/stripe'), openapi.ApiResponse({ status: 201 })];
        _getWalletBalance_decorators = [(0, common_1.Get)('wallet'), openapi.ApiResponse({ status: 200 })];
        _purchaseCredits_decorators = [(0, roles_decorator_1.Roles)('learner'), (0, common_1.Post)('wallet/credits'), openapi.ApiResponse({ status: 201 })];
        __esDecorate(_classThis, null, _createIntent_decorators, { kind: "method", name: "createIntent", static: false, private: false, access: { has: function (obj) { return "createIntent" in obj; }, get: function (obj) { return obj.createIntent; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _handleWebhook_decorators, { kind: "method", name: "handleWebhook", static: false, private: false, access: { has: function (obj) { return "handleWebhook" in obj; }, get: function (obj) { return obj.handleWebhook; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getWalletBalance_decorators, { kind: "method", name: "getWalletBalance", static: false, private: false, access: { has: function (obj) { return "getWalletBalance" in obj; }, get: function (obj) { return obj.getWalletBalance; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _purchaseCredits_decorators, { kind: "method", name: "purchaseCredits", static: false, private: false, access: { has: function (obj) { return "purchaseCredits" in obj; }, get: function (obj) { return obj.purchaseCredits; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsController = _classThis;
}();
exports.PaymentsController = PaymentsController;
