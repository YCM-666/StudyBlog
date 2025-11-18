import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../../supabase';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postFilter, setPostFilter] = useState('all');
  const [editingComment, setEditingComment] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchComments();
    fetchPosts();
  }, [postFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('comments')
        .select('*, profiles(username), posts(title, id)')
        .order('created_at', { ascending: false });

      if (postFilter !== 'all') {
        query = query.eq('post_id', postFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('加载评论列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    reset({ content: comment.content });
  };

  const handleUpdateComment = async (data) => {
    try {
      setEditingComment(null);

      const { error } = await supabase
        .from('comments')
        .update({ content: data.content })
        .eq('id', editingComment.id);

      if (error) throw error;

      setComments(comments.map(comment => 
        comment.id === editingComment.id 
          ? { ...comment, content: data.content }
          : comment
      ));

      reset();
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('更新评论失败，请稍后重试');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？删除后无法恢复。')) {
      return;
    }

    try {
      setDeletingComment(commentId);

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('删除评论失败，请稍后重试');
    } finally {
      setDeletingComment(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    reset();
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

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">评论管理</h1>
          <p className="text-gray-600 mt-2">管理所有博客的评论</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="animate-pulse">
            <div className="skeleton skeleton-line w-48"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评论者</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">内容</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">博客</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-24"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-48"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-32"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-28"></div></td>
                    <td className="px-6 py-4"><div className="skeleton skeleton-line w-32"></div></td>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">评论管理</h1>
        <p className="text-gray-600 mt-2">管理所有博客的评论</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <label htmlFor="post-filter" className="block text-sm font-medium text-gray-700">
            博客筛选
          </label>
          <select
            id="post-filter"
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            className="input"
          >
            <option value="all">全部博客 ({comments.length})</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title} ({comments.filter(c => c.post_id === post.id).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {editingComment && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">编辑评论</h2>
          <form onSubmit={handleSubmit(handleUpdateComment)}>
            <div className="mb-4">
              <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-2">
                评论内容
              </label>
              <textarea
                {...register('content', {
                  required: '请输入评论内容',
                  maxLength: {
                    value: 500,
                    message: '评论内容不能超过500字',
                  },
                })}
                rows="4"
                className="input"
                placeholder="请输入评论内容"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
            <div className="flex space-x-4">
              <button type="submit" className="btn btn-primary">
                更新评论
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {comments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {postFilter === 'all' ? '暂无评论' : '该博客暂无评论'}
            </h3>
            <p className="text-gray-600">
              {postFilter === 'all' 
                ? '还没有用户发表评论，等待用户互动吧！'
                : '这个博客还没有收到评论'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    评论者
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    内容
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    博客
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary-600 text-xs font-medium">
                            {comment.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {comment.profiles?.username || '匿名用户'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {truncateText(comment.content, 150)}
                          </ReactMarkdown>
                        </div>
                        {comment.content.length > 150 && (
                          <span className="text-xs text-gray-500">...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/blog/${comment.posts.id}`}
                        className="text-sm text-primary-600 hover:text-primary-900"
                      >
                        {comment.posts?.title || '未知博客'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(comment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditComment(comment)}
                        disabled={deletingComment === comment.id}
                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingComment === comment.id ? '删除中...' : '删除'}
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

export default Comments;