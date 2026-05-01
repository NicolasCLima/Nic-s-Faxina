const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { JWT_SECRET } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ error: 'Preencha todos os campos.' });

  const exists = await prisma.usuario.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'E-mail já cadastrado.' });

  const hash = await bcrypt.hash(senha, 10);
  const user = await prisma.usuario.create({ data: { nome, email, senha: hash } });
  res.status(201).json({ message: 'Usuário criado com sucesso!', id: user.id });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ error: 'Informe e-mail e senha.' });

  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) return res.status(401).json({ error: 'Credenciais inválidas.' });

  const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
});

module.exports = router;
