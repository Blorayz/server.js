// ============================================
// Servidor de pontos para overlay RuCapitão
// Aloja no Render.com (gratuito)
// ============================================

const express = require('express');
const cors    = require('cors');
const fetch   = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Substitui pelo teu novo JWT Token (após regenerares)
const SE_JWT = process.env.SE_JWT || '';
const SE_CHANNEL = '60a96e1f23e4423710564961';
const CUSTO_PONTOS = 5;

const SE_BASE = 'https://api.streamelements.com/kappa/v2';

// GET /pontos/:username — ver pontos de um user
app.get('/pontos/:username', async (req, res) => {
  try {
    const r = await fetch(`${SE_BASE}/points/${SE_CHANNEL}/${req.params.username}`, {
      headers: { Authorization: `Bearer ${SE_JWT}` }
    });
    const data = await r.json();
    res.json({ points: data.points ?? 0 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /valores/:username — verifica e debita 5 pontos
app.post('/valores/:username', async (req, res) => {
  try {
    // 1. Ver quantos pontos tem
    const r1 = await fetch(`${SE_BASE}/points/${SE_CHANNEL}/${req.params.username}`, {
      headers: { Authorization: `Bearer ${SE_JWT}` }
    });
    const data = await r1.json();
    const total = data.points ?? 0;

    if (total < CUSTO_PONTOS) {
      return res.json({ ok: false, reason: 'pontos_insuficientes', points: total });
    }

    // 2. Debitar os pontos
    const r2 = await fetch(`${SE_BASE}/points/${SE_CHANNEL}/${req.params.username}/${-CUSTO_PONTOS}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${SE_JWT}` }
    });
    const data2 = await r2.json();

    res.json({ ok: true, pointsBefore: total, pointsAfter: data2.newAmount ?? (total - CUSTO_PONTOS) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
