export async function onRequestGet({ request, env }) {
    const RPC_URL = 'https://api.mainnet-beta.solana.com';
    const PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'; // Raydium
    
    // Direct test call to RPC
    const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getProgramAccounts',
            params: [PROGRAM_ID, { encoding: 'jsonParsed', commitment: 'confirmed' }]
        })
    });
    
    const data = await response.json();
    
    return Response.json({
        success: true,
        rpcResponse: {
            hasResult: !!data.result,
            resultLength: data.result?.length || 0,
            firstAccount: data.result?.[0] || null
        }
    });
}
