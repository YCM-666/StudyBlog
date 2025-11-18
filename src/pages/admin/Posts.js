import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';

const Posts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingPost, setDeletingPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('加载博客列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('确定要删除这篇博客吗？删除后无法恢复。')) {
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
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('删除博客失败，请稍后重试');
    } finally {
      setDeletingPost(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusBadge = (status) => {
    return status === 'published' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        已发布
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        草稿
      </span>
    );
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">博客管理</h1>
          <button className="btn btn-primary">发布新博客</button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <select className="input">
              <option>全部</option>
              <option>已发布</option>
              <option>草稿</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">发布时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">阅读量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-48"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-16"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-32"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-12"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-24"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">博客管理</h1>
          <p className="text-gray-600 mt-2">管理您的所有博客文章</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="btn btn-primary"
        >
          发布新博客
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                状态筛选
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">全部 ({posts.length})</option>
                <option value="published">
                  已发布 ({posts.filter(p => p.status === 'published').length})
                </option>
                <option value="draft">
                  草稿 ({posts.filter(p => p.status === 'draft').length})
                </option>
              </select>
            </div>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'all' ? '暂无博客文章' : `暂无${statusFilter === 'published' ? '已发布' : '草稿'}文章`}
            </h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all' 
                ? '开始撰写您的第一篇博客吧！' 
                : '尝试切换筛选条件查看其他文章'
              }
            </p>
            {statusFilter === 'all' && (
              <Link to="/admin/posts/new" className="btn btn-primary">
                发布新博客
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    标题
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    发布时间
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    阅读量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {post.title || '无标题'}
                        </div>
                        {post.summary && (
                          <div className="text-sm text-gray-500">
                            {truncateText(post.summary)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.view_count || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        编辑
                      </Link>
                      {post.status === 'published' && (
                        <Link
                          to={`/blog/${post.id}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-900 ml-2"
                        >
                          查看
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        disabled={deletingPost === post.id}
                        className="text-red-600 hover:text-red-900 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingPost === post.id ? '删除中...' : '删除'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;