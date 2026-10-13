const { z } = require('zod');

// Nada de tags HTML em texto livre: o front renderiza esses campos.
const noHtml = (label) =>
  z
    .string({ error: `${label} é obrigatório.` })
    .trim()
    .refine((value) => !/[<>]/.test(value), `${label} contém caracteres inválidos.`);

const cpf = z
  .string({ error: 'CPF é obrigatório.' })
  .trim()
  .regex(/^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})$/, 'CPF inválido. Use 000.000.000-00.')
  .transform((value) =>
    value.includes('.') ? value : value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  );

const id = z.coerce
  .number({ error: 'ID inválido.' })
  .int('ID inválido.')
  .positive('ID inválido.')
  .max(2147483647, 'ID inválido.');

const loginBody = z.object({
  email: z.string({ error: 'Email é obrigatório.' }).trim().toLowerCase().max(100),
  senha: z.string({ error: 'Senha é obrigatória.' }).min(1, 'Senha é obrigatória.').max(128),
});

const criarConvidadoBody = z.object({
  nome: noHtml('Nome').pipe(z.string().min(2, 'Nome muito curto.').max(100, 'Nome muito longo.')),
  cpf,
  email: z
    .string({ error: 'Email é obrigatório.' })
    .trim()
    .toLowerCase()
    .max(100, 'Email muito longo.')
    .pipe(z.email('Email inválido.')),
  mesa: z.coerce
    .number({ error: 'Mesa inválida.' })
    .int('Mesa inválida.')
    .min(1, 'Mesa inválida.')
    .max(9999, 'Mesa inválida.'),
});

const idParams = z.object({ id });

// page/limit opcionais: sem eles a rota mantém o comportamento original (lista completa).
const paginacaoQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

module.exports = { loginBody, criarConvidadoBody, idParams, paginacaoQuery };
