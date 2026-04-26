
FIXORIUM SOLANA DEX ROUTER - COMPLETE DOCUMENTATION
LIVE API ENDPOINTS
text
Base URL: https://fixorium.com.pk/api/sol-router
Endpoint	Method	Description	Example
/quote	GET	Get best swap quote	?from=SOL&to=USDC&amount=1
/tokens	GET	List all supported tokens	-
/health	GET	API status	-
QUICK START (COPY-PASTE THIS CODE)
javascript
// Get quote for 1 SOL to USDC
const response = await fetch('https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1');
const data = await response.json();

console.log(data);
Response:

json
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
WALLET INTEGRATION EXAMPLES
Phantom Wallet
javascript
// Connect Phantom
const provider = window.solana;
const wallet = new PhantomWallet(provider);

// Get Fixorium quote
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1'
).then(r => r.json());

// Execute swap
console.log(`Swap 1 SOL for ${quote.best_route.output} USDC`);
console.log(`Fixorium fee: ${quote.fee}`);
Backpack Wallet
javascript
const wallet = window.backpack;
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=BONK&amount=0.5'
).then(r => r.json());

console.log(`Best on ${quote.best_route.dex}: ${quote.best_route.output} BONK`);
Solflare Wallet
javascript
const wallet = window.solflare;
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=USDC&to=SOL&amount=100'
).then(r => r.json());

console.log(`Output: ${quote.best_route.output} SOL`);
REACT/NEXT.JS COMPONENT
jsx
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
TELEGRAM BOT INTEGRATION
javascript
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
DISCORD BOT INTEGRATION
javascript
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
NPM PACKAGE
bash
npm install @fixorium/router-sdk
javascript
import { FixoriumRouter } from '@fixorium/router-sdk';

// Get quote
const quote = await FixoriumRouter.quote({
  from: 'SOL',
  to: 'USDC',
  amount: 1
});

console.log(quote.output);
API PARAMETERS
Parameter	Type	Required	Default	Description
from	string	Yes	-	Source token (SOL, USDC, USDT, BONK, WIF)
to	string	Yes	-	Target token
amount	number	Yes	-	Amount to swap
slippage	number	No	0.5	Slippage tolerance %
SUPPORTED TOKENS
Symbol	Mint Address	Decimals
SOL	So11111111111111111111111111111111111111112	9
USDC	EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v	6
USDT	Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB	6
BONK	DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263	5
WIF	EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm	6
SUPPORTED DEXES
✅ Raydium (CPMM + CLMM)

✅ Orca (Whirlpools)

✅ Meteora (DLMM)

🔄 Jupiter (Coming soon)

🔄 PumpSwap (Coming soon)

FEE COMPARISON
Router	Fee	On $1000 Swap
Jupiter	0.1%	$1.00
Fixorium	0.01%	$0.10
You Save	-	$0.90
TEST THE API (CURL COMMANDS)
bash
# Get SOL to USDC quote
curl https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1

# Get USDC to BONK quote
curl https://fixorium.com.pk/api/sol-router/quote?from=USDC&to=BONK&amount=100

# Get all tokens
curl https://fixorium.com.pk/api/sol-router/tokens

# Check health
curl https://fixorium.com.pk/api/sol-router/health
MIGRATE FROM JUPITER
Before (Jupiter - 0.1% fee):

javascript
const quote = await fetch('https://quote-api.jup.ag/v6/quote?inputMint=SOL&outputMint=USDC&amount=1000000000');
After (Fixorium - 0.01% fee):

javascript
const quote = await fetch('https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=1');
That's it! Just change the URL. 10x cheaper fees instantly.

SMART FEATURES
Automatic Split Routing
For large orders, Fixorium automatically splits across multiple DEXes:

javascript
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=USDC&amount=10000'
);

if (quote.split_route) {
  console.log(`Split across ${quote.split_route.routes.length} DEXes`);
  console.log(`${quote.split_route.improvement}% better price`);
}
Multi-Hop Routing
Automatically finds best path through intermediate tokens:

javascript
// SOL to BONK might route SOL → USDC → BONK for better price
const quote = await fetch(
  'https://fixorium.com.pk/api/sol-router/quote?from=SOL&to=BONK&amount=10'
);

console.log(quote.route); // ['SOL', 'USDC', 'BONK'] if better
FOR WALLET DEVELOPERS
Add Fixorium to your wallet in 5 minutes:

javascript
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
SUPPORT & CONTACT
Website: https://fixorium.com.pk

Twitter: @Fixorium

Discord: https://discord.gg/fixorium

Email: dev@fixorium.com

GitHub: https://github.com/fixercoin/fixorium-router

LICENSE
MIT - Free for all wallets, dApps, and developers.

Built by Fixorium - 0.01% fees. Maximum savings. Full transparency.

Start integrating today and save 90% on swap fees compared to Jupiter.
