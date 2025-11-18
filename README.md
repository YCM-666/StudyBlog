# 个人博客系统

基于 React + Supabase + Netlify 的现代化个人博客系统。

## 功能特性

### 👥 用户功能
- 用户注册/登录（邮箱密码）
- 浏览博客列表（支持分页）
- 查看博客详情（支持 Markdown 渲染）
- 发表、编辑、删除自己的评论
- 阅读量统计（24小时去重）

### 📝 博主功能
- 发布、编辑、删除博客文章
- 草稿功能
- 博客管理（支持状态筛选）
- 评论管理（查看、编辑、删除所有评论）
- 数据统计概览（访问量、评论数、趋势图表）

### 🎨 设计特点
- 响应式设计（支持桌面、平板、手机）
- 现代化 UI（基于 Tailwind CSS）
- 简洁清爽的界面风格
- 良好的用户体验和交互反馈

## 技术栈

### 前端
- **React 18+** - 现代化前端框架
- **React Router v6** - 路由管理
- **Tailwind CSS** - 样式框架
- **React Hook Form** - 表单处理
- **React Markdown** - Markdown 渲染
- **Recharts** - 数据图表
- **Supabase JS Client** - 数据库和认证

### 后端
- **Supabase** - 数据库 + 认证 + 权限控制

### 部署
- **Netlify** - 自动化部署和托管

## 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 本地开发

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd personal-blog
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   复制 `.env.example` 文件为 `.env`：
   ```bash
   cp .env.example .env
   ```
   
   编辑 `.env` 文件，填入您的 Supabase 配置：
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **启动开发服务器**
   ```bash
   npm start
   ```
   
   访问 http://localhost:3000

### Supabase 配置

#### 1. 创建 Supabase 项目
- 访问 [Supabase](https://supabase.com) 创建新项目
- 获取项目 URL 和 Anon Key

#### 2. 数据库表设计

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 用户信息表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'blogger')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 博客表
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. 行级安全策略 (RLS)

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- profiles 表策略
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- posts 表策略
CREATE POLICY "Published posts are viewable by everyone" ON posts FOR SELECT USING (status = 'published');
CREATE POLICY "Blogger can view all posts" ON posts FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'blogger')
);
CREATE POLICY "Blogger can manage all posts" ON posts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'blogger')
);

-- comments 表策略
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Blogger can manage all comments" ON comments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'blogger')
);
```

#### 4. 设置自动触发器

```sql
-- 创建更新时间函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 添加触发器
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 5. 创建博主账号

在 Supabase Auth 中手动创建博主账号，然后在 `profiles` 表中设置其 `role` 为 `'blogger'`。

## 部署到 Netlify

### 1. 准备工作
- 将代码推送到 GitHub 仓库
- 在 Netlify 中注册并连接 GitHub

### 2. 构建设置
在 Netlify 控制台设置：
- **Build command**: `npm run build`
- **Publish directory**: `build`

### 3. 环境变量
在 Netlify 的 Site settings > Environment variables 中添加：
- `REACT_APP_SUPABASE_URL`: 您的 Supabase 项目 URL
- `REACT_APP_SUPABASE_ANON_KEY`: 您的 Supabase Anon Key

### 4. 自动部署
Netlify 会在每次推送代码到 main 分支时自动构建和部署。

## 项目结构

```
src/
├── components/           # 公共组件
│   ├── Navbar.js       # 导航栏
│   ├── Footer.js       # 页脚
│   ├── ProtectedRoute.js # 权限路由
│   └── AdminLayout.js  # 后台布局
├── contexts/           # React Context
│   └── AuthContext.js  # 认证上下文
├── pages/              # 页面组件
│   ├── Home.js         # 首页
│   ├── BlogDetail.js  # 博客详情
│   ├── Login.js       # 登录页
│   ├── Register.js    # 注册页
│   └── admin/         # 后台页面
│       ├── Dashboard.js  # 数据概览
│       ├── Posts.js      # 博客管理
│       ├── Comments.js   # 评论管理
│       └── PostEditor.js # 博客编辑
├── routes/             # 路由配置
│   └── index.js
├── App.js             # 应用入口
├── index.js           # 渲染入口
└── supabase.js        # Supabase 配置
```

## 浏览器支持

- Chrome (最新 3 个版本)
- Firefox (最新 3 个版本)
- Safari (最新 3 个版本)
- Edge (最新版本)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License