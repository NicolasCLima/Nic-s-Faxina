import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ArrowUpDown, Calendar, Loader2, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_COLOR = {
  agendado: 'bg-sand-100 text-sand-700',
  em_andamento: 'bg-moss-100 text-moss-700',
  concluido: 'bg-bark-100 text-bark-600',
  cancelado: 'bg-red-50 text-red-500',
};

export default function Gestao() {
  const [list, setList] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('data'); // data | nome
  const [selected, setSelected] = useState(null);
  const [modalData, setModalData] = useState({ tipoServico: 'residencial', dataHora: '', duracao: 60, profissionalId: '' });
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(null);

  async function load() {
    setLoading(true);
    const { data } = await api.get(`/agendamentos?order=${order}`);
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [order]);
  useEffect(() => { api.get('/profissionais').then(r => setProfissionais(r.data)); }, []);

  function handleModal(e) {
    setModalData(f => ({ ...f, [e.target.name]: e.target.value }));
    setConflict(null);
  }

  async function saveGestao() {
    if (!selected) return;
    if (!modalData.dataHora || !modalData.profissionalId)
      return toast.error('Preencha data, horário e profissional.');
    setSaving(true);
    setConflict(null);
    try {
      await api.put(`/agendamentos/${selected.id}`, {
        tipoServico: modalData.tipoServico,
        dataHora: modalData.dataHora,
        duracao: +modalData.duracao,
        profissionalId: +modalData.profissionalId,
        status: 'agendado',
      });
      toast.success('Agendamento atualizado com sucesso!');
      setSelected(null);
      load();
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao salvar.';
      if (msg.includes('Conflito')) {
        setConflict(msg);
        toast.error(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  // Bubble sort por nome ou data (conforme requisito de algoritmo de ordenação)
  function bubbleSort(arr, key) {
    const a = [...arr];
    for (let i = 0; i < a.length - 1; i++) {
      for (let j = 0; j < a.length - i - 1; j++) {
        const va = key === 'data' ? new Date(a[j].dataHora) : a[j].cliente.nome.toLowerCase();
        const vb = key === 'data' ? new Date(a[j+1].dataHora) : a[j+1].cliente.nome.toLowerCase();
        if (va > vb) { [a[j], a[j+1]] = [a[j+1], a[j]]; }
      }
    }
    return a;
  }

  const sorted = bubbleSort(list, order);

  return (
    <Layout title="Gestão de Agendamentos">
      <div className="flex gap-4 mb-6 items-center">
        <span className="text-bark-500 text-sm font-medium">Ordenar por:</span>
        <button
          onClick={() => setOrder('data')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${order === 'data' ? 'bg-bark-700 text-sand-50' : 'bg-sand-100 text-bark-600 hover:bg-sand-200'}`}
        >
          <Calendar size={14} /> Data
        </button>
        <button
          onClick={() => setOrder('nome')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${order === 'nome' ? 'bg-bark-700 text-sand-50' : 'bg-sand-100 text-bark-600 hover:bg-sand-200'}`}
        >
          <ArrowUpDown size={14} /> Nome
        </button>
        <span className="text-bark-400 text-xs ml-auto">Algoritmo: Bubble Sort</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* List */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-warm border border-sand-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-sand-100 bg-sand-50">
            <p className="text-xs text-bark-500 font-medium uppercase tracking-wide">Selecione um agendamento para editar</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-bark-400"><Loader2 className="animate-spin" /></div>
          ) : sorted.length === 0 ? (
            <div className="py-16 text-center text-bark-400">Nenhum agendamento.</div>
          ) : (
            <div className="divide-y divide-sand-50 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {sorted.map(a => (
                <button
                  key={a.id}
                  onClick={() => {
                    setSelected(a);
                    setModalData({
                      tipoServico: a.tipoServico,
                      dataHora: format(new Date(a.dataHora), "yyyy-MM-dd'T'HH:mm"),
                      duracao: a.duracao,
                      profissionalId: a.profissionalId,
                    });
                    setConflict(null);
                  }}
                  className={`w-full text-left px-6 py-4 hover:bg-sand-50 transition-colors flex items-start justify-between gap-4 ${selected?.id === a.id ? 'bg-sand-100 border-l-4 border-l-bark-700' : ''}`}
                >
                  <div>
                    <p className="font-medium text-bark-800 text-sm">{a.cliente.nome}</p>
                    <p className="text-bark-400 text-xs mt-0.5">{a.profissional.nome}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-bark-600 text-xs">{format(new Date(a.dataHora), "dd/MM/yy HH:mm")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLOR[a.status]}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit panel */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-sand-100 rounded-2xl border border-sand-200 h-full flex items-center justify-center p-8">
              <p className="text-bark-400 text-sm text-center">Selecione um agendamento à esquerda para editar.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-warm border border-sand-100 p-6 space-y-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-bark-900">{selected.cliente.nome}</h3>
                <p className="text-bark-400 text-sm">ID #{selected.id}</p>
              </div>

              {conflict && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{conflict}</span>
                </div>
              )}

              <div>
                <label className="block text-bark-600 text-xs font-medium mb-1.5">Tipo de Serviço</label>
                <div className="relative">
                  <select name="tipoServico" value={modalData.tipoServico} onChange={handleModal}
                    className="w-full appearance-none px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300">
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bark-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-bark-600 text-xs font-medium mb-1.5">Profissional</label>
                <div className="relative">
                  <select name="profissionalId" value={modalData.profissionalId} onChange={handleModal}
                    className="w-full appearance-none px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300">
                    {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome} ({p.especialidade})</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bark-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-bark-600 text-xs font-medium mb-1.5">Data e Horário *</label>
                <input name="dataHora" type="datetime-local" value={modalData.dataHora} onChange={handleModal}
                  className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300" />
              </div>

              <div>
                <label className="block text-bark-600 text-xs font-medium mb-1.5">Duração (minutos)</label>
                <input name="duracao" type="number" value={modalData.duracao} onChange={handleModal} min={30}
                  className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300" />
              </div>

              <button onClick={saveGestao} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-bark-700 hover:bg-bark-800 text-sand-50 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 shadow-warm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Confirmar Agendamento
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
