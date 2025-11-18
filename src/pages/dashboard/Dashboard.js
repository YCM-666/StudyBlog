import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalComments: 0,
    totalViews: 0,
    totalLikes: 0,
  });
  const [viewTrend, setViewTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 获取用户的博客统计
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id);

      if (postsError) throw postsError;

      const published = posts.filter(post => post.status === 'published');
      const drafts = posts.filter(post => post.status === 'draft');

      // 获取用户的评论统计
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', user.id);

      if (commentsError) throw commentsError;

      // 计算总浏览量和点赞数
      const totalViews = published.reduce((sum, post) => sum + (post.view_count || 0), 0);
      const totalLikes = published.reduce((sum, post) => sum + (post.like_count || 0), 0);

      // 生成近7天趋势数据（模拟数据）
      const trendData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trendData.push({
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          views: Math.floor(Math.random() * 100) + 20, // 模拟数据
        });
      }

      setStats({
        totalPosts: posts.length,
        publishedPosts: published.length,
        draftPosts: drafts.length,
        totalComments: comments.length,
        totalViews,
        totalLikes,
      });
      setViewTrend(trendData);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">加载失败: {error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-10">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">个人数据概览</h1>
            <p className="text-gray-600 mt-1">查看你的博客创作数据和互动统计</p>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-3 shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">博客总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalPosts}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                  <span className="text-green-600">已发布 {stats.publishedPosts}</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></div>
                  <span className="text-gray-500">草稿 {stats.draftPosts}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">评论总数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalComments}</p>
              <p className="text-xs text-gray-500 mt-2">你在博客下的评论</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-lg">
              <span className="text-2xl">👀</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总浏览量</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2">所有博客的浏览总和</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-3 shadow-lg">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总点赞数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLikes}</p>
              <p className="text-xs text-gray-500 mt-2">所有博客的点赞总和</p>
            </div>
          </div>
        </div>
      </div>

      {/* 近7天浏览趋势 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">近7天浏览趋势</h2>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            数据分析
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={viewTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="url(#colorGradient)" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/dashboard/posts"
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl hover:from-primary-100 hover:to-primary-200 transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl">📝</span>
            </div>
            <span className="font-semibold text-primary-700">管理博客</span>
            <span className="text-sm text-primary-600 mt-1">查看和管理你的文章</span>
          </Link>
          
          <Link
            to="/dashboard/comments"
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl">💬</span>
            </div>
            <span className="font-semibold text-blue-700">管理评论</span>
            <span className="text-sm text-blue-600 mt-1">查看和回复评论</span>
          </Link>
          
          <Link
            to="/posts/new"
            className="group flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-2xl">✍️</span>
            </div>
            <span className="font-semibold text-green-700">发布新博客</span>
            <span className="text-sm text-green-600 mt-1">创建新文章</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;