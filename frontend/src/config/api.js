const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://personal-planning-system.onrender.com';

export const API_ENDPOINTS = {
  BLOGS: `${API_BASE_URL}/api/blog`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_STATUS: `${API_BASE_URL}/api/admin/user-status`,
  ADMIN_PAYMENTS: `${API_BASE_URL}/api/admin/approve-subscription`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
