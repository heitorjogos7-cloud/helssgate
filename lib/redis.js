// Cliente mínimo do Upstash Redis (REST), sem dependências.
// A integração "Upstash for Redis" da Vercel cria KV_REST_API_URL e KV_REST_API_TOKEN.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function r(cmd) {
  if (!URL_ || !TOKEN) {
    throw new Error('Banco não configurado: conecte o Upstash Redis ao projeto na Vercel e faça um novo deploy.');
  }
  const x = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await x.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

const MASTER = () => process.env.MASTER_PASSWORD || '273285';
const isMaster = (req) => req.headers['x-key'] === MASTER();

module.exports = { r, isMaster, MASTER };
