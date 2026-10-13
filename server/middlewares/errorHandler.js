const notFound = (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
};

// Último middleware: nunca vaza stack trace nem mensagem interna do banco.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // JSON malformado no body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Corpo da requisição grande demais.' });
  }

  // CORS bloqueado
  if (err.message === 'Origem não permitida pelo CORS') {
    return res.status(403).json({ error: err.message });
  }

  // Violação de UNIQUE no MySQL (cpf/email já cadastrados)
  if (err.code === 'ER_DUP_ENTRY') {
    const campo = /cpf/i.test(err.sqlMessage || '') ? 'CPF' : 'Email';
    return res.status(409).json({ error: `${campo} já cadastrado.` });
  }

  if (err.isOperational) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // O detalhe fica só no log do servidor; o cliente nunca vê mensagem interna.
  console.error('[erro]', req.method, req.originalUrl, err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
};

module.exports = { notFound, errorHandler };
