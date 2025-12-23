const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./config/firebaseAdmin');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/blog', require('./routes/blog'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

setInterval(() => {}, 1000);

// Subscription Expiry Monitor (Runs once per hour)
const monitorSubscriptions = async () => {
    console.log(`[${new Date().toLocaleTimeString()}] Running Subscription Expiry Monitor...`);
    try {
        const now = new Date().toISOString();
        const usersSnapshot = await db.collection('users')
            .where('profile.subscriptionStatus', '==', 'active')
            .get();

        const batch = db.batch();
        let expiredCount = 0;

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            const expiryDate = data.profile?.expiryDate || data.settings?.expiryDate;

            if (expiryDate && expiryDate < now) {
                const userRef = db.collection('users').doc(doc.id);
                batch.update(userRef, {
                    'profile.plan': 'free',
                    'profile.subscriptionStatus': 'expired',
                    'settings.plan': 'free',
                    'settings.subscriptionStatus': 'expired'
                });
                expiredCount++;
            }
        });

        if (expiredCount > 0) {
            await batch.commit();
            console.log(`[${new Date().toLocaleTimeString()}] Monitor: Downgraded ${expiredCount} expired subscriptions.`);
        } else {
            console.log(`[${new Date().toLocaleTimeString()}] Monitor: No expired subscriptions found.`);
        }
    } catch (err) {
        console.error('Subscription Monitor Error:', err.message);
    }
};

// Start monitor every hour
setInterval(monitorSubscriptions, 60 * 60 * 1000);
// Run once on startup
monitorSubscriptions();
