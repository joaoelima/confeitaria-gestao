const express = require('express');
const Empresa = require('../models/Empresa');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let empresa = await Empresa.findOne().sort({ createdAt: 1 });

    if (!empresa) {
      empresa = await Empresa.create({
        nomeFantasia: 'Minha Confeitaria',
        regimeTributario: 'simples_nacional',
        aliquotaEstimativa: 6,
        impostoFixoMensal: 0,
      });
    }

    return res.json(empresa);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar empresa', erro: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const dados = req.body;
    let empresa = await Empresa.findOne().sort({ createdAt: 1 });

    if (!empresa) {
      empresa = new Empresa({ ...dados, nomeFantasia: dados.nomeFantasia || 'Minha Confeitaria' });
    } else {
      Object.assign(empresa, dados);
    }

    await empresa.save();
    return res.json({ mensagem: 'Empresa atualizada com sucesso', empresa });
  } catch (error) {
    return res.status(400).json({ mensagem: 'Erro ao salvar empresa', erro: error.message });
  }
});

router.post('/consultar-cnpj', async (req, res) => {
  try {
    const { cnpj } = req.body;

    if (!cnpj) {
      return res.status(400).json({ mensagem: 'Informe um CNPJ para consulta' });
    }

    const apenasNumeros = String(cnpj).replace(/\D/g, '');

    if (apenasNumeros.length !== 14) {
      return res.status(400).json({ mensagem: 'CNPJ inválido. Informe 14 números.' });
    }

    return res.json({
      cnpj: apenasNumeros,
      mensagem:
        'Consulta automática de CNPJ não foi integrada nesta versão para evitar dependência frágil de serviço externo. O campo já está preparado para futura integração.',
      sugestao:
        'Preencha manualmente o regime tributário e a alíquota estimada com validação do contador.',
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao consultar CNPJ', erro: error.message });
  }
});

module.exports = router;
