-- 创建profiles表（用户信息表）
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT now()
);

-- 创建posts表（博客表）
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 创建comments表（评论表）
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 创建updated_at字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为posts表添加updated_at触发器
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 为comments表添加updated_at触发器
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 设置RLS（行级安全策略）

-- profiles表RLS策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 所有用户都可以查看所有profiles记录
CREATE POLICY "允许所有人查看profiles" ON profiles
  FOR SELECT
  USING (true);

-- 仅用户本人可以更新自己的profiles记录
CREATE POLICY "允许用户更新自己的profiles" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- posts表RLS策略
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 所有用户都可以查看已发布的博客
CREATE POLICY "允许所有人查看已发布的博客" ON posts
  FOR SELECT
  USING (status = 'published');

-- 仅作者可以查看自己的草稿
CREATE POLICY "允许作者查看自己的草稿" ON posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- 所有注册用户都可以创建博客
CREATE POLICY "允许注册用户创建博客" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 仅作者可以更新自己的博客
CREATE POLICY "允许作者更新自己的博客" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- 仅作者可以删除自己的博客
CREATE POLICY "允许作者删除自己的博客" ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- comments表RLS策略
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 所有用户都可以查看所有评论
CREATE POLICY "允许所有人查看评论" ON comments
  FOR SELECT
  USING (true);

-- 所有注册用户都可以创建评论
CREATE POLICY "允许注册用户创建评论" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 仅评论者可以更新自己的评论
CREATE POLICY "允许评论者更新自己的评论" ON comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 仅评论者可以删除自己的评论
CREATE POLICY "允许评论者删除自己的评论" ON comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- 创建一个函数，在用户注册时自动创建profile记录
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建一个触发器，在用户注册时自动触发
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();