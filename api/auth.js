const { MASTER } = require('../lib/redis');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  const key = String((req.body && req.body.key) || '');
  const ok = key === MASTER();
  if (!ok) await new Promise((r) => setTimeout(r, 500));
  return res.status(200).json({ ok });
};
