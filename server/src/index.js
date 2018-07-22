const http2 = require('http2');
const https = require('https');

const setup = require('./setup');

async function main() {
  await setup(https.createServer, 8000);
  await setup(http2.createSecureServer, 8001);
}

main();