const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(5000, () => console.log('Test server on 5000'));
// Keep alive
setInterval(() => {
    console.log('Heartbeat...');
}, 10000);
