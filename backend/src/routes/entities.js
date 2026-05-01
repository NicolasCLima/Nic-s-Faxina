const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// ---- CLIENTES ----
router.get('/clientes', authMiddleware, async (req, res) => {
  const data = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } });
  res.json(data);
});

router.post('/clientes', authMiddleware, async (req, res) => {
  const { nome, email, telefone, endereco } = req.body;
  if (!nome || !email || !telefone || !endereco)
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  const item = await prisma.cliente.create({ data: { nome, email, telefone, endereco } });
  res.status(201).json(item);
});

// ---- PROFISSIONAIS ----
router.get('/profissionais', authMiddleware, async (req, res) => {
  const data = await prisma.profissional.findMany({ orderBy: { nome: 'asc' } });
  res.json(data);
});

router.post('/profissionais', authMiddleware, async (req, res) => {
  const { nome, email, telefone, especialidade } = req.body;
  if (!nome || !email || !telefone)
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  const item = await prisma.profissional.create({ data: { nome, email, telefone, especialidade } });
  res.status(201).json(item);
});

module.exports = router;
