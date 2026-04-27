// functions/_middleware.ts

export const onRequest = async (context) => {
    const url = new URL(context.request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // ============================================
    // SERVE HTML PAGES
    // ============================================
    
    // Dashboard page
    if (path === '/dashboard' || path === '/dashboard/') {
        const html = await getDashboardHTML();
        return new Response(html, {
            headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' }
        });
    }
    
    // Register page
    if (path === '/register' || path === '/register/') {
        const html = await getRegisterHTML();
        return new Response(html, {
            headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' }
        });
    }
    
    // Integration page
    if (path === '/integration' || path === '/integration/') {
        const html = await getIntegrationHTML();
        return new Response(html, {
            headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' }
        });
    }

    // ============================================
    // API ROUTES
    // ============================================
    
    // Health check
    if (path === '/sol-router/health' || path === '/sol-router/health/') {
        return handleHealth(context);
    }
    
    // Quote
    if (path === '/sol-router/quote' || path === '/sol-router/quote/') {
        return handleQuote(context);
    }
    
    // Swap
    if (path === '/sol-router/swap' || path === '/sol-router/swap/') {
        return handleSwap(context);
    }
    
    // Tokens
    if (path === '/sol-router/tokens' || path === '/sol-router/tokens/') {
        return handleTokens(context);
    }
    
    // Routes
    if (path === '/sol-router/routes' || path === '/sol-router/routes/') {
        return handleRoutes(context);
    }
    
    // Limit order
    if (path === '/sol-router/limit' || path === '/sol-router/limit/') {
        return handleLimit(context);
    }
    
    // DCA
    if (path === '/sol-router/dca' || path === '/sol-router/dca/') {
        return handleDCA(context);
    }
    
    // Perpetual
    if (path === '/sol-router/perp' || path === '/sol-router/perp/') {
        return handlePerp(context);
    }
    
    // Pool
    if (path === '/sol-router/pool' || path === '/sol-router/pool/') {
        return handlePool(context);
    }
    
    // Register API (POST only)
    if (path === '/auth/register' || path === '/auth/register/') {
        return handleRegister(context);
    }
    
    // Dashboard API (GET with API key)
    if (path === '/user/dashboard' || path === '/user/dashboard/') {
        return handleDashboard(context);
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'NOT FOUND', path }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
};

// ============================================
// HTML CONTENT (Embedded for simplicity)
// ============================================

async function getDashboardHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAX ROUTER - DASHBOARD</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #0f0f1a 50%, #1a1a2e 100%);
            font-family: 'Courier New', monospace;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 800px; width: 100%; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
        .logo h1 { color: #00ffcc; font-size: 20px; letter-spacing: 4px; }
        .logo p { color: #ff3366; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
        .api-status { background: #001a1a; border: 1px solid #00ffcc; border-radius: 8px; padding: 8px 16px; font-size: 9px; color: #00ffcc; text-transform: uppercase; }
        .card {
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid #00ffcc;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 20px;
        }
        .card-title { color: #00ffcc; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; border-bottom: 1px solid #00ffcc33; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
        .stat-box { background: #001a1a; border-radius: 12px; padding: 15px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #00ffcc; margin-bottom: 5px; }
        .stat-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #00ffcc11; }
        .info-label { font-size: 9px; color: #ff3366; text-transform: uppercase; }
        .info-value { font-size: 9px; color: #00ffcc; font-family: monospace; text-align: right; word-break: break-all; }
        .progress-section { margin: 20px 0; }
        .progress-label { display: flex; justify-content: space-between; font-size: 8px; color: #888; margin-bottom: 6px; text-transform: uppercase; }
        .progress-bar { background: #001a1a; height: 6px; border-radius: 3px; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #00ffcc, #00997a); height: 100%; border-radius: 3px; transition: width 0.5s ease; }
        .endpoints-list { margin-top: 15px; }
        .endpoint-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #00ffcc11; font-size: 8px; }
        .endpoint-method { background: #00ffcc20; padding: 2px 6px; border-radius: 4px; color: #00ffcc; font-weight: bold; }
        .endpoint-url { color: #888; font-family: monospace; }
        .endpoint-copy { background: none; border: 1px solid #00ffcc33; padding: 2px 8px; border-radius: 4px; color: #00ffcc; font-size: 7px; cursor: pointer; }
        .btn-group { display: flex; gap: 10px; margin-top: 20px; }
        .btn { flex: 1; background: #001a1a; border: 1px solid #00ffcc; padding: 10px; color: #00ffcc; font-size: 9px; text-transform: uppercase; font-family: monospace; cursor: pointer; text-align: center; }
        .btn:hover { background: #00ffcc; color: #000; }
        .btn-danger { border-color: #ff3366; color: #ff3366; }
        .api-input-group { display: flex; gap: 10px; }
        .api-input-group input { flex: 1; background: #001a1a; border: 1px solid #00ffcc33; padding: 10px 12px; color: #00ffcc; font-size: 9px; font-family: monospace; border-radius: 8px; }
        .api-input-group button { background: #00ffcc; border: none; padding: 10px 20px; color: #000; font-size: 9px; font-weight: bold; text-transform: uppercase; cursor: pointer; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; font-size: 8px; color: #444; text-transform: uppercase; }
        @media (max-width: 480px) { .stats-grid { grid-template-columns: 1fr; } .btn-group { flex-direction: column; } .card { padding: 20px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo"><h1>MAX ROUTER</h1><p>DASHBOARD</p></div>
            <div id="apiStatus" class="api-status">STATUS: <span id="statusText">NOT CONNECTED</span></div>
        </div>
        <div id="apiKeySection" class="card">
            <div class="card-title">ENTER API KEY</div>
            <div class="api-input-group">
                <input type="text" id="apiKeyInput" placeholder="ENTER YOUR API KEY" autocomplete="off">
                <button id="connectBtn">CONNECT</button>
            </div>
            <p style="font-size: 7px; color: #444; margin-top: 8px;">DON'T HAVE AN API KEY? <a href="/register" style="color: #00ffcc;">REGISTER HERE</a></p>
        </div>
        <div id="dashboardContent" style="display: none;">
            <div class="card">
                <div class="card-title">USAGE STATISTICS</div>
                <div class="stats-grid">
                    <div class="stat-box"><div class="stat-value" id="requestsUsed">0</div><div class="stat-label">REQUESTS USED</div></div>
                    <div class="stat-box"><div class="stat-value" id="requestsLimit">10,000</div><div class="stat-label">REQUESTS LIMIT</div></div>
                    <div class="stat-box"><div class="stat-value" id="volume24h">$0</div><div class="stat-label">VOLUME (24H)</div></div>
                    <div class="stat-box"><div class="stat-value" id="remainingPercent">100%</div><div class="stat-label">REMAINING</div></div>
                </div>
                <div class="progress-section">
                    <div class="progress-label"><span>API USAGE</span><span id="usageText">0 / 10000</span></div>
                    <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width: 0%"></div></div>
                </div>
            </div>
            <div class="card">
                <div class="card-title">ACCOUNT INFORMATION</div>
                <div class="info-row"><span class="info-label">EMAIL</span><span class="info-value" id="userEmail">-</span></div>
                <div class="info-row"><span class="info-label">PROJECT NAME</span><span class="info-value" id="projectName">-</span></div>
                <div class="info-row"><span class="info-label">API KEY</span><span class="info-value" id="displayApiKey">-</span></div>
                <div class="info-row"><span class="info-label">CREATED AT</span><span class="info-value" id="createdAt">-</span></div>
            </div>
            <div class="card">
                <div class="card-title">API ENDPOINTS</div>
                <div class="endpoints-list">
                    <div class="endpoint-item"><span class="endpoint-method">GET</span><span class="endpoint-url">/sol-router/quote</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/quote')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-url">/sol-router/swap</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/swap')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-url">/sol-router/limit</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/limit')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-url">/sol-router/dca</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/dca')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-url">/sol-router/perp</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/perp')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">POST</span><span class="endpoint-url">/sol-router/pool</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/pool')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">GET</span><span class="endpoint-url">/sol-router/tokens</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/tokens')">COPY</button></div>
                    <div class="endpoint-item"><span class="endpoint-method">GET</span><span class="endpoint-url">/sol-router/routes</span><button class="endpoint-copy" onclick="copyEndpoint('/sol-router/routes')">COPY</button></div>
                </div>
            </div>
            <div class="btn-group"><button class="btn" onclick="refreshDashboard()">REFRESH</button><button class="btn btn-danger" onclick="disconnect()">DISCONNECT</button></div>
        </div>
        <div class="footer"><p>MAX ROUTER - ADVANCED DEX AGGREGATOR<br>30+ DEXES • 0.01% FEE • LIMIT ORDERS • DCA • PERPS</p></div>
    </div>
    <script>
        let currentApiKey = null;
        const savedKey = localStorage.getItem('max_api_key');
        if (savedKey) { document.getElementById('apiKeyInput').value = savedKey; connectDashboard(savedKey); }
        document.getElementById('connectBtn').addEventListener('click', () => { const apiKey = document.getElementById('apiKeyInput').value.trim(); if (!apiKey) { alert('PLEASE ENTER YOUR API KEY'); return; } connectDashboard(apiKey); });
        async function connectDashboard(apiKey) {
            try {
                const response = await fetch('/user/dashboard', { headers: { 'X-API-Key': apiKey } });
                const data = await response.json();
                if (data.success) {
                    currentApiKey = apiKey;
                    localStorage.setItem('max_api_key', apiKey);
                    document.getElementById('apiKeySection').style.display = 'none';
                    document.getElementById('dashboardContent').style.display = 'block';
                    document.getElementById('statusText').textContent = 'CONNECTED';
                    document.getElementById('userEmail').textContent = data.email || '-';
                    document.getElementById('projectName').textContent = data.projectName || '-';
                    document.getElementById('displayApiKey').textContent = currentApiKey.slice(0, 12) + '...' + currentApiKey.slice(-8);
                    document.getElementById('createdAt').textContent = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-';
                    const requestsUsed = data.requestsUsed || 0;
                    const requestsLimit = data.requestsLimit || 10000;
                    const volume24h = data.volume24h || 0;
                    const remainingPercent = ((requestsLimit - requestsUsed) / requestsLimit) * 100;
                    document.getElementById('requestsUsed').textContent = requestsUsed.toLocaleString();
                    document.getElementById('requestsLimit').textContent = requestsLimit.toLocaleString();
                    document.getElementById('volume24h').textContent = `$${volume24h.toLocaleString()}`;
                    document.getElementById('remainingPercent').textContent = `${remainingPercent.toFixed(1)}%`;
                    document.getElementById('usageText').textContent = `${requestsUsed} / ${requestsLimit}`;
                    document.getElementById('progressFill').style.width = `${(requestsUsed / requestsLimit) * 100}%`;
                } else { alert('INVALID API KEY'); localStorage.removeItem('max_api_key'); }
            } catch (error) { alert('CONNECTION FAILED'); }
        }
        async function refreshDashboard() { if (currentApiKey) { try { const response = await fetch('/user/dashboard', { headers: { 'X-API-Key': currentApiKey } }); const data = await response.json(); if (data.success) { location.reload(); } } catch(e) {} } }
        function disconnect() { currentApiKey = null; localStorage.removeItem('max_api_key'); document.getElementById('apiKeySection').style.display = 'block'; document.getElementById('dashboardContent').style.display = 'none'; document.getElementById('apiKeyInput').value = ''; document.getElementById('statusText').textContent = 'NOT CONNECTED'; }
        function copyEndpoint(endpoint) { navigator.clipboard.writeText(`https://fixorium.com.pk${endpoint}`); const btns = document.querySelectorAll('.endpoint-copy'); for (let btn of btns) { if (btn.textContent === 'COPY') { btn.textContent = 'COPIED!'; setTimeout(() => { btn.textContent = 'COPY'; }, 1500); break; } } }
        setInterval(() => { if (currentApiKey) refreshDashboard(); }, 30000);
    </script>
</body>
</html>`;
}

async function getRegisterHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAX ROUTER - REGISTER</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #0f0f1a 50%, #1a1a2e 100%);
            font-family: 'Courier New', monospace;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container { max-width: 500px; width: 100%; }
        .card {
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid #00ffcc;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 0 40px rgba(0, 255, 204, 0.1);
        }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #00ffcc; font-size: 28px; letter-spacing: 4px; margin-bottom: 5px; }
        .logo p { color: #ff3366; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; }
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; color: #00ffcc; font-size: 10px; text-transform: uppercase; margin-bottom: 8px; }
        .input-group input {
            width: 100%;
            background: #001a1a;
            border: 1px solid #00ffcc33;
            padding: 12px 16px;
            color: #00ffcc;
            font-size: 10px;
            font-family: monospace;
            border-radius: 8px;
        }
        .input-group input:focus { outline: none; border-color: #00ffcc; }
        button {
            width: 100%;
            background: linear-gradient(135deg, #00ffcc, #00997a);
            border: none;
            padding: 14px;
            color: #000;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            font-family: monospace;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
        }
        button:hover { transform: translateY(-2px); }
        .result { margin-top: 30px; padding: 20px; background: #001a1a; border-left: 3px solid #00ffcc; border-radius: 8px; display: none; }
        .result.show { display: block; animation: fadeIn 0.5s ease; }
        .key-box { background: #0a0a0a; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
        .key-label { color: #ff3366; font-size: 9px; margin-bottom: 5px; text-transform: uppercase; }
        .key-value { color: #00ffcc; font-size: 10px; font-family: monospace; word-break: break-all; }
        .copy-btn {
            background: #00ffcc20;
            border: 1px solid #00ffcc;
            padding: 4px 10px;
            font-size: 8px;
            margin-top: 8px;
            width: auto;
            display: inline-block;
        }
        .warning { background: rgba(255, 51, 102, 0.1); border: 1px solid #ff3366; padding: 12px; border-radius: 8px; margin-top: 15px; }
        .warning p { color: #ff3366; font-size: 9px; text-align: center; text-transform: uppercase; }
        .endpoints { margin-top: 15px; }
        .endpoint-item { font-size: 8px; padding: 4px 0; color: #888; font-family: monospace; text-transform: uppercase; }
        .footer { text-align: center; margin-top: 20px; font-size: 8px; color: #444; text-transform: uppercase; }
        .loading { display: inline-block; width: 10px; height: 10px; border: 2px solid #000; border-top-color: #00ffcc; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 6px; vertical-align: middle; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .card { padding: 25px; } .logo h1 { font-size: 22px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo"><h1>MAX ROUTER</h1><p>GET YOUR API KEY</p></div>
            <form id="registerForm">
                <div class="input-group"><label>EMAIL ADDRESS</label><input type="email" id="email" placeholder="DEVELOPER@EXAMPLE.COM" required></div>
                <div class="input-group"><label>PROJECT NAME</label><input type="text" id="projectName" placeholder="MY AWESOME WALLET" required></div>
                <button type="submit" id="registerBtn"><span id="btnText">REGISTER & GET API KEY</span></button>
            </form>
            <div id="result" class="result">
                <h3>REGISTRATION SUCCESSFUL</h3>
                <div class="key-box"><div class="key-label">API KEY</div><div class="key-value" id="apiKey"></div><button class="copy-btn" onclick="copyToClipboard('apiKey')">COPY</button></div>
                <div class="key-box"><div class="key-label">SECRET KEY</div><div class="key-value" id="secretKey"></div><button class="copy-btn" onclick="copyToClipboard('secretKey')">COPY</button></div>
                <div class="warning"><p>STORE YOUR SECRET KEY SAFELY<br>YOU WILL NOT SEE IT AGAIN</p></div>
                <div class="endpoints"><div class="key-label">API ENDPOINTS</div><div class="endpoint-item">GET /sol-router/quote</div><div class="endpoint-item">POST /sol-router/swap</div><div class="endpoint-item">POST /sol-router/limit</div><div class="endpoint-item">POST /sol-router/dca</div><div class="endpoint-item">POST /sol-router/perp</div><div class="endpoint-item">POST /sol-router/pool</div><div class="endpoint-item">GET /sol-router/tokens</div><div class="endpoint-item">GET /sol-router/routes</div></div>
            </div>
            <div class="footer"><p>MAX ROUTER - ADVANCED DEX AGGREGATOR<br>30+ DEXES • 0.01% FEE • LIMIT ORDERS • DCA • PERPS</p></div>
        </div>
    </div>
    <script>
        const form = document.getElementById('registerForm');
        const registerBtn = document.getElementById('registerBtn');
        const btnText = document.getElementById('btnText');
        const resultDiv = document.getElementById('result');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const projectName = document.getElementById('projectName').value.trim();
            if (!email || !projectName) { alert('PLEASE FILL ALL FIELDS'); return; }
            registerBtn.disabled = true;
            btnText.innerHTML = '<span class="loading"></span> REGISTERING...';
            try {
                const response = await fetch('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, projectName }) });
                const data = await response.json();
                if (data.success) {
                    document.getElementById('apiKey').textContent = data.apiKey;
                    document.getElementById('secretKey').textContent = data.secretKey;
                    resultDiv.classList.add('show');
                    document.getElementById('email').value = '';
                    document.getElementById('projectName').value = '';
                    btnText.innerHTML = 'REGISTERED';
                    await navigator.clipboard.writeText(`API KEY: ${data.apiKey}\nSECRET KEY: ${data.secretKey}`);
                } else { alert('REGISTRATION FAILED'); btnText.innerHTML = 'REGISTER & GET API KEY'; }
            } catch (error) { alert('REGISTRATION FAILED'); btnText.innerHTML = 'REGISTER & GET API KEY'; }
            finally { registerBtn.disabled = false; setTimeout(() => { if (btnText.innerHTML !== 'REGISTER & GET API KEY') btnText.innerHTML = 'REGISTER & GET API KEY'; }, 3000); }
        });
        function copyToClipboard(elementId) {
            const text = document.getElementById(elementId).textContent;
            if (text) { navigator.clipboard.writeText(text); const btn = event.target; const originalText = btn.textContent; btn.textContent = 'COPIED'; setTimeout(() => { btn.textContent = originalText; }, 1500); }
        }
        const savedApiKey = localStorage.getItem('max_api_key');
        if (savedApiKey) { if (confirm('YOU HAVE AN EXISTING API KEY. USE IT?')) { document.getElementById('apiKey').textContent = savedApiKey; resultDiv.classList.add('show'); } else { localStorage.removeItem('max_api_key'); } }
    </script>
</body>
</html>`;
}

async function getIntegrationHTML(): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAX ROUTER - INTEGRATION</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #0f0f1a 50%, #1a1a2e 100%);
            font-family: 'Courier New', monospace;
            padding: 20px;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        .card { background: rgba(10,10,10,0.95); border: 1px solid #00ffcc; border-radius: 16px; padding: 30px; margin-bottom: 20px; }
        .card h2 { color: #00ffcc; font-size: 14px; margin-bottom: 20px; }
        code { background: #001a1a; padding: 2px 6px; border-radius: 4px; color: #00ffcc; font-size: 10px; }
        pre { background: #0a0a0a; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 9px; color: #00ffcc; margin: 10px 0; }
        .logo h1 { color: #00ffcc; font-size: 24px; letter-spacing: 4px; text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo"><h1>MAX ROUTER - INTEGRATION GUIDE</h1></div>
        <div class="card">
            <h2>1. GET YOUR API KEY</h2>
            <p>Register at <a href="/register" style="color:#00ffcc">/register</a> to get your API key</p>
        </div>
        <div class="card">
            <h2>2. MAKE YOUR FIRST API CALL</h2>
            <pre>curl -H "X-API-Key: YOUR_API_KEY" https://fixorium.com.pk/sol-router/quote?from=SOL&to=USDC&amount=1</pre>
        </div>
        <div class="card">
            <h2>3. EXECUTE A SWAP</h2>
            <pre>curl -X POST https://fixorium.com.pk/sol-router/swap \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"fromToken":"SOL","toToken":"USDC","amount":1,"walletPublicKey":"YOUR_WALLET"}'</pre>
        </div>
        <div class="card">
            <h2>4. CREATE A LIMIT ORDER</h2>
            <pre>curl -X POST https://fixorium.com.pk/sol-router/limit \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"orderId":"001","tokenIn":"SOL","tokenOut":"USDC","amount":10,"triggerPrice":140}'</pre>
        </div>
    </div>
</body>
</html>`;
}

// ============================================
// API HANDLERS (Keep your existing handlers here)
// ============================================

async function handleHealth(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    return new Response(JSON.stringify({
        status: 'healthy', router: 'MAX ROUTER', domain: 'https://fixorium.com.pk',
        version: '2.0.0', fee: '0.01%', dexes: 30, timestamp: Date.now()
    }), { headers });
}

async function handleQuote(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    const url = new URL(context.request.url);
    const from = url.searchParams.get('from') || 'So11111111111111111111111111111111111111112';
    const to = url.searchParams.get('to') || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const amount = parseFloat(url.searchParams.get('amount') || '1');
    const quotes = [];
    try { const rayRes = await fetch(`https://api.raydium.io/v2/main/quote?inputMint=${from}&outputMint=${to}&amount=${amount * 1e9}`); const rayData = await rayRes.json(); quotes.push({ dex: 'RAYDIUM', output: rayData.outputAmount / 1e9 }); } catch(e) {}
    try { const orcaRes = await fetch(`https://api.orca.so/quote?inputMint=${from}&outputMint=${to}&amount=${amount}`); const orcaData = await orcaRes.json(); quotes.push({ dex: 'ORCA', output: orcaData.outputAmount }); } catch(e) {}
    try { const metRes = await fetch(`https://dlmm-api.meteora.ag/quote?mintA=${from}&mintB=${to}&amountA=${amount}`); const metData = await metRes.json(); quotes.push({ dex: 'METEORA', output: metData.amountB }); } catch(e) {}
    const bestRoute = quotes.length > 0 ? quotes.reduce((a, b) => a.output > b.output ? a : b) : { dex: 'NONE', output: 0 };
    return new Response(JSON.stringify({ success: true, router: 'MAX ROUTER', from, to, amount, best_route: bestRoute, all_routes: quotes, fee: { percent: '0.01%', amount: amount * 0.0001 }, timestamp: Date.now() }), { headers });
}

async function handleSwap(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    if (context.request.method !== 'POST') { return new Response(JSON.stringify({ error: 'METHOD NOT ALLOWED' }), { status: 405, headers }); }
    try {
        const body = await context.request.json();
        const { fromToken, toToken, amount, walletPublicKey } = body;
        const signature = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
        const outputAmount = amount * 150;
        return new Response(JSON.stringify({ success: true, signature, dex_used: 'RAYDIUM', amount_in: amount, amount_out: outputAmount, fee: amount * 0.0001, explorer_url: `https://solscan.io/tx/${signature}` }), { headers });
    } catch(e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers }); }
}

async function handleTokens(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    const tokens = [
        { symbol: 'SOL', name: 'SOLANA', address: 'So11111111111111111111111111111111111111112', decimals: 9 },
        { symbol: 'USDC', name: 'USD COIN', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        { symbol: 'USDT', name: 'TETHER', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
    ];
    return new Response(JSON.stringify({ success: true, count: tokens.length, tokens }), { headers });
}

async function handleRoutes(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    const url = new URL(context.request.url);
    const from = url.searchParams.get('from') || 'SOL';
    const to = url.searchParams.get('to') || 'USDC';
    const amount = parseFloat(url.searchParams.get('amount') || '100');
    return new Response(JSON.stringify({ success: true, from, to, amount, direct_routes: [{ dex: 'RAYDIUM', output: amount * 150 }, { dex: 'ORCA', output: amount * 149.8 }, { dex: 'METEORA', output: amount * 150.2 }], best_route: { dex: 'METEORA', output: amount * 150.2 } }), { headers });
}

async function handleLimit(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    if (context.request.method !== 'POST') { return new Response(JSON.stringify({ error: 'METHOD NOT ALLOWED' }), { status: 405, headers }); }
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, orderId: body.orderId || 'order_' + Date.now(), status: 'PENDING', message: 'LIMIT ORDER CREATED' }), { headers });
}

async function handleDCA(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    if (context.request.method !== 'POST') { return new Response(JSON.stringify({ error: 'METHOD NOT ALLOWED' }), { status: 405, headers }); }
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, orderId: body.orderId || 'dca_' + Date.now(), status: 'ACTIVE', nextExecution: Date.now() + (body.intervalSeconds * 1000) }), { headers });
}

async function handlePerp(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    if (context.request.method !== 'POST') { return new Response(JSON.stringify({ error: 'METHOD NOT ALLOWED' }), { status: 405, headers }); }
    const body = await context.request.json();
    const currentPrice = 150;
    const liquidationPrice = body.size > 0 ? currentPrice * (1 - (1 / body.leverage)) : currentPrice * (1 + (1 / body.leverage));
    return new Response(JSON.stringify({ success: true, positionId: body.positionId || 'perp_' + Date.now(), status: 'OPEN', entryPrice: currentPrice, liquidationPrice: liquidationPrice }), { headers });
}

async function handlePool(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    if (context.request.method !== 'POST') { return new Response(JSON.stringify({ error: 'METHOD NOT ALLOWED' }), { status: 405, headers }); }
    const body = await context.request.json();
    return new Response(JSON.stringify({ success: true, poolId: `pool_${Date.now()}`, message: 'POOL CREATED', tokenA: body.tokenA, tokenB: body.tokenB, reserveA: body.amountA, reserveB: body.amountB }), { headers });
}

async function handleRegister(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    if (context.request.method !== 'POST') { return new Response(JSON.stringify({ error: 'METHOD NOT ALLOWED' }), { status: 405, headers }); }
    const body = await context.request.json();
    const apiKey = 'max_' + crypto.randomUUID().replace(/-/g, '');
    const secretKey = 'sk_' + crypto.randomUUID().replace(/-/g, '');
    await context.env.MAX_KV.put(`user:${apiKey}`, JSON.stringify({ email: body.email, projectName: body.projectName, apiKey, secretKey, createdAt: Date.now(), requests: 0, limit: 10000, volume: 0 }));
    return new Response(JSON.stringify({ success: true, apiKey, secretKey, message: 'STORE YOUR SECRET KEY SAFELY', endpoints: { quote: 'https://fixorium.com.pk/sol-router/quote', swap: 'https://fixorium.com.pk/sol-router/swap', limit: 'https://fixorium.com.pk/sol-router/limit', dca: 'https://fixorium.com.pk/sol-router/dca', perp: 'https://fixorium.com.pk/sol-router/perp', pool: 'https://fixorium.com.pk/sol-router/pool', tokens: 'https://fixorium.com.pk/sol-router/tokens', routes: 'https://fixorium.com.pk/sol-router/routes' } }), { headers });
}

async function handleDashboard(context) {
    const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
    const apiKey = context.request.headers.get('X-API-Key');
    if (!apiKey) { return new Response(JSON.stringify({ error: 'API KEY REQUIRED' }), { status: 401, headers }); }
    const userStr = await context.env.MAX_KV.get(`user:${apiKey}`);
    if (!userStr) { return new Response(JSON.stringify({ error: 'INVALID API KEY' }), { status: 401, headers }); }
    const user = JSON.parse(userStr);
    return new Response(JSON.stringify({ success: true, email: user.email, projectName: user.projectName, requestsUsed: user.requests, requestsLimit: user.limit, volume24h: user.volume, createdAt: user.createdAt }), { headers });
}
