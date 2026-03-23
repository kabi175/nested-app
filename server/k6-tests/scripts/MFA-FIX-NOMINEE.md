# MFA Fix for Nominee Creation

## 🔐 Issue

The `/api/v1/users/nominees` endpoint requires MFA (Multi-Factor Authentication) verification. The error you're seeing:

```
MFA token missing for protected endpoint: /api/v1/users/nominees
```

## ✅ Solution

The script has been updated to handle MFA for nominee operations. It now:

1. **Starts MFA session** with action `NOMINEE_UPDATE`
2. **Gets OTP** (either from user input or test mode)
3. **Verifies OTP** to get MFA token
4. **Includes MFA token** in `X-MFA-Token` header when creating nominee

## 🚀 Usage

### Option 1: Interactive Mode (Manual OTP Entry)

```bash
# Get token first
./scripts/get-mobile-token.sh
export K6_AUTH_TOKEN=$(cat results/mobile-token.txt)

# Run setup script
./scripts/setup-test-user.sh

# When prompted, enter the OTP sent to your phone
```

### Option 2: Test Mode (Automated - Requires Backend Support)

If your backend supports test OTP (e.g., `000000` always works in test environment):

```bash
export K6_AUTH_TOKEN="your-token"
export TEST_MODE="true"
export TEST_OTP="000000"  # Or whatever test OTP your backend accepts

./scripts/setup-test-user.sh
```

## 📋 MFA Flow

```
Step 1: POST /api/v1/auth/mfa/start
  Body: { "action": "NOMINEE_UPDATE", "channel": "SMS" }
  → Returns: mfaSessionId

Step 2: POST /api/v1/auth/mfa/verify
  Body: { "mfaSessionId": "...", "otp": "123456" }
  → Returns: mfaToken

Step 3: POST /api/v1/users/nominees
  Headers: 
    Authorization: Bearer {token}
    X-MFA-Token: {mfaToken}
  Body: { "data": [{ ...nominee data... }] }
  → Returns: nominee ID
```

## 🔧 Backend Configuration

For automated testing, you may want to configure your backend to:

1. **Accept test OTP** for test accounts
2. **Bypass MFA** in test/staging environments
3. **Auto-approve** MFA for specific test phone numbers

Example backend check:
```java
if (isTestAccount(userId) && otp.equals("000000")) {
    return generateMfaToken();
}
```

## ⚠️ Important Notes

1. **MFA tokens expire** (usually 5 minutes)
2. **OTP expires** (usually 5-10 minutes)
3. **Rate limiting** applies to MFA requests
4. **Test mode** only works if backend supports it

## 🐛 Troubleshooting

### Error: "MFA session failed"

**Solution:**
- Check if phone number is registered
- Verify SMS service is working
- Wait a few minutes if rate limited

### Error: "Invalid OTP"

**Solution:**
- Request a new OTP
- Check OTP hasn't expired
- Verify OTP code is correct

### Error: "MFA token missing" (still)

**Solution:**
- Ensure script includes `X-MFA-Token` header
- Check MFA token was obtained successfully
- Verify token hasn't expired

## 📝 Updated Scripts

Both scripts have been updated:
- ✅ `setup-test-user.sh` - Bash version with MFA support
- ✅ `setup-test-user.js` - Node.js version with MFA support

The scripts now automatically handle MFA for nominee operations.
