const mongoose = require('mongoose');

const consumoInsumoSchema = new mongoose.Schema(
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
    quantidadeConsumida: {
      type: Number,
      required: true,
      min: 0,
    },
    unidade: {
      type: String,
      required: true,
      trim: true,
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
  },
  { _id: false }
);

const producaoSchema = new mongoose.Schema(
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
    quantidadeProduzida: {
      type: Number,
      required: true,
      min: 0,
    },
    custoTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    custoUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    consumoInsumos: {
      type: [consumoInsumoSchema],
      default: [],
    },
    observacoes: {
      type: String,
      default: '',
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

module.exports = mongoose.model('Producao', producaoSchema);
