const express = require('express');
const app = express();
const db = require('./connect');
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());

// ROTAS PARA LOGIN ----------------------------------------------

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await db('usuarios')
      .where({ email: email, senha: senha })
      .first();

    if (user) {
      res.json({ success: true, message: "Login bem-sucedido!" });
    } else {
      res.status(401).json({ success: false, message: "Email ou senha incorretos" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ROTAS PARA CONVIDADOS ----------------------------------------------
app.get('/api/guests', (req, res) => {
  db('convidados')
    .select('*')
    .then(convidados => res.json(convidados))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.post('/api/guests', (req, res) => {
  const { nome, cpf, email, mesa } = req.body;
  db('convidados')
    .insert({ nome, cpf, email, mesa })
    .then(() => res.status(201).json({ message: 'Convidado cadastrado com sucesso!' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.delete('/api/guests/:id', (req, res) => {
  const { id } = req.params;

  db('convidados')
    .where({ id })
    .del()
    .then((count) => {
      if (count > 0) {
        res.json({ message: 'Convidado deletado com sucesso!' });
      } else {
        res.status(404).json({ error: 'Convidado não encontrado.' });
      }
    })
    .catch(error => res.status(500).json({ error: error.message }));
});

// ROTAS PARA CHECK-IN ----------------------------------------------

app.get('/api/checkin', (req, res) => {
  db('convidados')
    .select('*')
    .then(convidados => res.json(convidados))
    .catch(error => res.status(500).json({ error: error.message }));
});

app.patch('/api/guests/:id/checkin', (req, res) => {
  const { id } = req.params;

  db('convidados')
    .where({ id })
    .update({ status: 'confirmado' }) // Usando o ENUM do seu banco
    .then((count) => {
      if (count > 0) {
        res.json({ message: 'Check-in realizado!' });
      } else {
        res.status(404).json({ error: 'Convidado não encontrado.' });
      }
    })
    .catch(error => res.status(500).json({ error: error.message }));
});
  

// ROTAS PARA DASHBOARD ----------------------------------------------

// MENSAGEM QUE APARECE NO CONSOLE QUANDO O SERVIDOR ESTÁ RODANDO

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});