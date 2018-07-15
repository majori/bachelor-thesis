const Joi = require('joi');
const crypto = require('crypto')
const hapi = require('hapi');
const path = require('path');
const fs = require('fs');

const options = {
  key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem')),
};

function handler(request) {      
  const start = Date.now();
  const bytes = crypto.randomBytes(request.query.size).toString('hex');

  function generatePayload() {
    return {
      start,
      payload: bytes,
      end: Date.now(),
    };
  }

  return !request.query.delay ?
    Promise.resolve(generatePayload()) : 
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(generatePayload());
      }, request.query.delay);
    });
}

module.exports = (listener, port) => {
  const server = hapi.Server({
    listener: listener(options),
    port,
    tls: true,
    routes: { cors: true },
  });

  server.route({
    method: 'GET',
    path: '/generate', 
    handler,
    options: {
      validate: {
        query: Joi.object().keys({
          size: Joi.number().integer().positive().required(),
          delay: Joi.number().integer().positive().allow(0),
        }),
      },
    },
  });

  server.start(err => {
    if (err) console.error(err)
    console.log(`Started ${server.connections.length} connections`)
  });
};
