require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/agendamentos', require('./routes/agendamentos'));
app.use('/api', require('./routes/entities'));

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date() }));

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚿 Faxina API rodando em http://localhost:${PORT}`));
