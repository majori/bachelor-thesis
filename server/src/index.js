const http2 = require('http2');
const https = require('https');
const hapi = require('hapi');
const path = require('path');
const fs = require('fs');

const setup = require('./setup');

const options = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem')),
};

const server1 = hapi.Server({
  // Since there are no browsers known that support
  // unencrypted HTTP/2, the use of `http2.createSecureServer()`
  // is necessary when communicating with browser clients.
  listener: http2.createSecureServer(options),
  port: 8000,
  tls: true,
});

const server2 = hapi.Server({
  listener: https.createServer(options),
  port: 8001,
  tls: true,
});

setup(server1);
setup(server2);