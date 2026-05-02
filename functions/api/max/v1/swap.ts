export async function onRequestPost({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  // Changed to use DEVELOPERS_KV
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const { userPublicKey, quoteResponse } = await request.json();
  
  if (!userPublicKey || !quoteResponse) {
    return Response.json({ error: 'Missing userPublicKey or quoteResponse' }, { status: 400 });
  }
  
  return Response.json({
    success: true,
    programId: 'Fg1s6RyhV1otJ6M862xiTNy9D292haSM1YMtn6RcoMWb',
    swapTransaction: 'base64_encoded_transaction_here',
    fee: quoteResponse.fee
  });
}
