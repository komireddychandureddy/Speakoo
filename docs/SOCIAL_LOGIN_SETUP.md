# Social Login Configuration Guide

This guide explains how to configure Google, Facebook, and Apple social login for the Speakoo web application.

## Prerequisites

- Domain name configured (e.g., speakoo.duckdns.org)
- HTTPS enabled (required for OAuth)

## Environment Variables Setup

Create a `.env` file in `apps/web/` directory (copy from `.env.example`):

```bash
cd apps/web
cp .env.example .env
```

## 1. Google OAuth Configuration

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Create OAuth 2.0 Client ID
1. Click **Create Credentials** > **OAuth client ID**
2. Select application type: **Web application**
3. Name: `Speakoo Web App`
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - `https://speakoo.duckdns.org` (for production)
5. **Authorized redirect URIs**:
   - `http://localhost:3000` (for development)
   - `https://speakoo.duckdns.org` (for production)
6. Click **Create**
7. Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

### Step 3: Configure Environment
Add to `apps/web/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Add to `apps/api/.env.development` and `apps/api/.env.production`:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## 2. Facebook Login Configuration

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Select **Consumer** as app type
4. App name: `Speakoo`
5. Contact email: your email
6. Click **Create App**

### Step 2: Add Facebook Login
1. In the app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** platform
4. Enter site URL: `https://speakoo.duckdns.org`
5. Click **Save** and **Continue**

### Step 3: Configure OAuth Settings
1. Go to **Facebook Login** > **Settings**
2. **Valid OAuth Redirect URIs**:
   - `http://localhost:3000`
   - `https://speakoo.duckdns.org`
3. **Allowed Domains for the JavaScript SDK**:
   - `localhost`
   - `speakoo.duckdns.org`
4. Click **Save Changes**

### Step 4: Get App ID and Secret
1. Go to **Settings** > **Basic**
2. Copy **App ID**
3. Click **Show** to reveal **App Secret** (copy it)

### Step 5: Configure Environment
Add to `apps/web/.env`:
```env
VITE_FACEBOOK_APP_ID=your-app-id
```

Add to `apps/api/.env.development` and `apps/api/.env.production`:
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

### Step 6: Switch to Live Mode (Production Only)
1. In app dashboard, toggle from **In Development** to **Live**
2. Complete App Review requirements if needed

---

## 3. Apple Sign In Configuration

### Step 1: Create App ID
1. Go to [Apple Developer](https://developer.apple.com/)
2. Sign in with Apple Developer account (requires membership)
3. Navigate to **Certificates, Identifiers & Profiles**
4. Click **Identifiers** > **+** button
5. Select **App IDs** > **Continue**
6. Select **App** > **Continue**
7. Description: `Speakoo Web`
8. Bundle ID: `com.speakoo.web` (reverse domain format)
9. Enable **Sign In with Apple** capability
10. Click **Continue** > **Register**

### Step 2: Create Service ID
1. Click **Identifiers** > **+** button
2. Select **Services IDs** > **Continue**
3. Description: `Speakoo Web Service`
4. Identifier: `com.speakoo.web.service`
5. Enable **Sign In with Apple**
6. Click **Configure** next to Sign In with Apple
7. **Primary App ID**: Select the App ID created in Step 1
8. **Web Domain**: `speakoo.duckdns.org` (without https://)
9. **Return URLs**: `https://speakoo.duckdns.org`
10. Click **Next** > **Done** > **Continue** > **Register**

### Step 3: Create Private Key
1. Click **Keys** > **+** button
2. Key Name: `Speakoo Apple Sign In Key`
3. Enable **Sign In with Apple**
4. Click **Configure** > Select Primary App ID
5. Click **Save** > **Continue** > **Register**
6. **Download** the key file (.p8) - save it securely
7. Note the **Key ID** (10-character string)

### Step 4: Get Team ID
1. Go to **Membership** in Apple Developer account
2. Copy your **Team ID** (10-character string)

### Step 5: Configure Environment
Add to `apps/web/.env`:
```env
VITE_APPLE_CLIENT_ID=com.speakoo.web.service
```

Add to `apps/api/.env.development` and `apps/api/.env.production`:
```env
APPLE_CLIENT_ID=com.speakoo.web.service
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=contents-of-p8-file
```

**Note**: For `APPLE_PRIVATE_KEY`, you can either:
- Option A: Paste the entire contents of the .p8 file (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
- Option B: Store the .p8 file in a secure location and reference its path

---

## 4. hCaptcha Configuration (Required)

### Step 1: Create hCaptcha Account
1. Go to [hCaptcha](https://www.hcaptcha.com/)
2. Sign up for a free account
3. Verify your email

### Step 2: Create Site
1. In hCaptcha dashboard, click **New Site**
2. Site name: `Speakoo Web`
3. Add domains:
   - `localhost` (for development)
   - `speakoo.duckdns.org` (for production)
4. Click **Save**
5. Copy the **Site Key** and **Secret Key**

### Step 3: Configure Environment
Add to `apps/web/.env`:
```env
VITE_HCAPTCHA_SITE_KEY=your-site-key
```

Add to `apps/api/.env.development` and `apps/api/.env.production`:
```env
HCAPTCHA_ENABLED=true
HCAPTCHA_SECRET=your-secret-key
HCAPTCHA_SITE_KEY=your-site-key
```

---

## 5. Complete Environment Files

### `apps/web/.env`
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your-facebook-app-id
VITE_APPLE_CLIENT_ID=com.speakoo.web.service
```

### `apps/api/.env.development`
```env
# ... existing vars ...

# OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
APPLE_CLIENT_ID=com.speakoo.web.service
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=your-private-key-contents

# hCaptcha
HCAPTCHA_ENABLED=true
HCAPTCHA_SECRET=your-hcaptcha-secret
HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

---

## 6. Restart Services

After configuring environment variables:

```bash
# Restart web app
cd apps/web
npm run dev

# Restart API
cd apps/api
npm run start:dev
```

---

## 7. Testing

1. Navigate to `http://localhost:3000` (or your domain)
2. You should now see:
   - Google "Continue with Google" button
   - Facebook "Continue with Facebook" button
   - Apple "Continue with Apple" button
   - hCaptcha checkbox on login/signup forms

3. Test each social login:
   - Click the button
   - Authorize the app
   - Verify successful login and redirect to dashboard

---

## Troubleshooting

### Google Login Not Working
- Verify Client ID is correct in both frontend and backend `.env`
- Check authorized domains in Google Cloud Console
- Ensure HTTPS is enabled (required for production)

### Facebook Login Not Working
- Verify App ID and App Secret are correct
- Check that app is in "Live" mode for production
- Verify redirect URIs match exactly
- Check browser console for JavaScript errors

### Apple Sign In Not Working
- Verify Service ID matches Client ID
- Check that domains are verified (may take 24 hours)
- Ensure private key (.p8) is correctly formatted
- Apple Sign In requires HTTPS even in development (use ngrok or similar)

### hCaptcha Not Showing
- Verify Site Key is correct
- Check that domain is added to hCaptcha site configuration
- Clear browser cache

### Country Code Dropdown Not Detecting Location
- Grant browser location permission when prompted
- If denied, it will fallback to timezone detection
- For testing geolocation, must use HTTPS (localhost exception exists)

---

## Security Notes

1. **Never commit `.env` files** - they contain secrets
2. **Rotate secrets regularly** - especially after team members leave
3. **Use different credentials** for development and production
4. **Enable rate limiting** - backend already has throttling configured
5. **Monitor for suspicious activity** - check OAuth app dashboards regularly

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [hCaptcha Documentation](https://docs.hcaptcha.com/)
