import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} 个人博客. 保留所有权利.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            使用 <span className="font-medium">Supabase</span> +{' '}
            <span className="font-medium">Netlify</span> 技术栈构建
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;