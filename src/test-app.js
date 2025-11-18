import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

// 简单的调试版本
console.log('App is loading...');

function TestApp() {
  console.log('TestApp rendering...');
  return (
    <Router>
      <AuthProvider>
        <div>
          <h1>测试页面</h1>
          <p>如果你能看到这个页面，说明React基础环境正常</p>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default TestApp;