const http2 = require('http2');
const https = require('https');

const setup = require('./setup');

setup(https.createServer, 8000);
setup(http2.createSecureServer, 8001);