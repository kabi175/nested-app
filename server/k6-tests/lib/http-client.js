/**
 * HTTP Client utilities for k6 load tests
 * Nested App - Investment Platform
 */

import http from 'k6/http';
import { check, fail } from 'k6';
import { config } from '../config/environments.js';

/**
 * Base headers for all requests
 */
export const baseHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Get headers with authentication token
 */
export function getAuthHeaders(token) {
  return {
    ...baseHeaders,
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Get headers with MFA token
 */
export function getMfaHeaders(token, mfaToken) {
  return {
    ...getAuthHeaders(token),
    'X-MFA-Token': mfaToken,
  };
}

/**
 * Make a GET request
 */
export function get(endpoint, token = null, tags = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = token ? getAuthHeaders(token) : baseHeaders;
  
  const response = http.get(url, {
    headers,
    tags: { name: endpoint, ...tags },
  });
  
  return response;
}

/**
 * Make a POST request
 */
export function post(endpoint, body, token = null, tags = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = token ? getAuthHeaders(token) : baseHeaders;
  
  const response = http.post(url, JSON.stringify(body), {
    headers,
    tags: { name: endpoint, ...tags },
  });
  
  return response;
}

/**
 * Make a PUT request
 */
export function put(endpoint, body, token = null, tags = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = token ? getAuthHeaders(token) : baseHeaders;
  
  const response = http.put(url, JSON.stringify(body), {
    headers,
    tags: { name: endpoint, ...tags },
  });
  
  return response;
}

/**
 * Make a PATCH request
 */
export function patch(endpoint, body, token = null, tags = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = token ? getAuthHeaders(token) : baseHeaders;
  
  const response = http.patch(url, JSON.stringify(body), {
    headers,
    tags: { name: endpoint, ...tags },
  });
  
  return response;
}

/**
 * Make a DELETE request
 */
export function del(endpoint, body = null, token = null, tags = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  const headers = token ? getAuthHeaders(token) : baseHeaders;
  
  const response = http.del(url, body ? JSON.stringify(body) : null, {
    headers,
    tags: { name: endpoint, ...tags },
  });
  
  return response;
}

/**
 * Check response status and optionally parse JSON
 */
export function checkResponse(response, expectedStatus, description) {
  const success = check(response, {
    [`${description} - status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${description} - response time < 1s`]: (r) => r.timings.duration < 1000,
  });
  
  if (!success) {
    console.error(`Failed check for ${description}: Status=${response.status}, Body=${response.body}`);
  }
  
  return success;
}

/**
 * Parse JSON response safely
 */
export function parseResponse(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    console.error(`Failed to parse response: ${response.body}`);
    return null;
  }
}

/**
 * Check response and parse JSON
 */
export function checkAndParse(response, expectedStatus, description) {
  checkResponse(response, expectedStatus, description);
  return parseResponse(response);
}

/**
 * Batch requests for parallel execution
 */
export function batch(requests, token = null) {
  const headers = token ? getAuthHeaders(token) : baseHeaders;
  
  const batchRequests = requests.map(req => ({
    method: req.method || 'GET',
    url: `${config.baseUrl}${req.endpoint}`,
    body: req.body ? JSON.stringify(req.body) : null,
    params: { headers, tags: req.tags || {} },
  }));
  
  return http.batch(batchRequests);
}

/**
 * Request with retry logic
 */
export function requestWithRetry(method, endpoint, body, token, maxRetries = 3) {
  let lastResponse = null;
  
  for (let i = 0; i < maxRetries; i++) {
    let response;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = get(endpoint, token);
        break;
      case 'POST':
        response = post(endpoint, body, token);
        break;
      case 'PUT':
        response = put(endpoint, body, token);
        break;
      case 'PATCH':
        response = patch(endpoint, body, token);
        break;
      case 'DELETE':
        response = del(endpoint, body, token);
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }
    
    lastResponse = response;
    
    if (response.status >= 200 && response.status < 500) {
      return response;
    }
    
    console.warn(`Retry ${i + 1}/${maxRetries} for ${endpoint}: Status=${response.status}`);
  }
  
  return lastResponse;
}
