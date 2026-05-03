export async function onRequestGet({ request, env }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const inputMint = url.searchParams.get('inputMint');
  const outputMint = url.searchParams.get('outputMint');
  const amount = url.searchParams.get('amount');
  
  if (!inputMint || !outputMint || !amount) {
    return Response.json({ error: 'Missing parameters: inputMint, outputMint, amount' }, { status: 400 });
  }
  
  const PROGRAM_ID = 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM';
  const RPC_URL = 'https://api.devnet.solana.com';
  
  let programAccounts = [];
  let isRealData = false;
  
  try {
    const response = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [PROGRAM_ID, { encoding: 'base64' }]
      })
    });
    const data = await response.json();
    programAccounts = data.result || [];
    isRealData = programAccounts.length > 0;
  } catch (error) {
    console.error('RPC call failed:', error);
  }
  
  const amountNum = parseFloat(amount);
  const feeBps = 1;
  const feePercent = feeBps / 10000;
  const feeAmount = amountNum * feePercent;
  const amountOut = amountNum - feeAmount;
  
  return Response.json({
    success: true,
    programId: PROGRAM_ID,
    network: 'devnet',
    isRealData: isRealData,
    programAccountsFound: programAccounts.length,
    quote: {
      inputMint: inputMint,
      outputMint: outputMint,
      inAmount: amount,
      outAmount: amountOut.toFixed(9),
      fee: {
        bps: feeBps,
        percentage: '0.01%',
        amount: feeAmount.toFixed(9)
      }
    },
    timestamp: Date.now()
  });
}
