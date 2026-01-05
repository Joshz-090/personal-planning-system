import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import DailyPlanner from './pages/DailyPlanner';
import WeeklyPlanner from './pages/WeeklyPlanner';
import WeeklyTimeBoard from './pages/WeeklyTimeBoard';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Blog from './pages/Blog';
import UserControl from './pages/admin/UserControl';
import PaymentApprovals from './pages/admin/PaymentApprovals';
import BlogManager from './pages/admin/BlogManager';

// Theme Controller Component
const ThemeController = () => {
  const { userProfile } = useAuth(); 

  useEffect(() => {
    const mode = userProfile?.themeMode || 'light';
    console.log("ThemeController: Applying mode:", mode);
    
    const root = document.documentElement;
    // Remove both to be safe, then add if needed
    root.classList.remove('dark');
    
    if (mode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }
  }, [userProfile?.themeMode]);

  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeController />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={<Home />} />
          
          {/* Protected Routes with Unified AppShell */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/daily" element={<DailyPlanner />} />
            <Route path="/weekly-board" element={<WeeklyTimeBoard />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/blog" element={<Blog />} />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={<UserControl />} />
            <Route path="/admin/payments" element={<PaymentApprovals />} />
            <Route path="/admin/blog" element={<BlogManager />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
