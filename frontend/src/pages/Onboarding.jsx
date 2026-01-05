import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiTarget, FiArrowRight, FiUser, FiCalendar } from 'react-icons/fi';

const Onboarding = () => {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    futureSelf: '',
    morals: '',
    fiveYearGoal: '',
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateProfile({
      ...formData,
      onboardingCompleted: true,
      countdownDate: formData.targetDate,
      customMessage: formData.futureSelf // Using future self as the main motivation message
    });

    if (result.success) {
      navigate('/');
    } else {
      console.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Design Your Future
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {step === 1 ? "Let's define who you want to become." : "Set your timeline to success."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Who do you want to be in 5 years?
                  </label>
                  <textarea
                    name="futureSelf"
                    required
                    value={formData.futureSelf}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your future self (career, lifestyle, mindset)..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What are your core values/morals?
                  </label>
                  <textarea
                    name="morals"
                    required
                    value={formData.morals}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Discipline, Integrity, Continuous Learning..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition flex items-center justify-center gap-2"
                >
                  Next Step <FiArrowRight />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Ultimate 5-Year Goal
                  </label>
                  <input
                    type="text"
                    name="fiveYearGoal"
                    required
                    value={formData.fiveYearGoal}
                    onChange={handleChange}
                    placeholder="E.g., Senior Software Architect"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Achievement
                  </label>
                  <input
                    type="date"
                    name="targetDate"
                    required
                    value={formData.targetDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div className="flex gap-4">
                   <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loading ? 'Saving...' : 'Start My Journey'} <FiTarget />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
