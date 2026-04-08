require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const conectarBanco = require('./config/db');
const empresaRoutes = require('./routes/empresaRoutes');
const insumoRoutes = require('./routes/insumoRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const producaoRoutes = require('./routes/producaoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const despesaRoutes = require('./routes/despesaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const fiscalRoutes = require('./routes/fiscalRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

conectarBanco();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (_req, res) => {
  return res.json({ ok: true, mensagem: 'Servidor rodando bonito' });
});

app.use('/api/empresa', empresaRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/producoes', producaoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/despesas', despesaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fiscal', fiscalRoutes);

app.get('*', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
