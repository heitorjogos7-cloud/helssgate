const { r, isMaster } = require('../lib/redis');

const num = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(b, Math.max(a, Math.round(v))) : d; };
const txt = (v, n) => String(v == null ? '' : v).slice(0, n);

// Ficha criada pelo jogador: o servidor limita os valores para evitar trapaça grosseira.
function clean(d) {
  const att = {};
  ['VIT', 'FOR', 'DES', 'SAB', 'INT', 'DEF'].forEach((k) => { att[k] = num(d.att && d.att[k], 3, 18, 10); });
  const vida = num(d.vida, 1, 38, 10);
  return {
    nome: txt(d.nome, 60) || 'Sem nome', classe: txt(d.classe, 40), variante: txt(d.variante, 40),
    lv: num(d.lv, 1, 20, 1), arma: txt(d.arma, 40), att, aura: num(d.aura, 1, 100, 50),
    vida, vidaMax: vida, ca: num(d.ca, 0, 40, 10), red: num(d.red, 0, 30, 0),
    habs: txt(d.habs, 3000), notas: '',
  };
}

module.exports = async (req, res) => {
  try {
    const m = req.method, b = req.body || {};
    if (m === 'GET') {
      const a = (await r(['HGETALL', 'fichas'])) || [];
      const docs = [];
      for (let i = 0; i < a.length; i += 2) {
        try { docs.push({ id: a[i], data: JSON.parse(a[i + 1]) }); } catch (e) { /* ignora registro quebrado */ }
      }
      if (!isMaster(req)) docs.forEach((d) => { delete d.data.notas; });
      return res.status(200).json({ docs });
    }
    if (m === 'POST') {
      const id = String(b.id || '');
      if (!/^[A-Za-z0-9_-]{6,80}$/.test(id)) return res.status(400).json({ error: 'ID inválido' });
      const n = await r(['HSETNX', 'fichas', id, JSON.stringify(clean(b.data || {}))]);
      if (!n) return res.status(409).json({ error: 'Você já criou sua ficha; só o mestre altera.' });
      return res.status(200).json({ ok: true });
    }
    if (!isMaster(req)) return res.status(401).json({ error: 'Somente o mestre pode alterar fichas.' });
    if (m === 'PUT') {
      const id = String(b.id || '');
      const cur = await r(['HGET', 'fichas', id]);
      if (!cur) return res.status(404).json({ error: 'Ficha não encontrada' });
      const o = JSON.parse(cur), d = b.data || {};
      ['nome', 'lv', 'vida', 'vidaMax', 'ca', 'habs', 'notas'].forEach((k) => {
        if (k in d) o[k] = (k === 'nome' || k === 'habs' || k === 'notas') ? txt(d[k], 3000) : num(d[k], -999, 9999, o[k]);
      });
      await r(['HSET', 'fichas', id, JSON.stringify(o)]);
      return res.status(200).json({ ok: true });
    }
    if (m === 'DELETE') {
      await r(['HDEL', 'fichas', String(req.query.id || '')]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
