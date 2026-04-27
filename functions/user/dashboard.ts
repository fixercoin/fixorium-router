<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAX ROUTER - DASHBOARD</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #0f0f1a 50%, #1a1a2e 100%);
            font-family: 'Courier New', 'SF Mono', 'Fira Code', monospace;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .logo h1 {
            color: #00ffcc;
            font-size: 20px;
            letter-spacing: 4px;
        }

        .logo p {
            color: #ff3366;
            font-size: 9px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .api-status {
            background: #001a1a;
            border: 1px solid #00ffcc;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 9px;
            color: #00ffcc;
            text-transform: uppercase;
        }

        .api-status span {
            color: #ff3366;
        }

        /* Card */
        .card {
            background: rgba(10, 10, 10, 0.95);
            border: 1px solid #00ffcc;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 0 40px rgba(0, 255, 204, 0.1);
            margin-bottom: 20px;
        }

        .card-title {
            color: #00ffcc;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 20px;
            border-bottom: 1px solid #00ffcc33;
            padding-bottom: 10px;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }

        .stat-box {
            background: #001a1a;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #00ffcc;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 8px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        /* Info Row */
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #00ffcc11;
        }

        .info-label {
            font-size: 9px;
            color: #ff3366;
            text-transform: uppercase;
        }

        .info-value {
            font-size: 9px;
            color: #00ffcc;
            font-family: monospace;
            word-break: break-all;
            text-align: right;
        }

        /* Progress Bar */
        .progress-section {
            margin: 20px 0;
        }

        .progress-label {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #888;
            margin-bottom: 6px;
            text-transform: uppercase;
        }

        .progress-bar {
            background: #001a1a;
            height: 6px;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-fill {
            background: linear-gradient(90deg, #00ffcc, #00997a);
            height: 100%;
            border-radius: 3px;
            transition: width 0.5s ease;
        }

        /* Endpoints List */
        .endpoints-list {
            margin-top: 15px;
        }

        .endpoint-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #00ffcc11;
            font-size: 8px;
        }

        .endpoint-method {
            background: #00ffcc20;
            padding: 2px 6px;
            border-radius: 4px;
            color: #00ffcc;
            font-weight: bold;
        }

        .endpoint-url {
            color: #888;
            font-family: monospace;
        }

        .endpoint-copy {
            background: none;
            border: 1px solid #00ffcc33;
            padding: 2px 8px;
            border-radius: 4px;
            color: #00ffcc;
            font-size: 7px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .endpoint-copy:hover {
            background: #00ffcc;
            color: #000;
        }

        /* Buttons */
        .btn-group {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .btn {
            flex: 1;
            background: #001a1a;
            border: 1px solid #00ffcc;
            padding: 10px;
            color: #00ffcc;
            font-size: 9px;
            text-transform: uppercase;
            font-family: monospace;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            text-decoration: none;
        }

        .btn:hover {
            background: #00ffcc;
            color: #000;
        }

        .btn-danger {
            border-color: #ff3366;
            color: #ff3366;
        }

        .btn-danger:hover {
            background: #ff3366;
            color: #000;
        }

        /* Input for API Key */
        .api-input-section {
            margin-bottom: 20px;
        }

        .api-input-group {
            display: flex;
            gap: 10px;
        }

        .api-input-group input {
            flex: 1;
            background: #001a1a;
            border: 1px solid #00ffcc33;
            padding: 10px 12px;
            color: #00ffcc;
            font-size: 9px;
            font-family: monospace;
            border-radius: 8px;
        }

        .api-input-group input:focus {
            outline: none;
            border-color: #00ffcc;
        }

        .api-input-group button {
            background: #00ffcc;
            border: none;
            padding: 10px 20px;
            color: #000;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            cursor: pointer;
            border-radius: 8px;
        }

        /* Loading */
        .loading {
            text-align: center;
            padding: 40px;
            color: #00ffcc;
            font-size: 10px;
            text-transform: uppercase;
        }

        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #00ffcc33;
            border-top-color: #00ffcc;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Error */
        .error {
            background: rgba(255, 51, 102, 0.1);
            border: 1px solid #ff3366;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin-bottom: 20px;
        }

        .error p {
            color: #ff3366;
            font-size: 9px;
            text-transform: uppercase;
        }

        /* Footer */
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 8px;
            color: #444;
            text-transform: uppercase;
        }

        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .btn-group {
                flex-direction: column;
            }
            .card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <h1>MAX ROUTER</h1>
                <p>DASHBOARD</p>
            </div>
            <div id="apiStatus" class="api-status">
                STATUS: <span id="statusText">NOT CONNECTED</span>
            </div>
        </div>

        <div id="apiKeySection" class="card">
            <div class="card-title">🔑 ENTER API KEY</div>
            <div class="api-input-section">
                <div class="api-input-group">
                    <input type="text" id="apiKeyInput" placeholder="ENTER YOUR API KEY" autocomplete="off">
                    <button id="connectBtn">CONNECT</button>
                </div>
                <p style="font-size: 7px; color: #444; margin-top: 8px; text-transform: uppercase;">
                    DON'T HAVE AN API KEY? <a href="/register.html" style="color: #00ffcc;">REGISTER HERE</a>
                </p>
            </div>
        </div>

        <div id="dashboardContent" style="display: none;">
            <div class="card">
                <div class="card-title">📊 USAGE STATISTICS</div>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value" id="requestsUsed">0</div>
                        <div class="stat-label">REQUESTS USED</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="requestsLimit">10,000</div>
                        <div class="stat-label">REQUESTS LIMIT</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="volume24h">$0</div>
                        <div class="stat-label">VOLUME (24H)</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="remainingPercent">100%</div>
                        <div class="stat-label">REMAINING</div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>API USAGE</span>
                        <span id="usageText">0 / 10000</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">👤 ACCOUNT INFORMATION</div>
                <div class="info-row">
                    <span class="info-label">EMAIL</span>
                    <span class="info-value" id="userEmail">-</span>
                </div>
                <div class="info-row">
                    <span class="info-label">PROJECT NAME</span>
                    <span class="info-value" id="projectName">-</span>
                </div>
                <div class="info-row">
                    <span class="info-label">API KEY</span>
                    <span class="info-value" id="displayApiKey">-</span>
                </div>
                <div class="info-row">
                    <span class="info-label">CREATED AT</span>
                    <span class="info-value" id="createdAt">-</span>
                </div>
            </div>

            <div class="card">
                <div class="card-title">📡 API ENDPOINTS</div>
                <div class="endpoints-list">
                    <div class="endpoint-item">
                        <span class="endpoint-method">GET</span>
                        <span class="endpoint-url">/sol-router/quote</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/quote')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">POST</span>
                        <span class="endpoint-url">/sol-router/swap</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/swap')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">POST</span>
                        <span class="endpoint-url">/sol-router/limit</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/limit')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">POST</span>
                        <span class="endpoint-url">/sol-router/dca</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/dca')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">POST</span>
                        <span class="endpoint-url">/sol-router/perp</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/perp')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">POST</span>
                        <span class="endpoint-url">/sol-router/pool</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/pool')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">GET</span>
                        <span class="endpoint-url">/sol-router/tokens</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/tokens')">COPY</button>
                    </div>
                    <div class="endpoint-item">
                        <span class="endpoint-method">GET</span>
                        <span class="endpoint-url">/sol-router/routes</span>
                        <button class="endpoint-copy" onclick="copyEndpoint('/sol-router/routes')">COPY</button>
                    </div>
                </div>
            </div>

            <div class="btn-group">
                <button class="btn" onclick="refreshDashboard()">🔄 REFRESH</button>
                <button class="btn btn-danger" onclick="disconnect()">🚪 DISCONNECT</button>
            </div>
        </div>

        <div class="footer">
            <p>MAX ROUTER - ADVANCED DEX AGGREGATOR</p>
            <p>30+ DEXES • 0.01% FEE • LIMIT ORDERS • DCA • PERPS</p>
        </div>
    </div>

    <script>
        let currentApiKey = null;

        // Load saved API key from localStorage
        const savedKey = localStorage.getItem('max_api_key');
        if (savedKey) {
            document.getElementById('apiKeyInput').value = savedKey;
            connectDashboard(savedKey);
        }

        document.getElementById('connectBtn').addEventListener('click', () => {
            const apiKey = document.getElementById('apiKeyInput').value.trim();
            if (!apiKey) {
                alert('PLEASE ENTER YOUR API KEY');
                return;
            }
            connectDashboard(apiKey);
        });

        async function connectDashboard(apiKey) {
            showLoading(true);
            
            try {
                const response = await fetch('/user/dashboard', {
                    headers: { 'X-API-Key': apiKey }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    currentApiKey = apiKey;
                    localStorage.setItem('max_api_key', apiKey);
                    displayDashboard(data);
                    document.getElementById('apiKeySection').style.display = 'none';
                    document.getElementById('dashboardContent').style.display = 'block';
                    document.getElementById('statusText').textContent = 'CONNECTED';
                    document.getElementById('statusText').style.color = '#00ffcc';
                } else {
                    showError('INVALID API KEY. PLEASE CHECK AND TRY AGAIN.');
                    localStorage.removeItem('max_api_key');
                }
            } catch (error) {
                console.error('Error:', error);
                showError('CONNECTION FAILED. PLEASE TRY AGAIN.');
            } finally {
                showLoading(false);
            }
        }

        function displayDashboard(data) {
            // User info
            document.getElementById('userEmail').textContent = data.email || '-';
            document.getElementById('projectName').textContent = data.projectName || '-';
            document.getElementById('displayApiKey').textContent = maskApiKey(currentApiKey);
            document.getElementById('createdAt').textContent = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-';
            
            // Stats
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
        }

        async function refreshDashboard() {
            if (!currentApiKey) return;
            
            try {
                const response = await fetch('/user/dashboard', {
                    headers: { 'X-API-Key': currentApiKey }
                });
                const data = await response.json();
                if (data.success) {
                    displayDashboard(data);
                }
            } catch (error) {
                console.error('Refresh failed:', error);
            }
        }

        function disconnect() {
            currentApiKey = null;
            localStorage.removeItem('max_api_key');
            document.getElementById('apiKeySection').style.display = 'block';
            document.getElementById('dashboardContent').style.display = 'none';
            document.getElementById('apiKeyInput').value = '';
            document.getElementById('statusText').textContent = 'NOT CONNECTED';
            document.getElementById('statusText').style.color = '#ff3366';
        }

        function copyEndpoint(endpoint) {
            const fullUrl = `https://fixorium.com.pk${endpoint}`;
            navigator.clipboard.writeText(fullUrl);
            
            // Show feedback
            const btns = document.querySelectorAll('.endpoint-copy');
            for (let btn of btns) {
                if (btn.textContent === 'COPY') {
                    btn.textContent = 'COPIED!';
                    setTimeout(() => {
                        btn.textContent = 'COPY';
                    }, 1500);
                    break;
                }
            }
        }

        function maskApiKey(key) {
            if (!key) return '-';
            if (key.length <= 16) return key;
            return key.slice(0, 12) + '...' + key.slice(-8);
        }

        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.innerHTML = `<p>⚠️ ${message} ⚠️</p>`;
            const container = document.querySelector('.container');
            const existingError = document.querySelector('.error');
            if (existingError) existingError.remove();
            container.insertBefore(errorDiv, container.firstChild);
            setTimeout(() => errorDiv.remove(), 5000);
        }

        function showLoading(show) {
            const btn = document.getElementById('connectBtn');
            if (show) {
                btn.textContent = 'CONNECTING...';
                btn.disabled = true;
            } else {
                btn.textContent = 'CONNECT';
                btn.disabled = false;
            }
        }

        // Auto-refresh every 30 seconds
        setInterval(() => {
            if (currentApiKey) {
                refreshDashboard();
            }
        }, 30000);
    </script>
</body>
</html>
