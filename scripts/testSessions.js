/**
 * Start the server, test the sessions endpoint, then exit.
 */
require('dotenv').config({ override: true });
process.env.PORT = 5000;

const http = require('http');
const app = require('./src/server');

// Give the server a moment to start
setTimeout(async () => {
  // Test /health
  const healthRes = await fetch('http://localhost:5000/health');
  const health = await healthRes.json();
  console.log('Health:', JSON.stringify(health));

  // Test /sessions/demo-user
  const sessRes = await fetch('http://localhost:5000/sessions/demo-user');
  const sess = await sessRes.json();
  console.log(`Sessions found: ${sess.sessions.length}`);
  if (sess.sessions.length > 0) {
    console.log('First session:', JSON.stringify(sess.sessions[0], null, 2));
    console.log('Last session:', JSON.stringify(sess.sessions[sess.sessions.length - 1], null, 2));
  }

  // Test /insight/demo-user
  const insRes = await fetch('http://localhost:5000/insight/demo-user');
  const ins = await insRes.json();
  console.log('Insight:', ins.insight ? ins.insight.substring(0, 100) + '...' : 'N/A');

  process.exit(0);
}, 2000);
