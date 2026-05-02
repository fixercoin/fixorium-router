export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  const keyData = await env.API_KEYS_KV.get(`key:${apiKey}`, 'json');
  
  if (!keyData) {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const allKeys = await env.API_KEYS_KV.list({ prefix: `key:` });
  const keys = [];
  
  for (const key of allKeys.keys) {
    const data = await env.API_KEYS_KV.get(key.name, 'json');
    if (data && data.developerId === keyData.developerId) {
      keys.push({ id: data.id, name: data.name, apiKey: data.apiKey.slice(0, 12) + '...', status: data.status });
    }
  }
  
  return Response.json({ success: true, keys });
}

export async function onRequestDelete({ request, env }: { request: Request; env: any }) {
  const url = new URL(request.url);
  const keyId = url.pathname.split('/').pop();
  const apiKey = request.headers.get('X-API-Key');
  
  const keyData = await env.API_KEYS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData) {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const allKeys = await env.API_KEYS_KV.list({ prefix: `key:` });
  for (const key of allKeys.keys) {
    const data = await env.API_KEYS_KV.get(key.name, 'json');
    if (data && data.id === keyId && data.developerId === keyData.developerId) {
      await env.API_KEYS_KV.delete(key.name);
      return Response.json({ success: true, message: 'API key revoked' });
    }
  }
  
  return Response.json({ error: 'API key not found' }, { status: 404 });
}
