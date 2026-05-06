const knex = require('knex');
const db = knex({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'admin',
        database: 'wedding_pass'
    }
});

async function listarConvidados() {
  return await db('convidados').select('*');
}

module.exports = {
  listarConvidados
};