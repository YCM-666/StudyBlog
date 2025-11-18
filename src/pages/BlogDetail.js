import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

const BlogDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const incrementViewCount = useCallback(async (postId) => {
    try {
      const viewKey = `viewed_post_${postId}`;
      const lastViewed = localStorage.getItem(viewKey);
      const now = Date.now();
      
      if (!lastViewed || now - parseInt(lastViewed) > 24 * 60 * 60 * 1000) {
        await supabase
          .from('posts')
          .update({ view_count: (post?.view_count || 0) + 1 })
          .eq('id', postId);
        
        localStorage.setItem(viewKey, now.toString());
      }
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  }, [post?.view_count]);

  const fetchPost = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      setPost(data);
      
      await incrementViewCount(id);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('博客不存在或已被删除');
      setLoading(false);
    }
  }, [id, incrementViewCount]);

  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*, profiles(username)')
        .eq('post_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentsLoading(false);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const onCommentSubmit = async (data) => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      setSubmittingComment(true);

      if (editingComment) {
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
        setEditingComment(null);
      } else {
        const { data: newComment, error } = await supabase
          .from('comments')
          .insert([
            {
              post_id: id,
              user_id: user.id,
              content: data.content,
            }
          ])
          .select('*, profiles(username)')
          .single();

        if (error) throw error;

        setComments([...comments, newComment]);
      }

      reset();
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('评论提交失败，请稍后重试');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    reset({ content: comment.content });
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('删除评论失败，请稍后重试');
    }
  };

  const canEditComment = (comment) => {
    return user && (comment.user_id === user.id || profile?.role === 'blogger');
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="skeleton skeleton-title mb-4"></div>
          <div className="skeleton skeleton-line mb-8"></div>
          <div className="space-y-4">
            <div className="skeleton skeleton-line"></div>
            <div className="skeleton skeleton-line"></div>
            <div className="skeleton skeleton-line w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">😕</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {error || '博客不存在'}
          </h2>
          <Link
            to="/"
            className="text-primary-600 hover:text-primary-500"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* 文章头部 */}
        <header className="bg-gradient-to-br from-primary-50 to-white px-8 py-12 border-b border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              博客文章
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* 作者信息 */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">
                    {post.profiles?.username?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">
                    {post.profiles?.username || '博主'}
                  </p>
                  <p className="text-sm text-gray-500">
                    发布于 {formatDate(post.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <span className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                  <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-medium">{post.view_count || 0} 次阅读</span>
                </span>
                {post.like_count > 0 && (
                  <span className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors">
                    <svg className="w-5 h-5 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="font-medium">{post.like_count} 个赞</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 文章内容 */}
        <div className="px-8 py-8">
          <div className="prose prose-lg prose-primary max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      <section className="mt-12">
        {/* 评论区标题 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                评论区 
                <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {comments.length}
                </span>
              </h2>
              <div className="flex items-center text-gray-500">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                参与讨论
              </div>
            </div>

            {/* 评论输入框 */}
            {user ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingComment ? '编辑评论' : '发表评论'}
                    </h3>
                    <form onSubmit={handleSubmit(onCommentSubmit)} className="space-y-4">
                      <div>
                        <textarea
                          {...register('content', {
                            required: '请输入评论内容',
                            minLength: {
                              value: 1,
                              message: '评论内容不能为空',
                            },
                            maxLength: {
                              value: 500,
                              message: '评论内容不能超过500字',
                            },
                          })}
                          rows="4"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                          placeholder="分享你的想法..."
                        />
                        {errors.content && (
                          <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
                        )}
                      </div>
                      <div className="flex space-x-4">
                        <button
                          type="submit"
                          disabled={submittingComment}
                          className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          {submittingComment ? '提交中...' : editingComment ? '更新评论' : '发表评论'}
                        </button>
                        {editingComment && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingComment(null);
                              reset();
                            }}
                            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                          >
                            取消
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-200 p-8 mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium mb-4">
                  登录后才能发表评论
                </p>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  立即登录
                </Link>
              </div>
            )}

            {/* 评论列表 */}
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无评论</h3>
                <p className="text-gray-600">快来发表第一条评论吧！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {comment.profiles?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {comment.profiles?.username || '匿名用户'}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {comment.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                      {canEditComment(comment) && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-sm text-gray-500 hover:text-primary-600 px-2 py-1 rounded hover:bg-primary-50 transition-colors duration-200"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-sm text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors duration-200"
                          >
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
    </div>
  );
};

export default BlogDetail;