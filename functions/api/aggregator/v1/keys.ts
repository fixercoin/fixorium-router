// GET - List all API keys for the user
export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const authHeader = request.headers.get('Authorization');
  
  // Get user email from session or header
  const email = authHeader?.replace('Bearer ', '');
  
  if (!email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get user from KV
  const userKey = `dev:${email}`;
  const user = await env.DEVELOPERS_KV.get(userKey, 'json');
  
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Get all API keys for this user
  const keysKey = `user:${user.id}:aggregator_keys`;
  const keys = await env.DEVELOPERS_KV.get(keysKey, 'json');
  
  return Response.json({
    success: true,
    keys: keys || []
  });
}

// POST - Create a new API key
export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const authHeader = request.headers.get('Authorization');
  const email = authHeader?.replace('Bearer ', '');
  
  if (!email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userKey = `dev:${email}`;
  const user = await env.DEVELOPERS_KV.get(userKey, 'json');
  
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  
  const { name, allowedDomains, rateLimit } = await request.json();
  
  // Generate new API key
  const apiKey = `agg_${crypto.randomUUID().replace(/-/g, '')}`;
  const apiSecret = crypto.randomUUID().replace(/-/g, '');
  
  const newKey = {
    id: crypto.randomUUID(),
    name: name || 'Default Key',
    apiKey,
    apiSecret,
    allowedDomains: allowedDomains || ['*'],
    rateLimit: rateLimit || 10000,
    usage: 0,
    createdAt: Date.now(),
    status: 'active'
  };
  
  // Store key in KV
  await env.DEVELOPERS_KV.put(`aggregator_key:${apiKey}`, JSON.stringify(newKey));
  
  // Add to user's keys list
  const keysKey = `user:${user.id}:aggregator_keys`;
  const existingKeys = await env.DEVELOPERS_KV.get(keysKey, 'json');
  const keysList = existingKeys || [];
  keysList.push(apiKey);
  await env.DEVELOPERS_KV.put(keysKey, JSON.stringify(keysList));
  
  return Response.json({
    success: true,
    key: newKey
  });
}

// DELETE - Revoke an API key
export async function onRequestDelete({ request, env }: { request: Request; env: any }) {
  const authHeader = request.headers.get('Authorization');
  const email = authHeader?.replace('Bearer ', '');
  
  if (!email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const keyId = url.searchParams.get('keyId');
  
  if (!keyId) {
    return Response.json({ error: 'Missing keyId' }, { status: 400 });
  }
  
  const userKey = `dev:${email}`;
  const user = await env.DEVELOPERS_KV.get(userKey, 'json');
  
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Delete the key from KV
  await env.DEVELOPERS_KV.delete(`aggregator_key:${keyId}`);
  
  // Remove from user's keys list
  const keysKey = `user:${user.id}:aggregator_keys`;
  const existingKeys = await env.DEVELOPERS_KV.get(keysKey, 'json');
  const keysList = existingKeys?.filter((k: string) => k !== keyId) || [];
  await env.DEVELOPERS_KV.put(keysKey, JSON.stringify(keysList));
  
  return Response.json({ success: true });
}
