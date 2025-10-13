# Child Form Components

This directory contains reusable components for the child creation form.

## Components

### FormHeader
A reusable gradient header component with icon and text.

**Props:**
- `title: string` - Main heading text
- `subtitle: string` - Subtitle text
- `animationStyle?: any` - Optional animation styles

**Usage:**
```tsx
<FormHeader
  title="Who is this for?"
  subtitle="Add your child to start planning for their education."
  animationStyle={{
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  }}
/>
```

### ChildForm
A form component for collecting child information with validation support.

**Props:**
- `values: ChildFormValues` - Form field values
- `errors: Record<string, string>` - Validation errors
- `animationStyle?: any` - Optional animation styles
- `checkboxRotation?: any` - Checkbox rotation animation value
- `onFieldChange: (field, value) => void` - Field change handler
- `onCheckboxChange: (value) => void` - Checkbox change handler

**Usage:**
```tsx
<ChildForm
  values={values}
  errors={errors}
  onFieldChange={handleFieldChange}
  onCheckboxChange={handleCheckboxChange}
  checkboxRotation={checkboxRotation}
  animationStyle={{
    opacity: fadeAnim,
    transform: [{ scale: cardScale }],
  }}
/>
```

## Features

- ✅ Type-safe props with TypeScript
- ✅ Reusable across different forms
- ✅ Animation support built-in
- ✅ Validation error display
- ✅ Consistent styling

