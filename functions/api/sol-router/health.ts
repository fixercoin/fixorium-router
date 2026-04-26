// functions/api/sol-router/health.ts

export const onRequest: PagesFunction = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  return new Response(JSON.stringify({
    status: "healthy",
    router: "Fixorium Solana DEX Router",
    fee: "0.01%",
    dexes: ["raydium", "orca", "meteora"],
    version: "1.0.0"
  }, null, 2), { headers });
};
