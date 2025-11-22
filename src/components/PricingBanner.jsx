import { FiCheck, FiZap, FiStar } from 'react-icons/fi';

/**
 * PricingBanner Component
 * Displays pricing plans (advertisement only)
 */
const PricingBanner = ({ currentPlan = 'free' }) => {
  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      period: 'Forever',
      features: ['Up to 20 daily tasks', 'Weekly planner', 'Basic goals', 'Dashboard analytics'],
      icon: FiCheck,
      active: currentPlan === 'free',
      badge: 'Active Now'
    },
    {
      id: 'ai',
      name: 'AI Plan',
      price: '$10',
      period: '/month',
      features: ['Everything in Free', 'AI task suggestions', 'Smart scheduling', 'Priority support'],
      icon: FiZap,
      active: false,
      badge: 'Coming Soon'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$20',
      period: '/month',
      features: ['Everything in AI', 'Unlimited tasks', 'Advanced analytics', 'Custom themes', 'Export data'],
      icon: FiStar,
      active: false,
      badge: 'Coming Soon'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {plans.map((plan) => {
        const Icon = plan.icon;
        return (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 transition-all ${
              plan.active
                ? 'border-blue-500 dark:border-blue-400 shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 opacity-75'
            }`}
          >
            {plan.badge && (
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                plan.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {plan.badge}
              </div>
            )}

            <div className="flex items-center space-x-3 mb-4">
              <Icon className={`w-8 h-8 ${
                plan.active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
              }`} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {plan.price}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">
                {plan.period}
              </span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <FiCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    plan.active ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <span className={`text-sm ${
                    plan.active 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              disabled={!plan.active}
              className={`w-full py-2 px-4 rounded-md font-medium transition ${
                plan.active
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {plan.active ? 'Current Plan' : 'Coming Soon'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PricingBanner;

