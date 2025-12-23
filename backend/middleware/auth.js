const { auth, db } = require('../config/firebaseAdmin');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // 1. Verify the ID Token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 2. Fetch user from Firestore to check role
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'Forbidden: User not found in database' });
    }

    const userData = userDoc.data();
    const role = userData.profile?.role || userData.settings?.role || userData.role;

    if (role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Attach user info to request
    req.user = { uid, ...userData };
    next();
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyAdmin;
