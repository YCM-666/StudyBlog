# Supabase后端设置说明

## 1. 导入SQL脚本

请在Supabase控制台中执行以下步骤，导入提供的SQL脚本：

1. 登录到Supabase控制台（https://app.supabase.com/）
2. 选择你的项目（fnolufchqnyjxymamqbn）
3. 在左侧导航栏中，点击「SQL Editor」
4. 点击「New Query」按钮
5. 复制并粘贴`supabase_schema.sql`文件中的所有内容到编辑器中
6. 点击「Run」按钮执行脚本

## 2. 验证执行结果

执行完SQL脚本后，你可以通过以下方式验证是否成功：

1. 在左侧导航栏中，点击「Database」>「Tables」
2. 确认以下表已创建：
   - `profiles` (用户信息表)
   - `posts` (博客表)
   - `comments` (评论表)

3. 验证RLS策略是否正确设置：
   - 点击每个表右侧的「•••」按钮
   - 选择「Edit permissions」
   - 确认RLS策略是否与SQL脚本中的设置一致

## 3. 导入示例数据（可选）

如果您希望数据库中包含一些示例数据以便测试，可以导入`supabase_seed.sql`文件。这个文件包含了一些示例用户、博客文章和评论数据。

### 3.1 外键约束说明

在导入示例数据时，您可能会遇到以下错误：

```
ERROR: 23503: insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"
DETAIL: Key (id)=(550e8400-e29b-41d4-a716-446655440000) is not present in table "users".
```

这是因为`profiles`表的`id`字段是一个外键，引用了`auth.users`表的`id`字段。在向`profiles`表插入数据之前，必须先在`auth.users`表中存在对应的用户记录。

### 3.2 解决方案

我们提供两种解决方案：

#### 方案一：使用超级管理员权限导入（推荐）

如果您有Supabase超级管理员权限，可以直接使用`supabase_seed.sql`文件，该文件已包含向`auth.users`表插入数据的语句。

#### 方案二：通过Supabase控制台手动创建用户

如果您没有超级管理员权限，可以按照以下步骤操作：

1. 在Supabase控制台中，点击左侧菜单的"Authentication"选项。
2. 点击"Add user"按钮创建3个测试用户：
   - user1@example.com
   - user2@example.com
   - user3@example.com
3. 记录下这3个用户的UUID（可以在用户详情页查看）。
4. 修改`supabase_seed.sql`文件，将`profiles`、`posts`和`comments`表中的用户ID替换为您刚创建的用户UUID。
5. 然后按照下面的步骤导入修改后的`supabase_seed.sql`文件。

### 3.3 导入示例数据的步骤

1. 在Supabase控制台中，点击「SQL Editor」
2. 点击「New Query」按钮
3. 复制并粘贴`supabase_seed.sql`文件中的所有内容到编辑器中
4. 点击「Run」按钮执行脚本

### 3.4 示例数据说明

导入的示例数据包括：

- **3个用户**：user1、user2、user3
- **4篇博客**：包括已发布和草稿状态的博客
- **4条评论**：与博客文章关联的评论

这些数据可以帮助您快速测试应用的各项功能，如浏览博客、查看详情、发表评论等。

## 4. 功能说明

### 4.1 数据表结构

#### profiles表（用户信息表）
- `id`: 用户ID，关联Supabase Auth的`auth.users.id`
- `username`: 用户名（显示用）
- `avatar_url`: 头像URL（可选）
- `bio`: 个人简介（可选）
- `created_at`: 创建时间（自动生成）

#### posts表（博客表）
- `id`: 博客ID（主键）
- `title`: 博客标题（必填）
- `summary`: 博客摘要（可选）
- `content`: 博客正文（Markdown格式，必填）
- `status`: 状态（`published`/`draft`，默认`draft`）
- `view_count`: 阅读量（默认0）
- `like_count`: 点赞数（默认0）
- `author_id`: 作者ID（关联profiles表）
- `created_at`: 创建时间（自动生成）
- `updated_at`: 更新时间（自动更新）

#### comments表（评论表）
- `id`: 评论ID（主键）
- `post_id`: 博客ID（关联posts表）
- `user_id`: 用户ID（关联profiles表）
- `content`: 评论内容（必填）
- `created_at`: 创建时间（自动生成）
- `updated_at`: 更新时间（自动更新）

### 4.2 RLS策略

#### profiles表
- **查看**: 所有用户都可以查看所有profiles记录
- **更新**: 仅用户本人可以更新自己的profiles记录

#### posts表
- **查看**: 
  - 所有用户都可以查看已发布的博客
  - 仅作者可以查看自己的草稿
- **创建**: 所有注册用户都可以创建博客
- **更新**: 仅作者可以更新自己的博客
- **删除**: 仅作者可以删除自己的博客

#### comments表
- **查看**: 所有用户都可以查看所有评论
- **创建**: 所有注册用户都可以创建评论
- **更新**: 仅评论者可以更新自己的评论
- **删除**: 仅评论者可以删除自己的评论

### 4.3 额外功能

#### 4.3.1 自动更新时间戳

为`posts`和`comments`表的`updated_at`字段设置了自动更新触发器，每次更新记录时会自动更新该字段。

#### 4.3.2 新用户自动创建profile记录

当用户通过Supabase Auth注册时，会自动在`profiles`表中创建对应的记录，使用邮箱作为默认用户名。

## 5. 前端连接配置

前端已经通过`src/supabase.js`文件配置了与Supabase的连接，使用环境变量获取Supabase URL和anon key。你可以在`.env`文件中查看和修改这些配置。

```javascript
// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://fnolufchqnyjxymamqbn.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZub2x1ZmNocW55anh5bWFtcWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NDgzOTcsImV4cCI6MjA3OTAyNDM5N30.GfmmQaWQko5cefRwLlE9-vtXi50gzjYBrrDkwJpPnS0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 6. 测试功能

完成Supabase配置后，你可以在本地运行前端应用，测试以下功能：

1. 用户注册和登录
2. 创建、编辑和删除博客
3. 查看博客列表和详情
4. 发表、编辑和删除评论
5. 查看个人博客管理
6. 查看个人评论管理

## 7. 注意事项

1. 确保在Supabase控制台中启用了Email/Password登录方式
2. 确保环境变量中的Supabase URL和anon key与你的项目配置一致
3. 如果遇到权限问题，请检查RLS策略是否正确设置
4. 如果需要修改表结构或RLS策略，请在Supabase控制台中进行操作