import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import { Calendar, Users, Briefcase, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABEL = { agendado: 'Agendado', em_andamento: 'Em andamento', concluido: 'Concluído', cancelado: 'Cancelado' };
const STATUS_COLOR = {
  agendado: 'bg-sand-100 text-sand-700 border border-sand-200',
  em_andamento: 'bg-moss-100 text-moss-700 border border-moss-200',
  concluido: 'bg-bark-100 text-bark-700 border border-bark-200',
  cancelado: 'bg-red-50 text-red-600 border border-red-100',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/agendamentos?order=data'),
      api.get('/clientes'),
      api.get('/profissionais'),
    ]).then(([a, c, p]) => {
      setAgendamentos(a.data);
      setClientes(c.data);
      setProfissionais(p.data);
    }).finally(() => setLoading(false));
  }, []);

  const proximos = agendamentos.filter(a => new Date(a.dataHora) >= new Date() && a.status === 'agendado').slice(0, 5);

  const stats = [
    { label: 'Agendamentos', value: agendamentos.length, icon: <Calendar size={22} />, color: 'bg-sand-100 text-sand-600' },
    { label: 'Clientes', value: clientes.length, icon: <Users size={22} />, color: 'bg-clay-100 text-clay-600' },
    { label: 'Profissionais', value: profissionais.length, icon: <Briefcase size={22} />, color: 'bg-moss-100 text-moss-700' },
    { label: 'Próximos (7d)', value: agendamentos.filter(a => {
        const d = new Date(a.dataHora);
        const now = new Date();
        const next7 = new Date(now.getTime() + 7*24*3600*1000);
        return d >= now && d <= next7;
      }).length, icon: <Clock size={22} />, color: 'bg-bark-100 text-bark-600' },
  ];

  return (
    <Layout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-bark-400">Carregando...</div>
      ) : (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-6 shadow-warm border border-sand-100">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>{s.icon}</div>
                <div className="font-display text-3xl font-bold text-bark-900">{s.value}</div>
                <div className="text-bark-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/agendamentos')}
              className="bg-bark-700 hover:bg-bark-800 text-sand-50 rounded-2xl p-6 flex items-center justify-between group transition-all shadow-warm"
            >
              <div>
                <div className="font-display text-lg font-semibold mb-1">Novo Agendamento</div>
                <div className="text-sand-300 text-sm">Cadastre um novo serviço</div>
              </div>
              <ArrowRight size={20} className="text-sand-400 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/gestao')}
              className="bg-sand-200 hover:bg-sand-300 text-bark-800 rounded-2xl p-6 flex items-center justify-between group transition-all"
            >
              <div>
                <div className="font-display text-lg font-semibold mb-1">Gestão</div>
                <div className="text-bark-500 text-sm">Visualize e organize</div>
              </div>
              <TrendingUp size={20} className="text-bark-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Próximos agendamentos */}
          <div className="bg-white rounded-2xl shadow-warm border border-sand-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-sand-100 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-bark-900">Próximos Agendamentos</h2>
              <button onClick={() => navigate('/gestao')} className="text-clay-600 text-sm hover:underline">Ver todos</button>
            </div>
            {proximos.length === 0 ? (
              <div className="py-12 text-center text-bark-400">Nenhum agendamento próximo.</div>
            ) : (
              <div className="divide-y divide-sand-100">
                {proximos.map(a => (
                  <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-sand-50 transition-colors">
                    <div>
                      <p className="font-medium text-bark-800 text-sm">{a.cliente.nome}</p>
                      <p className="text-bark-400 text-xs mt-0.5">{a.profissional.nome} · {a.tipoServico}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-bark-700 text-sm font-medium">
                        {format(new Date(a.dataHora), "dd MMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLOR[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
