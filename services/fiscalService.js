function calcularImpostoEstimado({ faturamento, regimeTributario, aliquotaEstimativa, impostoFixoMensal }) {
  const faturamentoSeguro = Number(faturamento) || 0;
  const aliquotaSegura = Number(aliquotaEstimativa) || 0;
  const impostoFixoSeguro = Number(impostoFixoMensal) || 0;

  let impostoEstimado = 0;
  let criterio = '';

  if (regimeTributario === 'mei') {
    impostoEstimado = impostoFixoSeguro;
    criterio = 'Valor fixo mensal configurado para MEI';
  } else {
    impostoEstimado = (faturamentoSeguro * aliquotaSegura) / 100;
    criterio = `Alíquota estimada de ${aliquotaSegura.toFixed(2)}% sobre o faturamento do período`;
  }

  return {
    impostoEstimado,
    criterio,
    observacao:
      'Este resumo fiscal é apenas estimativo e deve ser conferido por contador antes de qualquer envio oficial.',
  };
}

module.exports = {
  calcularImpostoEstimado,
};
