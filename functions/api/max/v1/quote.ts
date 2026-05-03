export async function onRequestGet({ request, env }) {
  try {
    const apiKey = request.headers.get('X-API-Key');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
    if (!keyData || keyData.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const url = new URL(request.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = url.searchParams.get('amount');
    
    if (!inputMint || !outputMint || !amount) {
      return new Response(JSON.stringify({ error: 'Missing parameters: inputMint, outputMint, amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const amountNum = parseFloat(amount);
    const feeAmount = amountNum * 0.0001;
    const amountOut = amountNum - feeAmount;
    
    return new Response(JSON.stringify({
      success: true,
      quote: {
        inputMint,
        outputMint,
        inAmount: amount,
        outAmount: amountOut.toString(),
        fee: { bps: 1, percentage: '0.01%', amount: feeAmount.toString() }
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
