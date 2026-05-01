import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, X, Loader2, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['agendado', 'em_andamento', 'concluido', 'cancelado'];
const STATUS_COLOR = {
  agendado: 'bg-sand-100 text-sand-700',
  em_andamento: 'bg-moss-100 text-moss-700',
  concluido: 'bg-bark-100 text-bark-600',
  cancelado: 'bg-red-50 text-red-500',
};

const emptyForm = { clienteId: '', profissionalId: '', tipoServico: 'residencial', dataHora: '', duracao: 60, status: 'agendado', observacoes: '' };

export default function Agendamentos() {
  const [list, setList] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await api.get(`/agendamentos?q=${q}`);
    setList(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    api.get('/clientes').then(r => setClientes(r.data));
    api.get('/profissionais').then(r => setProfissionais(r.data));
  }, []);

  function openNew() { setEditing(null); setForm(emptyForm); setModal(true); }
  function openEdit(item) {
    setEditing(item.id);
    setForm({
      clienteId: item.clienteId,
      profissionalId: item.profissionalId,
      tipoServico: item.tipoServico,
      dataHora: format(new Date(item.dataHora), "yyyy-MM-dd'T'HH:mm"),
      duracao: item.duracao,
      status: item.status,
      observacoes: item.observacoes || '',
    });
    setModal(true);
  }

  async function save() {
    if (!form.clienteId || !form.profissionalId || !form.dataHora || !form.duracao)
      return toast.error('Preencha todos os campos obrigatórios.');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/agendamentos/${editing}`, form);
        toast.success('Agendamento atualizado!');
      } else {
        await api.post('/agendamentos', form);
        toast.success('Agendamento criado!');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!confirm('Excluir este agendamento?')) return;
    try {
      await api.delete(`/agendamentos/${id}`);
      toast.success('Excluído!');
      load();
    } catch { toast.error('Erro ao excluir.'); }
  }

  function handle(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  return (
    <Layout title="Cadastro de Agendamentos">
      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-400" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Buscar agendamento..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sand-300 text-bark-800"
          />
        </div>
        <button onClick={load} className="px-4 py-2.5 bg-sand-200 hover:bg-sand-300 text-bark-700 rounded-xl text-sm font-medium transition-colors">Buscar</button>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-bark-700 hover:bg-bark-800 text-sand-50 rounded-xl text-sm font-medium transition-colors shadow-warm ml-auto">
          <Plus size={16} /> Novo
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-warm border border-sand-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-bark-400"><Loader2 className="animate-spin" /></div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-bark-400">Nenhum agendamento encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-100 bg-sand-50">
                  {['#', 'Cliente', 'Profissional', 'Tipo', 'Data/Hora', 'Duração', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-bark-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-50">
                {list.map(a => (
                  <tr key={a.id} className="hover:bg-sand-50 transition-colors">
                    <td className="px-5 py-4 text-bark-400">{a.id}</td>
                    <td className="px-5 py-4 font-medium text-bark-800">{a.cliente.nome}</td>
                    <td className="px-5 py-4 text-bark-600">{a.profissional.nome}</td>
                    <td className="px-5 py-4 capitalize text-bark-600">{a.tipoServico}</td>
                    <td className="px-5 py-4 text-bark-600">{format(new Date(a.dataHora), 'dd/MM/yy HH:mm')}</td>
                    <td className="px-5 py-4 text-bark-600">{a.duracao}min</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLOR[a.status]}`}>{a.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="p-1.5 text-bark-400 hover:text-clay-600 hover:bg-clay-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => remove(a.id)} className="p-1.5 text-bark-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-bark-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-warm-lg w-full max-w-lg page-enter overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-sand-100">
              <h3 className="font-display text-xl font-semibold text-bark-900">{editing ? 'Editar' : 'Novo'} Agendamento</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-sand-100 rounded-xl transition-colors text-bark-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <SelectField label="Cliente *" name="clienteId" value={form.clienteId} onChange={handle}>
                <option value="">Selecione...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </SelectField>
              <SelectField label="Profissional *" name="profissionalId" value={form.profissionalId} onChange={handle}>
                <option value="">Selecione...</option>
                {profissionais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </SelectField>
              <SelectField label="Tipo de Serviço *" name="tipoServico" value={form.tipoServico} onChange={handle}>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
              </SelectField>
              <div className="grid grid-cols-2 gap-4">
                <TextInput label="Data e Hora *" name="dataHora" type="datetime-local" value={form.dataHora} onChange={handle} />
                <TextInput label="Duração (min) *" name="duracao" type="number" value={form.duracao} onChange={handle} />
              </div>
              {editing && (
                <SelectField label="Status" name="status" value={form.status} onChange={handle}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </SelectField>
              )}
              <div>
                <label className="block text-bark-600 text-xs font-medium mb-1.5">Observações</label>
                <textarea name="observacoes" value={form.observacoes} onChange={handle} rows={3}
                  className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300 resize-none" />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button onClick={() => setModal(false)} className="px-5 py-2.5 border border-sand-200 text-bark-600 rounded-xl text-sm hover:bg-sand-50 transition-colors">Cancelar</button>
              <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-bark-700 text-sand-50 rounded-xl text-sm font-medium hover:bg-bark-800 transition-colors flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function SelectField({ label, name, value, onChange, children }) {
  return (
    <div>
      <label className="block text-bark-600 text-xs font-medium mb-1.5">{label}</label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange} required
          className="w-full appearance-none px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300">
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bark-400 pointer-events-none" />
      </div>
    </div>
  );
}

function TextInput({ label, name, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-bark-600 text-xs font-medium mb-1.5">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} required
        className="w-full px-4 py-3 bg-sand-50 border border-sand-200 rounded-xl text-sm text-bark-800 focus:outline-none focus:ring-2 focus:ring-sand-300" />
    </div>
  );
}
