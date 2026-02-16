const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  tipoDocumento: {
    type: String,
    enum: ['cc', 'ce', 'ti'],
    required: true
  },
  numeroDocumento: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tipoUsuario: {
    type: String,
    enum: ['lider', 'analista', 'desarrollador'],
    required: true
  },
  contraseña: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

usuarioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);
