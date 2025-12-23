const { db } = require('../config/firebaseAdmin');

async function check() {
    const snap = await db.collection('users').limit(1).get();
    if (snap.empty) {
        console.log("No users found");
    } else {
        console.log(JSON.stringify(snap.docs[0].data(), null, 2));
    }
    process.exit();
}

check();
