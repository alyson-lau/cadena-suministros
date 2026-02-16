const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cadenaSuministros';

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => {
    console.log('❌ Error de conexión a MongoDB:', err.message);
    console.log('⚠️ Ejecutando sin base de datos');
  });

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/materiales', require('./routes/materiales'));
app.use('/api/auth', require('./routes/auth'));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    version: '2.0.0 - AngularJS + Materialize'
  });
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/app')) {
    return res.status(404).json({ error: 'Ruta no encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Cadena de Suministros - Servidor`);
  console.log(`========================================`);
  console.log(`  Frontend AngularJS: http://localhost:${PORT}/app`);
  console.log(`  API REST:          http://localhost:${PORT}/api`);
  console.log(`  Estado MongoDB:    ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'}`);
  console.log(`========================================\n`);
});

module.exports = app;
