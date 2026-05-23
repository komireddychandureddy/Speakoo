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
exports.NotificationsService = exports.NOTIFICATION_QUEUE = void 0;
var common_1 = require("@nestjs/common");
var client_1 = require("@prisma/client");
exports.NOTIFICATION_QUEUE = 'notifications';
var NotificationsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var NotificationsService = _classThis = /** @class */ (function () {
        function NotificationsService_1(queue, prisma) {
            this.queue = queue;
            this.prisma = prisma;
            this.logger = new common_1.Logger(NotificationsService.name);
        }
        NotificationsService_1.prototype.scheduleBookingNotifications = function (bookingId, sessionStartTime) {
            return __awaiter(this, void 0, void 0, function () {
                var booking, reminder60, reminder10, now;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.booking.findUniqueOrThrow({ where: { id: bookingId } })];
                        case 1:
                            booking = _a.sent();
                            // Immediate notifications
                            return [4 /*yield*/, this.enqueue({ userId: booking.learnerId, bookingId: bookingId, type: client_1.NotificationType.booking_confirmed, channel: client_1.NotificationChannel.email })];
                        case 2:
                            // Immediate notifications
                            _a.sent();
                            return [4 /*yield*/, this.enqueue({ userId: booking.learnerId, bookingId: bookingId, type: client_1.NotificationType.booking_confirmed, channel: client_1.NotificationChannel.whatsapp })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.enqueue({ userId: booking.tutorId, bookingId: bookingId, type: client_1.NotificationType.booking_confirmed, channel: client_1.NotificationChannel.email })];
                        case 4:
                            _a.sent();
                            reminder60 = new Date(sessionStartTime.getTime() - 60 * 60 * 1000);
                            reminder10 = new Date(sessionStartTime.getTime() - 10 * 60 * 1000);
                            now = Date.now();
                            if (!(reminder60.getTime() > now)) return [3 /*break*/, 7];
                            return [4 /*yield*/, this.enqueue({
                                    userId: booking.learnerId,
                                    bookingId: bookingId,
                                    type: client_1.NotificationType.reminder_60min, channel: client_1.NotificationChannel.email,
                                }, reminder60.getTime() - now)];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, this.enqueue({
                                    userId: booking.learnerId,
                                    bookingId: bookingId,
                                    type: client_1.NotificationType.reminder_60min, channel: client_1.NotificationChannel.whatsapp,
                                }, reminder60.getTime() - now)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7:
                            if (!(reminder10.getTime() > now)) return [3 /*break*/, 9];
                            return [4 /*yield*/, this.enqueue({
                                    userId: booking.learnerId,
                                    bookingId: bookingId,
                                    type: client_1.NotificationType.reminder_10min, channel: client_1.NotificationChannel.email,
                                }, reminder10.getTime() - now)];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        NotificationsService_1.prototype.cancelBookingNotifications = function (bookingId) {
            return __awaiter(this, void 0, void 0, function () {
                var jobs, _i, jobs_1, job;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.queue.getJobs(['delayed', 'waiting'])];
                        case 1:
                            jobs = _a.sent();
                            _i = 0, jobs_1 = jobs;
                            _a.label = 2;
                        case 2:
                            if (!(_i < jobs_1.length)) return [3 /*break*/, 5];
                            job = jobs_1[_i];
                            if (!(job.data.bookingId === bookingId)) return [3 /*break*/, 4];
                            return [4 /*yield*/, job.remove()];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        NotificationsService_1.prototype.enqueue = function (data_1) {
            return __awaiter(this, arguments, void 0, function (data, delayMs) {
                var idempotencyKey, alreadySent;
                if (delayMs === void 0) { delayMs = 0; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            idempotencyKey = "".concat(data.bookingId, ":").concat(data.type, ":").concat(data.channel);
                            return [4 /*yield*/, this.prisma.notificationLog.findUnique({
                                    where: { idempotencyKey: idempotencyKey },
                                })];
                        case 1:
                            alreadySent = _a.sent();
                            if (alreadySent)
                                return [2 /*return*/];
                            return [4 /*yield*/, this.queue.add(data, { delay: delayMs, attempts: 3, backoff: 5000 })];
                        case 2:
                            _a.sent();
                            this.logger.log("Queued notification ".concat(idempotencyKey, " delay=").concat(delayMs, "ms"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        return NotificationsService_1;
    }());
    __setFunctionName(_classThis, "NotificationsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        NotificationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return NotificationsService = _classThis;
}();
exports.NotificationsService = NotificationsService;
