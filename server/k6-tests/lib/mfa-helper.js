/**
 * MFA Helper for k6 Load Tests
 * Handles MFA flow with default test OTP (123456) for load testing
 */

import http from 'k6/http';
import { post, getMfaHeaders } from './http-client.js';
import { endpoints, config } from '../config/environments.js';

// Default test OTP for load testing
const DEFAULT_TEST_OTP = '123456';

/**
 * Start MFA session for a given action
 * @param {string} token - Authentication token
 * @param {string} action - MFA action (e.g., 'MF_BUY', 'MF_SELL', 'NOMINEE_UPDATE')
 * @param {string} channel - MFA channel (default: 'SMS')
 * @returns {string|null} MFA session ID or null if failed
 */
export function startMfaSession(token, action, channel = 'SMS') {
  const payload = {
    action: action,
    channel: channel,
  };

  const response = post(
    endpoints.mfa.start,
    payload,
    token,
    { scenario: 'mfa_start' }
  );

  if (response.status === 200 || response.status === 201) {
    try {
      const data = JSON.parse(response.body);
      const sessionId = data.mfaSessionId || data.data?.mfaSessionId || data.mfa_session_id;
      return sessionId;
    } catch (e) {
      console.error('Failed to parse MFA start response:', response.body);
      return null;
    }
  }

  return null;
}

/**
 * Verify OTP and get MFA token
 * @param {string} token - Authentication token
 * @param {string} sessionId - MFA session ID
 * @param {string} otp - OTP code (default: '123456' for load testing)
 * @returns {string|null} MFA token or null if failed
 */
export function verifyMfaOtp(token, sessionId, otp = DEFAULT_TEST_OTP) {
  const payload = {
    mfaSessionId: sessionId,
    otp: otp,
  };

  const response = post(
    endpoints.mfa.verify,
    payload,
    token,
    { scenario: 'mfa_verify' }
  );

  if (response.status === 200 || response.status === 201) {
    try {
      const data = JSON.parse(response.body);
      const mfaToken = data.mfaToken || data.data?.mfaToken || data.mfa_token;
      return mfaToken;
    } catch (e) {
      console.error('Failed to parse MFA verify response:', response.body);
      return null;
    }
  }

  return null;
}

/**
 * Complete MFA flow and get MFA token
 * @param {string} token - Authentication token
 * @param {string} action - MFA action
 * @param {string} otp - OTP code (default: '123456' for load testing)
 * @returns {string|null} MFA token or null if failed
 */
export function getMfaToken(token, action, otp = DEFAULT_TEST_OTP) {
  // Step 1: Start MFA session
  const sessionId = startMfaSession(token, action);
  if (!sessionId) {
    console.warn(`Failed to start MFA session for action: ${action}`);
    return null;
  }

  // Step 2: Verify OTP
  const mfaToken = verifyMfaOtp(token, sessionId, otp);
  if (!mfaToken) {
    console.warn(`Failed to verify MFA OTP for action: ${action}`);
    return null;
  }

  return mfaToken;
}

/**
 * Make a POST request with automatic MFA handling
 * If request returns 403, automatically handles MFA and retries
 * @param {string} endpoint - API endpoint
 * @param {object} body - Request body
 * @param {string} token - Authentication token
 * @param {string} mfaAction - MFA action if MFA is required
 * @param {object} tags - Request tags
 * @returns {object} HTTP response
 */
export function postWithMfa(endpoint, body, token, mfaAction = null, tags = {}) {
  // First attempt without MFA
  let response = post(endpoint, body, token, tags);

  // If 403 and MFA action provided, handle MFA and retry
  if (response.status === 403 && mfaAction) {
    const mfaToken = getMfaToken(token, mfaAction);
    if (mfaToken) {
      // Retry with MFA token
      const headers = getMfaHeaders(token, mfaToken);
      const url = `${config.baseUrl}${endpoint}`;
      
      response = http.post(url, JSON.stringify(body), {
        headers,
        tags: { name: endpoint, ...tags, mfa_retry: true },
      });
    }
  }

  return response;
}
