import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('edit');
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const watchedData = watch();

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const savedData = localStorage.getItem('postDraft');
    if (savedData && !isEditing) {
      const draft = JSON.parse(savedData);
      setFormData(draft);
      setValue('title', draft.title);
      setValue('summary', draft.summary);
      setValue('content', draft.content);
    }
  }, [setValue, isEditing]);

  useEffect(() => {
    if (!isEditing && (watchedData.title || watchedData.summary || watchedData.content)) {
      const draftData = {
        title: watchedData.title || '',
        summary: watchedData.summary || '',
        content: watchedData.content || '',
      };
      localStorage.setItem('postDraft', JSON.stringify(draftData));
    }
  }, [watchedData, isEditing]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        summary: data.summary || '',
        content: data.content || '',
      });

      setValue('title', data.title || '');
      setValue('summary', data.summary || '');
      setValue('content', data.content || '');
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('加载博客失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      setError(null);

      const postData = {
        title: data.title,
        summary: data.summary,
        content: data.content,
      };

      let result;
      if (isEditing) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('posts')
          .insert([
            {
              ...postData,
              status: 'draft',
              author_id: (await supabase.auth.getUser()).data.user.id,
            }
          ]);
      }

      if (result.error) throw result.error;

      if (!isEditing) {
        localStorage.removeItem('postDraft');
      }

      navigate('/admin/posts');
    } catch (err) {
      console.error('Error saving post:', err);
      setError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      setError(null);

      const postData = {
        title: watchedData.title,
        summary: watchedData.summary,
        content: watchedData.content,
        status: 'published',
      };

      if (!postData.title || !postData.content) {
        setError('请填写标题和内容后再发布');
        setSaving(false);
        return;
      }

      let result;
      if (isEditing) {
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('posts')
          .insert([
            {
              ...postData,
              author_id: (await supabase.auth.getUser()).data.user.id,
            }
          ]);
      }

      if (result.error) throw result.error;

      if (!isEditing) {
        localStorage.removeItem('postDraft');
      }

      navigate('/admin/posts');
    } catch (err) {
      console.error('Error publishing post:', err);
      setError('发布失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-6">
          <div className="skeleton skeleton-title mb-4"></div>
          <div className="skeleton skeleton-line mb-2"></div>
          <div className="skeleton skeleton-line w-2/3"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="skeleton skeleton-line mb-4"></div>
          <div className="skeleton skeleton-line mb-4"></div>
          <div className="skeleton skeleton-line mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? '编辑博客' : '发布新博客'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? '修改您的博客文章' : '撰写并发布新的博客文章'}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/admin/posts')}
            className="btn btn-secondary"
            disabled={saving}
          >
            取消
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="btn btn-secondary"
          >
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? '发布中...' : isEditing ? '更新发布' : '发布'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                标题 *
              </label>
              <input
                {...register('title', {
                  required: '请输入博客标题',
                  maxLength: {
                    value: 200,
                    message: '标题不能超过200个字符',
                  },
                })}
                type="text"
                className="input"
                placeholder="请输入博客标题"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                摘要
              </label>
              <textarea
                {...register('summary', {
                  maxLength: {
                    value: 500,
                    message: '摘要不能超过500个字符',
                  },
                })}
                rows="3"
                className="input"
                placeholder="请输入博客摘要（可选）"
              />
              {errors.summary && (
                <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'edit'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'preview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                预览
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'edit' ? (
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  内容 * (支持 Markdown)
                </label>
                <textarea
                  {...register('content', {
                    required: '请输入博客内容',
                  })}
                  rows="20"
                  className="input font-mono text-sm"
                  placeholder="请输入博客内容，支持 Markdown 语法..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  <p>支持 Markdown 语法，例如：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>**粗体** *斜体*</li>
                    <li># 标题 ## 二级标题</li>
                    <li>[链接文字](URL)</li>
                    <li>`代码` 和 ```代码块```</li>
                    <li>- 列表项</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="markdown-content">
                {watchedData.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {watchedData.content}
                  </ReactMarkdown>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    请先在编辑标签页中输入内容
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;