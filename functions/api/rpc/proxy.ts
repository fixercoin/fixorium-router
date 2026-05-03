export async function onRequestPost({ request, env }) {
    const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
    
    // Forward the request to Solana RPC
    const response = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: request.body
    });
    
    const data = await response.json();
    
    // Add CORS headers
    return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    });
}
