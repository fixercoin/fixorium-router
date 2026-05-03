import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

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
  const publicKey = url.searchParams.get('publicKey');
  const network = url.searchParams.get('network') || 'devnet';
  
  if (!publicKey) {
    return Response.json({ error: 'Missing publicKey parameter' }, { status: 400 });
  }
  
  // Use YOUR RPC endpoints
  const rpcUrl = network === 'devnet' 
    ? 'https://api.devnet.solana.com'
    : 'https://api.mainnet-beta.solana.com';
  
  try {
    const connection = new Connection(rpcUrl);
    const pubKey = new PublicKey(publicKey);
    
    // Get SOL balance
    const balance = await connection.getBalance(pubKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    
    // Get token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
      programId: TOKEN_PROGRAM_ID
    });
    
    const tokens = [];
    for (const tokenAccount of tokenAccounts.value) {
      const accountData = tokenAccount.account.data.parsed.info;
      const balance2 = accountData.tokenAmount.uiAmount;
      if (balance2 > 0) {
        tokens.push({
          mint: accountData.mint,
          balance: balance2,
          decimals: accountData.tokenAmount.decimals
        });
      }
    }
    
    // Get transaction count
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 10 });
    
    return Response.json({
      success: true,
      network,
      publicKey,
      lamports: balance,
      solBalance,
      tokens,
      transactionCount: signatures.length,
      timestamp: Date.now()
    });
    
  } catch (error: any) {
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to fetch account data',
      network 
    }, { status: 500 });
  }
}
