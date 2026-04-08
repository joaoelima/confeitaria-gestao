const express = require('express');
const Produto = require('../models/Produto');
const Insumo = require('../models/Insumo');
const Producao = require('../models/Producao');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const producoes = await Producao.find().sort({ data: -1 });
    return res.json(producoes);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar produções', erro: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { produtoId, quantidadeProduzida, observacoes } = req.body;
    const quantidadeFinal = Number(quantidadeProduzida) || 0;

    if (quantidadeFinal <= 0) {
      return res.status(400).json({ mensagem: 'Informe uma quantidade válida para produção' });
    }

    const produto = await Produto.findById(produtoId);

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    if (!produto.fichaTecnica.length) {
      return res.status(400).json({ mensagem: 'O produto não possui ficha técnica cadastrada' });
    }

    const consumoInsumos = [];
    let custoTotal = 0;

    for (const item of produto.fichaTecnica) {
      const insumo = await Insumo.findById(item.insumo);

      if (!insumo) {
        return res.status(404).json({ mensagem: `Insumo não encontrado na ficha técnica: ${item.nomeInsumo}` });
      }

      const quantidadeConsumida = item.quantidade * quantidadeFinal;

      if (insumo.quantidadeEmEstoque < quantidadeConsumida) {
        return res.status(400).json({
          mensagem: `Estoque insuficiente para o insumo ${insumo.nome}. Necessário: ${quantidadeConsumida} ${insumo.unidade}`,
        });
      }

      const custoItemTotal = quantidadeConsumida * insumo.custoUnitario;
      custoTotal += custoItemTotal;

      insumo.quantidadeEmEstoque -= quantidadeConsumida;
      await insumo.save();

      consumoInsumos.push({
        insumo: insumo._id,
        nomeInsumo: insumo.nome,
        quantidadeConsumida,
        unidade: insumo.unidade,
        custoUnitario: insumo.custoUnitario,
        custoTotal: custoItemTotal,
      });
    }

    produto.estoqueAtual += quantidadeFinal;
    produto.custoEstimadoUnitario = custoTotal / quantidadeFinal;
    await produto.save();

    const producao = await Producao.create({
      produto: produto._id,
      nomeProduto: produto.nome,
      quantidadeProduzida: quantidadeFinal,
      custoTotal,
      custoUnitario: custoTotal / quantidadeFinal,
      consumoInsumos,
      observacoes,
    });

    return res.status(201).json({ mensagem: 'Produção registrada com sucesso', producao });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao registrar produção', erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const producao = await Producao.findByIdAndDelete(req.params.id);

    if (!producao) {
      return res.status(404).json({ mensagem: 'Produção não encontrada' });
    }

    return res.json({
      mensagem:
        'Produção removida. Observação: esta versão não faz estorno automático de estoque ao excluir uma produção já registrada.',
    });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao remover produção', erro: error.message });
  }
});

module.exports = router;
