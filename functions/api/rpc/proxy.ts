export async function onRequestPost({ request }) {
    const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
    
    const body = await request.text();
    
    const response = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        }
    });
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
