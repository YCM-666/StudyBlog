import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useAuth } from '../../contexts/AuthContext';

const Comments = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('comments')
        .select(`
          *,
          posts (
            id,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setComments(data || []);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId) => {
    if (editContent.trim().length === 0 || editContent.length > 500) {
      alert('评论内容必须在1-500字之间');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, content: editContent.trim(), updated_at: new Date().toISOString() }
          : comment
      ));
      
      setEditingComment(null);
      setEditContent('');

    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？此操作无法撤销。')) {
      return;
    }

    try {
      setDeletingComment(commentId);
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));

    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingComment(null);
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
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">我的评论</h1>
        <p className="text-gray-600 mt-2">管理你在博客下发表的所有评论</p>
      </div>

      {comments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-lg mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有评论</h3>
          <p className="text-gray-600 mb-4">去博客下发表你的第一条评论吧！</p>
          <Link
            to="/"
            className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md font-medium transition-colors inline-block"
          >
            浏览博客
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link
                        to={`/blog/${comment.post_id}`}
                        className="text-primary-600 hover:text-primary-800 font-medium"
                      >
                        {comment.posts?.title || '未知博客'}
                      </Link>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.updated_at !== comment.created_at && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          已编辑
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                      maxLength={500}
                      placeholder="编辑评论内容..."
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {editContent.length}/500 字符
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-900 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditComment(comment)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                        className="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {deletingComment === comment.id ? '删除中...' : '删除'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;