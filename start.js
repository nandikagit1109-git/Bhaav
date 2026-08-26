// Simple wrapper to start the Bhaav server on port 5000
require('dotenv').config({ override: true });
process.env.PORT = 5000;
require('./src/server');
