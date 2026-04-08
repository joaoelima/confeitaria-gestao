const mongoose = require('mongoose');

const fichaTecnicaItemSchema = new mongoose.Schema(
  {
    insumo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Insumo',
      required: true,
    },
    nomeInsumo: {
      type: String,
      required: true,
      trim: true,
    },
    quantidade: {
      type: Number,
      required: true,
      min: 0,
    },
    unidade: {
      type: String,
      required: true,
      trim: true,
    },
    custoUnitarioNoCadastro: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    categoria: {
      type: String,
      default: 'Geral',
      trim: true,
    },
    precoVenda: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    estoqueAtual: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    fichaTecnica: {
      type: [fichaTecnicaItemSchema],
      default: [],
    },
    custoEstimadoUnitario: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Produto', produtoSchema);
