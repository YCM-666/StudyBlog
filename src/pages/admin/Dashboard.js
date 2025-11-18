import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        postsResult,
        commentsResult,
        viewsResult
      ] = await Promise.all([
        supabase
          .from('posts')
          .select('status, view_count, like_count, created_at'),
        supabase
          .from('comments')
          .select('created_at'),
        supabase
          .from('posts')
          .select('view_count, created_at')
          .eq('status', 'published')
          .order('created_at', { ascending: true })
      ]);

      if (postsResult.error) throw postsResult.error;
      if (commentsResult.error) throw commentsResult.error;
      if (viewsResult.error) throw viewsResult.error;

      const posts = postsResult.data || [];
      const comments = commentsResult.data || [];
      const views = viewsResult.data || [];

      const publishedPosts = posts.filter(post => post.status === 'published');
      const draftPosts = posts.filter(post => post.status === 'draft');

      const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
      const totalLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);

      setStats({
        totalPosts: posts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: draftPosts.length,
        totalComments: comments.length,
        totalViews,
        totalLikes,
      });

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const trendData = last7Days.map(date => {
        const dayViews = views
          .filter(post => post.created_at && post.created_at.startsWith(date))
          .reduce((sum, post) => sum + (post.view_count || 0), 0);
        
        return {
          date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          views: dayViews,
        };
      });

      setViewTrend(trendData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`text-3xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据概览</h1>
          <p className="text-gray-600 mt-2">查看您的博客网站核心数据统计</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="skeleton skeleton-line w-1/2 mb-2"></div>
                <div className="skeleton skeleton-line w-1/4"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="skeleton skeleton-line w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">数据概览</h1>
          <p className="text-gray-600 mt-2">查看您的博客网站核心数据统计</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">数据概览</h1>
        <p className="text-gray-600 mt-2">查看您的博客网站核心数据统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="博客总数"
          value={stats.totalPosts}
          icon="📝"
          color="text-blue-500"
        />
        <StatCard
          title="已发布"
          value={stats.publishedPosts}
          icon="✅"
          color="text-green-500"
        />
        <StatCard
          title="草稿"
          value={stats.draftPosts}
          icon="📄"
          color="text-yellow-500"
        />
        <StatCard
          title="评论总数"
          value={stats.totalComments}
          icon="💬"
          color="text-purple-500"
        />
        <StatCard
          title="总阅读量"
          value={stats.totalViews}
          icon="👁️"
          color="text-indigo-500"
        />
        <StatCard
          title="总点赞数"
          value={stats.totalLikes}
          icon="❤️"
          color="text-red-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">近7天阅读量趋势</h2>
        
        {viewTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewTrend}>
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
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            暂无数据
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">博客状态分布</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">已发布博客</span>
              <span className="font-semibold text-green-600">
                {stats.publishedPosts} 篇
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${stats.totalPosts > 0 ? (stats.publishedPosts / stats.totalPosts) * 100 : 0}%`
                }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">草稿博客</span>
              <span className="font-semibold text-yellow-600">
                {stats.draftPosts} 篇
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full"
                style={{
                  width: `${stats.totalPosts > 0 ? (stats.draftPosts / stats.totalPosts) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">平均数据</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">平均阅读量</span>
              <span className="font-semibold text-indigo-600">
                {stats.publishedPosts > 0 
                  ? Math.round(stats.totalViews / stats.publishedPosts).toLocaleString()
                  : 0
                } 次
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">平均评论数</span>
              <span className="font-semibold text-purple-600">
                {stats.publishedPosts > 0 
                  ? (stats.totalComments / stats.publishedPosts).toFixed(1)
                  : 0
                } 条
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">平均点赞数</span>
              <span className="font-semibold text-red-600">
                {stats.publishedPosts > 0 
                  ? (stats.totalLikes / stats.publishedPosts).toFixed(1)
                  : 0
                } 个
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;