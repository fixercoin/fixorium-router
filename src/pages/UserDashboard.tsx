import React, { useState, useEffect } from 'react';

interface DashboardProps {
    walletAddress?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ walletAddress = '' }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [copied, setCopied] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [activeTab, setActiveTab] = useState<'max' | 'mintme'>('max');
    
    // API testing states
    const [maxEndpoint, setMaxEndpoint] = useState('quote');
    const [maxParams, setMaxParams] = useState('{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "amount": "1000000"\n}');
    const [maxResponse, setMaxResponse] = useState('');
    const [maxLoading, setMaxLoading] = useState(false);
    
    const [mintMeEndpoint, setMintMeEndpoint] = useState('quote');
    const [mintMeParams, setMintMeParams] = useState('{\n  "tokenIn": "0x0000000000000000000000000000000000000000",\n  "tokenOut": "0x091da08c5bf888252ed1ab3e44246cbf72d63307",\n  "amountIn": "1000000000000000000",\n  "recipient": "0xYourWalletAddress"\n}');
    const [mintMeResponse, setMintMeResponse] = useState('');
    const [mintMeLoading, setMintMeLoading] = useState(false);
    
    const [apiUsage, setApiUsage] = useState({
        maxCalls: 0,
        maxLimit: 10000,
        mintMeCalls: 0,
        mintMeLimit: 5000
    });

    const MINTME_CONTRACT = "0x33C60168f237146647891BAae4ca4DF8Ac58D03E";
    const MAX_PROGRAM_ID = "EfKNU2eApaQY53ghPR4t3wTuGYSrvSa26NJMo37e1UdM";

    // Available MAX endpoints
    const maxEndpoints = [
        { value: 'quote', label: 'QUOTE', method: 'GET', description: 'Get swap quote' },
        { value: 'swap', label: 'SWAP', method: 'POST', description: 'Execute swap' },
        { value: 'pools', label: 'POOLS', method: 'GET', description: 'Get liquidity pools' },
        { value: 'tokenPrice', label: 'TOKEN PRICE', method: 'GET', description: 'Get token price' },
        { value: 'getAccount', label: 'GET ACCOUNT', method: 'GET', description: 'Get account info' },
        { value: 'limitOrder', label: 'LIMIT ORDER', method: 'POST', description: 'Create limit order' },
        { value: 'dca', label: 'DCA', method: 'POST', description: 'Create DCA strategy' }
    ];

    // Available MintMe endpoints
    const mintMeEndpoints = [
        { value: 'quote', label: 'QUOTE', method: 'POST', description: 'Get swap quote' },
        { value: 'swap', label: 'SWAP', method: 'POST', description: 'Execute swap' },
        { value: 'liquidity', label: 'LIQUIDITY', method: 'GET', description: 'Get liquidity pools' }
    ];

    useEffect(() => {
        // Update params based on selected endpoint
        const endpointConfig: Record<string, string> = {
            quote: '{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "amount": "1000000"\n}',
            swap: '{\n  "userPublicKey": "YourSolanaWalletAddressHere",\n  "quoteResponse": {\n    "inputMint": "So11111111111111111111111111111111111111112",\n    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n    "inAmount": "1000000",\n    "outAmount": "999900",\n    "fee": {\n      "bps": 1,\n      "percentage": "0.01%",\n      "amount": "100"\n    }\n  }\n}',
            pools: '{\n  "mint": "So11111111111111111111111111111111111111112"\n}',
            tokenPrice: '{\n  "mint": "So11111111111111111111111111111111111111112"\n}',
            getAccount: '{\n  "publicKey": "YourSolanaWalletAddressHere"\n}',
            limitOrder: '{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "inputAmount": "1000000",\n  "triggerPrice": "150.5",\n  "expiryDays": 7,\n  "userPublicKey": "YourSolanaWalletAddressHere"\n}',
            dca: '{\n  "inputMint": "So11111111111111111111111111111111111111112",\n  "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",\n  "totalAmount": "10000000",\n  "amountPerCycle": "1000000",\n  "cycleSeconds": 86400,\n  "totalCycles": 10,\n  "userPublicKey": "YourSolanaWalletAddressHere"\n}'
        };
        setMaxParams(endpointConfig[maxEndpoint] || endpointConfig.quote);
    }, [maxEndpoint]);

    useEffect(() => {
        const userEmail = localStorage.getItem('user_email');
        const userRegistered = localStorage.getItem('user_registered');
        const savedApiKey = localStorage.getItem('max_api_key');
        const savedApiSecret = localStorage.getItem('max_api_secret');
        
        if (userEmail && userRegistered === 'true') {
            setRegisteredEmail(userEmail);
            setIsRegistered(true);
            if (savedApiKey) setApiKey(savedApiKey);
            if (savedApiSecret) setApiSecret(savedApiSecret);
        }
        
        const savedUsage = localStorage.getItem('api_usage');
        if (savedUsage) {
            setApiUsage(JSON.parse(savedUsage));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_registered');
        localStorage.removeItem('max_api_key');
        localStorage.removeItem('max_api_secret');
        setIsRegistered(false);
        setRegisteredEmail('');
        setApiKey('');
        setApiSecret('');
        window.location.href = '/';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getMethodForEndpoint = (endpoint: string): string => {
        const methods: Record<string, string> = {
            quote: 'GET',
            swap: 'POST',
            pools: 'GET',
            tokenPrice: 'GET',
            getAccount: 'GET',
            limitOrder: 'POST',
            dca: 'POST'
        };
        return methods[endpoint] || 'GET';
    };

    const testMaxEndpoint = async () => {
        setMaxLoading(true);
        setMaxResponse('');
        
        if (!apiKey) {
            setMaxResponse('Error: No MAX API key found. Please register for MAX API first.');
            setMaxLoading(false);
            return;
        }
        
        try {
            let url = `/api/max/v1/${maxEndpoint}`;
            const method = getMethodForEndpoint(maxEndpoint);
            let options: RequestInit = {
                method: method,
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                }
            };
            
            if (method === 'GET') {
                let params;
                try {
                    params = JSON.parse(maxParams);
                } catch (e) {
                    setMaxResponse(`Error: Invalid JSON\n\n${e.message}`);
                    setMaxLoading(false);
                    return;
                }
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            } else {
                let body;
                try {
                    body = JSON.parse(maxParams);
                } catch (e) {
                    setMaxResponse(`Error: Invalid JSON\n\n${e.message}`);
                    setMaxLoading(false);
                    return;
                }
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            setMaxResponse(JSON.stringify(data, null, 2));
            
            const newUsage = { ...apiUsage, maxCalls: apiUsage.maxCalls + 1 };
            setApiUsage(newUsage);
            localStorage.setItem('api_usage', JSON.stringify(newUsage));
        } catch (error: any) {
            setMaxResponse(`Error: ${error.message}`);
        } finally {
            setMaxLoading(false);
        }
    };

    const testMintMeEndpoint = async () => {
        setMintMeLoading(true);
        setMintMeResponse('');
        
        try {
            let url = `/api/mintme/v1/${mintMeEndpoint}`;
            let options: RequestInit = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            
            if (mintMeEndpoint === 'quote' || mintMeEndpoint === 'swap') {
                options.method = 'POST';
                let body;
                try {
                    body = JSON.parse(mintMeParams);
                } catch (e) {
                    setMintMeResponse(`Error: Invalid JSON in parameters\n\n${e.message}`);
                    setMintMeLoading(false);
                    return;
                }
                options.body = JSON.stringify(body);
            } else if (mintMeEndpoint === 'liquidity') {
                options.method = 'GET';
                let params;
                try {
                    params = JSON.parse(mintMeParams);
                } catch (e) {
                    setMintMeResponse(`Error: Invalid JSON in parameters\n\n${e.message}`);
                    setMintMeLoading(false);
                    return;
                }
                const queryParams = new URLSearchParams(params).toString();
                url += `?${queryParams}`;
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            setMintMeResponse(JSON.stringify(data, null, 2));
            
            const newUsage = { ...apiUsage, mintMeCalls: apiUsage.mintMeCalls + 1 };
            setApiUsage(newUsage);
            localStorage.setItem('api_usage', JSON.stringify(newUsage));
        } catch (error: any) {
            setMintMeResponse(`Error: ${error.message}`);
        } finally {
            setMintMeLoading(false);
        }
    };

    const currentMaxEndpoint = maxEndpoints.find(e => e.value === maxEndpoint);

    return (
        <div className="min-h-screen bg-dark">
            {/* Fixed Header */}
            <header className="fixed top-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-b border-border z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-8">
                            <div className="text-base font-semibold text-primary uppercase tracking-wider">
                                DEFI PLATFORM
                            </div>
                            <nav className="hidden md:flex items-center gap-6">
                                <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    EXCHANGE
                                </a>
                                <button onClick={() => window.location.href = '/'} className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    HOME
                                </button>
                                <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    WALLET
                                </a>
                                <a href="https://fixorium.com.pk/team" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-primary transition uppercase tracking-wider">
                                    TEAM
                                </a>
                            </nav>
                        </div>

                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 text-gray-400 hover:text-primary transition p-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-[10px] font-medium uppercase tracking-wider">PROFILE</span>
                            </button>
                            
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50">
                                    <div className="py-1">
                                        {isRegistered && (
                                            <>
                                                <div className="px-4 py-3 border-b border-border">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">ACCOUNT</div>
                                                    <div className="text-xs text-white break-all">{registeredEmail}</div>
                                                </div>
                                                <div className="px-4 py-3 border-b border-border">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">MAX API KEY</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="flex-1 text-[10px] text-primary break-all bg-darker p-1.5 rounded">
                                                            {apiKey || 'Not available'}
                                                        </code>
                                                        {apiKey && (
                                                            <button onClick={() => copyToClipboard(apiKey)} className="text-gray-400 hover:text-white p-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="px-4 py-3">
                                                    <div className="text-[10px] text-gray-400 uppercase mb-1">MINTME CONTRACT</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <code className="flex-1 text-[10px] text-green-400 break-all bg-darker p-1.5 rounded">
                                                            {MINTME_CONTRACT}
                                                        </code>
                                                        <button onClick={() => copyToClipboard(MINTME_CONTRACT)} className="text-gray-400 hover:text-white p-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="px-4 py-3 border-t border-border mt-2">
                                                    <button onClick={handleLogout} className="w-full text-left px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 transition uppercase tracking-wider">LOGOUT</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Custom Marquee */}
            <div className="fixed top-14 left-0 right-0 bg-primary/10 border-y border-primary/20 overflow-hidden whitespace-nowrap py-2 z-40">
                <div className="inline-block animate-marquee whitespace-nowrap">
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">NEW</span>
                        <span className="text-white text-[9px] uppercase tracking-wider">FIXORIUM EXCHANGE — MULTICHAIN DEX AGGREGATOR</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">WALLET</span>
                        <span className="text-white text-[9px] uppercase tracking-wider">FIXORIUM WALLET — MULTICHAIN WALLET</span>
                    </span>
                    <span className="mx-4 inline-flex items-center gap-2">
                        <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">API</span>
                        <span className="text-white text-[9px] uppercase tracking-wider">7 ENDPOINTS: QUOTE • SWAP • POOLS • TOKEN PRICE • ACCOUNT • LIMIT ORDER • DCA</span>
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column - 30% */}
                        <div className="lg:w-[30%] flex">
                            <div className="w-full border border-gray-700 rounded-xl overflow-hidden bg-transparent flex flex-col">
                                <div className="p-5 border-b border-gray-700">
                                    <h1 className="text-lg font-bold text-primary uppercase tracking-wider">API DASHBOARD</h1>
                                    <p className="text-xs text-gray-400 mt-1">Welcome back, <span className="text-primary">{registeredEmail}</span></p>
                                </div>

                                <div className="p-5 border-b border-gray-700">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">API USAGE</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span>MAX API (Solana)</span>
                                                <span>{apiUsage.maxCalls} / {apiUsage.maxLimit}</span>
                                            </div>
                                            <div className="w-full bg-darker rounded-full h-1.5">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(apiUsage.maxCalls / apiUsage.maxLimit) * 100}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span>MintMe API (EVM)</span>
                                                <span>{apiUsage.mintMeCalls} / {apiUsage.mintMeLimit}</span>
                                            </div>
                                            <div className="w-full bg-darker rounded-full h-1.5">
                                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(apiUsage.mintMeCalls / apiUsage.mintMeLimit) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Simple Text Tabs */}
                                <div className="p-5 border-b border-gray-700">
                                    <div className="flex gap-6">
                                        <button
                                            onClick={() => setActiveTab('max')}
                                            className={`text-sm font-semibold uppercase tracking-wider transition-all pb-2 ${activeTab === 'max' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                                        >
                                            MAX API
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('mintme')}
                                            className={`text-sm font-semibold uppercase tracking-wider transition-all pb-2 ${activeTab === 'mintme' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-gray-300'}`}
                                        >
                                            MINTME API
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 flex-1">
                                    <div className="text-[10px] text-gray-400 uppercase mb-2">
                                        {activeTab === 'max' ? 'Your API Key' : 'Contract Address'}
                                    </div>
                                    <div className="bg-darker rounded-lg p-2 mb-3 border border-gray-700">
                                        <code className="text-[9px] break-all">
                                            {activeTab === 'max' 
                                                ? (apiKey ? `${apiKey.slice(0, 30)}...` : 'Not available')
                                                : MINTME_CONTRACT
                                            }
                                        </code>
                                    </div>
                                    {activeTab === 'max' && apiKey && (
                                        <button onClick={() => copyToClipboard(apiKey)} className="w-full py-2 bg-primary/10 text-primary text-[10px] font-semibold rounded-lg hover:bg-primary/20 transition border border-gray-700">
                                            COPY API KEY
                                        </button>
                                    )}
                                    {activeTab === 'mintme' && (
                                        <button onClick={() => copyToClipboard(MINTME_CONTRACT)} className="w-full py-2 bg-green-500/10 text-green-400 text-[10px] font-semibold rounded-lg hover:bg-green-500/20 transition border border-gray-700">
                                            COPY CONTRACT ADDRESS
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - 70% */}
                        <div className="lg:w-[70%] flex">
                            {activeTab === 'max' ? (
                                <div className="w-full border border-gray-700 rounded-xl overflow-hidden bg-transparent flex flex-col">
                                    <div className="p-6 border-b border-gray-700">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MAX API TESTER</h2>
                                                <p className="text-[11px] text-gray-400 mt-1">Solana DEX Aggregator - 0.01% Fee</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <select
                                                    value={maxEndpoint}
                                                    onChange={(e) => setMaxEndpoint(e.target.value)}
                                                    className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-700 bg-darker text-gray-400 hover:text-white focus:border-primary outline-none"
                                                >
                                                    {maxEndpoints.map(ep => (
                                                        <option key={ep.value} value={ep.value}>
                                                            {ep.label} ({ep.method})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        {currentMaxEndpoint && (
                                            <div className="mt-2 text-[9px] text-gray-500">
                                                {currentMaxEndpoint.description} • Method: {currentMaxEndpoint.method}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                            <div className="flex flex-col">
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">REQUEST PARAMETERS</label>
                                                <textarea 
                                                    value={maxParams} 
                                                    onChange={(e) => setMaxParams(e.target.value)} 
                                                    className="flex-1 w-full p-3 bg-darker border border-gray-700 rounded-lg text-white text-xs font-mono focus:border-primary outline-none resize-none min-h-[350px]" 
                                                    placeholder="Enter JSON parameters..."
                                                />
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-[9px] text-gray-400">Program ID: {MAX_PROGRAM_ID.slice(0, 16)}...</div>
                                                    <button 
                                                        onClick={testMaxEndpoint} 
                                                        disabled={maxLoading || !apiKey} 
                                                        className="px-5 py-2 bg-primary text-black text-[11px] font-bold rounded-lg hover:bg-[#e8d58a] transition disabled:opacity-50"
                                                    >
                                                        {maxLoading ? 'SENDING...' : 'SEND REQUEST'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">RESPONSE</label>
                                                <pre className="flex-1 w-full p-3 bg-darker border border-gray-700 rounded-lg text-[10px] text-gray-300 font-mono overflow-auto whitespace-pre-wrap break-all min-h-[350px]">
                                                    {maxResponse || 'Click "SEND REQUEST" to test the endpoint...'}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full border border-gray-700 rounded-xl overflow-hidden bg-transparent flex flex-col">
                                    <div className="p-6 border-b border-gray-700">
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div>
                                                <h2 className="text-lg font-bold text-primary uppercase tracking-wider">MINTME API TESTER</h2>
                                                <p className="text-[11px] text-gray-400 mt-1">EVM DEX Aggregator - 0.01% Fee</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <select
                                                    value={mintMeEndpoint}
                                                    onChange={(e) => setMintMeEndpoint(e.target.value)}
                                                    className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-700 bg-darker text-gray-400 hover:text-white focus:border-primary outline-none"
                                                >
                                                    {mintMeEndpoints.map(ep => (
                                                        <option key={ep.value} value={ep.value}>
                                                            {ep.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                            <div className="flex flex-col">
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">REQUEST PARAMETERS</label>
                                                <textarea 
                                                    value={mintMeParams} 
                                                    onChange={(e) => setMintMeParams(e.target.value)} 
                                                    className="flex-1 w-full p-3 bg-darker border border-gray-700 rounded-lg text-white text-xs font-mono focus:border-primary outline-none resize-none min-h-[350px]" 
                                                    placeholder="Enter JSON parameters..."
                                                />
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="text-[9px] text-gray-400">Contract: {MINTME_CONTRACT.slice(0, 16)}...</div>
                                                    <button 
                                                        onClick={testMintMeEndpoint} 
                                                        disabled={mintMeLoading} 
                                                        className="px-5 py-2 bg-primary text-black text-[11px] font-bold rounded-lg hover:bg-[#e8d58a] transition disabled:opacity-50"
                                                    >
                                                        {mintMeLoading ? 'SENDING...' : 'SEND REQUEST'}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <label className="block text-[10px] text-gray-400 uppercase mb-2 font-semibold">RESPONSE</label>
                                                <pre className="flex-1 w-full p-3 bg-darker border border-gray-700 rounded-lg text-[10px] text-gray-300 font-mono overflow-auto whitespace-pre-wrap break-all min-h-[350px]">
                                                    {mintMeResponse || 'Click "SEND REQUEST" to test the endpoint...'}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-darker/95 backdrop-blur-md border-t border-border z-50 md:hidden">
                <div className="flex items-center justify-around py-2">
                    <a href="https://exchange.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m3 4H4m0 0l4 4m-4-4l4-4" /></svg>
                        <span className="text-[8px] uppercase">EXCHANGE</span>
                    </a>
                    <button onClick={() => window.location.href = '/'} className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        <span className="text-[8px] uppercase">HOME</span>
                    </button>
                    <a href="https://wallet.fixorium.com.pk" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M6 14h12M9 18h6M12 6v12" /></svg>
                        <span className="text-[8px] uppercase">WALLET</span>
                    </a>
                    <a href="https://fixorium.com.pk/team" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 text-gray-400 hover:text-primary transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        <span className="text-[8px] uppercase">TEAM</span>
                    </a>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 40s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
