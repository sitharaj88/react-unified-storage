import { useState, useEffect } from 'react';
import { StorageProvider, useStore, useCollection } from '@sitharaj08/react-unified-storage';
import './App.css';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  theme: 'light' | 'dark';
}

function CounterSection() {
  const [count, setCount, meta] = useStore<number>('counter', {
    defaultValue: 0,
    metadata: true
  });

  const currentCount = count ?? 0;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Counter</h2>
        <span className="badge">Basic Storage</span>
      </div>
      <div className="counter-display">
        <div className="counter-value">{currentCount}</div>
        <div className="counter-controls">
          <button
            className="btn btn-secondary"
            onClick={() => setCount(currentCount - 1)}
            disabled={currentCount === 0}
          >
            −
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCount(currentCount + 1)}
          >
            +
          </button>
        </div>
      </div>
      {meta && (
        <div className="meta-info">
          <span>Last updated: {new Date(meta.updatedAt).toLocaleTimeString()}</span>
          <span>Driver: {meta.driver}</span>
        </div>
      )}
    </div>
  );
}

function TodoSection() {
  const todos = useCollection<Todo>('todos');
  const [newTodo, setNewTodo] = useState('');
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadTodos = async () => {
      const list = await todos.list();
      setTodoList(list);
      const count = await todos.count();
      setTotalCount(count);
    };
    loadTodos();
  }, [todos]);

  const addTodo = async () => {
    if (newTodo.trim()) {
      await todos.add({
        id: crypto.randomUUID(),
        text: newTodo.trim(),
        completed: false,
        createdAt: Date.now()
      });
      setNewTodo('');
      // Refresh the list
      const list = await todos.list();
      setTodoList(list);
      const count = await todos.count();
      setTotalCount(count);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const todo = todoList.find(t => t.id === id);
    if (todo) {
      await todos.update(id, { ...todo, completed: !completed });
      const list = await todos.list();
      setTodoList(list);
    }
  };

  const deleteTodo = async (id: string) => {
    await todos.remove(id);
    const list = await todos.list();
    setTodoList(list);
    const count = await todos.count();
    setTotalCount(count);
  };

  const clearCompleted = async () => {
    const completedTodos = todoList.filter(todo => todo.completed);
    await Promise.all(completedTodos.map(todo => todos.remove(todo.id)));
    const list = await todos.list();
    setTodoList(list);
    const count = await todos.count();
    setTotalCount(count);
  };

  const completedCount = todoList.filter(t => t.completed).length;

  return (
    <div className="section">
      <div className="section-header">
        <h2>Todo List</h2>
        <span className="badge">Collections API</span>
      </div>

      <div className="todo-input">
        <input
          type="text"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button className="btn btn-primary" onClick={addTodo}>
          Add
        </button>
      </div>

      <div className="todo-stats">
        <span>Total: {totalCount}</span>
        <span>Completed: {completedCount}</span>
      </div>

      <div className="todo-list">
        {todos.isLoading ? (
          <div className="loading">Loading todos...</div>
        ) : (
          todoList.map((todo) => (
            <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span className="todo-text">{todo.text}</span>
              <button
                className="btn btn-danger btn-small"
                onClick={() => deleteTodo(todo.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {totalCount > 0 && (
        <div className="todo-actions">
          <button className="btn btn-secondary" onClick={clearCompleted}>
            Clear Completed
          </button>
          <button className="btn btn-danger" onClick={() => todos.clear()}>
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileSection() {
  const [profile, setProfile] = useStore<UserProfile>('user-profile', {
    defaultValue: {
      name: '',
      email: '',
      theme: 'light'
    }
  });

  const currentProfile = profile ?? {
    name: '',
    email: '',
    theme: 'light' as const
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile({ ...currentProfile, [field]: value });
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>User Profile</h2>
        <span className="badge">Complex Objects</span>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={currentProfile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={currentProfile.email}
            onChange={(e) => updateProfile('email', e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Theme</label>
          <select
            value={currentProfile.theme}
            onChange={(e) => updateProfile('theme', e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {currentProfile.name && (
        <div className="profile-preview">
          <h3>Profile Preview</h3>
          <div className="profile-card">
            <div className="avatar">
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info">
              <h4>{currentProfile.name}</h4>
              <p>{currentProfile.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AppSettings {
  driver: 'auto' | 'memory' | 'local' | 'session' | 'idb';
  broadcast: boolean;
  encryption: boolean;
  compression: boolean;
}

function SettingsSection({ onSettingsChange }: { onSettingsChange: (settings: AppSettings) => void }) {
  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('app-settings');
    return stored ? JSON.parse(stored) : {
      driver: 'auto' as 'auto' | 'memory' | 'local' | 'session' | 'idb',
      broadcast: true,
      encryption: false,
      compression: false
    };
  });

  const updateSetting = (key: string, value: string | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2>Storage Settings</h2>
        <span className="badge">Configuration</span>
      </div>

      <div className="settings-grid">
        <div className="setting-item">
          <label>Storage Driver</label>
          <select
            value={settings.driver}
            onChange={(e) => updateSetting('driver', e.target.value)}
          >
            <option value="auto">Auto (Recommended)</option>
            <option value="memory">Memory (Session only)</option>
            <option value="local">LocalStorage</option>
            <option value="session">SessionStorage</option>
            <option value="idb">IndexedDB</option>
          </select>
          <small>Choose how data is stored</small>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.broadcast}
              onChange={(e) => updateSetting('broadcast', e.target.checked)}
            />
            Cross-tab Sync
          </label>
          <small>Sync changes across browser tabs</small>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.encryption}
              onChange={(e) => updateSetting('encryption', e.target.checked)}
            />
            Encryption
          </label>
          <small>Encrypt stored data</small>
        </div>

        <div className="setting-item">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.compression}
              onChange={(e) => updateSetting('compression', e.target.checked)}
            />
            Compression
          </label>
          <small>Compress data to save space</small>
        </div>
      </div>
    </div>
  );
}

function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate sync events
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="sync-indicator">
      <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
      <span>{isOnline ? 'Online' : 'Offline'}</span>
      {lastSync && (
        <small>Last sync: {lastSync.toLocaleTimeString()}</small>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('counter');

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('app-settings');
    return stored ? JSON.parse(stored) : {
      driver: 'auto' as 'auto' | 'memory' | 'local' | 'session' | 'idb',
      broadcast: true,
      encryption: false,
      compression: false
    };
  });

  const currentAppSettings = appSettings;

  const config = {
    driver: currentAppSettings.driver === 'auto' ? 'auto' as const : currentAppSettings.driver,
    broadcast: currentAppSettings.broadcast,
    encryption: currentAppSettings.encryption ? {
      key: 'demo-key-for-showcase',
      salt: 'demo-salt'
    } : undefined,
    compression: currentAppSettings.compression
  };

  const tabs = [
    { id: 'counter', label: 'Counter', icon: '🔢' },
    { id: 'todos', label: 'Todos', icon: '📝' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <StorageProvider config={config}>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1>React Unified Storage</h1>
            <p>A comprehensive storage solution for React applications</p>
            <SyncIndicator />
          </div>
        </header>

        <nav className="app-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="app-main">
          <div className="container">
            {activeTab === 'counter' && <CounterSection />}
            {activeTab === 'todos' && <TodoSection />}
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'settings' && <SettingsSection onSettingsChange={setAppSettings} />}

            <div className="features-showcase">
              <h3>✨ Features Demonstrated</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <span>Cross-tab Sync</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span>Encryption</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🗜️</span>
                  <span>Compression</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Mobile Responsive</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>React Hooks</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <span>TypeScript</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>
            Built with ❤️ using React Unified Storage •
            <a href="https://github.com/sitharaj08/react-unified-storage" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </StorageProvider>
  );
}

export default App;