import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import NavBar from "../components/NavBar";
import CountdownCard from "../components/CountdownCard";
import PricingBanner from "../components/PricingBanner";
import QuickPlanWidget from "../components/QuickPlanWidget";
import ProgressBar from "../components/ProgressBar";

import {
  FiCalendar,
  FiTarget,
  FiBarChart2,
  FiCheckCircle,
} from "react-icons/fi";
import { formatDate } from "../utils/dateUtils";

const Home = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect logic
  useEffect(() => {
    if (currentUser && userProfile) {
      if (!userProfile.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, userProfile, navigate]);

  /* ---------------------------------------------------
     LANDING PAGE (UNAUTHENTICATED)
  ---------------------------------------------------- */

  /* ---------------------------------------------------
     UNAUTHENTICATED USER (LANDING PAGE)
  ---------------------------------------------------- */
  return (
    <div className="
      min-h-screen 
      bg-gradient-to-br from-blue-50 to-indigo-100 
      dark:from-gray-900 dark:to-gray-800
      pt-16
    ">
      <NavBar />

      <main className="max-w-7xl mx-auto px-6 py-20">

        {/* Hero */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            Shcadule
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            The all-in-one personal planning system for daily tasks, weekly routines, and long-term goals.
          </p>

          <div className="flex justify-center gap-4 mt-8">
            <Link
              to="/register"
              className="
                px-8 py-3 rounded-xl font-semibold 
                bg-blue-600 text-white shadow-lg
                hover:bg-blue-700 hover:shadow-xl
                transition-all
              "
            >
              Get Started
            </Link>

            <Link
              to="/login"
              className="
                px-8 py-3 rounded-xl font-semibold
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-white
                shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700
                transition-all
              "
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
          <FeatureCard
            icon={FiCalendar}
            color="text-blue-600 dark:text-blue-400"
            title="Daily Planning"
            description="Track up to 20 tasks daily with smart organization"
          />

          <FeatureCard
            icon={FiBarChart2}
            color="text-purple-600 dark:text-purple-400"
            title="Weekly Overview"
            description="Review weekly habits, tasks, and performance"
          />

          <FeatureCard
            icon={FiTarget}
            color="text-green-600 dark:text-green-400"
            title="Long-Term Goals"
            description="Plan your monthly, quarterly, and yearly objectives"
          />
        </section>

        {/* Pricing Preview */}
        <section className="mb-10">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Choose Your Plan
          </h2>

          <PricingBanner currentPlan="free" />
        </section>
      </main>
    </div>
  );
};

export default Home;



/* ---------------------------------------------------
   SUBCOMPONENTS
---------------------------------------------------- */

const ActionCard = ({ to, icon: Icon, iconColor, title, description }) => (
  <Link
    to={to}
    className="
      bg-white dark:bg-gray-800 
      p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700
      hover:shadow-xl hover:-translate-y-1 
      transition-all cursor-pointer group relative
    "
  >
    <Icon className={`w-14 h-14 mx-auto mb-4 ${iconColor} group-hover:scale-110 transition-transform`} />
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>

    {/* Glow effect */}
    <div className="
      absolute inset-0 rounded-2xl 
      bg-gradient-to-br from-blue-500/10 to-purple-500/10
      opacity-0 group-hover:opacity-100 transition-opacity
      pointer-events-none
    "></div>
  </Link>
);

const FeatureCard = ({ icon: Icon, color, title, description }) => (
  <div className="
    bg-white dark:bg-gray-800 
    p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700
    hover:shadow-xl hover:-translate-y-1
    transition-all text-center
  ">
    <Icon className={`w-14 h-14 mx-auto mb-5 ${color}`} />
    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-lg">
      {description}
    </p>
  </div>
);
