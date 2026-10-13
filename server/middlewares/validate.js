const AppError = require('../utils/AppError');

// validate({ body, params, query }) -> valida com zod e expõe o resultado
// já tratado (trim, coerção, normalização) em req.validated.
const validate = (schemas) => (req, res, next) => {
  const validated = {};

  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;

    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      const message = result.error.issues[0]?.message || 'Dados inválidos.';
      const details = result.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message,
      }));
      return next(new AppError(message, 400, details));
    }
    validated[part] = result.data;
  }

  req.validated = validated;
  next();
};

module.exports = validate;
