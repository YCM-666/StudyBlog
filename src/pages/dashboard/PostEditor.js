import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../contexts/AuthContext';

const PostEditor = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('edit');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const watchedData = watch();

  const fetchPost = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('author_id', user.id)
        .single();

      if (error) throw error;
      
      setValue('title', data.title);
      setValue('summary', data.summary || '');
      setValue('content', data.content);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id, user.id, setValue]);

  useEffect(() => {
    // 从localStorage加载草稿（仅限新建博客时）
    const savedData = localStorage.getItem('postDraft');
    if (savedData && !isEditing) {
      const draft = JSON.parse(savedData);
      setValue('title', draft.title);
      setValue('summary', draft.summary);
      setValue('content', draft.content);
    }
  }, [setValue, isEditing]);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [isEditing, fetchPost]);

  // 自动保存草稿
  useEffect(() => {
    if (!isEditing && (watchedData.title || watchedData.content)) {
      const draftData = {
        title: watchedData.title || '',
        summary: watchedData.summary || '',
        content: watchedData.content || '',
      };
      localStorage.setItem('postDraft', JSON.stringify(draftData));
    }
  }, [watchedData, isEditing]);

  const onSubmit = async (data, status) => {
    try {
      setSaving(true);
      setError(null);

      const postData = {
        title: data.title.trim(),
        summary: data.summary?.trim() || '',
        content: data.content.trim(),
        status,
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id)
          .eq('author_id', user.id);
      } else {
        result = await supabase
          .from('posts')
          .insert({
            ...postData,
            author_id: user.id,
            view_count: 0,
            like_count: 0,
          });
      }

      if (result.error) throw result.error;

      // 清除草稿
      localStorage.removeItem('postDraft');

      if (status === 'published') {
        navigate('/dashboard/posts');
      } else {
        navigate(isEditing ? '/dashboard/posts' : '/dashboard/posts');
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = (data) => {
    onSubmit(data, 'draft');
  };

  const handlePublish = (data) => {
    if (!window.confirm('确定要发布这篇博客吗？')) {
      return;
    }
    onSubmit(data, 'published');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && isEditing) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">加载失败: {error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? '编辑博客' : '发布新博客'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? '修改博客内容' : '分享你的想法和见解'}
            </p>
          </div>
        </div>
      </div>

      {/* 编辑器表单 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <form className="space-y-8 p-8">
          {/* 标题输入 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              博客标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title', {
                required: '请输入博客标题',
                maxLength: {
                  value: 100,
                  message: '标题不能超过100个字符'
                }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-lg font-medium"
              placeholder="输入吸引人的标题..."
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* 摘要输入 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              博客摘要
            </label>
            <textarea
              {...register('summary', {
                maxLength: {
                  value: 200,
                  message: '摘要不能超过200个字符'
                }
              })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
              placeholder="简要描述博客内容..."
            />
            {errors.summary && (
              <p className="mt-2 text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* 内容编辑器 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              博客内容 <span className="text-red-500">*</span>
            </label>
            
            {/* 标签切换 */}
            <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'edit'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                预览
              </button>
            </div>

            {/* 编辑器 */}
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {activeTab === 'edit' ? (
                <div className="relative">
                  <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <textarea
                    {...register('content', {
                      required: '请输入博客内容',
                      minLength: {
                        value: 10,
                        message: '内容至少需要10个字符'
                      }
                    })}
                    rows={20}
                    className="w-full px-3 py-2 pl-10 border-0 focus:ring-0 focus:border-transparent resize-none font-mono text-sm text-gray-900 placeholder-gray-500"
                    placeholder="使用Markdown语法编写博客内容..."
                  />
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto p-6 bg-gray-50">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {watchedData.content || ''}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            
            {errors.content && (
              <p className="mt-2 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-red-800">{error}</div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard/posts')}
              className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              取消
            </button>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSubmit(handleSaveDraft)}
                disabled={saving}
                className="px-6 py-2.5 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </span>
                ) : '保存草稿'}
              </button>
              <button
                type="button"
                onClick={handleSubmit(handlePublish)}
                disabled={saving}
                className="px-8 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    发布中...
                  </span>
                ) : '发布博客'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditor;