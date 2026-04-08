const API = {
  dashboard: '/api/dashboard',
  empresa: '/api/empresa',
  consultarCnpj: '/api/empresa/consultar-cnpj',
  insumos: '/api/insumos',
  produtos: '/api/produtos',
  producoes: '/api/producoes',
  vendas: '/api/vendas',
  despesas: '/api/despesas',
  fiscal: '/api/fiscal/resumo',
};

const state = {
  empresa: null,
  insumos: [],
  produtos: [],
  producoes: [],
  vendas: [],
  despesas: [],
  dashboard: null,
  fichaIndex: 0,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

function getMesAnoAtual() {
  const now = new Date();
  return {
    mes: now.getMonth() + 1,
    ano: now.getFullYear(),
  };
}

function setToast(message, isError = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.style.background = isError ? '#991b1b' : '#111827';
  setTimeout(() => toast.classList.add('hidden'), 3200);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.mensagem || 'Erro inesperado na requisição');
  }

  return data;
}

function trocarSecao(section) {
  $$('.menu-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === section);
  });

  $$('.section').forEach((item) => item.classList.remove('active'));
  $(`#section-${section}`).classList.add('active');
  $('#tituloSecao').textContent =
    {
      dashboard: 'Dashboard',
      empresa: 'Empresa',
      insumos: 'Insumos',
      produtos: 'Produtos',
      producao: 'Produção',
      vendas: 'Vendas',
      despesas: 'Despesas',
      fiscal: 'Resumo Fiscal',
    }[section] || 'Dashboard';
}

function preencherFormulario(form, data) {
  if (!form || !data) return;

  Array.from(form.elements).forEach((field) => {
    if (!field.name) return;
    field.value = data[field.name] ?? '';
  });
}

function obterDadosFormulario(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function limparFormulario(form) {
  form.reset();
}

function gerarCSV(rows, headers, nomeArquivo) {
  const csvContent = [headers.join(';')]
    .concat(
      rows.map((row) =>
        row
          .map((item) => `"${String(item ?? '').replaceAll('"', '""')}"`)
          .join(';')
      )
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  URL.revokeObjectURL(url);
}

function renderDashboard() {
  const container = $('#dashboardCards');
  const data = state.dashboard;

  if (!data) {
    container.innerHTML = '<div class="card">Sem dados ainda.</div>';
    return;
  }

  const cards = [
    ['Faturamento do mês', formatCurrency(data.faturamento)],
    ['Lucro bruto', formatCurrency(data.lucroBruto)],
    ['Lucro líquido', formatCurrency(data.lucroLiquido)],
    ['Despesas do mês', formatCurrency(data.totalDespesas)],
    ['Custo de produção', formatCurrency(data.custoProducao)],
    ['Estoque de produtos', formatCurrency(data.valorEstoqueProdutos)],
    ['Estoque de insumos', formatCurrency(data.valorEstoqueInsumos)],
    ['Total de vendas', data.totalVendas],
  ];

  container.innerHTML = cards
    .map(
      ([title, value]) => `
        <article class="info-card">
          <h4>${title}</h4>
          <strong>${value}</strong>
        </article>
      `
    )
    .join('');
}

function renderInsumos() {
  const tbody = $('#tbodyInsumos');

  tbody.innerHTML = state.insumos
    .map((insumo) => {
      const alerta = Number(insumo.quantidadeEmEstoque) <= Number(insumo.estoqueMinimo || 0);
      return `
        <tr>
          <td>
            ${insumo.nome}
            ${alerta ? '<div class="badge-alerta">Estoque baixo</div>' : ''}
          </td>
          <td>${insumo.unidade}</td>
          <td>${insumo.quantidadeEmEstoque}</td>
          <td>${formatCurrency(insumo.custoUnitario)}</td>
          <td>${insumo.estoqueMinimo || 0}</td>
          <td><button class="danger-btn" onclick="excluirRegistro('insumo', '${insumo._id}')">Excluir</button></td>
        </tr>
      `;
    })
    .join('');
}

function renderProdutos() {
  const tbody = $('#tbodyProdutos');

  tbody.innerHTML = state.produtos
    .map(
      (produto) => `
        <tr>
          <td>${produto.nome}</td>
          <td>${produto.categoria || '-'}</td>
          <td>${formatCurrency(produto.precoVenda)}</td>
          <td>${formatCurrency(produto.custoEstimadoUnitario)}</td>
          <td>${produto.estoqueAtual}</td>
          <td><button class="danger-btn" onclick="excluirRegistro('produto', '${produto._id}')">Excluir</button></td>
        </tr>
      `
    )
    .join('');

  popularSelectProdutos();
}

function renderProducoes() {
  const tbody = $('#tbodyProducoes');

  tbody.innerHTML = state.producoes
    .map(
      (item) => `
        <tr>
          <td>${item.nomeProduto}</td>
          <td>${item.quantidadeProduzida}</td>
          <td>${formatCurrency(item.custoTotal)}</td>
          <td>${formatCurrency(item.custoUnitario)}</td>
          <td>${formatDate(item.data)}</td>
          <td><button class="danger-btn" onclick="excluirRegistro('producao', '${item._id}')">Excluir</button></td>
        </tr>
      `
    )
    .join('');
}

function renderVendas() {
  const tbody = $('#tbodyVendas');

  tbody.innerHTML = state.vendas
    .map(
      (item) => `
        <tr>
          <td>${item.nomeProduto}</td>
          <td>${item.quantidadeVendida}</td>
          <td>${formatCurrency(item.faturamentoTotal)}</td>
          <td>${formatCurrency(item.lucroBruto)}</td>
          <td>${formatDate(item.data)}</td>
          <td><button class="danger-btn" onclick="excluirRegistro('venda', '${item._id}')">Excluir</button></td>
        </tr>
      `
    )
    .join('');
}

function renderDespesas() {
  const tbody = $('#tbodyDespesas');

  tbody.innerHTML = state.despesas
    .map(
      (item) => `
        <tr>
          <td>${item.descricao}</td>
          <td>${item.categoria}</td>
          <td>${formatCurrency(item.valor)}</td>
          <td>${formatDate(item.data)}</td>
          <td><button class="danger-btn" onclick="excluirRegistro('despesa', '${item._id}')">Excluir</button></td>
        </tr>
      `
    )
    .join('');
}

function popularSelectProdutos() {
  const options = ['<option value="">Selecione...</option>']
    .concat(
      state.produtos.map(
        (produto) =>
          `<option value="${produto._id}">${produto.nome} | Estoque: ${produto.estoqueAtual} | Venda: ${formatCurrency(
            produto.precoVenda
          )}</option>`
      )
    )
    .join('');

  $('#selectProdutoProducao').innerHTML = options;
  $('#selectProdutoVenda').innerHTML = options;
}

function criarLinhaFichaTecnica() {
  state.fichaIndex += 1;

  const wrapper = document.createElement('div');
  wrapper.className = 'ficha-item';
  wrapper.dataset.index = state.fichaIndex;

  wrapper.innerHTML = `
    <label>
      Insumo
      <select class="ficha-insumo" required>
        <option value="">Selecione...</option>
        ${state.insumos.map((insumo) => `<option value="${insumo._id}">${insumo.nome} (${insumo.unidade})</option>`).join('')}
      </select>
    </label>
    <label>
      Quantidade usada por unidade produzida
      <input type="number" step="0.01" class="ficha-quantidade" required />
    </label>
    <button type="button" class="danger-btn btn-remover-ficha">Remover</button>
  `;

  wrapper.querySelector('.btn-remover-ficha').addEventListener('click', () => wrapper.remove());
  $('#fichaTecnicaContainer').appendChild(wrapper);
}


function atualizarFichaTecnicaVisual() {
  const container = $('#fichaTecnicaContainer');
  if (!container) return;

  if (!state.insumos.length) {
    container.innerHTML = '<div class="info-box">Cadastre insumos primeiro para montar a ficha técnica.</div>';
    return;
  }

  const semLinhas = !container.querySelector('.ficha-item');
  if (semLinhas) {
    container.innerHTML = '';
    criarLinhaFichaTecnica();
  }
}

function coletarFichaTecnica() {
  return Array.from(document.querySelectorAll('.ficha-item'))
    .map((item) => ({
      insumoId: item.querySelector('.ficha-insumo').value,
      quantidade: Number(item.querySelector('.ficha-quantidade').value || 0),
    }))
    .filter((item) => item.insumoId && item.quantidade > 0);
}

async function carregarEmpresa() {
  state.empresa = await request(API.empresa);
  preencherFormulario($('#formEmpresa'), state.empresa);
}

async function carregarDashboard() {
  const { mes, ano } = getMesAnoAtual();
  state.dashboard = await request(`${API.dashboard}?mes=${mes}&ano=${ano}`);
  renderDashboard();
}

async function carregarInsumos() {
  state.insumos = await request(API.insumos);
  renderInsumos();
  atualizarFichaTecnicaVisual();
}

async function carregarProdutos() {
  state.produtos = await request(API.produtos);
  renderProdutos();
}

async function carregarProducoes() {
  state.producoes = await request(API.producoes);
  renderProducoes();
}

async function carregarVendas() {
  state.vendas = await request(API.vendas);
  renderVendas();
}

async function carregarDespesas() {
  state.despesas = await request(API.despesas);
  renderDespesas();
}

async function carregarResumoFiscal() {
  const valor = $('#filtroFiscal').value;
  let mes;
  let ano;

  if (valor) {
    [ano, mes] = valor.split('-').map(Number);
  } else {
    const atual = getMesAnoAtual();
    mes = atual.mes;
    ano = atual.ano;
  }

  try {
    const resumo = await request(`${API.fiscal}?mes=${mes}&ano=${ano}`);

    $('#resumoFiscal').innerHTML = `
      <div class="fiscal-resumo-grid">
        <div class="fiscal-card"><span>Empresa</span><strong>${resumo.empresa.nomeFantasia}</strong></div>
        <div class="fiscal-card"><span>CNPJ</span><strong>${resumo.empresa.cnpj || 'Não informado'}</strong></div>
        <div class="fiscal-card"><span>Regime</span><strong>${resumo.empresa.regimeTributario.replaceAll('_', ' ')}</strong></div>
        <div class="fiscal-card"><span>Período</span><strong>${String(resumo.periodo.mes).padStart(2, '0')}/${resumo.periodo.ano}</strong></div>
        <div class="fiscal-card"><span>Faturamento bruto</span><strong>${formatCurrency(resumo.faturamentoBruto)}</strong></div>
        <div class="fiscal-card"><span>Custo dos produtos vendidos</span><strong>${formatCurrency(
          resumo.custoProdutosVendidos
        )}</strong></div>
        <div class="fiscal-card"><span>Despesas operacionais</span><strong>${formatCurrency(
          resumo.despesasOperacionais
        )}</strong></div>
        <div class="fiscal-card"><span>Lucro estimado</span><strong>${formatCurrency(resumo.lucroEstimado)}</strong></div>
        <div class="fiscal-card"><span>Imposto estimado</span><strong>${formatCurrency(resumo.impostoEstimado)}</strong></div>
        <div class="fiscal-card"><span>Critério</span><strong>${resumo.criterioCalculo}</strong></div>
      </div>
      <div class="info-box">
${resumo.observacao}

Observações da empresa:
${resumo.empresa.observacoesFiscais || 'Nenhuma observação cadastrada.'}
      </div>
    `;
  } catch (error) {
    $('#resumoFiscal').innerHTML = `<div class="info-box">${error.message}</div>`;
  }
}

async function carregarTudo() {
  try {
    await Promise.all([
      carregarEmpresa(),
      carregarInsumos(),
      carregarProdutos(),
      carregarProducoes(),
      carregarVendas(),
      carregarDespesas(),
      carregarDashboard(),
    ]);
    await carregarResumoFiscal();
  } catch (error) {
    setToast(error.message, true);
  }
}

async function salvarEmpresa(event) {
  event.preventDefault();
  const dados = obterDadosFormulario(event.target);

  dados.aliquotaEstimativa = Number(dados.aliquotaEstimativa || 0);
  dados.impostoFixoMensal = Number(dados.impostoFixoMensal || 0);

  try {
    await request(API.empresa, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
    setToast('Empresa salva com sucesso');
    await carregarEmpresa();
    await carregarResumoFiscal();
  } catch (error) {
    setToast(error.message, true);
  }
}

async function consultarCnpj() {
  const cnpj = $('#formEmpresa [name="cnpj"]').value;

  try {
    const resposta = await request(API.consultarCnpj, {
      method: 'POST',
      body: JSON.stringify({ cnpj }),
    });

    $('#resultadoConsultaCnpj').textContent = `${resposta.mensagem}\n\n${resposta.sugestao}`;
    setToast('Consulta de CNPJ validada');
  } catch (error) {
    $('#resultadoConsultaCnpj').textContent = error.message;
    setToast(error.message, true);
  }
}

async function salvarInsumo(event) {
  event.preventDefault();
  const dados = obterDadosFormulario(event.target);
  dados.quantidadeEmEstoque = Number(dados.quantidadeEmEstoque || 0);
  dados.custoUnitario = Number(dados.custoUnitario || 0);
  dados.estoqueMinimo = Number(dados.estoqueMinimo || 0);

  try {
    await request(API.insumos, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    limparFormulario(event.target);
    setToast('Insumo salvo com sucesso');
    await carregarInsumos();
    await carregarProdutos();
    await carregarDashboard();
  } catch (error) {
    setToast(error.message, true);
  }
}

async function salvarProduto(event) {
  event.preventDefault();
  const dados = obterDadosFormulario(event.target);
  const fichaTecnica = coletarFichaTecnica();

  if (!fichaTecnica.length) {
    setToast('Adicione pelo menos um item na ficha técnica', true);
    return;
  }

  try {
    await request(API.produtos, {
      method: 'POST',
      body: JSON.stringify({
        nome: dados.nome,
        categoria: dados.categoria,
        precoVenda: Number(dados.precoVenda || 0),
        fichaTecnica,
      }),
    });

    limparFormulario(event.target);
    $('#fichaTecnicaContainer').innerHTML = '';
    criarLinhaFichaTecnica();
    setToast('Produto salvo com sucesso');
    await carregarProdutos();
    await carregarDashboard();
  } catch (error) {
    setToast(error.message, true);
  }
}

async function salvarProducao(event) {
  event.preventDefault();
  const dados = obterDadosFormulario(event.target);

  try {
    await request(API.producoes, {
      method: 'POST',
      body: JSON.stringify({
        produtoId: dados.produtoId,
        quantidadeProduzida: Number(dados.quantidadeProduzida || 0),
        observacoes: dados.observacoes,
      }),
    });
    limparFormulario(event.target);
    setToast('Produção registrada com sucesso');
    await Promise.all([carregarProducoes(), carregarInsumos(), carregarProdutos(), carregarDashboard(), carregarResumoFiscal()]);
  } catch (error) {
    setToast(error.message, true);
  }
}

async function salvarVenda(event) {
  event.preventDefault();
  const dados = obterDadosFormulario(event.target);

  try {
    await request(API.vendas, {
      method: 'POST',
      body: JSON.stringify({
        produtoId: dados.produtoId,
        quantidadeVendida: Number(dados.quantidadeVendida || 0),
        valorUnitario: Number(dados.valorUnitario || 0),
        cliente: dados.cliente,
        formaPagamento: dados.formaPagamento,
      }),
    });
    limparFormulario(event.target);
    setToast('Venda registrada com sucesso');
    await Promise.all([carregarVendas(), carregarProdutos(), carregarDashboard(), carregarResumoFiscal()]);
  } catch (error) {
    setToast(error.message, true);
  }
}

async function salvarDespesa(event) {
  event.preventDefault();
  const dados = obterDadosFormulario(event.target);
  dados.valor = Number(dados.valor || 0);
  dados.data = dados.data || new Date().toISOString();

  try {
    await request(API.despesas, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    limparFormulario(event.target);
    setToast('Despesa salva com sucesso');
    await Promise.all([carregarDespesas(), carregarDashboard(), carregarResumoFiscal()]);
  } catch (error) {
    setToast(error.message, true);
  }
}

async function excluirRegistro(tipo, id) {
  const mapa = {
    insumo: API.insumos,
    produto: API.produtos,
    producao: API.producoes,
    venda: API.vendas,
    despesa: API.despesas,
  };

  const confirmar = window.confirm('Quer mesmo excluir este registro?');
  if (!confirmar) return;

  try {
    await request(`${mapa[tipo]}/${id}`, { method: 'DELETE' });
    setToast('Registro excluído');
    await carregarTudo();
  } catch (error) {
    setToast(error.message, true);
  }
}

window.excluirRegistro = excluirRegistro;

function configurarMenu() {
  $$('.menu-btn').forEach((button) => {
    button.addEventListener('click', () => trocarSecao(button.dataset.section));
  });
}

function configurarExportacoes() {
  $('#btnExportarInsumos').addEventListener('click', () => {
    gerarCSV(
      state.insumos.map((item) => [item.nome, item.unidade, item.quantidadeEmEstoque, item.custoUnitario, item.estoqueMinimo]),
      ['Nome', 'Unidade', 'Quantidade em estoque', 'Custo unitário', 'Estoque mínimo'],
      'insumos.csv'
    );
  });

  $('#btnExportarProdutos').addEventListener('click', () => {
    gerarCSV(
      state.produtos.map((item) => [item.nome, item.categoria, item.precoVenda, item.custoEstimadoUnitario, item.estoqueAtual]),
      ['Nome', 'Categoria', 'Preço de venda', 'Custo estimado unitário', 'Estoque atual'],
      'produtos.csv'
    );
  });

  $('#btnExportarProducoes').addEventListener('click', () => {
    gerarCSV(
      state.producoes.map((item) => [item.nomeProduto, item.quantidadeProduzida, item.custoTotal, item.custoUnitario, formatDate(item.data)]),
      ['Produto', 'Quantidade produzida', 'Custo total', 'Custo unitário', 'Data'],
      'producoes.csv'
    );
  });

  $('#btnExportarVendas').addEventListener('click', () => {
    gerarCSV(
      state.vendas.map((item) => [item.nomeProduto, item.quantidadeVendida, item.faturamentoTotal, item.lucroBruto, formatDate(item.data)]),
      ['Produto', 'Quantidade vendida', 'Faturamento total', 'Lucro bruto', 'Data'],
      'vendas.csv'
    );
  });

  $('#btnExportarDespesas').addEventListener('click', () => {
    gerarCSV(
      state.despesas.map((item) => [item.descricao, item.categoria, item.valor, formatDate(item.data)]),
      ['Descrição', 'Categoria', 'Valor', 'Data'],
      'despesas.csv'
    );
  });
}

function configurarEventos() {
  $('#formEmpresa').addEventListener('submit', salvarEmpresa);
  $('#btnConsultarCnpj').addEventListener('click', consultarCnpj);
  $('#formInsumo').addEventListener('submit', salvarInsumo);
  $('#formProduto').addEventListener('submit', salvarProduto);
  $('#formProducao').addEventListener('submit', salvarProducao);
  $('#formVenda').addEventListener('submit', salvarVenda);
  $('#formDespesa').addEventListener('submit', salvarDespesa);
  $('#btnAtualizarTudo').addEventListener('click', carregarTudo);
  $('#btnAdicionarItemFicha').addEventListener('click', criarLinhaFichaTecnica);
  $('#filtroFiscal').addEventListener('change', carregarResumoFiscal);
  $('#btnImprimirFiscal').addEventListener('click', () => window.print());
}

function configurarDataFiscal() {
  const { mes, ano } = getMesAnoAtual();
  $('#filtroFiscal').value = `${ano}-${String(mes).padStart(2, '0')}`;
}

async function iniciar() {
  configurarMenu();
  configurarEventos();
  configurarExportacoes();
  configurarDataFiscal();
  await carregarTudo();
  atualizarFichaTecnicaVisual();
}

iniciar();
