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
exports.NotificationProcessor = void 0;
var bull_1 = require("@nestjs/bull");
var common_1 = require("@nestjs/common");
var resend_1 = require("resend");
var twilio_1 = require("twilio");
var notifications_service_1 = require("../notifications.service");
var client_1 = require("@prisma/client");
var NotificationProcessor = function () {
    var _classDecorators = [(0, bull_1.Processor)(notifications_service_1.NOTIFICATION_QUEUE)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handle_decorators;
    var NotificationProcessor = _classThis = /** @class */ (function () {
        function NotificationProcessor_1(prisma, config) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.config = config;
            this.logger = new common_1.Logger(NotificationProcessor.name);
            this.resend = new resend_1.Resend(this.config.getOrThrow('RESEND_API_KEY'));
            this.twilio = (0, twilio_1.default)(this.config.getOrThrow('TWILIO_ACCOUNT_SID'), this.config.getOrThrow('TWILIO_AUTH_TOKEN'));
        }
        NotificationProcessor_1.prototype.handle = function (job) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, userId, bookingId, type, channel, idempotencyKey, alreadySent, user, phoneNumber;
                var _b, _c, _d, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _a = job.data, userId = _a.userId, bookingId = _a.bookingId, type = _a.type, channel = _a.channel;
                            idempotencyKey = "".concat(bookingId, ":").concat(type, ":").concat(channel);
                            return [4 /*yield*/, this.prisma.notificationLog.findUnique({ where: { idempotencyKey: idempotencyKey } })];
                        case 1:
                            alreadySent = _g.sent();
                            if (alreadySent)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.prisma.user.findUniqueOrThrow({
                                    where: { id: userId },
                                    include: { profile: true },
                                })];
                        case 2:
                            user = _g.sent();
                            if (!(channel === client_1.NotificationChannel.email)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.resend.emails.send({
                                    from: 'Speakoo <noreply@speakoo.com>',
                                    to: user.email,
                                    subject: this.getSubject(type),
                                    text: this.getBody(type, (_c = (_b = user.profile) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : 'Learner'),
                                })];
                        case 3:
                            _g.sent();
                            _g.label = 4;
                        case 4:
                            if (!(channel === client_1.NotificationChannel.whatsapp)) return [3 /*break*/, 7];
                            phoneNumber = (_d = user.profile) === null || _d === void 0 ? void 0 : _d.phoneNumber;
                            if (!!phoneNumber) return [3 /*break*/, 5];
                            this.logger.warn("Skipping WhatsApp for user ".concat(userId, ": no phone number on profile"));
                            return [3 /*break*/, 7];
                        case 5: return [4 /*yield*/, this.twilio.messages.create({
                                from: this.config.getOrThrow('TWILIO_WHATSAPP_FROM'),
                                to: "whatsapp:".concat(phoneNumber),
                                body: this.getBody(type, (_f = (_e = user.profile) === null || _e === void 0 ? void 0 : _e.displayName) !== null && _f !== void 0 ? _f : 'there'),
                            })];
                        case 6:
                            _g.sent();
                            _g.label = 7;
                        case 7: return [4 /*yield*/, this.prisma.notificationLog.create({
                                data: { userId: userId, bookingId: bookingId, type: type, channel: channel, idempotencyKey: idempotencyKey },
                            })];
                        case 8:
                            _g.sent();
                            this.logger.log("Notification sent: ".concat(idempotencyKey));
                            return [2 /*return*/];
                    }
                });
            });
        };
        NotificationProcessor_1.prototype.getSubject = function (type) {
            var _a;
            var subjects = {
                booking_confirmed: 'Your Speakoo session is confirmed!',
                reminder_60min: 'Your session starts in 60 minutes',
                reminder_10min: 'Your session starts in 10 minutes',
                session_summary: 'Session summary',
                payout: 'Payout processed',
            };
            return (_a = subjects[type]) !== null && _a !== void 0 ? _a : 'Speakoo notification';
        };
        NotificationProcessor_1.prototype.getBody = function (type, name) {
            var _a;
            var bodies = {
                booking_confirmed: "Hi ".concat(name, ", your session has been confirmed. See you soon!"),
                reminder_60min: "Hi ".concat(name, ", your session starts in 60 minutes. Get ready!"),
                reminder_10min: "Hi ".concat(name, ", your session starts in 10 minutes. Join now!"),
                session_summary: "Hi ".concat(name, ", here is your session summary."),
                payout: "Hi ".concat(name, ", your payout has been processed."),
            };
            return (_a = bodies[type]) !== null && _a !== void 0 ? _a : "Hi ".concat(name, ", you have a notification from Speakoo.");
        };
        return NotificationProcessor_1;
    }());
    __setFunctionName(_classThis, "NotificationProcessor");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handle_decorators = [(0, bull_1.Process)()];
        __esDecorate(_classThis, null, _handle_decorators, { kind: "method", name: "handle", static: false, private: false, access: { has: function (obj) { return "handle" in obj; }, get: function (obj) { return obj.handle; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationProcessor = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationProcessor = _classThis;
}();
exports.NotificationProcessor = NotificationProcessor;
