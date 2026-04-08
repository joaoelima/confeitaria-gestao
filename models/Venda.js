const mongoose = require('mongoose');

const vendaSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto',
      required: true,
    },
    nomeProduto: {
      type: String,
      required: true,
      trim: true,
    },
    quantidadeVendida: {
      type: Number,
      required: true,
      min: 0,
    },
    valorUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    faturamentoTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    custoUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    custoTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    lucroBruto: {
      type: Number,
      required: true,
    },
    cliente: {
      type: String,
      default: '',
      trim: true,
    },
    formaPagamento: {
      type: String,
      default: 'Não informado',
      trim: true,
    },
    data: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Venda', vendaSchema);
