# MFA Helper for Load Tests

## Overview

The MFA helper automatically handles MFA (Multi-Factor Authentication) in load tests using a default test OTP code: **123456**.

## Default Test OTP

**OTP Code: `123456`**

This is used automatically for all MFA verifications in load tests.

## Usage

### Automatic MFA Handling

The investment journey and payment flow tests automatically handle MFA:

```javascript
import { getMfaToken } from '../lib/mfa-helper.js';

// If payment verify returns 403 (MFA required)
if (response.status === 403) {
  const mfaToken = getMfaToken(token, 'MF_BUY', '123456');
  // Retry request with MFA token
}
```

### Manual MFA Flow

```javascript
import { startMfaSession, verifyMfaOtp, getMfaToken } from '../lib/mfa-helper.js';

// Option 1: Complete flow (recommended)
const mfaToken = getMfaToken(token, 'MF_BUY', '123456');

// Option 2: Step by step
const sessionId = startMfaSession(token, 'MF_BUY');
const mfaToken = verifyMfaOtp(token, sessionId, '123456');
```

## Supported MFA Actions

- `MF_BUY` - For buy/payment verification
- `MF_SELL` - For sell/redeem verification
- `NOMINEE_UPDATE` - For nominee operations
- `EMAIL_UPDATE` - For email updates

## Backend Configuration

For the default OTP (123456) to work, your backend should:

1. **Accept test OTP in test/staging environments**
2. **Bypass MFA validation for test OTP**
3. **Auto-approve OTP 123456 for test accounts**

Example backend check:
```java
if (isTestEnvironment() && otp.equals("123456")) {
    return generateMfaToken();
}
```

## Updated Tests

The following tests now automatically handle MFA with default OTP:

- ✅ `investment-journey.js` - Payment verify with MFA
- ✅ `payment-flow-journey.js` - Payment verify with MFA

## Example Flow

```
1. POST /api/v1/payments/{id}/actions/verify
   → Returns 403 (MFA required)

2. POST /api/v1/auth/mfa/start
   Body: { "action": "MF_BUY", "channel": "SMS" }
   → Returns: mfaSessionId

3. POST /api/v1/auth/mfa/verify
   Body: { "mfaSessionId": "...", "otp": "123456" }
   → Returns: mfaToken

4. POST /api/v1/payments/{id}/actions/verify (retry)
   Headers: X-MFA-Token: {mfaToken}
   → Returns: 200 (success)
```

## Notes

- Default OTP is **123456** (hardcoded for load testing)
- MFA tokens expire (usually 5 minutes)
- Rate limiting may apply to MFA requests
- Test OTP only works if backend is configured to accept it
