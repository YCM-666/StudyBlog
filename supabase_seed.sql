-- 向auth.users表插入示例用户数据
-- 注意：这需要Supabase超级管理员权限
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, role) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'user1@example.com', NOW(), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "User 1", "email": "user1@example.com"}'::jsonb, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'user2@example.com', NOW(), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "User 2", "email": "user2@example.com"}'::jsonb, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'user3@example.com', NOW(), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}'::jsonb, '{"full_name": "User 3", "email": "user3@example.com"}'::jsonb, 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 向profiles表插入示例用户数据
INSERT INTO public.profiles (id, username, avatar_url, bio, created_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'user1', 'https://via.placeholder.com/150', '这是用户1的简介', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'user2', 'https://via.placeholder.com/150', '这是用户2的简介', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'user3', 'https://via.placeholder.com/150', '这是用户3的简介', NOW())
ON CONFLICT (id) DO NOTHING;

-- 向posts表插入示例博客数据
INSERT INTO public.posts (id, title, summary, content, status, view_count, like_count, author_id, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, '如何使用React和Supabase构建博客', '这是一篇关于如何使用React和Supabase构建博客的教程', $$# 如何使用React和Supabase构建博客

在这篇教程中，我将向您展示如何使用React和Supabase构建一个完整的博客应用。

## 什么是React？

React是一个用于构建用户界面的JavaScript库。

## 什么是Supabase？

Supabase是一个开源的Firebase替代品，提供数据库、身份验证、存储等功能。

## 开始构建

首先，我们需要创建一个React应用，然后配置Supabase连接。$$, 'published', 100, 10, '550e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  ('550e8400-e29b-41d4-a716-446655440011'::uuid, 'React Hooks入门指南', '这是一篇关于React Hooks的入门指南', $$# React Hooks入门指南

React Hooks是React 16.8中引入的新特性，允许您在函数组件中使用state和其他React特性。

## useState Hook

useState Hook允许您在函数组件中添加状态。

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## useEffect Hook

useEffect Hook允许您在函数组件中执行副作用操作。$$, 'published', 150, 15, '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('550e8400-e29b-41d4-a716-446655440012'::uuid, 'Tailwind CSS最佳实践', '这是一篇关于Tailwind CSS最佳实践的文章', $$# Tailwind CSS最佳实践

Tailwind CSS是一个实用优先的CSS框架，允许您快速构建现代网站。

## 使用@apply指令

@apply指令允许您将多个Tailwind类组合成一个自定义类。

```css
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```

## 响应式设计

Tailwind CSS提供了响应式前缀，允许您根据屏幕尺寸应用不同的样式。$$, 'published', 200, 20, '550e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440013'::uuid, 'React Router v6教程', '这是一篇关于React Router v6的教程', $$# React Router v6教程

React Router是React应用中最常用的路由库。版本6带来了许多新特性和改进。

## 安装

```bash
npm install react-router-dom@6
```

## 使用Routes和Route组件

在React Router v6中，您需要使用Routes和Route组件来定义路由。$$, 'draft', 0, 0, '550e8400-e29b-41d4-a716-446655440000'::uuid, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- 向comments表插入示例评论数据
INSERT INTO public.comments (id, post_id, user_id, content, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440020'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '这是一篇很棒的文章！', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('550e8400-e29b-41d4-a716-446655440021'::uuid, '550e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '感谢分享，学到了很多！', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('550e8400-e29b-41d4-a716-446655440022'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Hooks真的很方便！', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440023'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Tailwind CSS确实提高了开发效率！', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- 向auth.users表插入示例用户数据（可选）
-- 注意：如果您已经在Supabase控制台中注册了用户，可以跳过这一步
-- 以下语句仅用于开发环境，生产环境不建议直接操作auth.users表
/*
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, role) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'user1@example.com', NOW(), NOW(), NOW(), NOW(), $$'{"provider": "email", "providers": ["email"]}'$$, $$'{"full_name": "User 1", "email": "user1@example.com"}'$$, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'user2@example.com', NOW(), NOW(), NOW(), NOW(), $$'{"provider": "email", "providers": ["email"]}'$$, $$'{"full_name": "User 2", "email": "user2@example.com"}'$$, 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'user3@example.com', NOW(), NOW(), NOW(), NOW(), $$'{"provider": "email", "providers": ["email"]}'$$, $$'{"full_name": "User 3", "email": "user3@example.com"}'$$, 'authenticated')
ON CONFLICT (id) DO NOTHING;
*/

-- 注意：auth.users表的数据插入需要Supabase超级管理员权限
-- 如果您没有这些权限，建议通过Supabase控制台的"Authentication"部分手动创建测试用户

-- 查看插入的数据
SELECT 'Users' AS type, COUNT(*) AS count FROM public.profiles;
SELECT 'Posts' AS type, COUNT(*) AS count FROM public.posts;
SELECT 'Comments' AS type, COUNT(*) AS count FROM public.comments;