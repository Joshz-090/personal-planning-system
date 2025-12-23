import { FiCheck, FiZap, FiStar, FiLoader } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PaymentModal from "./PaymentModal";

const PricingBanner = ({ currentPlan = "free" }) => {
  const { updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Free Plan",
      price: "$0",
      priceEtb: "0 ETB",
      period: "Forever",
      features: [
        "Up to 20 daily tasks",
        "Weekly planner",
        "Basic goals",
        "Dashboard analytics",
      ],
      icon: FiCheck,
      badge: "Starter",
      theme: "free",
      isAvailable: true,
    },
    {
      id: "ai",
      name: "AI Plan",
      price: "$10",
      priceEtb: "1,700 ETB",
      period: "/month",
      features: [
        "Everything in Free",
        "AI task suggestions",
        "Smart scheduling",
        "Priority support",
      ],
      icon: FiZap,
      badge: "Popular",
      theme: "ai",
      isAvailable: true, 
    },
    {
      id: "pro",
      name: "Pro Plan",
      price: "$20",
      priceEtb: "3,400 ETB",
      period: "/month",
      features: [
        "Everything in AI",
        "Unlimited tasks",
        "Advanced analytics",
        "Custom themes",
        "Export data",
      ],
      icon: FiStar,
      badge: "Best Value",
      theme: "pro",
      isAvailable: true,
    },
  ];

  const handleSelect = (id, available) => {
    if (!available || loading || id === currentPlan) return;
    
    // Open Payment Modal for non-free plans
    setPendingPlanId(id);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (referenceId) => {
    setLoading(true);
    setShowPaymentModal(false);
    setSelectedPlan(pendingPlanId);

    try {
      // Here we would verify the referenceId with backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updates = {
        lastPaymentRef: referenceId,
        paymentDate: new Date().toISOString(),
      };

      if (pendingPlanId === 'free') {
        updates.plan = 'free';
        updates.subscriptionStatus = 'active';
      } else {
        updates.pendingPlan = pendingPlanId;
        updates.subscriptionStatus = 'pending';
      }
      
      const result = await updateProfile(updates);
      
      if (result.success) {
        alert(pendingPlanId === 'free' ? "Plan updated to Free!" : "Payment submitted! Waiting for Admin approval.");
      }
    } catch (error) {
      console.error("Failed to update plan:", error);
      setSelectedPlan(currentPlan);
    } finally {
      setLoading(false);
      setPendingPlanId(null);
    }
  };

  const getThemeClasses = (theme, isActive) => {
    switch (theme) {
      case 'ai':
        return isActive 
          ? "bg-gradient-to-b from-indigo-900 to-purple-900 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] text-white" 
          : "bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-900 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]";
      case 'pro':
        return isActive 
          ? "bg-gradient-to-bl from-gray-900 via-gray-800 to-black border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-white" 
          : "bg-white dark:bg-gray-800 border-amber-200 dark:border-amber-900 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]";
      default: // free
        return isActive 
          ? "bg-white dark:bg-gray-800 border-blue-500 shadow-lg ring-1 ring-blue-500" 
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg";
    }
  };

  const getButtonStyles = (theme, isActive, isAvailable) => {
    if (!isAvailable) return "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed";
    if (isActive) return "bg-green-500 text-white cursor-default";

    switch (theme) {
      case 'ai':
        return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30";
      case 'pro':
        return "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-lg shadow-amber-500/30";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-10 px-0 lg:px-0">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isActive = currentPlan === plan.id;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              onClick={() => handleSelect(plan.id, plan.isAvailable)}
              className={`
                relative p-8 rounded-3xl border transition-all duration-500 transform
                ${getThemeClasses(plan.theme, isActive)}
                ${!isActive && plan.isAvailable ? 'hover:-translate-y-2 cursor-pointer' : ''}
                ${!plan.isAvailable ? 'opacity-80 grayscale-[0.5]' : ''}
              `}
            >
              {/* Absolute Glow Effects for Premium Cards */}
              {plan.theme === 'ai' && isActive && (
                <div className="absolute inset-0 bg-purple-500/10 blur-3xl rounded-3xl -z-10" />
              )}
              
              {/* Badge */}
              <span
                className={`
                  absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${isActive 
                    ? "bg-white/20 text-white backdrop-blur-sm" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}
                `}
              >
                {plan.badge}
              </span>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${isActive ? 'bg-white/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "text-white" : plan.theme === 'ai' ? 'text-purple-600' : plan.theme === 'pro' ? 'text-amber-500' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${!isActive && "text-gray-900 dark:text-white"}`}>
                    {plan.name}
                  </h3>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold ${!isActive && "text-gray-900 dark:text-white"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm font-medium opacity-60 ${!isActive && "text-gray-500"}`}>
                    / {plan.priceEtb}
                  </span>
                </div>
                <span className={`text-sm font-medium opacity-80 ${!isActive && "text-gray-500"}`}>
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 min-h-[160px]">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <FiCheck
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isActive ? "text-green-400" : "text-green-500"
                      }`}
                    />
                    <span className={`text-sm ${!isActive && "text-gray-600 dark:text-gray-300"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                disabled={!plan.isAvailable || isActive || loading}
                className={`
                  w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                  ${getButtonStyles(plan.theme, isActive, plan.isAvailable)}
                  ${loading && isSelected && !isActive ? 'opacity-75 cursor-wait' : ''}
                `}
              >
                {loading && isSelected && !isActive ? (
                  <>
                    <FiLoader className="animate-spin w-4 h-4" /> Processing...
                  </>
                ) : isActive ? (
                  <>
                    <FiCheck className="w-4 h-4" /> Active Plan
                  </>
                ) : plan.isAvailable ? (
                  "Upgrade Now"
                ) : (
                  "Coming Soon"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && pendingPlanId && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={plans.find(p => p.id === pendingPlanId)}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </>
  );
};

export default PricingBanner;
