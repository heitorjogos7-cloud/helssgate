const { r, isMaster } = require('../lib/redis');

// Monstros, NPCs, puzzles e notas secretas: tudo só para o mestre.
module.exports = async (req, res) => {
  try {
    if (!isMaster(req)) return res.status(401).json({ error: 'Somente o mestre.' });
    const m = req.method, b = req.body || {};
    if (m === 'GET') {
      const a = (await r(['HGETALL', 'mestre'])) || [];
      const docs = [];
      for (let i = 0; i < a.length; i += 2) {
        try { docs.push({ id: a[i], data: JSON.parse(a[i + 1]) }); } catch (e) { /* ignora */ }
      }
      return res.status(200).json({ docs });
    }
    if (m === 'POST' || m === 'PUT') {
      const id = String(b.id || '');
      if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) return res.status(400).json({ error: 'ID inválido' });
      const s = JSON.stringify(b.data || {});
      if (s.length > 20000) return res.status(413).json({ error: 'Conteúdo grande demais' });
      await r(['HSET', 'mestre', id, s]);
      return res.status(200).json({ ok: true });
    }
    if (m === 'DELETE') {
      await r(['HDEL', 'mestre', String(req.query.id || '')]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
