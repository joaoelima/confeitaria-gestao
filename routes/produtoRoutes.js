const express = require('express');
const Produto = require('../models/Produto');
const Insumo = require('../models/Insumo');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const produtos = await Produto.find().sort({ nome: 1 });
    return res.json(produtos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar produtos', erro: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, categoria, precoVenda, fichaTecnica = [] } = req.body;

    const fichaProcessada = [];
    let custoEstimadoUnitario = 0;

    for (const item of fichaTecnica) {
      const insumo = await Insumo.findById(item.insumoId);

      if (!insumo) {
        return res.status(404).json({ mensagem: `Insumo não encontrado: ${item.insumoId}` });
      }

      const quantidade = Number(item.quantidade) || 0;
      const custoItem = quantidade * insumo.custoUnitario;
      custoEstimadoUnitario += custoItem;

      fichaProcessada.push({
        insumo: insumo._id,
        nomeInsumo: insumo.nome,
        quantidade,
        unidade: insumo.unidade,
        custoUnitarioNoCadastro: insumo.custoUnitario,
      });
    }

    const produto = await Produto.create({
      nome,
      categoria,
      precoVenda,
      fichaTecnica: fichaProcessada,
      custoEstimadoUnitario,
    });

    return res.status(201).json({ mensagem: 'Produto cadastrado com sucesso', produto });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao cadastrar produto', erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, categoria, precoVenda, fichaTecnica = [] } = req.body;
    const produtoExistente = await Produto.findById(req.params.id);

    if (!produtoExistente) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    const fichaProcessada = [];
    let custoEstimadoUnitario = 0;

    for (const item of fichaTecnica) {
      const insumo = await Insumo.findById(item.insumoId);

      if (!insumo) {
        return res.status(404).json({ mensagem: `Insumo não encontrado: ${item.insumoId}` });
      }

      const quantidade = Number(item.quantidade) || 0;
      const custoItem = quantidade * insumo.custoUnitario;
      custoEstimadoUnitario += custoItem;

      fichaProcessada.push({
        insumo: insumo._id,
        nomeInsumo: insumo.nome,
        quantidade,
        unidade: insumo.unidade,
        custoUnitarioNoCadastro: insumo.custoUnitario,
      });
    }

    produtoExistente.nome = nome;
    produtoExistente.categoria = categoria;
    produtoExistente.precoVenda = precoVenda;
    produtoExistente.fichaTecnica = fichaProcessada;
    produtoExistente.custoEstimadoUnitario = custoEstimadoUnitario;

    await produtoExistente.save();

    return res.json({ mensagem: 'Produto atualizado com sucesso', produto: produtoExistente });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao atualizar produto', erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.json({ mensagem: 'Produto removido com sucesso' });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao remover produto', erro: error.message });
  }
});

module.exports = router;
