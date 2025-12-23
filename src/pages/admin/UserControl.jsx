import { useState, useEffect } from 'react';
import { FiUser, FiCheck, FiSlash } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/Firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { API_ENDPOINTS } from '../../config/api';

const UserControl = () => {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_USERS);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error('Expected array, got:', data);
        setUsers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authFetch) {
      fetchUsers();
    }
  }, [authFetch]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN_STATUS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      });
      
      if (response.ok) {
        fetchUsers(); // Refresh list
        alert(`User access ${newStatus === 'denied' ? 'denied' : 'restored'} successfully.`);
      }
    } catch (err) {
      alert('Error updating user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">User Control Center</h1>
          <p className="text-slate-500 text-sm">Manage users, access rights, and overall system status.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-bold shadow-sm">
                Total Users: {users.length}
            </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Sub Status</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">System Access</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 dark:border-gray-800 hover:bg-slate-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-bold text-blue-600">
                      {(user.profile?.name || user.settings?.name || 'U')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{user.profile?.name || user.settings?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 dark:text-gray-500">{user.profile?.email || user.settings?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`
                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                    ${(user.profile?.plan || user.settings?.plan) === 'pro' ? 'bg-amber-100 text-amber-600' : 
                      (user.profile?.plan || user.settings?.plan) === 'ai' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}
                  `}>
                    {user.profile?.plan || user.settings?.plan || 'free'}
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(user.profile?.subscriptionStatus || user.settings?.subscriptionStatus) === 'active' ? 'bg-green-500' : (user.profile?.subscriptionStatus || user.settings?.subscriptionStatus) === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-medium text-slate-600 dark:text-gray-400 capitalize">{user.profile?.subscriptionStatus || user.settings?.subscriptionStatus || 'active'}</span>
                  </div>
                </td>
                <td className="p-5">
                  {(user.profile?.status || user.settings?.status) !== 'denied' ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                      <FiCheck className="w-3.5 h-3.5" /> Authorized
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                      <FiSlash className="w-3.5 h-3.5" /> Denied Access
                    </span>
                  )}
                </td>
                <td className="p-5 text-right">
                    {(user.profile?.status || user.settings?.status) !== 'denied' ? (
                        <button 
                            onClick={() => handleStatusChange(user.id, 'denied')}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black transition-all"
                        >
                            Deny User
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-xs font-black transition-all"
                        >
                            Restore Access
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserControl;
