# Authentication Improvements - Email & Phone Support

This document describes the comprehensive authentication improvements implemented to support registration and login with both email and phone numbers.

## Overview

The authentication system has been enhanced to support:
1. **Login with email OR phone number** - Users can now log in using either their email address or phone number
2. **Registration with optional phone number** - Users can provide their phone number during email registration
3. **Unified OTP verification** - Email and phone OTP verification work seamlessly

---

## Backend Changes

### 1. Enhanced Login DTO (`apps/api/src/modules/auth/dto/login.dto.ts`)

**Changes:**
- Made `email` and `phone` both optional
- Added conditional validation: at least one must be provided
- Added E.164 format validation for phone numbers

**Example usage:**
```json
// Login with email
{
  "email": "user@example.com",
  "password": "password123"
}

// Login with phone
{
  "phone": "+12025550100",
  "password": "password123"
}
```

### 2. Updated Register DTO (`apps/api/src/modules/auth/dto/register.dto.ts`)

**Changes:**
- Added optional `phoneNumber` field
- Added E.164 format validation for phone numbers

**Example usage:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe",
  "phoneNumber": "+12025550100"  // Optional
}
```

### 3. Auth Service Updates (`apps/api/src/modules/auth/auth.service.ts`)

#### Login Method
- Now finds users by email OR phone using Prisma's `OR` condition
- Validates that at least one identifier is provided
- Returns appropriate error messages

#### Register Method
- Checks for duplicate phone numbers (if provided)
- Stores phone number in both `User` and `Profile` tables
- Sends email verification OTP to all users
- Sends phone verification OTP if phone number is provided
- User receives both OTPs if phone is provided

---

## Frontend Changes (Flutter Mobile App)

### 1. Updated Auth Provider (`apps/mobile/lib/features/auth/application/auth_provider.dart`)

#### Login Method
- Now accepts optional `email` and `phone` parameters
- Sends the appropriate field to the backend

**Example:**
```dart
// Login with email
await authProvider.login(
  email: 'user@example.com',
  password: 'password123',
);

// Login with phone
await authProvider.login(
  phone: '+12025550100',
  password: 'password123',
);
```

#### Register Method
- Added optional `phoneNumber` parameter
- Sends phone number to backend if provided
- Sets correct OTP verification status (email or phone) based on what was provided

### 2. Login Screen (`apps/mobile/lib/features/auth/presentation/screens/login_screen.dart`)

**Changes:**
- Renamed `_emailCtrl` to `_identifierCtrl`
- Updated field label to "Email or Phone Number"
- Added smart validation:
  - Accepts email format: `user@example.com`
  - Accepts phone format (E.164): `+12025550100`
- Auto-detects input type and sends to backend accordingly

**User Experience:**
- Users can type either email or phone in a single field
- Clear error messages for invalid formats
- Seamless login experience

### 3. Register Screen (`apps/mobile/lib/features/auth/presentation/screens/register_screen.dart`)

**Changes:**
- Enhanced `_EmailFields` widget to include optional phone field
- Added country code dropdown and phone number input
- Increased tab view height from 230 to 420 to accommodate new fields
- Updated submit logic to include phone number when registering via email tab

**User Experience:**
- **Email Tab**: Users can now optionally provide phone number along with email
  - Email (required)
  - Phone number (optional) with country code selector
  - Password fields
- **Phone Tab**: Remains unchanged - phone-only registration
- Phone field is marked as "Optional" in email tab
- Validation only triggers if user enters a phone number

---

## OTP Verification Flow

### Email Registration (with optional phone)

1. User registers with email (and optionally phone)
2. Backend sends:
   - Email verification OTP (always)
   - Phone verification OTP (if phone provided)
3. Frontend shows appropriate OTP screen:
   - If phone provided: `AuthStatus.needsPhoneOtp`
   - If no phone: `AuthStatus.needsEmailOtp`

### Phone-Only Registration

1. User registers with phone number only
2. Backend sends phone verification OTP
3. Frontend shows phone OTP verification screen
4. After verification, user is authenticated

### Login Flow

1. User enters email OR phone + password
2. Frontend auto-detects input type
3. Backend authenticates user
4. User is logged in (no OTP needed for login)

---

## Testing Guide

### Backend Tests

**Test Login with Email:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Test Login with Phone:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+12025550100",
    "password": "password123"
  }'
```

**Test Registration with Email + Phone:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "displayName": "New User",
    "phoneNumber": "+12025550101"
  }'
```

### Frontend Tests

1. **Login Screen:**
   - Try logging in with email
   - Try logging in with phone (E.164 format)
   - Verify error messages for invalid formats
   - Test "Forgot Password" flow

2. **Register Screen - Email Tab:**
   - Register with email only
   - Register with email + phone
   - Verify phone field is optional
   - Check country code dropdown works
   - Verify OTP screen appears

3. **Register Screen - Phone Tab:**
   - Register with phone number
   - Verify phone OTP is sent
   - Complete verification

4. **OTP Verification:**
   - Test email OTP verification
   - Test phone OTP verification
   - Test resend OTP functionality

---

## Phone Number Format (E.164)

All phone numbers must be in E.164 international format:
- Starts with `+`
- Followed by country code (1-3 digits)
- Followed by subscriber number (7-14 digits)
- Total length: 8-15 digits (including the +)

**Examples:**
- US: `+12025550100`
- UK: `+447911123456`
- India: `+919876543210`
- Australia: `+61412345678`

**Country codes supported in dropdown:**
- +1 (US/Canada)
- +44 (UK)
- +91 (India)
- +61 (Australia)
- +33 (France)
- +49 (Germany)
- +81 (Japan)
- +86 (China)
- +55 (Brazil)
- +52 (Mexico)

---

## Security Considerations

1. **Phone Number Validation:**
   - Backend validates E.164 format
   - Frontend provides user-friendly input
   - Duplicate phone numbers are rejected

2. **Login Security:**
   - Both email and phone login require password
   - Captcha support already integrated
   - Rate limiting via `@nestjs/throttler`

3. **OTP Security:**
   - OTPs expire after 10 minutes
   - Each OTP can only be used once
   - Production uses random 6-digit codes
   - Development/staging uses static '123456' for testing

4. **Data Privacy:**
   - Phone numbers stored with proper indexing
   - Phone numbers included in Profile table for easy access
   - Consistent with existing email verification flow

---

## Database Schema

**User Table:**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  phoneNumber   String?  @unique
  passwordHash  String
  isVerified    Boolean  @default(false)  // Email verification
  isPhoneVerified Boolean @default(false) // Phone verification
  // ... other fields
}
```

**Profile Table:**
```prisma
model Profile {
  id          String  @id @default(cuid())
  userId      String  @unique
  displayName String
  phoneNumber String? // Copied from User for easy access
  // ... other fields
}
```

---

## Migration Notes

No database migration is needed as:
- `phoneNumber` field already exists in User table
- `isPhoneVerified` field already exists in User table
- Profile table already has phone number support

---

## Backward Compatibility

All changes are backward compatible:
- Existing email-only users can continue logging in with email
- Existing phone-only users can continue logging in with phone
- New users benefit from the enhanced registration options

---

## Future Enhancements

Potential future improvements:
1. Social login integration (Google, Apple, Facebook)
2. Two-factor authentication (2FA) via SMS
3. Phone number change with verification
4. International phone number formatting in UI
5. Phone number recovery for forgotten passwords
