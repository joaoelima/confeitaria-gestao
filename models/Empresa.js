const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema(
  {
    nomeFantasia: {
      type: String,
      required: true,
      trim: true,
    },
    razaoSocial: {
      type: String,
      default: '',
      trim: true,
    },
    cnpj: {
      type: String,
      default: '',
      trim: true,
    },
    regimeTributario: {
      type: String,
      enum: ['mei', 'simples_nacional', 'lucro_presumido', 'personalizado'],
      default: 'simples_nacional',
    },
    aliquotaEstimativa: {
      type: Number,
      default: 6,
      min: 0,
    },
    impostoFixoMensal: {
      type: Number,
      default: 0,
      min: 0,
    },
    observacoesFiscais: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Empresa', empresaSchema);
