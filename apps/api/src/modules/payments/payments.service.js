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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
var common_1 = require("@nestjs/common");
var stripe_1 = require("stripe");
var client_1 = require("@prisma/client");
var PaymentsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PaymentsService = _classThis = /** @class */ (function () {
        function PaymentsService_1(prisma, config, notificationsService) {
            this.prisma = prisma;
            this.config = config;
            this.notificationsService = notificationsService;
            this.logger = new common_1.Logger(PaymentsService.name);
            this.stripe = new stripe_1.default(this.config.getOrThrow('STRIPE_SECRET_KEY'), {
                apiVersion: '2024-04-10',
            });
        }
        PaymentsService_1.prototype.createPaymentIntent = function (bookingId, learnerId) {
            return __awaiter(this, void 0, void 0, function () {
                var booking, intent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })];
                        case 1:
                            booking = _a.sent();
                            if (booking.learnerId !== learnerId) {
                                throw new common_1.BadRequestException('Booking does not belong to this learner');
                            }
                            return [4 /*yield*/, this.stripe.paymentIntents.create({
                                    amount: booking.priceCents,
                                    currency: 'usd',
                                    metadata: { bookingId: bookingId, learnerId: learnerId },
                                })];
                        case 2:
                            intent = _a.sent();
                            return [4 /*yield*/, this.prisma.payment.upsert({
                                    where: { bookingId: bookingId },
                                    create: {
                                        bookingId: bookingId,
                                        stripePaymentIntent: intent.id,
                                        amountCents: booking.priceCents,
                                        status: client_1.PaymentStatus.pending,
                                    },
                                    update: { stripePaymentIntent: intent.id, status: client_1.PaymentStatus.pending },
                                })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, { clientSecret: intent.client_secret }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.handleWebhook = function (rawBody, signature) {
            return __awaiter(this, void 0, void 0, function () {
                var webhookSecret, event, intent, charge;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            webhookSecret = this.config.getOrThrow('STRIPE_WEBHOOK_SECRET');
                            try {
                                event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
                            }
                            catch (_b) {
                                throw new common_1.BadRequestException('Invalid webhook signature');
                            }
                            if (!(event.type === 'payment_intent.succeeded')) return [3 /*break*/, 2];
                            intent = event.data.object;
                            return [4 /*yield*/, this.onPaymentSucceeded(intent)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (!(event.type === 'charge.refunded')) return [3 /*break*/, 4];
                            charge = event.data.object;
                            return [4 /*yield*/, this.onChargeRefunded(charge)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/, { received: true }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.onPaymentSucceeded = function (intent) {
            return __awaiter(this, void 0, void 0, function () {
                var bookingId, booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bookingId = intent.metadata['bookingId'];
                            if (!bookingId)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.$transaction([
                                    this.prisma.payment.update({
                                        where: { bookingId: bookingId },
                                        data: { status: client_1.PaymentStatus.succeeded },
                                    }),
                                    this.prisma.booking.update({
                                        where: { id: bookingId },
                                        data: { status: client_1.BookingStatus.confirmed },
                                    }),
                                ])];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.booking.findUniqueOrThrow({
                                    where: { id: bookingId },
                                    include: { slot: true },
                                })];
                        case 2:
                            booking = _a.sent();
                            return [4 /*yield*/, this.notificationsService.scheduleBookingNotifications(bookingId, booking.slot.startTime)];
                        case 3:
                            _a.sent();
                            this.logger.log("Payment succeeded for booking ".concat(bookingId));
                            return [2 /*return*/];
                    }
                });
            });
        };
        PaymentsService_1.prototype.onChargeRefunded = function (charge) {
            return __awaiter(this, void 0, void 0, function () {
                var paymentIntentId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            paymentIntentId = charge.payment_intent;
                            return [4 /*yield*/, this.prisma.payment.updateMany({
                                    where: { stripePaymentIntent: paymentIntentId },
                                    data: { status: client_1.PaymentStatus.refunded },
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        PaymentsService_1.prototype.getWalletBalance = function (userId) {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.walletTransaction.aggregate({
                                where: { userId: userId },
                                _sum: { amountCents: true },
                            })];
                        case 1:
                            result = _b.sent();
                            return [2 /*return*/, { balanceCents: (_a = result._sum.amountCents) !== null && _a !== void 0 ? _a : 0 }];
                    }
                });
            });
        };
        PaymentsService_1.prototype.purchaseCredits = function (userId, bundleId) {
            return __awaiter(this, void 0, void 0, function () {
                var bundle, intent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.creditBundle.findUniqueOrThrow({ where: { id: bundleId } })];
                        case 1:
                            bundle = _a.sent();
                            return [4 /*yield*/, this.stripe.paymentIntents.create({
                                    amount: bundle.priceCents,
                                    currency: 'usd',
                                    metadata: { userId: userId, bundleId: bundleId, type: 'credit_purchase' },
                                })];
                        case 2:
                            intent = _a.sent();
                            this.logger.log("Credit purchase intent created for user ".concat(userId, ", bundle ").concat(bundleId));
                            return [2 /*return*/, { clientSecret: intent.client_secret }];
                    }
                });
            });
        };
        return PaymentsService_1;
    }());
    __setFunctionName(_classThis, "PaymentsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PaymentsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PaymentsService = _classThis;
}();
exports.PaymentsService = PaymentsService;
