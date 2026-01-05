import { useAuth } from '../contexts/AuthContext';
import PricingBanner from '../components/PricingBanner';
import { FiCheck, FiZap, FiStar } from 'react-icons/fi';

const Pricing = () => {
  const { userProfile } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pricing Plans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose the plan that works best for you
          </p>
        </div>

        <PricingBanner currentPlan={userProfile?.plan || 'free'} />

        {/* Additional Information */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes will take effect immediately.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards and PayPal. Payment processing is secure and handled by our trusted partners.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The Free Plan is available forever with no trial period needed. For paid plans, we'll offer a 14-day free trial when they launch.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

