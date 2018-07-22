const Joi = require('joi');
const crypto = require('crypto')
const hapi = require('hapi');
const path = require('path');
const fs = require('fs');

const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '..', 'results.sqlite'),
  },
  useNullAsDefault: true
});

module.exports = async (listener, port) => {
  const server = hapi.Server({
    listener: listener({
      key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'privkey.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'cert.pem')),
    }),
    port,
    tls: true,
    routes: { cors: true },
  });

  if (!(await knex.schema.hasTable('runs'))) {
    await knex.schema.createTable('runs', (t) => {
      t.integer('timestamp').primary();
      t.integer('http_version');
      t.integer('concurrency');
      t.integer('size');
      t.integer('delay');
    });
    console.log('Table "runs" created');
  }
  
  if (!(await knex.schema.hasTable('results'))) {
    await knex.schema.createTable('results', (t) => {
      t.increments('id').primary();
      t.integer('run_id')
        .references('id')
        .inTable('runs')
        .onDelete('CASCADE');
      t.integer('duration');
    });
    console.log('Table "results" created');
  }

  server.route({
    method: 'GET',
    path: '/generate', 
    handler: (request) => {      
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
    },
    options: {
      validate: {
        query: Joi.object().keys({
          size: Joi.number().integer().positive().required(),
          delay: Joi.number().integer().positive().allow(0),
        }),
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/save', 
    handler: async (request) => {
      const timestamp = Date.now()
      try {
        await knex('runs')
          .insert({
            timestamp,
            http_version: request.payload.version,
            concurrency: request.payload.concurrency,
            size: request.payload.size,
            delay: request.payload.delay,
          });

        await knex('results')
          .insert(request.payload.durations.map(duration => ({
            run_id: timestamp,
            duration,
          })));

        return 'OK';
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    options: {
      validate: {
        payload: Joi.object().keys({
          concurrency: Joi.number().integer().positive().required(),
          version: Joi.allow([1, 2]),
          size: Joi.number().integer().positive().required(),
          delay: Joi.number().integer().positive().allow(0),
          durations: Joi.array().items(Joi.number()),
        }),
      },
    },
  });

  server.start();
};
