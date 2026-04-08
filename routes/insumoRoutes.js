const express = require('express');
const Insumo = require('../models/Insumo');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const insumos = await Insumo.find().sort({ nome: 1 });
    return res.json(insumos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar insumos', erro: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const insumo = await Insumo.create(req.body);
    return res.status(201).json({ mensagem: 'Insumo cadastrado com sucesso', insumo });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao cadastrar insumo', erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const insumo = await Insumo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!insumo) {
      return res.status(404).json({ mensagem: 'Insumo não encontrado' });
    }

    return res.json({ mensagem: 'Insumo atualizado com sucesso', insumo });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao atualizar insumo', erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const insumo = await Insumo.findByIdAndDelete(req.params.id);

    if (!insumo) {
      return res.status(404).json({ mensagem: 'Insumo não encontrado' });
    }

    return res.json({ mensagem: 'Insumo removido com sucesso' });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao remover insumo', erro: error.message });
  }
});

module.exports = router;
