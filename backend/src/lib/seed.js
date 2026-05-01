const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Usuarios
  await prisma.usuario.createMany({
    data: [
      { nome: 'Admin', email: 'admin@faxina.com', senha: await bcrypt.hash('admin123', 10), role: 'admin' },
      { nome: 'Operador 1', email: 'op1@faxina.com', senha: await bcrypt.hash('op123', 10), role: 'operador' },
      { nome: 'Operador 2', email: 'op2@faxina.com', senha: await bcrypt.hash('op123', 10), role: 'operador' },
    ],
    skipDuplicates: true,
  });

  // Clientes
  await prisma.cliente.createMany({
    data: [
      { nome: 'Maria Silva', email: 'maria@email.com', telefone: '48 99999-0001', endereco: 'Rua das Flores, 123 - Florianópolis' },
      { nome: 'João Pereira', email: 'joao@email.com', telefone: '48 99999-0002', endereco: 'Av. Beira Mar, 456 - Florianópolis' },
      { nome: 'Empresa ABC Ltda', email: 'contato@abc.com', telefone: '48 3333-0001', endereco: 'Rua Comercial, 789 - São José' },
    ],
    skipDuplicates: true,
  });

  // Profissionais
  await prisma.profissional.createMany({
    data: [
      { nome: 'Ana Oliveira', email: 'ana@faxina.com', telefone: '48 99888-0001', especialidade: 'residencial' },
      { nome: 'Carlos Santos', email: 'carlos@faxina.com', telefone: '48 99888-0002', especialidade: 'comercial' },
      { nome: 'Rita Costa', email: 'rita@faxina.com', telefone: '48 99888-0003', especialidade: 'geral' },
    ],
    skipDuplicates: true,
  });

  // Agendamentos
  const clientes = await prisma.cliente.findMany();
  const profissionais = await prisma.profissional.findMany();

  await prisma.agendamento.createMany({
    data: [
      {
        clienteId: clientes[0].id,
        profissionalId: profissionais[0].id,
        tipoServico: 'residencial',
        dataHora: new Date('2025-05-10T09:00:00'),
        duracao: 120,
        status: 'agendado',
        observacoes: 'Apartamento 3 quartos',
      },
      {
        clienteId: clientes[1].id,
        profissionalId: profissionais[2].id,
        tipoServico: 'residencial',
        dataHora: new Date('2025-05-11T14:00:00'),
        duracao: 90,
        status: 'agendado',
        observacoes: 'Casa com piscina',
      },
      {
        clienteId: clientes[2].id,
        profissionalId: profissionais[1].id,
        tipoServico: 'comercial',
        dataHora: new Date('2025-05-12T08:00:00'),
        duracao: 180,
        status: 'agendado',
        observacoes: 'Escritório 200m²',
      },
    ],
  });

  console.log('✅ Banco populado com sucesso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
