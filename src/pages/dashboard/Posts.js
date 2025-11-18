import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingPost, setDeletingPost] = useState(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPosts(data || []);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user.id, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('确定要删除这篇博客吗？此操作无法撤销。')) {
      return;
    }

    try {
      setDeletingPost(postId);
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));

    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingPost(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      {/* 页面标题和操作栏 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的博客</h1>
            <p className="text-gray-600 mt-2">管理你发布的所有博客</p>
          </div>
          <Link
            to="/posts/new"
            className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
          >
            <span className="mr-2">➕</span>
            发布新博客
          </Link>
        </div>
      </div>

      {/* 状态筛选器 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">状态筛选:</span>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: '全部', color: 'gray' },
              { value: 'published', label: '已发布', color: 'green' },
              { value: 'draft', label: '草稿', color: 'yellow' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? `bg-${filter.color}-100 text-${filter.color}-800 border-${filter.color}-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 博客列表 */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-lg mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'all' ? '还没有博客' : 
             statusFilter === 'published' ? '还没有已发布的博客' : '还没有草稿'}
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' ? '开始创作你的第一篇博客吧！' :
             statusFilter === 'published' ? '发布你的博客让更多人看到吧！' : '保存草稿以便稍后编辑'}
          </p>
          {statusFilter !== 'published' && (
            <Link
              to="/posts/new"
              className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md font-medium transition-colors inline-block"
            >
              发布新博客
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发布时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    阅读量
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {post.title}
                        </div>
                        {post.summary && (
                          <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                            {post.summary}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.view_count || 0}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/blog/${post.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                          title="查看博客"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/dashboard/posts/${post.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="编辑"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPost === post.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="删除"
                        >
                          {deletingPost === post.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;