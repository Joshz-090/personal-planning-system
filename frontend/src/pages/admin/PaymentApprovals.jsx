import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiZap, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';

const PaymentApprovals = () => {
  const { authFetch } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN_USERS);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter for users with pending status
        const pending = data.filter(u => (u.profile?.subscriptionStatus || u.settings?.subscriptionStatus) === 'pending');
        setRequests(pending);
      } else {
        console.error('Expected array, got:', data);
        setRequests([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authFetch) {
        fetchRequests();
    }
  }, [authFetch]);

  const handleAction = async (userId, approved) => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN_PAYMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approve: approved })
      });
      
      if (response.ok) {
        fetchRequests(); // Refresh list
        alert(approved ? 'Plan approved!' : 'Plan rejected.');
      }
    } catch (err) {
      alert('Error processed approval');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Subscription Approvals</h1>
        <p className="text-slate-500 text-sm">Review manual payment references and activate premium plans.</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-gray-800 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FiCheck className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No pending payment approvals</p>
            <p className="text-slate-400 text-xs mt-1">Everything is up to date!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div 
              key={request.id}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${(request.profile?.pendingPlan || request.settings?.pendingPlan) === 'pro' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                  <FiZap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {request.profile?.name || request.settings?.name || 'Unknown User'}
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-gray-800 rounded text-[10px] uppercase tracking-widest text-slate-500">
                        {request.profile?.pendingPlan || request.settings?.pendingPlan} Plan
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">{request.profile?.email || request.settings?.email}</p>
                </div>
              </div>

              <div className="flex-1 max-w-xs px-6 border-l border-slate-100 dark:border-gray-800">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Payment Reference</p>
                <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                    {request.profile?.lastPaymentRef || request.settings?.lastPaymentRef || 'NO-REF'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAction(request.id, false)}
                  className="flex-1 md:flex-none p-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="Reject"
                >
                  <FiX className="w-5 h-5 mx-auto" />
                </button>
                <button 
                  onClick={() => handleAction(request.id, true)}
                  className="flex-1 md:flex-none px-8 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
                >
                  Approve <FiCheck />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900 flex gap-4">
        <FiInfo className="w-6 h-6 text-blue-500 flex-shrink-0" />
        <div className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            <p className="font-bold mb-1">Processing Note:</p>
            When you click approve, the system will automatically activate the user's selected plan and set their expiration date to 30 days from today. The user will receive an in-app notification immediately.
        </div>
      </div>
    </div>
  );
};

export default PaymentApprovals;
