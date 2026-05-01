const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

const include = { cliente: true, profissional: true };

// GET /api/agendamentos
router.get('/', authMiddleware, async (req, res) => {
  const { q, order } = req.query;
  const where = q
    ? {
        OR: [
          { cliente: { nome: { contains: q } } },
          { profissional: { nome: { contains: q } } },
          { tipoServico: { contains: q } },
          { status: { contains: q } },
        ],
      }
    : {};

  const orderBy = order === 'data' ? { dataHora: 'asc' } : { cliente: { nome: 'asc' } };

  const data = await prisma.agendamento.findMany({ where, include, orderBy });
  res.json(data);
});

// GET /api/agendamentos/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const item = await prisma.agendamento.findUnique({ where: { id: +req.params.id }, include });
  if (!item) return res.status(404).json({ error: 'Não encontrado.' });
  res.json(item);
});

// POST /api/agendamentos
router.post('/', authMiddleware, async (req, res) => {
  const { clienteId, profissionalId, tipoServico, dataHora, duracao, observacoes } = req.body;
  if (!clienteId || !profissionalId || !tipoServico || !dataHora || !duracao)
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });

  // Verificar conflito de horário
  const inicio = new Date(dataHora);
  const fim = new Date(inicio.getTime() + duracao * 60000);

  const conflito = await prisma.agendamento.findFirst({
    where: {
      profissionalId: +profissionalId,
      status: { not: 'cancelado' },
      AND: [
        { dataHora: { lt: fim } },
        {
          dataHora: {
            gt: new Date(inicio.getTime() - 1),
          },
        },
      ],
    },
  });

  if (conflito)
    return res.status(409).json({ error: 'Conflito de horário: profissional já possui agendamento nesse período.' });

  const item = await prisma.agendamento.create({
    data: {
      clienteId: +clienteId,
      profissionalId: +profissionalId,
      tipoServico,
      dataHora: inicio,
      duracao: +duracao,
      observacoes,
    },
    include,
  });
  res.status(201).json(item);
});

// PUT /api/agendamentos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { clienteId, profissionalId, tipoServico, dataHora, duracao, status, observacoes } = req.body;
  const id = +req.params.id;

  if (dataHora && duracao && profissionalId) {
    const inicio = new Date(dataHora);
    const fim = new Date(inicio.getTime() + +duracao * 60000);
    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissionalId: +profissionalId,
        status: { not: 'cancelado' },
        id: { not: id },
        AND: [{ dataHora: { lt: fim } }, { dataHora: { gte: inicio } }],
      },
    });
    if (conflito)
      return res.status(409).json({ error: 'Conflito de horário: profissional já possui agendamento nesse período.' });
  }

  const item = await prisma.agendamento.update({
    where: { id },
    data: {
      ...(clienteId && { clienteId: +clienteId }),
      ...(profissionalId && { profissionalId: +profissionalId }),
      ...(tipoServico && { tipoServico }),
      ...(dataHora && { dataHora: new Date(dataHora) }),
      ...(duracao && { duracao: +duracao }),
      ...(status && { status }),
      ...(observacoes !== undefined && { observacoes }),
    },
    include,
  });
  res.json(item);
});

// DELETE /api/agendamentos/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  await prisma.agendamento.delete({ where: { id: +req.params.id } });
  res.json({ message: 'Agendamento excluído.' });
});

module.exports = router;
