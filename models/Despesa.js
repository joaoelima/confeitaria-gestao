const mongoose = require('mongoose');

const despesaSchema = new mongoose.Schema(
  {
    descricao: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      required: true,
      default: 'Geral',
      trim: true,
    },
    valor: {
      type: Number,
      required: true,
      min: 0,
    },
    data: {
      type: Date,
      default: Date.now,
    },
    observacoes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Despesa', despesaSchema);
