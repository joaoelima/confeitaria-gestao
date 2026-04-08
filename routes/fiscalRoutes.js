const express = require('express');
const Empresa = require('../models/Empresa');
const Venda = require('../models/Venda');
const Despesa = require('../models/Despesa');
const { calcularImpostoEstimado } = require('../services/fiscalService');

const router = express.Router();

function inicioFimDoMes(ano, mes) {
  const anoNumero = Number(ano);
  const mesNumero = Number(mes) - 1;
  const inicio = new Date(anoNumero, mesNumero, 1, 0, 0, 0, 0);
  const fim = new Date(anoNumero, mesNumero + 1, 1, 0, 0, 0, 0);
  return { inicio, fim };
}

router.get('/resumo', async (req, res) => {
  try {
    const agora = new Date();
    const mes = req.query.mes || agora.getMonth() + 1;
    const ano = req.query.ano || agora.getFullYear();
    const { inicio, fim } = inicioFimDoMes(ano, mes);

    const [empresa, vendas, despesas] = await Promise.all([
      Empresa.findOne().sort({ createdAt: 1 }),
      Venda.find({ data: { $gte: inicio, $lt: fim } }),
      Despesa.find({ data: { $gte: inicio, $lt: fim } }),
    ]);

    if (!empresa) {
      return res.status(404).json({ mensagem: 'Cadastre os dados da empresa antes de gerar o resumo fiscal' });
    }

    const faturamentoBruto = vendas.reduce((total, item) => total + item.faturamentoTotal, 0);
    const custoProdutosVendidos = vendas.reduce((total, item) => total + item.custoTotal, 0);
    const despesasOperacionais = despesas.reduce((total, item) => total + item.valor, 0);
    const lucroEstimado = faturamentoBruto - custoProdutosVendidos - despesasOperacionais;

    const calculo = calcularImpostoEstimado({
      faturamento: faturamentoBruto,
      regimeTributario: empresa.regimeTributario,
      aliquotaEstimativa: empresa.aliquotaEstimativa,
      impostoFixoMensal: empresa.impostoFixoMensal,
    });

    return res.json({
      empresa: {
        nomeFantasia: empresa.nomeFantasia,
        razaoSocial: empresa.razaoSocial,
        cnpj: empresa.cnpj,
        regimeTributario: empresa.regimeTributario,
        aliquotaEstimativa: empresa.aliquotaEstimativa,
        impostoFixoMensal: empresa.impostoFixoMensal,
        observacoesFiscais: empresa.observacoesFiscais,
      },
      periodo: { mes: Number(mes), ano: Number(ano) },
      faturamentoBruto,
      custoProdutosVendidos,
      despesasOperacionais,
      lucroEstimado,
      impostoEstimado: calculo.impostoEstimado,
      criterioCalculo: calculo.criterio,
      observacao: calculo.observacao,
      totalVendasNoPeriodo: vendas.length,
      totalDespesasNoPeriodo: despesas.length,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao gerar resumo fiscal', erro: error.message });
  }
});

module.exports = router;
