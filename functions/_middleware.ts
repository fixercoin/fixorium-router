export const onRequest = async (context) => {
    const url = new URL(context.request.url);
    const path = url.pathname;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // ========== HTML PAGES ==========
    if (path === '/' || path === '/dashboard') {
        return new Response(await getDashboardHTML(), { headers: { 'Content-Type': 'text/html' } });
    }
    if (path === '/register') {
        return new Response(await getRegisterHTML(), { headers: { 'Content-Type': 'text/html' } });
    }
    if (path === '/integration') {
        return new Response(await getIntegrationHTML(), { headers: { 'Content-Type': 'text/html' } });
    }

    // ========== API ENDPOINTS ==========
    if (path === '/sol-router/health') return handleHealth();
    if (path === '/sol-router/quote') return handleQuote(url);
    if (path === '/sol-router/tokens') return handleTokens();
    if (path === '/sol-router/routes') return handleRoutes(url);
    if (path === '/sol-router/swap' && context.request.method === 'POST') return handleSwap(context);
    if (path === '/sol-router/limit' && context.request.method === 'POST') return handleLimit(context);
    if (path === '/sol-router/dca' && context.request.method === 'POST') return handleDCA(context);
    if (path === '/sol-router/perp' && context.request.method === 'POST') return handlePerp(context);
    if (path === '/sol-router/pool' && context.request.method === 'POST') return handlePool(context);
    if (path === '/auth/register' && context.request.method === 'POST') return handleRegister(context);
    if (path === '/user/dashboard') return handleDashboard(context);

    return new Response(JSON.stringify({ error: 'NOT FOUND' }), { status: 404, headers: corsHeaders });
};

// ========== HTML CONTENT ==========

async function getDashboardHTML() {
    return `<!DOCTYPE html>
<html>
<head><title>MAX ROUTER</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;font-family:monospace;padding:20px}
.container{max-width:800px;margin:0 auto}
.card{background:#001a1a;border:1px solid #0fc;border-radius:16px;padding:25px;margin-bottom:20px}
h1{color:#0fc;font-size:24px;letter-spacing:4px}
h2{color:#0fc;font-size:14px;margin-bottom:15px}
input,select{background:#0a0a0a;border:1px solid #0fc;padding:10px;color:#0fc;border-radius:8px;width:100%;margin:5px 0}
button{background:#0fc;border:none;padding:12px;color:#000;font-weight:bold;border-radius:8px;cursor:pointer;width:100%;margin:5px 0}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:20px}
.stat-box{background:#001a1a;padding:15px;text-align:center;border-radius:12px}
.stat-value{font-size:28px;color:#0fc;font-weight:bold}
.stat-label{font-size:9px;color:#888}
.row{display:flex;gap:10px;margin:10px 0}
.flex-1{flex:1}
.text-center{text-align:center}
.color-red{color:#f36}
a{color:#0fc}
</style></head>
<body>
<div class="container">
<div class="card"><h1>MAX ROUTER</h1><p id="status" style="color:#0fc">STATUS: <span id="statusText">NOT CONNECTED</span></p></div>
<div id="loginSection" class="card"><h2>ENTER API KEY</h2><input type="text" id="apiKey" placeholder="YOUR API KEY"><button onclick="connect()">CONNECT</button><p class="text-center" style="margin-top:10px"><a href="/register">GET API KEY</a></p></div>
<div id="dashboardSection" style="display:none">
<div class="stats"><div class="stat-box"><div class="stat-value" id="requests">0</div><div class="stat-label">REQUESTS</div></div>
<div class="stat-box"><div class="stat-value" id="limit">10000</div><div class="stat-label">LIMIT</div></div>
<div class="stat-box"><div class="stat-value" id="volume">0</div><div class="stat-label">VOLUME</div></div></div>
<div class="card"><h2>SWAP</h2><div class="row"><select id="fromToken" class="flex-1"><option>SOL</option><option>USDC</option></select><input type="number" id="amount" placeholder="AMOUNT" value="1" class="flex-1"></div>
<div class="row"><select id="toToken" class="flex-1"><option>USDC</option><option>SOL</option></select><input type="text" id="output" placeholder="OUTPUT" readonly class="flex-1"></div>
<div class="row"><input type="text" id="wallet" placeholder="YOUR WALLET ADDRESS" class="flex-1"></div>
<button onclick="getQuote()">GET QUOTE</button>
<button onclick="executeSwap()" style="background:#0fc">EXECUTE SWAP</button>
<button onclick="createLimitOrder()">LIMIT ORDER</button>
<button onclick="createPool()">CREATE POOL</button>
</div></div></div>
<script>
let currentApiKey = null;
async function connect(){const key=document.getElementById('apiKey').value;if(!key){alert('ENTER API KEY');return}
const res=await fetch('/user/dashboard',{headers:{'X-API-Key':key}});const data=await res.json()
if(data.success){currentApiKey=key;localStorage.setItem('max_api_key',key);document.getElementById('loginSection').style.display='none';document.getElementById('dashboardSection').style.display='block';document.getElementById('statusText').innerText='CONNECTED';document.getElementById('requests').innerText=data.requestsUsed||0;document.getElementById('limit').innerText=data.requestsLimit||10000}else{alert('INVALID API KEY')}}
async function getQuote(){const from=document.getElementById('fromToken').value;const to=document.getElementById('toToken').value;const amount=document.getElementById('amount').value
const res=await fetch('/sol-router/quote?from='+from+'&to='+to+'&amount='+amount);const data=await res.json()
if(data.best_route){document.getElementById('output').value=data.best_route.output}else{alert('QUOTE FAILED')}}
async function executeSwap(){if(!currentApiKey){alert('CONNECT FIRST');return}
const from=document.getElementById('fromToken').value;const to=document.getElementById('toToken').value;const amount=document.getElementById('amount').value;const wallet=document.getElementById('wallet').value
if(!wallet){alert('ENTER WALLET ADDRESS');return}
const res=await fetch('/sol-router/swap',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':currentApiKey},body:JSON.stringify({fromToken:from,toToken:to,amount:parseFloat(amount),walletPublicKey:wallet})})
const data=await res.json();if(data.success){alert('SWAP SUCCESS! TX: '+data.signature.slice(0,20))}else{alert('SWAP FAILED')}}
async function createLimitOrder(){if(!currentApiKey){alert('CONNECT FIRST');return}
const from=document.getElementById('fromToken').value;const to=document.getElementById('toToken').value;const amount=document.getElementById('amount').value
const res=await fetch('/sol-router/limit',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':currentApiKey},body:JSON.stringify({orderId:'order_'+(Date.now()),tokenIn:from,tokenOut:to,amount:parseFloat(amount),triggerPrice:140,isBuy:false,expiresIn:86400})})
const data=await res.json();if(data.success){alert('LIMIT ORDER CREATED! ID: '+data.orderId)}else{alert('FAILED')}}
async function createPool(){if(!currentApiKey){alert('CONNECT FIRST');return}
const from=document.getElementById('fromToken').value;const to=document.getElementById('toToken').value
const res=await fetch('/sol-router/pool',{method:'POST',headers:{'Content-Type':'application/json','X-API-Key':currentApiKey},body:JSON.stringify({tokenA:from,tokenB:to,amountA:1000,amountB:150000,creator:'user'})})
const data=await res.json();if(data.success){alert('POOL CREATED! ID: '+data.poolId)}else{alert('FAILED')}}
const savedKey=localStorage.getItem('max_api_key');if(savedKey){document.getElementById('apiKey').value=savedKey;connect()}
</script>
</body></html>`;
}

async function getRegisterHTML() {
    return `<!DOCTYPE html>
<html>
<head><title>MAX ROUTER - REGISTER</title><style>
body{background:#0a0a0a;font-family:monospace;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px}
.card{background:#001a1a;border:1px solid #0fc;border-radius:16px;padding:40px;max-width:450px;width:100%}
h1{color:#0fc;text-align:center;margin-bottom:20px}
input{width:100%;background:#0a0a0a;border:1px solid #0fc;padding:12px;color:#0fc;border-radius:8px;margin:10px 0}
button{width:100%;background:#0fc;border:none;padding:12px;color:#000;font-weight:bold;border-radius:8px;cursor:pointer;margin:10px 0}
.result{background:#0a0a0a;padding:15px;border-radius:8px;margin-top:20px;display:none}
.key{color:#0fc;word-break:break-all;font-size:11px;margin:5px 0}
a{color:#0fc}
</style></head>
<body>
<div class="card"><h1>MAX ROUTER</h1><h2 style="color:#0fc;text-align:center">REGISTER</h2>
<input type="email" id="email" placeholder="EMAIL"><input type="text" id="project" placeholder="PROJECT NAME">
<button onclick="register()">REGISTER</button>
<div id="result" class="result"><div class="key">API KEY: <span id="apiKey"></span></div><div class="key">SECRET: <span id="secretKey"></span></div><p style="color:#f36;font-size:10px;margin-top:10px">⚠️ SAVE YOUR SECRET KEY</p></div>
<a href="/dashboard">← BACK TO DASHBOARD</a></div>
<script>
async function register(){const email=document.getElementById('email').value;const project=document.getElementById('project').value;if(!email||!project){alert('FILL ALL FIELDS');return}
const res=await fetch('/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,projectName:project})});const data=await res.json()
if(data.success){document.getElementById('result').style.display='block';document.getElementById('apiKey').innerText=data.apiKey;document.getElementById('secretKey').innerText=data.secretKey;navigator.clipboard.writeText('API: '+data.apiKey+'\nSECRET: '+data.secretKey)}else{alert('REGISTRATION FAILED')}}
</script></body></html>`;
}

async function getIntegrationHTML() {
    return `<!DOCTYPE html>
<html>
<head><title>MAX ROUTER - INTEGRATION</title><style>
body{background:#0a0a0a;font-family:monospace;padding:20px}
.container{max-width:900px;margin:0 auto}
.card{background:#001a1a;border:1px solid #0fc;border-radius:16px;padding:25px;margin-bottom:20px}
h1{color:#0fc}
code{background:#0a0a0a;padding:2px 6px;border-radius:4px;color:#0fc}
pre{background:#0a0a0a;padding:15px;border-radius:8px;overflow-x:auto;color:#0fc}
a{color:#0fc}
</style></head>
<body>
<div class="container"><h1>MAX ROUTER - INTEGRATION</h1>
<div class="card"><h2>1. GET API KEY</h2><p>Register at <a href="/register">/register</a> to get your API key</p></div>
<div class="card"><h2>2. GET QUOTE</h2><pre>curl -X GET "https://fixorium.com.pk/sol-router/quote?from=SOL&to=USDC&amount=1"</pre></div>
<div class="card"><h2>3. EXECUTE SWAP</h2><pre>curl -X POST https://fixorium.com.pk/sol-router/swap \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"fromToken":"SOL","toToken":"USDC","amount":1,"walletPublicKey":"YOUR_WALLET"}'</pre></div>
<div class="card"><h2>4. LIMIT ORDER</h2><pre>curl -X POST https://fixorium.com.pk/sol-router/limit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"orderId":"001","tokenIn":"SOL","tokenOut":"USDC","amount":10,"triggerPrice":140}'</pre></div>
<div class="card"><h2>5. CREATE POOL</h2><pre>curl -X POST https://fixorium.com.pk/sol-router/pool \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"tokenA":"SOL","tokenB":"USDC","amountA":1000,"amountB":150000}'</pre></div>
</div></body></html>`;
}

// ========== API HANDLERS ==========

async function handleHealth() {
    return new Response(JSON.stringify({ status: 'healthy', router: 'MAX ROUTER', fee: '0.01%' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleQuote(url) {
    const from = url.searchParams.get('from') || 'SOL';
    const to = url.searchParams.get('to') || 'USDC';
    const amount = parseFloat(url.searchParams.get('amount') || '1');
    let output = amount * 150;
    let dex = 'RAYDIUM';
    try {
        const res = await fetch(`https://api.raydium.io/v2/main/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${amount * 1e9}`);
        const data = await res.json();
        output = data.outputAmount / 1e9;
    } catch(e) {}
    return new Response(JSON.stringify({ success: true, best_route: { dex, output }, fee: '0.01%' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleTokens() {
    const tokens = [{ symbol: 'SOL', address: 'So11111111111111111111111111111111111111112', decimals: 9 }];
    return new Response(JSON.stringify({ success: true, tokens }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleRoutes(url) {
    return new Response(JSON.stringify({ success: true, routes: [{ dex: 'RAYDIUM', output: 15000 }] }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleSwap(context) {
    const body = await context.request.json();
    const signature = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    return new Response(JSON.stringify({ success: true, signature }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleLimit(context) {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, orderId: body.orderId || 'order_' + Date.now() }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleDCA(context) {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, orderId: body.orderId || 'dca_' + Date.now() }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handlePerp(context) {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, positionId: body.positionId || 'perp_' + Date.now() }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handlePool(context) {
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, poolId: 'pool_' + Date.now() }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleRegister(context) {
    const body = await context.request.json();
    const apiKey = 'max_' + crypto.randomUUID().replace(/-/g, '');
    const secretKey = 'sk_' + crypto.randomUUID().replace(/-/g, '');
    await context.env.MAX_KV.put(`user:${apiKey}`, JSON.stringify({
        email: body.email, projectName: body.projectName, apiKey, secretKey,
        createdAt: Date.now(), requests: 0, limit: 10000, volume: 0
    }));
    return new Response(JSON.stringify({ success: true, apiKey, secretKey }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

async function handleDashboard(context) {
    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const userStr = await context.env.MAX_KV.get(`user:${apiKey}`);
    if (!userStr) {
        return new Response(JSON.stringify({ error: 'INVALID API KEY' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const user = JSON.parse(userStr);
    return new Response(JSON.stringify({ success: true, email: user.email, projectName: user.projectName, requestsUsed: user.requests, requestsLimit: user.limit, volume24h: user.volume }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}
