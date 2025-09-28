# Schema Validation Examples

Schema validation ensures data integrity and provides runtime type checking using Zod.

## Basic Schema Validation

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(0).max(150, 'Age must be between 0 and 150'),
  role: z.enum(['admin', 'user', 'guest']).default('user')
});

function UserForm() {
  const [user, setUser] = useStore('user', {
    schema: userSchema,
    defaultValue: {
      name: '',
      email: '',
      age: 0,
      role: 'user' as const
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Schema validation happens automatically on setUser
      await setUser(user);
      setErrors({});
      alert('User saved successfully!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Age:</label>
        <input
          type="number"
          value={user.age}
          onChange={(e) => setUser({ ...user, age: Number(e.target.value) })}
        />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>

      <div>
        <label>Role:</label>
        <select
          value={user.role}
          onChange={(e) => setUser({ ...user, role: e.target.value as any })}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      <button type="submit">Save User</button>
    </form>
  );
}
```

## Complex Schema with Nested Objects

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';
import { z } from 'zod';

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  country: z.string().min(1)
});

const companySchema = z.object({
  name: z.string().min(1),
  address: addressSchema,
  employees: z.number().min(1),
  founded: z.date()
});

const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  department: z.enum(['engineering', 'sales', 'marketing', 'hr']),
  salary: z.number().positive(),
  company: companySchema,
  skills: z.array(z.string()).min(1),
  isActive: z.boolean().default(true)
});

function EmployeeProfile() {
  const [employee, setEmployee] = useStore('employee-profile', {
    schema: employeeSchema,
    defaultValue: {
      id: crypto.randomUUID(),
      name: '',
      email: '',
      department: 'engineering' as const,
      salary: 0,
      company: {
        name: '',
        address: {
          street: '',
          city: '',
          zipCode: '',
          country: ''
        },
        employees: 1,
        founded: new Date()
      },
      skills: [],
      isActive: true
    }
  });

  // Form implementation would go here...
  return <div>Employee Profile Form</div>;
}
```

## Schema with Custom Validation

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';
import { z } from 'zod';

// Custom password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  email: z.string().email('Invalid email address'),

  password: passwordSchema,

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

function RegistrationForm() {
  const [formData, setFormData] = useStore('registration-form', {
    schema: registrationSchema,
    defaultValue: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await setFormData(formData);
      setErrors({});
      // Proceed with registration...
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
      <button type="submit">Register</button>
    </form>
  );
}
```

## Schema with Transformations

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';
import { z } from 'zod';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  language: z.string().default('en'),

  // Transform string to number
  fontSize: z.string()
    .transform((val) => parseInt(val))
    .pipe(z.number().min(12).max(24))
    .default('16'),

  // Transform and validate date
  lastLogin: z.string()
    .optional()
    .transform((val) => val ? new Date(val) : new Date())
    .pipe(z.date()),

  // Transform array of strings to objects
  favoriteColors: z.array(z.string())
    .default([])
    .transform((colors) =>
      colors.map((color, index) => ({
        id: index + 1,
        name: color,
        hex: color.startsWith('#') ? color : `#${color}`
      }))
    )
});

function AdvancedSettings() {
  const [settings, setSettings] = useStore('advanced-settings', {
    schema: settingsSchema,
    defaultValue: {
      theme: 'light' as const,
      language: 'en',
      fontSize: '16',
      favoriteColors: []
    }
  });

  // settings.fontSize is now a number
  // settings.favoriteColors is now an array of objects
  // settings.lastLogin is now a Date object

  return <div>Settings form...</div>;
}
```