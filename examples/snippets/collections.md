# Collections API Examples

Collections provide a high-level API for managing structured data with CRUD operations.

## Basic Todo Collection

```tsx
import { useCollection } from '@sitharaj08/react-unified-storage';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
}

function TodoApp() {
  const todos = useCollection<Todo>('todos');
  const [todoList, setTodoList] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Load todos on mount
  useEffect(() => {
    todos.list().then(setTodoList);
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;

    const todo = await todos.add({
      title: newTodo,
      completed: false,
      createdAt: Date.now(),
      priority: 'medium'
    });

    setTodoList(prev => [...prev, todo]);
    setNewTodo('');
  };

  const toggleTodo = async (id: number) => {
    const todo = await todos.get(id);
    if (todo) {
      await todos.update(id, { completed: !todo.completed });
      setTodoList(prev =>
        prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      );
    }
  };

  const deleteTodo = async (id: number) => {
    await todos.remove(id);
    setTodoList(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = async () => {
    const completedTodos = await todos.list(todo => todo.completed);
    await Promise.all(completedTodos.map(todo => todos.remove(todo.id)));
    setTodoList(prev => prev.filter(t => !t.completed));
  };

  return (
    <div>
      <h2>Todo Collection</h2>

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
        {todoList.map(todo => (
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
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* Summary */}
      <div>
        <p>{todoList.filter(t => !t.completed).length} items left</p>
        <button onClick={clearCompleted}>Clear Completed</button>
      </div>
    </div>
  );
}
```

## Product Inventory System

```tsx
import { useCollection } from '@sitharaj08/react-unified-storage';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

function InventoryManager() {
  const products = useCollection<Product>('products');
  const [productList, setProductList] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const allProducts = await products.list();
    setProductList(allProducts);
  };

  const filteredProducts = productList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(filter.toLowerCase()) ||
                         product.description.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = await products.add({
      ...productData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setProductList(prev => [...prev, newProduct]);
  };

  const updateStock = async (id: string, newStock: number) => {
    await products.update(id, {
      stock: newStock,
      updatedAt: Date.now()
    });
    setProductList(prev =>
      prev.map(p => p.id === id ? { ...p, stock: newStock, updatedAt: Date.now() } : p)
    );
  };

  const deleteProduct = async (id: string) => {
    await products.remove(id);
    setProductList(prev => prev.filter(p => p.id !== id));
  };

  const categories = [...new Set(productList.map(p => p.category))];

  return (
    <div>
      <h2>Product Inventory</h2>

      {/* Filters */}
      <div>
        <input
          placeholder="Search products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Product list */}
      <div>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock}</p>
            <p>Category: {product.category}</p>

            <div>
              <button onClick={() => updateStock(product.id, product.stock + 1)}>+</button>
              <span>{product.stock}</span>
              <button onClick={() => updateStock(product.id, Math.max(0, product.stock - 1))}>-</button>
            </div>

            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Blog Post Management

```tsx
import { useCollection } from '@sitharaj08/react-unified-storage';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  published: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}

function BlogManager() {
  const posts = useCollection<BlogPost>('blog-posts');
  const [postsList, setPostsList] = useState<BlogPost[]>([]);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [showPublishedOnly]);

  const loadPosts = async () => {
    const allPosts = await posts.list(post =>
      !showPublishedOnly || post.published
    );
    setPostsList(allPosts.sort((a, b) => b.createdAt - a.createdAt));
  };

  const createPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPost = await posts.add({
      ...postData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setPostsList(prev => [newPost, ...prev]);
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    await posts.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
    setPostsList(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)
    );
  };

  const publishPost = async (id: string) => {
    await updatePost(id, {
      published: true,
      publishedAt: Date.now()
    });
  };

  const unpublishPost = async (id: string) => {
    await updatePost(id, {
      published: false,
      publishedAt: undefined
    });
  };

  const deletePost = async (id: string) => {
    await posts.remove(id);
    setPostsList(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <h2>Blog Manager</h2>

      <div>
        <label>
          <input
            type="checkbox"
            checked={showPublishedOnly}
            onChange={(e) => setShowPublishedOnly(e.target.checked)}
          />
          Show published only
        </label>
      </div>

      <div>
        <h3>Create New Post</h3>
        {/* Form for creating new posts */}
      </div>

      <div>
        <h3>Posts ({postsList.length})</h3>
        {postsList.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h4>{post.title}</h4>
            <p>By {post.author}</p>
            <p>Status: {post.published ? 'Published' : 'Draft'}</p>
            <p>Tags: {post.tags.join(', ')}</p>

            <div>
              {!post.published ? (
                <button onClick={() => publishPost(post.id)}>Publish</button>
              ) : (
                <button onClick={() => unpublishPost(post.id)}>Unpublish</button>
              )}
              <button onClick={() => deletePost(post.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Advanced Collection Queries

```tsx
import { useCollection } from '@sitharaj08/react-unified-storage';

function AdvancedQueries() {
  const users = useCollection<User>('users');

  // Find users by multiple criteria
  const findUsers = async () => {
    const allUsers = await users.list();

    // Active admin users
    const admins = allUsers.filter(u => u.role === 'admin' && u.active);

    // Users created in the last 30 days
    const recentUsers = allUsers.filter(u =>
      Date.now() - u.createdAt < 30 * 24 * 60 * 60 * 1000
    );

    // Users with specific skills
    const skilledUsers = allUsers.filter(u =>
      u.skills.includes('TypeScript') && u.skills.includes('React')
    );

    return { admins, recentUsers, skilledUsers };
  };

  // Bulk operations
  const bulkActivateUsers = async (userIds: string[]) => {
    await Promise.all(
      userIds.map(id => users.update(id, { active: true }))
    );
  };

  // Complex updates
  const promoteUsers = async (criteria: (user: User) => boolean) => {
    const eligibleUsers = await users.list(criteria);
    await Promise.all(
      eligibleUsers.map(user =>
        users.update(user.id, { role: 'senior', level: user.level + 1 })
      )
    );
  };

  return <div>Advanced query examples</div>;
}
```