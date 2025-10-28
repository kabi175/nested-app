# Types Organization

This directory contains TypeScript type definitions organized by domain and use case for better maintainability and clarity.

## File Structure

```
types/
├── auth.ts          # Authentication & user management types
├── child.ts         # Child-related types
├── education.ts     # Education system types
├── investment.ts    # Investment, goals, and orders types
├── index.ts         # Consolidated exports for easy importing
├── user.ts          # DEPRECATED - kept for backward compatibility
└── README.md        # This documentation
```

## Domain Organization

### 🔐 Authentication (`auth.ts`)
- `User` - User account information and authentication data

### 👶 Child Management (`child.ts`)
- `Child` - Child profile and demographic information

### 🎓 Education (`education.ts`)
- `Education` - Educational institutions and courses data

### 💰 Investment (`investment.ts`)
- `Goal` - Investment goals and targets
- `Order` - Investment orders (SIP, buy, sell transactions)

## Usage Examples

### Import from specific domain files:
```typescript
// Authentication types
import { User } from '@/types/auth';

// Child management types
import { Child } from '@/types/child';

// Investment types
import { Goal, Order } from '@/types/investment';

// Education types
import { Education } from '@/types/education';
```

### Import all types from index:
```typescript
// Import multiple types at once
import { User, Child, Goal, Education } from '@/types';
```

### Legacy imports (still supported):
```typescript
// Still works but deprecated
import { User, Child, Goal, Education } from '@/types/user';
```

## Migration Guide

The old `user.ts` file has been refactored into domain-specific files. All existing imports will continue to work due to backward compatibility exports, but new code should use the domain-specific imports.

### Before:
```typescript
import { User, Child, Goal, Education } from '@/types/user';
```

### After (recommended):
```typescript
import { User } from '@/types/auth';
import { Child } from '@/types/child';
import { Goal } from '@/types/investment';
import { Education } from '@/types/education';
```

## Benefits

1. **🎯 Domain Separation**: Types are organized by their business domain
2. **📦 Smaller Bundles**: Import only the types you need
3. **🔍 Better Discoverability**: Easier to find relevant types
4. **🛠️ Maintainability**: Changes to one domain don't affect others
5. **📚 Clear Relationships**: Related types are grouped together
6. **🔄 Backward Compatible**: Existing code continues to work

## Type Relationships

```
User (auth) ──┐
              ├── Child (child) ──┐
              │                   ├── Goal (investment) ──┐
              │                   │                       ├── Order (investment)
              │                   └── Education (education)
              └── Direct relationship with Goals
```

## Future Considerations

- Consider adding `api.ts` for API response types
- Consider adding `ui.ts` for component prop types
- Consider adding `form.ts` for form validation types
- Keep types close to their usage domain for better maintainability
