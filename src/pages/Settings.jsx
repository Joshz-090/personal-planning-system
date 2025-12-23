import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiSave, FiUser, FiClock, FiCalendar, FiMoon, FiSun, FiTarget, FiHeart, FiEye } from 'react-icons/fi';
import { formatDate } from '../utils/dateUtils';

const Settings = () => {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || currentUser?.email || '',
    timeFormat: userProfile?.timeFormat || '24',
    calendarPreference: userProfile?.calendarPreference || 'gregorian',
    themeMode: userProfile?.themeMode || 'light',
    customMessage: userProfile?.customMessage || '',
    futureSelf: userProfile?.futureSelf || '',
    morals: userProfile?.morals || '',
    fiveYearGoal: userProfile?.fiveYearGoal || '',
    countdownDate: userProfile?.countdownDate || ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [currentDateEC, setCurrentDateEC] = useState('');

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        ...userProfile,
        email: userProfile.email || currentUser?.email
      }));
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    // Update Ethiopian Date preview
    if (formData.calendarPreference === 'ethiopian') {
      const today = new Date();
      // We pass 'ethiopian' explicitly to force the preview
      const ecDate = formatDate(today, 'ethiopian'); 
      setCurrentDateEC(`(Today: ${ecDate})`);
    } else {
      setCurrentDateEC('');
    }
  }, [formData.calendarPreference]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Error saving settings: ' + result.error);
    }
    
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-8">
          {/* Profile Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              <FiUser className="w-5 h-5 text-blue-500" />
              <span>Profile Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
          </section>

          {/* Life Goals Section (Onboarding Data) */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              <FiTarget className="w-5 h-5 text-purple-500" />
              <span>Life Vision & Goals</span>
            </h2>

            <div className="space-y-6">
               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FiEye /> Future Self Vision
                </label>
                <textarea
                  name="futureSelf"
                  value={formData.futureSelf}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Who do you want to become?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiHeart /> Core Values / Morals
                  </label>
                  <input
                    type="text"
                    name="morals"
                    value={formData.morals}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="e.g. Integrity, Growth..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <FiTarget /> 5-Year Goal
                  </label>
                  <input
                    type="text"
                    name="fiveYearGoal"
                    value={formData.fiveYearGoal}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="What is your main target?"
                  />
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Motivation / Custom Message
                </label>
                <input
                  type="text"
                  name="customMessage"
                  value={formData.customMessage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Displayed on your dashboard..."
                />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              <FiClock className="w-5 h-5 text-indigo-500" />
              <span>System Preferences</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  {formData.themeMode === 'dark' ? <FiMoon /> : <FiSun />}
                  <span>Theme Mode</span>
                </label>
                <select
                  name="themeMode"
                  value={formData.themeMode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <FiCalendar />
                  <span>Calendar System {currentDateEC && <span className="text-xs text-indigo-500 ml-2">{currentDateEC}</span>}</span>
                </label>
                <select
                  name="calendarPreference"
                  value={formData.calendarPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="gregorian">Gregorian (GC)</option>
                  <option value="ethiopian">Ethiopian (EC)</option>
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Format
                </label>
                <select
                  name="timeFormat"
                  value={formData.timeFormat}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="12">12-hour (AM/PM)</option>
                  <option value="24">24-hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  5-Year Plan Countdown Target
                </label>
                <input
                  type="datetime-local"
                  name="countdownDate"
                  value={formData.countdownDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4">
            {message && (
              <p className={`text-sm font-medium ${
                message.includes('Error') 
                  ? 'text-red-500 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

