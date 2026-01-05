import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

/**
 * CountdownCard Component
 * Displays a countdown timer or custom message
 */
const CountdownCard = ({ targetDate, message }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center space-x-2 mb-4">
        <FiClock className="w-6 h-6" />
        <h3 className="text-xl font-bold">Countdown</h3>
      </div>

      {message && (
        <p className="text-lg mb-4 opacity-90">{message}</p>
      )}

      {timeLeft && targetDate ? (
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{timeLeft.days}</div>
            <div className="text-sm opacity-80">Days</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{timeLeft.hours}</div>
            <div className="text-sm opacity-80">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{timeLeft.minutes}</div>
            <div className="text-sm opacity-80">Minutes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{timeLeft.seconds}</div>
            <div className="text-sm opacity-80">Seconds</div>
          </div>
        </div>
      ) : (
        <p className="text-lg opacity-80">
          {message || 'Set a target date to see countdown'}
        </p>
      )}
    </div>
  );
};

export default CountdownCard;

