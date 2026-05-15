const express = require('express');
const app = express();
const db = require('./connect');
const cors = require('cors');
const port = 3000;

app.use(cors());
app.use(express.json());

// ROTAS PARA LOGIN ----------------------------------------------

// LOGAR CONTA

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

// MOSTRAR CONVIDADOS CADASTRADOS

app.get('/api/convidados', (req, res) => {
  db('convidados')
    .select('*')
    .then(convidados => res.json(convidados))
    .catch(error => res.status(500).json({ error: error.message }));
});

// CADASTRAR USUARIO NOVO

app.post('/api/convidados', (req, res) => {
  const { nome, cpf, email, mesa } = req.body;
  db('convidados')
    .insert({ nome, cpf, email, mesa })
    .then(() => res.status(201).json({ message: 'Convidado cadastrado com sucesso!' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// DELETAR USUARIO PELO ID

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

// MOSTRAR CONVIDADOS 

app.get('/api/checkin', (req, res) => {
  db('convidados')
    .select('*')
    .then(convidados => res.json(convidados))
    .catch(error => res.status(500).json({ error: error.message }));
});

// FAZER CHECK-IN

app.patch('/api/guests/:id/checkin', async (req, res) => {
    const { id } = req.params;
    try {
        await db('convidados').where({ id }).update({ status: 'confirmado' });
        res.json({ message: "Check-in realizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  

// ROTAS PARA DASHBOARD ----------------------------------------------

// CONSULTA OS NUMEROS NO BANCO DE DADOS

app.get('/api/dashboard', async (req, res) => {
  try {
    const [total, confirmados, pendentes] = await Promise.all([
      db('convidados').count('id as count').first(),
      db('convidados').where({ status: 'confirmado' }).count('id as count').first(),
      db('convidados').where({ status: 'pendente' }).count('id as count').first()
    ]);

    // ENVIA OS DADOS
    res.json({
      total: total,
      confirmados: confirmados,
      pendentes: pendentes
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// MENSAGEM QUE APARECE NO CONSOLE QUANDO O SERVIDOR ESTÁ RODANDO

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});