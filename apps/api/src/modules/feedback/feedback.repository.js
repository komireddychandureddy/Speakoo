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
exports.FeedbackRepository = void 0;
var common_1 = require("@nestjs/common");
var POINTS_PER_SESSION = 10;
var BADGE_SLUGS = {
    FIRST_SESSION: 'first_session',
    TEN_SESSIONS: 'ten_sessions',
    THIRTY_DAY_STREAK: '30_day_streak',
};
var FeedbackRepository = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FeedbackRepository = _classThis = /** @class */ (function () {
        function FeedbackRepository_1(prisma) {
            this.prisma = prisma;
        }
        FeedbackRepository_1.prototype.createFeedback = function (reviewerId, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var booking;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.booking.findUniqueOrThrow({
                                where: { id: dto.bookingId },
                                include: { session: true },
                            })];
                        case 1:
                            booking = _a.sent();
                            if (booking.learnerId !== reviewerId) {
                                throw new common_1.BadRequestException('You can only submit feedback for your own bookings');
                            }
                            if (!booking.session) {
                                throw new common_1.BadRequestException('No session found for this booking');
                            }
                            return [2 /*return*/, this.prisma.sessionFeedback.create({
                                    data: {
                                        sessionId: booking.session.id,
                                        reviewerId: reviewerId,
                                        revieweeId: booking.tutorId,
                                        rating: dto.rating,
                                        comment: dto.comment,
                                    },
                                })];
                    }
                });
            });
        };
        FeedbackRepository_1.prototype.upsertPointsAndAwardBadges = function (learnerId) {
            return __awaiter(this, void 0, void 0, function () {
                var existing, now, lastSession, daysSinceLast, streakDays, updated, totalSessions;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.learnerPoints.findUnique({ where: { learnerId: learnerId } })];
                        case 1:
                            existing = _b.sent();
                            now = new Date();
                            lastSession = existing === null || existing === void 0 ? void 0 : existing.lastSession;
                            daysSinceLast = lastSession
                                ? (now.getTime() - lastSession.getTime()) / 86400000
                                : null;
                            streakDays = daysSinceLast !== null && daysSinceLast <= 1
                                ? ((_a = existing === null || existing === void 0 ? void 0 : existing.streakDays) !== null && _a !== void 0 ? _a : 0) + 1
                                : 1;
                            return [4 /*yield*/, this.prisma.learnerPoints.upsert({
                                    where: { learnerId: learnerId },
                                    create: { learnerId: learnerId, points: POINTS_PER_SESSION, streakDays: streakDays, lastSession: now },
                                    update: {
                                        points: { increment: POINTS_PER_SESSION },
                                        streakDays: streakDays,
                                        lastSession: now,
                                    },
                                })];
                        case 2:
                            updated = _b.sent();
                            totalSessions = Math.floor(updated.points / POINTS_PER_SESSION);
                            return [4 /*yield*/, this.checkAndAwardBadges(learnerId, totalSessions, updated.streakDays)];
                        case 3:
                            _b.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        FeedbackRepository_1.prototype.checkAndAwardBadges = function (learnerId, totalSessions, streakDays) {
            return __awaiter(this, void 0, void 0, function () {
                var slugsToAward, _i, slugsToAward_1, slug, badge;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            slugsToAward = [];
                            if (totalSessions === 1)
                                slugsToAward.push(BADGE_SLUGS.FIRST_SESSION);
                            if (totalSessions === 10)
                                slugsToAward.push(BADGE_SLUGS.TEN_SESSIONS);
                            if (streakDays >= 30)
                                slugsToAward.push(BADGE_SLUGS.THIRTY_DAY_STREAK);
                            if (!slugsToAward.length)
                                return [2 /*return*/];
                            _i = 0, slugsToAward_1 = slugsToAward;
                            _a.label = 1;
                        case 1:
                            if (!(_i < slugsToAward_1.length)) return [3 /*break*/, 5];
                            slug = slugsToAward_1[_i];
                            return [4 /*yield*/, this.prisma.badge.findUnique({ where: { slug: slug } })];
                        case 2:
                            badge = _a.sent();
                            if (!badge)
                                return [3 /*break*/, 4];
                            return [4 /*yield*/, this.prisma.learnerBadge.upsert({
                                    where: { learnerId_badgeId: { learnerId: learnerId, badgeId: badge.id } },
                                    create: { learnerId: learnerId, badgeId: badge.id },
                                    update: {},
                                })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        return FeedbackRepository_1;
    }());
    __setFunctionName(_classThis, "FeedbackRepository");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FeedbackRepository = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FeedbackRepository = _classThis;
}();
exports.FeedbackRepository = FeedbackRepository;
