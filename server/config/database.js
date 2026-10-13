const knex = require('knex');
const config = require('./env');

const db = knex({
  client: 'mysql2',
  connection: {
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
  pool: { min: config.db.poolMin, max: config.db.poolMax },
});

module.exports = db;
