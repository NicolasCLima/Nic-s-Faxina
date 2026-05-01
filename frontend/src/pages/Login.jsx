import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Sparkles, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.senha);
        toast.success('Bem-vindo de volta!');
        navigate('/');
      } else {
        if (!form.nome.trim()) return toast.error('Informe seu nome.');
        if (form.senha.length < 6) return toast.error('Senha deve ter ao menos 6 caracteres.');
        if (form.senha !== form.confirmar) return toast.error('As senhas não conferem.');
        await register(form.nome, form.email, form.senha);
        toast.success('Conta criada! Faça login.');
        setMode('login');
        setForm({ nome: '', email: '', senha: '', confirmar: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-bark-700 overflow-hidden">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 text-sand-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sand-400 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-bark-900" />
            </div>
            <span className="font-display text-2xl font-semibold">Faxina+</span>
          </div>

          <div>
            <h1 className="font-display text-5xl font-bold leading-tight mb-6">
              Limpeza com<br />
              <span className="text-sand-300">organização</span>
            </h1>
            <p className="text-sand-200 text-lg leading-relaxed mb-10">
              Gerencie agendamentos, profissionais e clientes em um único lugar. Simples, rápido e eficiente.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Agendamentos', value: '500+' },
                { label: 'Profissionais', value: '30+' },
                { label: 'Clientes', value: '200+' },
              ].map(s => (
                <div key={s.label} className="bg-bark-800/50 rounded-2xl p-4 backdrop-blur-sm border border-sand-600/20">
                  <div className="font-display text-2xl font-bold text-sand-300">{s.value}</div>
                  <div className="text-sand-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-bark-400 text-sm">
            © 2025 Faxina+ · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-sand-50">
        <div className="w-full max-w-md page-enter">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-sand-400 rounded-xl flex items-center justify-center">
              <Sparkles size={18} className="text-bark-900" />
            </div>
            <span className="font-display text-xl font-semibold text-bark-900">Faxina+</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-bark-900 mb-1">
            {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>
          <p className="text-bark-500 mb-8">
            {mode === 'login'
              ? 'Use suas credenciais para acessar o sistema.'
              : 'Preencha os dados para criar sua conta.'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <InputField icon={<User size={16} />} name="nome" placeholder="Seu nome completo" value={form.nome} onChange={handle} />
            )}
            <InputField icon={<Mail size={16} />} name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handle} />
            <InputField icon={<Lock size={16} />} name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handle} />
            {mode === 'register' && (
              <InputField icon={<Lock size={16} />} name="confirmar" type="password" placeholder="Confirmar senha" value={form.confirmar} onChange={handle} />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-bark-700 hover:bg-bark-800 active:bg-bark-900 text-sand-50 font-medium py-3.5 px-6 rounded-xl transition-all duration-200 shadow-warm hover:shadow-warm-lg mt-2 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <span className="text-bark-500 text-sm">
              {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setForm({ nome: '', email: '', senha: '', confirmar: '' }); }}
              className="text-clay-600 hover:text-clay-700 font-medium text-sm transition-colors"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
            </button>
          </div>

          {/* Demo hint */}
          {mode === 'login' && (
            <div className="mt-8 bg-sand-100 border border-sand-200 rounded-xl p-4">
              <p className="text-bark-600 text-xs font-medium mb-1">Acesso demo:</p>
              <p className="text-bark-500 text-xs">admin@faxina.com · admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, name, type = 'text', placeholder, value, onChange }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bark-400">{icon}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full pl-10 pr-4 py-3.5 bg-white border border-sand-200 rounded-xl text-bark-800 placeholder-bark-300 text-sm focus:outline-none focus:ring-2 focus:ring-sand-300 focus:border-transparent transition-all"
      />
    </div>
  );
}
