const mongoose = require('mongoose');

const insumoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    unidade: {
      type: String,
      required: true,
      trim: true,
    },
    quantidadeEmEstoque: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    custoUnitario: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    estoqueMinimo: {
      type: Number,
      default: 0,
      min: 0,
    },
    fornecedor: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Insumo', insumoSchema);
