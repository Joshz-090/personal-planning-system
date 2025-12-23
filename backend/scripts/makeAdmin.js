const { db } = require('../config/firebaseAdmin');

const makeAdmin = async (uid) => {
  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error('User not found in Firestore!');
      return;
    }

    // Update the profile and settings with admin role
    await userRef.update({
      'profile.role': 'admin',
      'settings.role': 'admin'
    });

    console.log(`Success: User ${uid} is now an ADMIN.`);
    process.exit(0);
  } catch (err) {
    console.error('Error making user admin:', err.message);
    process.exit(1);
  }
};

// UID provided by user
makeAdmin('BGbKf44kUccE2UdPKwrOA9Chy7n1');
