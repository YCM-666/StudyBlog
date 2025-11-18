import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import BlogDetail from '../pages/BlogDetail';
import Login from '../pages/Login';
import Register from '../pages/Register';
import DashboardLayout from '../components/DashboardLayout';
import UserDashboard from '../pages/dashboard/Dashboard';
import UserPosts from '../pages/dashboard/Posts';
import UserComments from '../pages/dashboard/Comments';
import PostEditor from '../pages/dashboard/PostEditor';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/page/:page" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/new" element={
            <ProtectedRoute>
              <PostEditor />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="posts" element={<UserPosts />} />
            <Route path="posts/:id/edit" element={<PostEditor />} />
            <Route path="comments" element={<UserComments />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default AppRoutes;