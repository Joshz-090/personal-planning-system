import { useState } from 'react';
import { FiX, FiCheckCircle, FiCreditCard, FiSmartphone, FiCopy } from 'react-icons/fi';

const PaymentModal = ({ isOpen, onClose, plan, onConfirm }) => {
  const [method, setMethod] = useState('telebirr'); // 'telebirr' | 'cbe'
  const [reference, setReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reference.trim()) {
      setError('Please enter the transaction reference number.');
      return;
    }
    setError('');
    setIsProcessing(true);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onConfirm(reference);
    setIsProcessing(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Could add extensive toast notification here
  };

  const priceETB = plan.id === 'ai' ? '1700' : '3400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn scale-100 transition-all">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Complete Payment
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Plan Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upgrading to</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{plan.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{priceETB} ETB</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setMethod('telebirr')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                method === 'telebirr' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-200'
              }`}
            >
              <FiSmartphone className={`w-8 h-8 ${method === 'telebirr' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${method === 'telebirr' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>Telebirr</span>
            </button>
            <button
              onClick={() => setMethod('cbe')}
              className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                method === 'cbe' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-200'
              }`}
            >
              <FiCreditCard className={`w-8 h-8 ${method === 'cbe' ? 'text-purple-600' : 'text-gray-400'}`} />
              <span className={`font-semibold ${method === 'cbe' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>CBE Bank</span>
            </button>
          </div>

          {/* Payment Details */}
          <div className="mb-8 space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transfer {priceETB} ETB to:
            </p>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Account Number</p>
                <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                  {method === 'telebirr' ? '0953454460' : '100593303865'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Shcadule Inc.</p>
              </div>
              <button 
                onClick={() => copyToClipboard(method === 'telebirr' ? '0953454460' : '100593303865')}
                className="p-2 text-gray-400 hover:text-blue-600 transition"
                title="Copy Number"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reference Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Reference / Ref Number
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Enter the transaction code from SMS"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all
              ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}
              flex items-center justify-center gap-2
            `}
          >
            {isProcessing ? 'Verifying...' : 'I Have Paid'}
            {!isProcessing && <FiCheckCircle />}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
