export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const { walletAddress, email, companyName } = await request.json();
  
  if (!walletAddress) {
    return Response.json({ error: 'Wallet address required' }, { status: 400 });
  }
  
  const developerId = crypto.randomUUID();
  const apiKey = `max_${crypto.randomUUID().replace(/-/g, '')}`;
  const apiSecret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const developer = {
    id: developerId,
    walletAddress,
    email: email || '',
    companyName: companyName || '',
    status: 'active',
    createdAt: Date.now(),
  };
  
  const keyData = {
    id: crypto.randomUUID(),
    developerId,
    apiKey,
    apiSecret,
    name: 'Primary Key',
    rateLimitRps: 10,
    status: 'active',
    createdAt: Date.now(),
  };
  
  await env.DEVELOPERS_KV.put(`dev:${developerId}`, JSON.stringify(developer));
  await env.API_KEYS_KV.put(`key:${apiKey}`, JSON.stringify(keyData));
  
  return Response.json({
    success: true,
    apiKey,
    apiSecret,
    fee: { bps: 1, percentage: '0.01%', recipient: 'F9RJSJ4Fr2mLsQrZjemeg3PVMjG2KgjF9t5shZLHMnwG' },
    programId: 'Fg1s6RyhV1otJ6M862xiTNy9D292haSM1YMtn6RcoMWb'
  });
}
