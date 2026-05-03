import { Connection, PublicKey } from '@solana/web3.js';

export async function onRequestGet({ request, env }: { request: Request; env: any }) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    return Response.json({ error: 'API key required' }, { status: 401 });
  }
  
  const keyData = await env.DEVELOPERS_KV.get(`key:${apiKey}`, 'json');
  if (!keyData || keyData.status !== 'active') {
    return Response.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  const url = new URL(request.url);
  const mint = url.searchParams.get('mint');
  const network = url.searchParams.get('network') || 'devnet';
  
  if (!mint) {
    return Response.json({ error: 'Missing mint parameter' }, { status: 400 });
  }
  
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  
  try {
    const connection = new Connection(rpcUrl);
    const programId = new PublicKey(env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM');
    
    // Get price from YOUR program's price feed
    let price = 0;
    let priceChange24h = 0;
    let volume24h = 0;
    
    try {
      // Find price account PDA for this mint
      const [pricePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('price'), new PublicKey(mint).toBuffer()],
        programId
      );
      
      const priceAccount = await connection.getAccountInfo(pricePda);
      if (priceAccount) {
        // Parse your price data from the account
        // This depends on your program's data structure
        const dataView = new DataView(priceAccount.data.buffer);
        price = dataView.getFloat64(8, true); // Example: read price at offset 8
      }
    } catch (e) {
      // If no price feed, calculate from quote
      try {
        const quoteResponse = await fetch(`${request.url.replace('tokenPrice', 'quote')}&amount=1000000`, {
          headers: { 'X-API-Key': apiKey }
        });
        const quoteData = await quoteResponse.json();
        if (quoteData.quote) {
          price = parseFloat(quoteData.quote.outAmount) / 1000000;
        }
      } catch (e2) {
        console.log('Could not get price from quote');
      }
    }
    
    return Response.json({
      success: true,
      network,
      mint,
      price,
      priceChange24h,
      volume24h,
      programId: programId.toString(),
      timestamp: Date.now()
    });
    
  } catch (error: any) {
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to fetch price',
      network 
    }, { status: 500 });
  }
}
