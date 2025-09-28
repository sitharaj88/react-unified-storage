# Quick Start

Get up and running with React Unified Storage in minutes.

## Basic Example

Here's a complete example showing the most common use cases:

```tsx
import { StorageProvider, useStore, useCollection } from '@sitharaj08/react-unified-storage';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

function App() {
  return (
    <StorageProvider config={{
      driver: 'auto',        // Auto-select best storage
      encryption: {          // Optional encryption
        key: 'your-secret-key'
      }
    }}>
      <TodoApp />
    </StorageProvider>
  );
}

function TodoApp() {
  // Simple value storage
  const [filter, setFilter] = useStore('todo-filter', {
    defaultValue: 'all' as 'all' | 'active' | 'completed'
  });

  // Collection for structured data
  const todos = useCollection<Todo>('todos');

  const [todosList, setTodosList] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Load todos on mount
  useEffect(() => {
    todos.list().then(setTodosList);
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const todo = await todos.add({
      title: newTodo,
      completed: false
    });

    setTodosList(prev => [...prev, todo]);
    setNewTodo('');
  };

  const toggleTodo = async (id: number) => {
    await todos.update(id, (todo) => ({
      ...todo,
      completed: !todo.completed
    }));

    setTodosList(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  const filteredTodos = todosList.filter(todo => {
    switch (filter) {
      case 'active': return !todo.completed;
      case 'completed': return todo.completed;
      default: return true;
    }
  });

  return (
    <div>
      <h1>Todo App</h1>

      {/* Filter controls */}
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>

      {/* Add new todo */}
      <div>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="What needs to be done?"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add Todo</button>
      </div>

      {/* Todo list */}
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none'
            }}>
              {todo.title}
            </span>
          </li>
        ))}
      </ul>

      <p>
        {filteredTodos.filter(t => !t.completed).length} items left
      </p>
    </div>
  );
}

export default App;
```

## Configuration Options

### Basic Configuration

```tsx
<StorageProvider config={{
  driver: 'auto',           // 'auto', 'idb', 'local', 'session', 'memory'
  namespace: 'myapp',       // Key prefix for isolation
  broadcast: true,          // Enable cross-tab sync
}}>
  <App />
</StorageProvider>
```

### Advanced Configuration

```tsx
<StorageProvider config={{
  driver: 'idb',            // Use IndexedDB
  namespace: 'myapp-v1',    // Versioned namespace
  broadcast: true,          // Cross-tab synchronization
  encryption: {             // AES-GCM encryption
    key: 'your-32-char-secret-key-here!',
    salt: 'optional-salt'
  },
  compression: true,        // Gzip compression
  errorHandler: (error) => {
    console.error('Storage error:', error);
    // Send to error reporting service
  }
}}>
  <App />
</StorageProvider>
```

## Common Patterns

### Settings Persistence

```tsx
function Settings() {
  const [settings, setSettings] = useStore('app-settings', {
    defaultValue: {
      theme: 'light',
      language: 'en',
      notifications: true
    }
  });

  return (
    <div>
      <h2>Settings</h2>
      <label>
        Theme:
        <select
          value={settings.theme}
          onChange={(e) => setSettings({
            ...settings,
            theme: e.target.value
          })}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
      {/* More settings... */}
    </div>
  );
}
```

### Form State Management

```tsx
function ContactForm() {
  const [formData, setFormData] = useStore('contact-form', {
    defaultValue: {
      name: '',
      email: '',
      message: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form data
    console.log('Submitting:', formData);

    // Clear form after submission
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({
          ...formData,
          name: e.target.value
        })}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({
          ...formData,
          email: e.target.value
        })}
        placeholder="Email"
        required
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({
          ...formData,
          message: e.target.value
        })}
        placeholder="Message"
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

### User Authentication State

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useStore<User | null>('current-user', {
    defaultValue: null
  });

  const login = async (email: string, password: string) => {
    // Authentication logic
    const userData = await authenticateUser(email, password);
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Next Steps

- Read the [Getting Started Guide](./getting-started.md)
- Learn more in the [Installation Guide](./installation.md)
- Read the [API reference](./api/core-api.md)