const Joi = require('joi');
const crypto = require('crypto')

function handler(request) {      
  const start = Date.now();
  const bytes = crypto.randomBytes(request.query.size).toString('hex');
  const timeToGenerateBytes = Date.now() - start;

  function generatePayload() {
    return {
      start,
      payload: bytes,
      end: Date.now(),
    };
  }

  return request.query.delay ?
    generatePayload() : 
    new Promise((resolve, reject) => {
      setTimeout(() => resolve(generatePayload()), request.query.delay - timeToGenerateBytes)
    });
}

module.exports = (server) => {
  server.route({
    method: 'GET',
    path: '/generate', 
    handler,
    options: {
      validate: {
        query: Joi.object().keys({
          size: Joi.number().integer().positive().required(),
          delay: Joi.number().integer().positive(),
        }),
      },
    },
  });

  server.start(err => {
    if (err) console.error(err)
    console.log(`Started ${server.connections.length} connections`)
  });
};
