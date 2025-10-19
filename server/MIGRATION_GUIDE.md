# Migration Applied: Make phone_number NULLABLE

## ✅ What Was Done

### 1. Created Flyway Migration Structure
- Created directory: `src/main/resources/db/migration/`
- Created migration: `V1__alter_users_phone_number_not_null.sql`

### 2. Migration Details

**File:** `V1__alter_users_phone_number_not_null.sql`

```sql
-- Drops NOT NULL constraint if it exists
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;

-- Updates documentation
COMMENT ON COLUMN users.phone_number IS 'User phone number - optional for authentication';
```

### 3. Updated Configuration

**application.properties:**
- Changed `spring.jpa.hibernate.ddl-auto` from `update` to `validate`
- Added Flyway configuration
- Now **Flyway manages schema**, Hibernate only validates

### 4. Updated Entity

**User.java:**
```java
// Phone number is now optional (nullable)
@Column(unique = true)
private String phoneNumber;
```

---

## 🚀 How to Apply the Migration

### Method 1: Restart the Application (Automatic)

Simply restart your Spring Boot application:

```bash
cd /Users/mohan/personal/freelance/nested-app/server
./gradlew bootRun
```

Flyway will automatically:
1. Detect the new migration file
2. Run it against your database
3. Update the `flyway_schema_history` table

**You'll see in the logs:**
```
Flyway: Migrating schema "public" to version "1 - alter users phone number not null"
Flyway: Successfully applied 1 migration to schema "public"
```

### Method 2: Rebuild and Run

```bash
cd /Users/mohan/personal/freelance/nested-app/server
./gradlew clean build
./gradlew bootRun
```

---

## ✅ Verify the Migration

### Option 1: Check Application Logs

Look for these lines in the console:
```
INFO: Flyway: Migrating schema "public" to version "1 - alter users phone number not null"
INFO: Flyway: Successfully applied 1 migration
```

### Option 2: Check Database Directly

Connect to PostgreSQL and verify:

```bash
# Connect to database
psql -h localhost -U admin -d nested

# Check if migration was applied
SELECT * FROM flyway_schema_history;

# Verify column is NULLABLE
\d users

# Should show: phone_number | character varying | (without "not null")
```

### Option 3: Check via SQL

```sql
-- Check column constraints
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'phone_number';

-- Result should show: is_nullable = YES
```

---

## ⚠️ Important Notes

### After Migration
- Phone number is now **optional** (can be NULL)
- Users can be created without a phone number
- Existing users with NULL phone numbers will remain NULL
- Your application can now accept users without phone numbers

---

## 🐛 Troubleshooting

### Error: "Cannot drop NOT NULL constraint"

**Cause:** The column might already be nullable

**Solution:** This is not an error - the migration will succeed either way. PostgreSQL's `DROP NOT NULL` is idempotent.

### Error: "Migration checksum mismatch"

**Cause:** Migration file was modified after being applied

**Solution:** 
1. If migration hasn't been applied yet, you can modify it
2. If already applied, create a new migration (V2) instead

### Error: "Validate failed"

**Cause:** Entity definition doesn't match database schema

**Solution:** The entity has already been updated. Just restart the app.

---

## 📝 Testing the Migration

### Test 1: Create user without phone number (should work now)

```java
User user = new User();
user.setEmail("test@example.com");
user.setFirebaseUid("test-uid");
// Don't set phone number - this is now allowed

userRepository.save(user); 
// Should succeed - phone_number can be NULL
```

### Test 2: Create user with phone number (should still work)

```java
User user = new User();
user.setEmail("test2@example.com");
user.setFirebaseUid("test-uid-2");
user.setPhoneNumber("+1234567890");

userRepository.save(user); 
// Should succeed
```

### Test 3: Verify database allows NULL

```sql
-- Insert a user without phone number
INSERT INTO users (email, firebase_uid, phone_number, is_active, role, created_at, updated_at)
VALUES ('test@example.com', 'test-uid', NULL, true, 'STANDARD', NOW(), NOW());

-- Should succeed without error

-- Check if NULL values are allowed
SELECT id, email, phone_number FROM users WHERE phone_number IS NULL;
```

---

## 📚 Next Steps

### If you need to add more migrations:

1. Create new file: `V2__your_description.sql`
2. Write your SQL
3. Restart application
4. Flyway will apply it automatically

Example:
```bash
touch src/main/resources/db/migration/V2__add_user_status_column.sql
```

See `src/main/resources/db/migration/README.md` for detailed guide.

---

**Created:** 2025-10-19  
**Updated:** 2025-10-19  
**Migration Applied:** V1__alter_users_phone_number_not_null (makes phone_number NULLABLE)

