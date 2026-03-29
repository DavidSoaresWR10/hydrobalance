const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── TESTE DE CONEXÃO ──────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', timestamp: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════
// OPERAÇÕES (CRUD)
// ══════════════════════════════════════════════════════

app.get('/api/operacoes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM operacoes ORDER BY atualizado_em DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/operacoes/:id', async (req, res) => {
  try {
    const op = await pool.query('SELECT * FROM operacoes WHERE id = $1', [req.params.id]);
    if (op.rows.length === 0) return res.status(404).json({ error: 'Operação não encontrada' });
    const bal = await pool.query('SELECT * FROM balanco WHERE operacao_id = $1', [req.params.id]);
    res.json({ operacao: op.rows[0], balanco: bal.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/operacoes', async (req, res) => {
  let {
    usuario_id, nome, empresa, ano, uf, bacia, tipo_minerio,
    clima, estresse_hidrico, metodo_lavra, corpo_captacao,
    corpo_lancamento, cbh, responsavel
  } = req.body;

  try {
    if (!usuario_id) {
      const u = await pool.query('SELECT id FROM usuarios LIMIT 1');
      if (u.rows.length === 0) return res.status(400).json({ error: 'Nenhum usuário cadastrado' });
      usuario_id = u.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO operacoes 
       (usuario_id, nome, empresa, ano, uf, bacia, tipo_minerio, clima, 
        estresse_hidrico, metodo_lavra, corpo_captacao, corpo_lancamento, cbh, responsavel)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [usuario_id, nome, empresa, ano, uf, bacia, tipo_minerio, clima,
        estresse_hidrico, metodo_lavra, corpo_captacao, corpo_lancamento, cbh, responsavel]
    );

    await pool.query('INSERT INTO balanco (operacao_id) VALUES ($1)', [result.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/operacoes/:id', async (req, res) => {
  const {
    nome, empresa, ano, uf, bacia, tipo_minerio, clima,
    estresse_hidrico, metodo_lavra, corpo_captacao,
    corpo_lancamento, cbh, responsavel
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE operacoes SET
       nome=$1, empresa=$2, ano=$3, uf=$4, bacia=$5, tipo_minerio=$6,
       clima=$7, estresse_hidrico=$8, metodo_lavra=$9, corpo_captacao=$10,
       corpo_lancamento=$11, cbh=$12, responsavel=$13, atualizado_em=CURRENT_TIMESTAMP
       WHERE id=$14 RETURNING *`,
      [nome, empresa, ano, uf, bacia, tipo_minerio, clima, estresse_hidrico,
        metodo_lavra, corpo_captacao, corpo_lancamento, cbh, responsavel, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/operacoes/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM operacoes WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Não encontrada' });
    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════
// BALANÇO HÍDRICO
// ══════════════════════════════════════════════════════

app.put('/api/balanco/:operacao_id', async (req, res) => {
  const fields = [
    'c_sup_a', 'c_sup_b', 'c_sub_a', 'c_sub_b', 'c_mar_a', 'c_mar_b',
    'c_ter_a', 'c_ter_b', 'c_rom',
    'oag_dew_a', 'oag_dew_b', 'oag_div_a', 'oag_div_b',
    'prec_a', 'prec_b', 'prec_fonte', 'prec_mm',
    'd_sup_a', 'd_sup_b', 'd_sub_a', 'd_sub_b', 'd_ter_a', 'd_ter_b', 'd_sup_nome',
    'ds', 'rec', 'con_ev', 'con_prod', 'con_rej', 'tec1', 'tec2'
  ];

  const setClauses = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = fields.map(f => req.body[f] ?? null);
  values.push(req.params.operacao_id);

  try {
    const result = await pool.query(
      `UPDATE balanco SET ${setClauses}, atualizado_em=CURRENT_TIMESTAMP
       WHERE operacao_id = $${fields.length + 1} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Balanço não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════════════
// PROXY IA
// ══════════════════════════════════════════════════════
app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no .env' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: req.body.model || 'claude-sonnet-4-20250514',
        max_tokens: req.body.max_tokens || 1000,
        messages: req.body.messages,
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ══════════════════════════════════════════════════════
// SERVIR FRONTEND EM PRODUÇÃO
// ══════════════════════════════════════════════════════
const path = require('path');
const distPath = path.join(__dirname, '..', 'dist');

// Servir arquivos estáticos do build do Vite
app.use(express.static(distPath));

// Qualquer rota que não seja /api → index.html (SPA fallback)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// ══════════════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`🚀 HydroBalance API rodando em http://localhost:${PORT}`);
});