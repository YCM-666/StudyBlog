// 模拟 Supabase 客户端 - 用于前端演示
import { mockPosts, mockComments, mockUsers, mockUser, mockProfile } from './mockData';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class MockSupabaseClient {
  constructor() {
    this.auth = new MockAuth();
  }

  from(tableName) {
    return new MockQueryBuilder(tableName);
  }

  rpc(name, params) {
    return new MockRPC(name, params);
  }
}

class MockAuth {
  constructor() {
    this.currentUser = mockUser;
    this.currentSession = { user: mockUser };
  }

  async getUser() {
    return { data: { user: this.currentUser }, error: null };
  }

  async getSession() {
    return { data: { session: this.currentSession }, error: null };
  }

  signInWithPassword({ email, password }) {
    return new Promise((resolve) => {
      delay().then(() => {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
          // 模拟用户登录
          resolve({
            data: { 
              user: { 
                id: user.id,
                email: user.email, 
                user_metadata: { username: user.username }
              },
              session: { 
                user: { 
                  id: user.id,
                  email: user.email, 
                  user_metadata: { username: user.username }
                }
              }
            },
            error: null
          });
        } else {
          resolve({
            data: { user: null, session: null },
            error: { message: '邮箱或密码错误' }
          });
        }
      });
    });
  }

  signUp({ email, password }) {
    return new Promise((resolve) => {
      delay().then(() => {
        // 检查邮箱是否已存在
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          resolve({
            data: { user: null, session: null },
            error: { message: '该邮箱已被注册' }
          });
        } else {
          // 模拟新用户注册
          const newUser = {
            id: 'new_user_' + Date.now(),
            email,
            user_metadata: { username: email.split('@')[0] } // 默认用户名
          };
          resolve({
            data: { 
              user: newUser,
              session: { user: newUser }
            },
            error: null
          });
        }
      });
    });
  }

  signOut() {
    this.currentUser = null;
    this.currentSession = null;
    return Promise.resolve({ error: null });
  }

  onAuthStateChange(callback) {
    // 立即调用一次
    setTimeout(() => {
      callback('SIGNED_IN', this.currentSession);
    }, 100);

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  }
}

class MockQueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.queryData = [];
    this.filters = [];
    this.orders = [];
    this.rangeLimit = null;
    this.rangeOffset = null;
    this.selectFields = '*';
    this.shouldCount = false;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orders.push({ column, ascending });
    return this;
  }

  range(from, to) {
    this.rangeOffset = from;
    this.rangeLimit = to - from + 1;
    return this;
  }

  single() {
    this.shouldSingle = true;
    return this;
  }

  count() {
    this.shouldCount = true;
    return this;
  }

  async executeQuery() {
    await delay();

    let data = [];
    let count = 0;

    // 获取数据
    if (this.tableName === 'posts') {
      data = [...mockPosts];
    } else if (this.tableName === 'comments') {
      data = [...mockComments];
    } else if (this.tableName === 'profiles') {
      data = [mockProfile];
    }

    // 应用过滤
    this.filters.forEach(filter => {
      if (filter.type === 'eq') {
        data = data.filter(item => item[filter.column] === filter.value);
      } else if (filter.type === 'in') {
        data = data.filter(item => filter.values.includes(item[filter.column]));
      }
    });

    // 应用排序
    this.orders.forEach(order => {
      data.sort((a, b) => {
        const aVal = a[order.column];
        const bVal = b[order.column];
        if (order.ascending) {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    });

    count = data.length;

    // 应用分页
    if (this.rangeOffset !== null && this.rangeLimit !== null) {
      data = data.slice(this.rangeOffset, this.rangeOffset + this.rangeLimit);
    }

    // 单条结果
    if (this.shouldSingle) {
      data = data[0] || null;
    }

    return { data, error: null, count };
  }

  async then(resolve) {
    const result = await this.executeQuery();
    resolve(result);
    return result;
  }
}

class MockRPC {
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }

  async then(resolve) {
    await delay();
    resolve({ data: null, error: null });
  }
}

// 扩展 MockQueryBuilder 的方法
['insert', 'update', 'delete'].forEach(method => {
  MockQueryBuilder.prototype[method] = function(data) {
    this.method = method;
    this.data = data;
    return this;
  };
});

const mockSupabase = new MockSupabaseClient();
export { mockSupabase as supabase };