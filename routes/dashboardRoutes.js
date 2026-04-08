const express = require('express');
const Produto = require('../models/Produto');
const Insumo = require('../models/Insumo');
const Venda = require('../models/Venda');
const Despesa = require('../models/Despesa');
const Producao = require('../models/Producao');

const router = express.Router();

function inicioFimDoMes(ano, mes) {
  const anoNumero = Number(ano);
  const mesNumero = Number(mes) - 1;
  const inicio = new Date(anoNumero, mesNumero, 1, 0, 0, 0, 0);
  const fim = new Date(anoNumero, mesNumero + 1, 1, 0, 0, 0, 0);
  return { inicio, fim };
}

router.get('/', async (req, res) => {
  try {
    const agora = new Date();
    const mes = req.query.mes || agora.getMonth() + 1;
    const ano = req.query.ano || agora.getFullYear();
    const { inicio, fim } = inicioFimDoMes(ano, mes);

    const [vendas, despesas, producoes, produtos, insumos] = await Promise.all([
      Venda.find({ data: { $gte: inicio, $lt: fim } }),
      Despesa.find({ data: { $gte: inicio, $lt: fim } }),
      Producao.find({ data: { $gte: inicio, $lt: fim } }),
      Produto.find(),
      Insumo.find(),
    ]);

    const faturamento = vendas.reduce((total, item) => total + item.faturamentoTotal, 0);
    const custoProdutosVendidos = vendas.reduce((total, item) => total + item.custoTotal, 0);
    const totalDespesas = despesas.reduce((total, item) => total + item.valor, 0);
    const lucroBruto = faturamento - custoProdutosVendidos;
    const lucroLiquido = lucroBruto - totalDespesas;
    const custoProducao = producoes.reduce((total, item) => total + item.custoTotal, 0);
    const valorEstoqueProdutos = produtos.reduce(
      (total, item) => total + item.estoqueAtual * (item.custoEstimadoUnitario || 0),
      0
    );
    const valorEstoqueInsumos = insumos.reduce(
      (total, item) => total + item.quantidadeEmEstoque * item.custoUnitario,
      0
    );

    return res.json({
      periodo: { mes: Number(mes), ano: Number(ano) },
      faturamento,
      custoProdutosVendidos,
      custoProducao,
      totalDespesas,
      lucroBruto,
      lucroLiquido,
      totalVendas: vendas.length,
      totalProducoes: producoes.length,
      totalProdutos: produtos.length,
      totalInsumos: insumos.length,
      valorEstoqueProdutos,
      valorEstoqueInsumos,
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao carregar dashboard', erro: error.message });
  }
});

module.exports = router;
