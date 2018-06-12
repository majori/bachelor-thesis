const http2 = require('http2');
const path = require('path');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem')),
});

server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  // stream is a Duplex
  stream.respond({
    'content-type': 'text/html',
    ':status': 200
  });
  stream.end('<h1>Hello World</h1>');
});

server.listen(8443);