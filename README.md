🦊 FIXORIUM SOLANA DEX ROUTER
Complete Documentation - The Cheapest DEX Aggregator on Solana

💰 Only 0.01% Fee
10x cheaper than Jupiter | Save 90% on every swap

📍 LIVE API ENDPOINTS
Base URL: https://fixorium.com.pk/api/sol-router

📊 /quote
Get best swap quote

?from=SOL&to=USDC&amount=1
📋 /tokens
List all supported tokens

GET /tokens
💚 /health
Check API status

GET /health
🚀 QUICK START
Copy and paste this code to get started:

// Get quote for 1 SOL to USDC
const response = await fetch('https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1');
const data = await response.json();

console.log(data);
Response:

{
  "success": true,
  "router": "Fixorium",
  "fee": "0.01%",
  "from": "SOL",
  "to": "USDC",
  "amount": 1,
  "best_route": {
    "dex": "raydium",
    "output": 1.02,
    "price": 1.02
  },
  "all_routes": [
    {"dex": "raydium", "output": 1.02},
    {"dex": "orca", "output": 1.019},
    {"dex": "meteora", "output": 1.021}
  ]
}
👛 WALLET INTEGRATION EXAMPLES
Phantom Wallet
// Connect Phantom
const provider = window.solana;
const wallet = new PhantomWallet(provider);

// Get Fixorium quote
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1'
).then(r => r.json());

console.log(`Swap 1 SOL for ${quote.best_route.output} USDC`);
console.log(`Fixorium fee: ${quote.fee}`);
Backpack Wallet
const wallet = window.backpack;
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=BONK&amount=0.5'
).then(r => r.json());

console.log(`Best on ${quote.best_route.dex}: ${quote.best_route.output} BONK`);
Solflare Wallet
const wallet = window.solflare;
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=USDC&to=SOL&amount=100'
).then(r => r.json());

console.log(`Output: ${quote.best_route.output} SOL`);
⚛️ REACT/NEXT.JS COMPONENT
import { useState } from 'react';

export default function FixoriumSwap() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  const getQuote = async () => {
    setLoading(true);
    const res = await fetch(
      'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1'
    );
    const data = await res.json();
    setQuote(data);
    setLoading(false);
  };

  return (
    <div>
      <h2>Fixorium Router - 0.01% Fee</h2>
      <button onClick={getQuote} disabled={loading}>
        {loading ? 'Loading...' : 'Get Quote'}
      </button>
      {quote && (
        <div>
          <p>Best DEX: {quote.best_route.dex}</p>
          <p>Output: {quote.best_route.output} USDC</p>
          <p>Fee: {quote.fee}</p>
          <p>You save 90% vs Jupiter</p>
        </div>
      )}
    </div>
  );
}
🤖 TELEGRAM BOT INTEGRATION
bot.onText(/\/swap (.+) (.+) (.+)/, async (msg, match) => {
  const [_, from, to, amount] = match;
  
  const quote = await fetch(
    `https://fixorium.com.pk/api/sol-router/quote?from=${from}&to=${to}&amount=${amount}`
  ).then(r => r.json());
  
  bot.sendMessage(msg.chat.id, `
🦊 FIXORIUM QUOTE
${amount} ${from} = ${quote.best_route.output} ${to}
Route: ${quote.best_route.dex}
Fee: 0.01%
  `);
});
🎮 DISCORD BOT INTEGRATION
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  
  const quote = await fetch(
    'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1'
  ).then(r => r.json());
  
  await interaction.reply({
    embeds: [{
      title: 'Fixorium Quote',
      color: 0xe94560,
      fields: [
        { name: 'From', value: '1 SOL', inline: true },
        { name: 'To', value: `${quote.best_route.output} USDC`, inline: true },
        { name: 'Route', value: quote.best_route.dex, inline: true },
        { name: 'Fee', value: '0.01%', inline: true }
      ]
    }]
  });
});
📦 NPM PACKAGE
npm install @fixorium/router-sdk
import { FixoriumRouter } from '@fixorium/router-sdk';

// Get quote
const quote = await FixoriumRouter.quote({
  from: 'SOL',
  to: 'USDC',
  amount: 1
});

console.log(quote.output);
📝 API PARAMETERS
Parameter	Type	Required	Default	Description
from	string	Yes	-	Source token (SOL, USDC, USDT, BONK, WIF)
to	string	Yes	-	Target token
amount	number	Yes	-	Amount to swap
slippage	number	No	0.5	Slippage tolerance %
🪙 SUPPORTED TOKENS
SOL
So11111111111111111111111111111111111111112

Decimals: 9

USDC
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

Decimals: 6

USDT
Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB

Decimals: 6

BONK
DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263

Decimals: 5

WIF
EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm

Decimals: 6

🔄 SUPPORTED DEXES
✅ Raydium
CPMM + CLMM

✅ Orca
Whirlpools

✅ Meteora
DLMM

🔄 Jupiter
Coming soon

🔄 PumpSwap
Coming soon

💰 FEE COMPARISON
Jupiter
Fee: 0.1%

On $1000 Swap: $1.00

Fixorium
Fee: 0.01%

On $1000 Swap: $0.10

💎 You Save: $0.90 (90%)
🧪 TEST THE API
# Get SOL to USDC quote
curl https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1

# Get USDC to BONK quote
curl https://fixorium.com.pk/api/sol-router/quote?from=USDC&to=BONK&amount=100

# Get all tokens
curl https://fixorium.com.pk/api/sol-router/tokens

# Check health
curl https://fixorium.com.pk/api/sol-router/health
🔄 MIGRATE FROM JUPITER
Before (Jupiter - 0.1% fee):

const quote = await fetch('https://quote-api.jup.ag/v6/quote?inputMint=SOL&outputMint=USDC&amount=1000000000');
After (Fixorium - 0.01% fee):

const quote = await fetch('https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1');
That's it! Just change the URL. 10x cheaper fees instantly.

🧠 SMART FEATURES
Automatic Split Routing
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=10000'
);

if (quote.split_route) {
  console.log(`Split across ${quote.split_route.routes.length} DEXes`);
  console.log(`${quote.split_route.improvement}% better price`);
}
Multi-Hop Routing
// SOL to BONK might route SOL → USDC → BONK for better price
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=BONK&amount=10'
);

console.log(quote.route); // ['SOL', 'USDC', 'BONK'] if better
🔧 FOR WALLET DEVELOPERS
Add Fixorium to your wallet in 5 minutes:

// Step 1: Add API call
async function getFixoriumQuote(from, to, amount) {
  const res = await fetch(
    `https://fixorium.com.pk/api/sol-router/quote?from=${from}&to=${to}&amount=${amount}`
  );
  return res.json();
}

// Step 2: Display in UI
const quote = await getFixoriumQuote('SOL', 'USDC', 1);
showToUser(`${quote.best_route.output} USDC via ${quote.best_route.dex}`);

// Step 3: Execute using your existing swap logic
await executeSwap(quote.best_route);
🆘 SUPPORT & CONTACT
🌐 Website
https://fixorium.com.pk

🐦 Twitter
@Fixorium

💬 Discord
https://discord.gg/fixorium

📧 Email
dev@fixorium.com

🐙 GitHub
https://github.com/fixercoin/fixorium-router

📄 LICENSE
MIT - Free for all wallets, dApps, and developers.

🦊 Built by Fixorium - 0.01% fees. Maximum savings. Full transparency.

Start integrating today and save 90% on swap fees compared to Jupiter.

Get Started Now →
