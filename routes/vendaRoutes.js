const express = require('express');
const Produto = require('../models/Produto');
const Venda = require('../models/Venda');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const vendas = await Venda.find().sort({ data: -1 });
    return res.json(vendas);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar vendas', erro: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { produtoId, quantidadeVendida, valorUnitario, cliente, formaPagamento } = req.body;
    const quantidadeFinal = Number(quantidadeVendida) || 0;
    const valorUnitarioFinal = Number(valorUnitario) || 0;

    if (quantidadeFinal <= 0 || valorUnitarioFinal < 0) {
      return res.status(400).json({ mensagem: 'Informe quantidade e valor unitário válidos' });
    }

    const produto = await Produto.findById(produtoId);

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    if (produto.estoqueAtual < quantidadeFinal) {
      return res.status(400).json({ mensagem: 'Estoque do produto insuficiente para esta venda' });
    }

    const faturamentoTotal = quantidadeFinal * valorUnitarioFinal;
    const custoUnitario = Number(produto.custoEstimadoUnitario) || 0;
    const custoTotal = custoUnitario * quantidadeFinal;
    const lucroBruto = faturamentoTotal - custoTotal;

    produto.estoqueAtual -= quantidadeFinal;
    await produto.save();

    const venda = await Venda.create({
      produto: produto._id,
      nomeProduto: produto.nome,
      quantidadeVendida: quantidadeFinal,
      valorUnitario: valorUnitarioFinal,
      faturamentoTotal,
      custoUnitario,
      custoTotal,
      lucroBruto,
      cliente,
      formaPagamento,
    });

    return res.status(201).json({ mensagem: 'Venda registrada com sucesso', venda });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao registrar venda', erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const venda = await Venda.findByIdAndDelete(req.params.id);

    if (!venda) {
      return res.status(404).json({ mensagem: 'Venda não encontrada' });
    }

    return res.json({
      mensagem:
        'Venda removida. Observação: esta versão não faz retorno automático do estoque ao excluir uma venda já registrada.',
    });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao remover venda', erro: error.message });
  }
});

module.exports = router;
