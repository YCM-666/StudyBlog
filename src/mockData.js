// 模拟数据文件 - 用于前端演示
export const mockPosts = [
  {
    id: '1',
    title: 'React 18 新特性详解',
    summary: 'React 18 带来了许多激动人心的新特性，包括并发渲染、Suspense改进等。本文将详细介绍这些特性...',
    content: `# React 18 新特性详解

React 18 是一个重要的版本更新，带来了许多新特性和改进。

## 主要新特性

### 1. 并发渲染
并发渲染是 React 18 最重要的新特性之一...

### 2. Suspense 改进
Suspense 在 React 18 中得到了显著改进...

### 3. 新的 Hooks
- \`useId\`: 生成唯一 ID
- \`useTransition\`: 处理非紧急状态更新
- \`useDeferredValue\`: 延迟非关键更新

## 代码示例

\`\`\`javascript
function App() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  const handleClick = () => {
    startTransition(() => {
      setCount(count + 1);
    });
  };

  return (
    <button onClick={handleClick}>
      {isPending ? 'Loading...' : count}
    </button>
  );
}
\`\`\`

## 总结

React 18 的新特性为开发者提供了更好的性能和开发体验...`,
    status: 'published',
    view_count: 156,
    like_count: 12,
    author_id: '1',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    profiles: {
      username: '张三'
    }
  },
  {
    id: '2',
    title: 'Vue 3 Composition API 深入解析',
    summary: 'Vue 3 的 Composition API 是一个革命性的改变，它提供了更灵活的组件逻辑组织方式...',
    content: `# Vue 3 Composition API 深入解析

Vue 3 引入的 Composition API 为开发者提供了更好的逻辑复用和代码组织方式。

## setup() 函数

Composition API 的核心是 setup() 函数：

\`\`\`javascript
import { ref, reactive, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const state = reactive({ name: 'Vue 3' })
    
    const doubled = computed(() => count.value * 2)
    
    return {
      count,
      state,
      doubled
    }
  }
}
\`\`\`

## 优势

Composition API 提供了以下优势：
- 更好的 TypeScript 支持
- 逻辑复用更简单
- 代码组织更灵活`,
    status: 'published',
    view_count: 89,
    like_count: 8,
    author_id: '2',
    created_at: '2024-01-12T14:20:00Z',
    updated_at: '2024-01-12T14:20:00Z',
    profiles: {
      username: '李四'
    }
  },
  {
    id: '3',
    title: 'TypeScript 最佳实践',
    summary: 'TypeScript 为 JavaScript 添加了类型系统，让大型项目更易维护。本文分享一些最佳实践...',
    content: `# TypeScript 最佳实践

TypeScript 已经成为现代前端开发的标准配置，这里分享一些最佳实践。

## 类型定义

使用 interface 定义对象类型：

\`\`\`typescript
interface User {
  id: string
  name: string
  email?: string  // 可选属性
  readonly createdAt: Date  // 只读属性
}
\`\`\`

## 泛型

泛型让代码更灵活且类型安全：

\`\`\`typescript
function createArray<T>(items: T[]): T[] {
  return new Array().concat(items)
}

const numbers = createArray([1, 2, 3])
const strings = createArray(['a', 'b', 'c'])
\`\`\`

## 实用工具类型

TypeScript 提供了许多实用工具类型：
- Partial\<T\> - 所有属性变为可选
- Required\<T\> - 所有属性变为必需
- Pick\<T, K\> - 选择特定属性`,
    status: 'published',
    view_count: 234,
    like_count: 18,
    author_id: '3',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z',
    profiles: {
      username: '王五'
    }
  },
  {
    id: '4',
    title: '前端性能优化技巧',
    summary: '现代 Web 应用性能优化是每个前端开发者都需要掌握的技能...',
    content: `# 前端性能优化技巧

性能优化是提升用户体验的关键，本文介绍一些实用的优化技巧。

## 图片优化

- 使用适当的图片格式（WebP、AVIF）
- 实现懒加载
- 使用响应式图片

## JavaScript 优化

- 使用 requestAnimationFrame
- 避免强制同步布局
- 使用虚拟滚动

## CSS 优化

- 使用 transform 代替 left/top
- 合理使用 will-change
- CSS containment`,
    status: 'draft',
    view_count: 0,
    like_count: 0,
    author_id: 'user1',
    created_at: '2024-01-20T15:30:00Z',
    updated_at: '2024-01-20T15:30:00Z',
    profiles: {
      username: '赵六'
    }
  }
];

export const mockComments = [
  {
    id: '1',
    post_id: '1',
    user_id: 'user1',
    content: '非常详细的介绍！关于并发渲染的部分特别有帮助。我也在项目中试用了 React 18，性能确实有提升。',
    created_at: '2024-01-16T08:30:00Z',
    updated_at: '2024-01-16T08:30:00Z',
    profiles: {
      username: '前端小白'
    }
  },
  {
    id: '2',
    post_id: '1',
    user_id: 'user2',
    content: '期待看到更多关于 useTransition 的实际应用案例。最近在做复杂的状态管理，这个功能很有用。',
    created_at: '2024-01-16T10:15:00Z',
    updated_at: '2024-01-16T10:15:00Z',
    profiles: {
      username: '技术爱好者'
    }
  },
  {
    id: '3',
    post_id: '2',
    user_id: 'user3',
    content: 'Vue 3 的 Composition API 确实比 Options API 更灵活！代码复用变得简单多了。',
    created_at: '2024-01-13T14:20:00Z',
    updated_at: '2024-01-13T14:20:00Z',
    profiles: {
      username: 'Vue开发者'
    }
  },
  {
    id: '4',
    post_id: '3',
    user_id: 'user1',
    content: 'TypeScript 的类型系统确实让大型项目维护变得更容易。强烈推荐！',
    created_at: '2024-01-11T09:45:00Z',
    updated_at: '2024-01-11T09:45:00Z',
    profiles: {
      username: '前端小白'
    }
  }
];

// 模拟不同用户的登录信息
export const mockUsers = [
  {
    email: 'zhangsan@example.com',
    password: 'password',
    username: '张三',
    id: '1'
  },
  {
    email: 'lisi@example.com', 
    password: 'password',
    username: '李四',
    id: '2'
  },
  {
    email: 'wangwu@example.com',
    password: 'password', 
    username: '王五',
    id: '3'
  },
  {
    email: 'zhaoliu@example.com',
    password: 'password',
    username: '赵六', 
    id: 'user1'
  }
];

// 默认当前用户信息
export const mockUser = {
  id: '1',
  email: 'zhangsan@example.com',
  user_metadata: {
    username: '张三'
  }
};

export const mockProfile = {
  id: '1',
  username: '张三',
  role: 'user'
};