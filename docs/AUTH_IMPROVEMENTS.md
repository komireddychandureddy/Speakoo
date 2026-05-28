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

## Frontend Changes (React Web App)

### 1. Updated Auth API Client (`apps/web/src/core/network/authApi.ts`)

#### apiLogin Method
- Now accepts `identifier` parameter instead of `email`
- Auto-detects phone numbers (starts with `+`)
- Sends appropriate field to backend based on format

**Implementation:**
```typescript
export async function apiLogin(
  identifier: string,
  password: string,
  captchaToken?: string
): Promise<LoginResponse> {
  const isPhone = identifier.trim().startsWith('+');
  const payload = isPhone 
    ? { phone: identifier.trim(), password }
    : { email: identifier.trim(), password };
  
  if (captchaToken) {
    (payload as any).captchaToken = captchaToken;
  }
  
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
  return data;
}
```

#### apiRegister Method
- Added optional `phoneNumber` parameter
- Conditionally includes phone number in request payload

**Implementation:**
```typescript
export async function apiRegister(
  displayName: string,
  email: string,
  password: string,
  captchaToken?: string,
  phoneNumber?: string
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>('/auth/register', {
    displayName,
    email,
    password,
    ...(captchaToken && { captchaToken }),
    ...(phoneNumber && { phoneNumber }),
  });
  return data;
}
```

#### Error Messages
- Updated `parseAuthError` to reflect email/phone support:
  - "Invalid credentials. Please check your email/phone and password."
  - "An account with this email or phone number already exists."

### 2. Login Page (`apps/web/src/pages/Auth/LoginPage.tsx`)

#### State Changes
- Renamed `loginEmail` to `loginIdentifier`
- Added `signupPhone` state variable for optional phone registration

#### Login Handler
- Updated to support email OR phone login
- E.164 format validation for phone numbers
- Auto-detects input type and validates accordingly

**Implementation:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const identifier = loginIdentifier.trim();
  
  // Validate phone format if starts with +
  if (identifier.startsWith('+') && !/^\+[1-9]\d{7,14}$/.test(identifier)) {
    setError('Invalid phone format. Use E.164 format (e.g., +1234567890)');
    return;
  }
  
  try {
    await apiLogin(identifier, loginPassword, loginCaptchaToken || undefined);
    // ... success handling
  } catch (err) {
    setError(parseAuthError(err));
  }
};
```

#### Register Handler
- Added optional phone field validation
- E.164 format validation for phone numbers
- Sends phone to backend if provided

**Implementation:**
```typescript
const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate optional phone format
  if (signupPhone.trim() && !/^\+[1-9]\d{7,14}$/.test(signupPhone.trim())) {
    setError('Invalid phone format. Use E.164 format (e.g., +1234567890)');
    return;
  }
  
  try {
    await apiRegister(
      signupName,
      signupEmail,
      signupPassword,
      signupCaptchaToken || undefined,
      signupPhone.trim() || undefined
    );
    // ... success handling
  } catch (err) {
    setError(parseAuthError(err));
  }
};
```

#### UI Changes

**Login Form:**
```tsx
<input
  type="text"
  placeholder="Email or Phone Number"
  value={loginIdentifier}
  onChange={(e) => setLoginIdentifier(e.target.value)}
  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
  autoComplete="username"
/>
<p className="text-xs text-gray-500 mt-1 ml-1">
  For phone, use E.164 format (e.g., +1234567890)
</p>
```

**Registration Form:**
```tsx
<input
  type="tel"
  placeholder="Phone Number (optional)"
  value={signupPhone}
  onChange={(e) => setSignupPhone(e.target.value)}
  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#43A047]"
/>
<p className="text-xs text-gray-500 mt-1 ml-1">
  Use E.164 format (e.g., +1234567890)
</p>
```

### User Experience (React Web)

**Login:**
- Single unified input field accepts email OR phone
- Helper text guides users on E.164 format
- Auto-detection based on `+` prefix
- Clear error messages for invalid formats

**Registration:**
- Email is required (primary identifier)
- Phone number is optional
- E.164 format validation with helper text
- Backend sends dual OTPs if phone provided

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

**Flutter Mobile App:**

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

**React Web App:**

1. **Login Page - Login Tab:**
   - Test login with email: `user@example.com`
   - Test login with phone: `+1234567890`
   - Test invalid phone format (should show error)
   - Test empty fields (should show validation error)
   - Verify helper text is displayed

2. **Login Page - Sign Up Tab:**
   - Test registration with email only
   - Test registration with email + phone
   - Test invalid phone format (should show error)
   - Verify phone field is truly optional (can submit without phone)
   - Test email format validation
   - Verify helper text guides E.164 format

3. **Browser Testing:**
   - Clear cache: `Ctrl + Shift + Delete` or `Ctrl + F5`
   - Test on production: `https://speakoo.duckdns.org`
   - Verify unified login input works
   - Verify optional phone registration works
   - Check that backend sends dual OTPs when phone provided

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
