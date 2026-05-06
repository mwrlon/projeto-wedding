const express = require('express');
const app = express();

const convidadoRoutes = require('./routes/convidadosRoutes');

app.use(express.json());

app.use(convidadoRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando');
});