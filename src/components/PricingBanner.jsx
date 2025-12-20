import { FiCheck, FiZap, FiStar } from "react-icons/fi";
import { useState } from "react";

const PricingBanner = ({ currentPlan = "free" }) => {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: "$0",
      period: "Forever",
      features: [
        "Up to 20 daily tasks",
        "Weekly planner",
        "Basic goals",
        "Dashboard analytics",
      ],
      icon: FiCheck,
      badge: "Active Now",
      isAvailable: true,
    },
    {
      id: "ai",
      name: "AI Plan",
      price: "$10",
      period: "/month",
      features: [
        "Everything in Free",
        "AI task suggestions",
        "Smart scheduling",
        "Priority support",
      ],
      icon: FiZap,
      badge: "Coming Soon",
      isAvailable: false,
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "$20",
      period: "/month",
      features: [
        "Everything in AI",
        "Unlimited tasks",
        "Advanced analytics",
        "Custom themes",
        "Export data",
      ],
      icon: FiStar,
      badge: "Coming Soon",
      isAvailable: false,
    },
  ];

  const handleSelect = (id, available) => {
    if (!available) return;
    setSelectedPlan(id);

    // ✨ you can later trigger your Firestore update here
    // updateUserPlan(id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
      {plans.map((plan) => {
        const Icon = plan.icon;
        const isActive = selectedPlan === plan.id;

        return (
          <div
            key={plan.id}
            className={`
              relative p-8 rounded-2xl border shadow-md transition-all duration-300 
              hover:shadow-xl hover:-translate-y-1 cursor-pointer
              bg-white dark:bg-gray-800
              ${isActive ? "border-blue-500 shadow-blue-500" : "border-gray-300 dark:border-gray-700"}
              ${!plan.isAvailable ? "opacity-70" : ""}
            `}
            onClick={() => handleSelect(plan.id, plan.isAvailable)}
          >
            {/* Badge */}
            <span
              className={`
                absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold 
                ${isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 dark:bg-gray-700 dark:text-gray-300"}
              `}
            >
              {plan.badge}
            </span>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <Icon
                className={`w-8 h-8 ${isActive ? "text-blue-600" : "text-gray-400"}`}
              />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {plan.price}
              </span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">
                {plan.period}
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <FiCheck
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-green-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isActive
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Button */}
            <button
              disabled={!plan.isAvailable}
              onClick={() => handleSelect(plan.id, plan.isAvailable)}
              className={`
                w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300
                ${isActive
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : plan.isAvailable
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300"
                  : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"}
              `}
            >
              {isActive ? "Current Plan" : plan.isAvailable ? "Select Plan" : "Coming Soon"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PricingBanner;
