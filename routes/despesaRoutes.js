const express = require('express');
const Despesa = require('../models/Despesa');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const despesas = await Despesa.find().sort({ data: -1 });
    return res.json(despesas);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar despesas', erro: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const despesa = await Despesa.create(req.body);
    return res.status(201).json({ mensagem: 'Despesa cadastrada com sucesso', despesa });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao cadastrar despesa', erro: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const despesa = await Despesa.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!despesa) {
      return res.status(404).json({ mensagem: 'Despesa não encontrada' });
    }

    return res.json({ mensagem: 'Despesa atualizada com sucesso', despesa });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao atualizar despesa', erro: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const despesa = await Despesa.findByIdAndDelete(req.params.id);

    if (!despesa) {
      return res.status(404).json({ mensagem: 'Despesa não encontrada' });
    }

    return res.json({ mensagem: 'Despesa removida com sucesso' });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao remover despesa', erro: error.message });
  }
});

module.exports = router;
