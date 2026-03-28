# Troubleshooting Validation Errors

## Common Validation Error: `HandlerMethodValidationException`

This error occurs when request data doesn't meet validation requirements.

## Common Causes

### 1. Bank Account Creation

**Error**: `Validation failure` when creating bank account

**Possible Issues**:

#### a) Account Type Format
- **Problem**: Account type must be enum value
- **Solution**: Use `SAVINGS` or `CURRENT` (uppercase)
- **Script**: Already handles this by converting to uppercase

#### b) IFSC Code Format
- **Problem**: IFSC must match pattern `^[A-Z]{4}0[A-Z0-9]{6}$`
- **Example**: `SBIN0001234` ✅ | `sbin0001234` ❌ | `SBIN001234` ❌
- **Solution**: Ensure IFSC is uppercase and has format: `XXXX0XXXXX`

#### c) Account Number Format
- **Problem**: Account number must be 9-18 digits
- **Example**: `123456789` ✅ (9 digits) | `1234567890123456` ✅ (16 digits)
- **Solution**: Ensure account number is numeric and within range

#### d) is_primary Type
- **Problem**: Must be boolean, not string
- **Wrong**: `"is_primary": "true"` ❌
- **Correct**: `"is_primary": true` ✅
- **Script**: Already handles this correctly

### 2. Goal Creation

**Error**: `Validation failure` when creating goal

**Possible Issues**:

#### a) Missing Child
- **Problem**: `child` field is required and must not be empty
- **Solution**: Ensure child ID is provided and valid

#### b) Target Date Format
- **Problem**: Target date must be in format `yyyy-MM-dd`
- **Example**: `2024-12-31` ✅ | `31-12-2024` ❌ | `2024/12/31` ❌
- **Solution**: Use ISO date format

#### c) Target Date Not Empty
- **Problem**: Target date cannot be null or empty
- **Solution**: Always provide a valid future date

### 3. User Profile Update

**Possible Issues**:

#### a) Gender Format
- **Problem**: Gender must be lowercase enum
- **Valid**: `male`, `female`, `transgender`
- **Invalid**: `MALE`, `Male`, `M`

#### b) Date of Birth Format
- **Problem**: Must be in format `yyyy-MM-dd`
- **Example**: `1990-01-15` ✅

## How to Debug

### 1. Check the Full Error Response

```bash
# Enable verbose output
curl -v -X POST "${BASE_URL}/api/v1/users/${USER_ID}/banks" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "1234567890",
    "ifsc": "SBIN0001234",
    "account_type": "SAVINGS",
    "is_primary": true
  }'
```

### 2. Check Server Logs

```bash
tail -f server/logs/nested-api.log | grep -i validation
```

### 3. Validate JSON Payload

```bash
# Use jq to validate JSON
echo '{"account_type": "savings"}' | jq '.'

# Check enum values
echo '{"account_type": "SAVINGS"}' | jq '.'
```

## Quick Fixes

### Fix Bank Account Script

If you're getting validation errors:

```bash
# Ensure uppercase account type
export BANK_ACCOUNT_TYPE="SAVINGS"  # or "CURRENT"

# Ensure valid IFSC format
export BANK_IFSC="SBIN0001234"  # Must be XXXX0XXXXX

# Ensure valid account number (9-18 digits)
export BANK_ACCOUNT_NUMBER="123456789012"

# Run script
./scripts/create-bank.sh
```

### Fix Goal Script

```bash
# Ensure child exists
export CHILD_ID="123"

# Ensure valid date format
export GOAL_TARGET_DATE="2034-12-31"  # yyyy-MM-dd

# Run script
./scripts/create-goal.sh
```

## Validation Rules Summary

| Field | Type | Format | Example |
|-------|------|--------|---------|
| `account_type` | Enum | `SAVINGS` or `CURRENT` | `SAVINGS` |
| `ifsc` | String | `^[A-Z]{4}0[A-Z0-9]{6}$` | `SBIN0001234` |
| `account_number` | String | 9-18 digits | `123456789012` |
| `is_primary` | Boolean | `true` or `false` | `true` |
| `target_date` | Date | `yyyy-MM-dd` | `2034-12-31` |
| `child.id` | String/Number | Required, not empty | `123` |
| `gender` | Enum | `male`, `female`, `transgender` | `male` |

## Testing Validation

```bash
# Test bank account payload
curl -X POST "${BASE_URL}/api/v1/users/${USER_ID}/banks" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "123456789012",
    "ifsc": "SBIN0001234",
    "account_type": "SAVINGS",
    "is_primary": true
  }' | jq '.'
```

If you see validation errors, check:
1. All required fields are present
2. Field formats match requirements
3. Enum values are correct
4. Data types are correct (boolean vs string)
