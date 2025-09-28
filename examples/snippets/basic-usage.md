# Basic Usage Examples

## Simple Counter

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';

function Counter() {
  const [count, setCount] = useStore('counter', { defaultValue: 0 });

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

## User Profile Form

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';

interface User {
  name: string;
  email: string;
  age: number;
}

function UserProfile() {
  const [user, setUser] = useStore<User>('user-profile', {
    defaultValue: { name: '', email: '', age: 0 }
  });

  return (
    <div>
      <h2>User Profile</h2>
      <div>
        <label>Name:</label>
        <input
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
      </div>
      <div>
        <label>Age:</label>
        <input
          type="number"
          value={user.age}
          onChange={(e) => setUser({ ...user, age: Number(e.target.value) })}
        />
      </div>
      <p>Profile data is automatically saved!</p>
    </div>
  );
}
```

## Settings with Metadata

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';

function SettingsWithMetadata() {
  const [settings, setSettings, meta] = useStore('app-settings', {
    defaultValue: { theme: 'light', language: 'en' },
    metadata: true
  });

  return (
    <div>
      <h2>Settings</h2>

      <div>
        <label>Theme:</label>
        <select
          value={settings.theme}
          onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label>Language:</label>
        <select
          value={settings.language}
          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {meta && (
        <div>
          <h3>Metadata</h3>
          <p>Created: {new Date(meta.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(meta.updatedAt).toLocaleString()}</p>
          <p>Driver: {meta.driver}</p>
          <p>Version: {meta.version}</p>
        </div>
      )}
    </div>
  );
}
```

## Functional Updates

```tsx
import { useStore } from '@sitharaj08/react-unified-storage';

function TodoList() {
  const [todos, setTodos] = useStore('todos', {
    defaultValue: [] as string[]
  });

  const addTodo = (text: string) => {
    setTodos(prev => [...prev, text]);
  };

  const removeTodo = (index: number) => {
    setTodos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2>Todo List</h2>
      <input
        placeholder="Add a todo..."
        onKeyPress={(e) => {
          if (e.key === 'Enter' && e.currentTarget.value) {
            addTodo(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
      />
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => removeTodo(index)}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```