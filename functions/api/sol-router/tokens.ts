// functions/api/sol-router/tokens.ts

export const onRequest: PagesFunction = async () => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const tokens = {
    SOL: {
      mint: "So11111111111111111111111111111111111111112",
      decimals: 9,
      symbol: "SOL",
      name: "Solana"
    },
    USDC: {
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
      symbol: "USDC",
      name: "USD Coin"
    },
    USDT: {
      mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      decimals: 6,
      symbol: "USDT",
      name: "Tether"
    }
  };

  return new Response(JSON.stringify({
    router: "Fixorium Solana DEX Router",
    count: Object.keys(tokens).length,
    tokens
  }, null, 2), { headers });
};
