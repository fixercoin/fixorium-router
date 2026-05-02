export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  
  if (!keyData) {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const allKeys = await env.DEVELOPERS_KV.list({ prefix: `key:` });
  const keys = [];
  
  for (const key of allKeys.keys) {
    const data = await env.DEVELOPERS_KV.get(key.name, 'json');
    if (data && data.developerId === keyData.developerId) {
      keys.push({ 
        id: data.id, 
        name: data.name, 
        apiKey: data.apiKey ? data.apiKey.slice(0, 12) + '...' : 'N/A', 
        status: data.status 
      });
    }
  }
  
  return Response.json({ success: true, keys });
}

export async function onRequestDelete({ request, env }: { request: Request; env: any }) {
  const url = new URL(request.url);
  const keyId = url.pathname.split('/').pop();
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData) {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const allKeys = await env.DEVELOPERS_KV.list({ prefix: `key:` });
  for (const key of allKeys.keys) {
    const data = await env.DEVELOPERS_KV.get(key.name, 'json');
    if (data && data.id === keyId && data.developerId === keyData.developerId) {
      await env.DEVELOPERS_KV.delete(key.name);
      return Response.json({ success: true, message: 'API key revoked' });
    }
  }
  
  return Response.json({ error: 'API key not found' }, { status: 404 });
}
