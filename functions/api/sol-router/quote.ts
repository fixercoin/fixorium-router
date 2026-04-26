// functions/api/sol-router/quote.ts
// URL: https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1

export const onRequest: PagesFunction = async (context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const url = new URL(context.request.url);
  const fromToken = url.searchParams.get('from') || 'SOL';
  const toToken = url.searchParams.get('to') || 'USDC';
  const amount = parseFloat(url.searchParams.get('amount') || '1');

  // Fixorium fee: 0.01%
  const FEE_BPS = 1;
  const fixoriumFee = amount * (FEE_BPS / 10000);

  // Get quotes from Solana DEXes
  const quotes = await getQuotesFromDEXes(fromToken, toToken, amount);

  // Find best route
  const bestRoute = findBestRoute(quotes);

  // Calculate split route
  const splitRoute = calculateSplitRoute(quotes, amount);

  const response = {
    success: true,
    router: "Fixorium Solana DEX Router",
    fee: "0.01%",
    from: fromToken,
    to: toToken,
    amount: amount,
    best_route: bestRoute,
    split_route: splitRoute,
    all_routes: quotes,
    timestamp: Date.now()
  };

  return new Response(JSON.stringify(response, null, 2), { headers });
};

async function getQuotesFromDEXes(from: string, to: string, amount: number) {
  const quotes = [];

  // Raydium quote
  try {
    const raydium = await fetch(`https://api.raydium.io/v2/main/quote?inputMint=${getMint(from)}&outputMint=${getMint(to)}&amount=${amount * 1e9}`);
    if (raydium.ok) {
      const data = await raydium.json();
      quotes.push({
        dex: "raydium",
        input_amount: amount,
        output_amount: data.outputAmount / 1e9,
        price: data.price,
        price_impact: data.priceImpact
      });
    }
  } catch(e) {}

  // Orca quote
  try {
    const orca = await fetch(`https://api.orca.so/quote?inputMint=${getMint(from)}&outputMint=${getMint(to)}&amount=${amount}`);
    if (orca.ok) {
      const data = await orca.json();
      quotes.push({
        dex: "orca",
        input_amount: amount,
        output_amount: data.outputAmount,
        price: data.price,
        price_impact: data.priceImpact
      });
    }
  } catch(e) {}

  return quotes;
}

function findBestRoute(quotes: any[]) {
  if (quotes.length === 0) return null;
  return quotes.reduce((best, current) => 
    current.output_amount > best.output_amount ? current : best, quotes[0]);
}

function calculateSplitRoute(quotes: any[], totalAmount: number) {
  if (quotes.length < 2) return null;
  
  const halfAmount = totalAmount / 2;
  const totalOutput = quotes[0].output_amount / 2 + quotes[1].output_amount / 2;
  const bestOutput = Math.max(...quotes.map(q => q.output_amount));
  
  return {
    type: "split",
    routes: [
      { dex: quotes[0].dex, amount: halfAmount, output: quotes[0].output_amount / 2 },
      { dex: quotes[1].dex, amount: halfAmount, output: quotes[1].output_amount / 2 }
    ],
    total_output: totalOutput,
    improvement: ((totalOutput - bestOutput) / bestOutput) * 100
  };
}

function getMint(token: string): string {
  const mints: Record<string, string> = {
    SOL: "So11111111111111111111111111111111111111112",
    USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
  };
  return mints[token] || mints.SOL;
}
