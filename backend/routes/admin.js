const express = require('express');
const router = express.Router();
const { db, auth } = require('../config/firebaseAdmin');
const verifyAdmin = require('../middleware/auth');

// Apply admin protection to all routes
router.use(verifyAdmin);

// GET all users
router.get('/users', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// APPROVE Payment / Plan
router.post('/approve-subscription', async (req, res) => {
  const { userId, approve } = req.body;
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const userData = userDoc.data();
    const updates = {};

    if (approve) {
      // Move pendingPlan to actual plan
      const newPlan = userData.profile?.pendingPlan || userData.settings?.pendingPlan || 'free';
      updates['profile.plan'] = newPlan;
      updates['profile.subscriptionStatus'] = 'active';
      updates['profile.expiryDate'] = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      updates['profile.pendingPlan'] = null;
      
      // Also update settings to be safe
      updates['settings.plan'] = newPlan;
      updates['settings.subscriptionStatus'] = 'active';
      updates['settings.expiryDate'] = updates['profile.expiryDate'];
      updates['settings.pendingPlan'] = null;
    } else {
      updates['profile.subscriptionStatus'] = 'expired';
      updates['profile.pendingPlan'] = null;
    }

    await userRef.update(updates);
    res.json({ message: 'Subscription updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DENY / BAN User (Using Firebase Auth to disable the account)
router.post('/user-status', async (req, res) => {
  const { userId, status } = req.body; // 'active' or 'denied'
  try {
    const userRef = db.collection('users').doc(userId);
    
    // 1. Update Firestore status
    await userRef.update({
      'profile.status': status,
      'settings.status': status
    });

    // 2. Disable/Enable in Firebase Auth (Requires Service Account)
    try {
        await auth.updateUser(userId, {
            disabled: status === 'denied'
        });
    } catch (authErr) {
        console.error('Auth update failed (likely missing Service Account):', authErr.message);
    }

    res.json({ message: `User status changed to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
