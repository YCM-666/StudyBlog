import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        user: action.payload.user, 
        profile: action.payload.profile, 
        loading: false, 
        error: null 
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, profile: null, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 所有注册用户都有发布博客权限
        const mockProfile = { 
          id: session.user.id, 
          username: session.user.user_metadata?.username || '用户', 
          role: 'user'
        };

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: session.user, profile: mockProfile }
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // 所有注册用户都有发布博客权限
          const mockProfile = { 
            id: session.user.id, 
            username: session.user.user_metadata?.username || '用户', 
            role: 'user'
          };

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: session.user, profile: mockProfile }
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, profile }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, username) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 注册成功 - 新用户都是注册用户，有发布博客权限
      const mockProfile = { id: data.user.id, username, role: 'user' };
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, profile: mockProfile }
      });

      return { success: true, message: '注册成功！' };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};