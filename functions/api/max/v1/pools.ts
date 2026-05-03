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
  
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  
  try {
    const connection = new Connection(rpcUrl);
    const programId = new PublicKey(env.MAX_PROGRAM_ID || 'EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM');
    
    // Get all pool accounts from YOUR program
    const programAccounts = await connection.getProgramAccounts(programId);
    const pools = [];
    
    for (const account of programAccounts) {
      try {
        // Parse pool data - adjust based on YOUR program's account structure
        const data = account.account.data;
        const dataView = new DataView(data.buffer);
        
        // Example parsing - you need to match YOUR program's data layout
        const mintAStart = 8;
        const mintA = new PublicKey(data.slice(mintAStart, mintAStart + 32));
        const mintBStart = mintAStart + 32;
        const mintB = new PublicKey(data.slice(mintBStart, mintBStart + 32));
        
        if (!mint || mintA.toString() === mint || mintB.toString() === mint) {
          pools.push({
            id: account.pubkey.toString(),
            mintA: mintA.toString(),
            mintB: mintB.toString(),
            fee: '0.01%'
          });
        }
      } catch (e) {
        // Skip invalid accounts
        continue;
      }
    }
    
    return Response.json({
      success: true,
      network,
      programId: programId.toString(),
      pools,
      totalPools: pools.length,
      timestamp: Date.now()
    });
    
  } catch (error: any) {
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to fetch pools',
      network 
    }, { status: 500 });
  }
}
