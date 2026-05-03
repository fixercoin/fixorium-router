import React, { useState, useEffect } from 'react';

interface Token {
    symbol: string;
    name: string;
    mint: string;
    logo: string;
    decimals: number;
}

interface QuoteResponse {
    success: boolean;
    source: string;
    aggregator: string;
    fee: string;
    input: { token: string; amount: number; mint: string };
    output: { token: string; amount: number; quote: number; mint: string };
    fee_amount: number;
    price_impact: number;
    min_output: number;
    route?: Array<{ dex: string; percent: number }>;
}

interface DexStatus {
    name: string;
    logo: string;
    status: 'active' | 'testing' | 'error';
    latency?: number;
}

const TOKENS: Token[] = [
    { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', logo: '🟠', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', logo: '💵', decimals: 6 },
    { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', logo: '💰', decimals: 6 },
    { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', logo: '🐕', decimals: 5 },
    { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', logo: '🪐', decimals: 6 },
    { symbol: 'PYTH', name: 'Pyth', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', logo: '📊', decimals: 6 },
    { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', logo: '🔴', decimals: 6 },
    { symbol: 'ORCA', name: 'Orca', mint: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE', logo: '🐋', decimals: 6 },
];

const DEX_LIST: DexStatus[] = [
    { name: 'Raydium', logo: '🔴', status: 'active' },
    { name: 'Orca', logo: '🐋', status: 'active' },
    { name: 'Meteora', logo: '🌠', status: 'active' },
    { name: 'Pump.fun', logo: '🎯', status: 'active' },
    { name: 'Phoenix', logo: '🔥', status: 'active' },
    { name: 'OpenBook', logo: '📖', status: 'active' },
    { name: 'Lifinity', logo: '♾️', status: 'testing' },
    { name: 'GooseFX', logo: '🦢', status: 'testing' },
];

const Dashboard: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
    const [toToken, setToToken] = useState<Token>(TOKENS[1]);
    const [amount, setAmount] = useState('1');
    const [quote, setQuote] = useState<QuoteResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [slippage, setSlippage] = useState(0.5);
    const [dexStatuses, setDexStatuses] = useState<DexStatus[]>(DEX_LIST);
    const [testingDex, setTestingDex] = useState<string | null>(null);
    const [showFromTokens, setShowFromTokens] = useState(false);
    const [showToTokens, setShowToTokens] = useState(false);
    const [activeTab, setActiveTab] = useState<'quote' | 'test' | 'analytics'>('quote');

    useEffect(() => {
        const key = localStorage.getItem('max_api_key');
        if (key) setApiKey(key);
    }, []);

    const fetchQuote = async () => {
        setLoading(true);
        setError(null);
        setQuote(null);
        
        try {
            const amountInLamports = (parseFloat(amount) * Math.pow(10, fromToken.decimals)).toFixed(0);
            const res = await fetch(
                `/api/max/v1/quote?input=${fromToken.symbol}&output=${toToken.symbol}&amount=${amount}&slippage=${slippage}`,
                { headers: { 'X-API-Key': apiKey } }
            );
            const data = await res.json();
            
            if (data.success) {
                setQuote(data);
            } else {
                setError(data.error || 'Quote failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    const testSingleDex = async (dexName: string) => {
        setTestingDex(dexName);
        setDexStatuses(prev => prev.map(d => 
            d.name === dexName ? { ...d, status: 'testing' } : d
        ));
        
        const startTime = performance.now();
        
        try {
            const res = await fetch(
                `/api/max/v1/quote?input=${fromToken.symbol}&output=${toToken.symbol}&amount=0.1`
            );
            const latency = performance.now() - startTime;
            
            if (res.ok) {
                setDexStatuses(prev => prev.map(d => 
                    d.name === dexName ? { ...d, status: 'active', latency } : d
                ));
            } else {
                setDexStatuses(prev => prev.map(d => 
                    d.name === dexName ? { ...d, status: 'error', latency } : d
                ));
            }
        } catch {
            setDexStatuses(prev => prev.map(d => 
                d.name === dexName ? { ...d, status: 'error' } : d
            ));
        } finally {
            setTestingDex(null);
        }
    };

    const testAllDexes = async () => {
        for (const dex of dexStatuses) {
            await testSingleDex(dex.name);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    const swapTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
    };

    const formatNumber = (num: number, decimals: number = 6) => {
        return num.toFixed(decimals).replace(/\.?0+$/, '');
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">MAX Aggregator Dashboard</h1>
                    <p className="text-gray-600">Test swaps with 0.01% fee across all Solana DEXes</p>
                </div>

                {/* API Key Status */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg">
                        <span className="text-xs text-gray-500">API Key: </span>
                        <span className="text-xs text-gray-800 font-mono">
                            {apiKey ? `${apiKey.slice(0, 16)}...` : 'Not configured'}
                        </span>
                    </div>
                    <button 
                        onClick={testAllDexes}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                        Test All DEXes
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-6">
                    {['quote', 'test', 'analytics'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 text-sm font-medium capitalize transition ${
                                activeTab === tab 
                                    ? 'text-blue-600 border-b-2 border-blue-600' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab === 'quote' ? 'Quote Tester' : tab === 'test' ? 'DEX Testing' : 'Analytics'}
                        </button>
                    ))}
                </div>

                {/* Quote Tester Tab */}
                {activeTab === 'quote' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Input Form */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Swap Parameters</h3>
                            
                            <div className="space-y-4">
                                {/* From Token */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">From</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowFromTokens(!showFromTokens)}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            <span>{fromToken.logo}</span>
                                            <span className="font-medium">{fromToken.symbol}</span>
                                            <span>▼</span>
                                        </button>
                                        <input 
                                            type="number"
                                            value={amount} 
                                            onChange={(e) => setAmount(e.target.value)} 
                                            className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:border-blue-500 focus:outline-none"
                                            placeholder="Amount"
                                        />
                                    </div>
                                </div>

                                {/* Swap Direction */}
                                <div className="flex justify-center">
                                    <button 
                                        onClick={swapTokens}
                                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </button>
                                </div>

                                {/* To Token */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">To</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowToTokens(!showToTokens)}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            <span>{toToken.logo}</span>
                                            <span className="font-medium">{toToken.symbol}</span>
                                            <span>▼</span>
                                        </button>
                                        <input 
                                            value={quote?.output?.amount || ''} 
                                            readOnly
                                            className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm"
                                            placeholder="Receive amount"
                                        />
                                    </div>
                                </div>

                                {/* Slippage */}
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Slippage Tolerance</label>
                                    <div className="flex gap-2">
                                        {[0.1, 0.5, 1.0].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setSlippage(val)}
                                                className={`px-3 py-1 text-sm rounded-lg ${
                                                    slippage === val 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                }`}
                                            >
                                                {val}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={fetchQuote} 
                                    disabled={loading || !apiKey}
                                    className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Fetching Quote...' : 'Get Quote'}
                                </button>
                            </div>

                            {/* Token Dropdowns */}
                            {showFromTokens && (
                                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                    {TOKENS.map((token) => (
                                        <button
                                            key={token.symbol}
                                            onClick={() => { setFromToken(token); setShowFromTokens(false); }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50"
                                        >
                                            <span className="text-lg">{token.logo}</span>
                                            <div className="text-left">
                                                <div className="font-medium">{token.symbol}</div>
                                                <div className="text-xs text-gray-500">{token.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showToTokens && (
                                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                    {TOKENS.map((token) => (
                                        <button
                                            key={token.symbol}
                                            onClick={() => { setToToken(token); setShowToTokens(false); }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50"
                                        >
                                            <span className="text-lg">{token.logo}</span>
                                            <div className="text-left">
                                                <div className="font-medium">{token.symbol}</div>
                                                <div className="text-xs text-gray-500">{token.name}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quote Result */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Quote Result</h3>
                            </div>
                            <div className="p-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                {quote && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Route Source</span>
                                            <span className="text-blue-600 font-medium text-sm">{quote.source}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">From</span>
                                            <span className="text-gray-900 font-medium">
                                                {amount} {quote.input.token}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">To</span>
                                            <span className="text-gray-900 font-medium">
                                                {formatNumber(quote.output.amount)} {quote.output.token}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Rate</span>
                                            <span className="text-gray-900 font-mono text-sm">
                                                1 {quote.input.token} = {quote.output.quote} {quote.output.token}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">MAX Fee (0.01%)</span>
                                            <span className="text-green-600 font-mono text-sm">
                                                {formatNumber(quote.fee_amount)} {quote.output.token}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-500 text-sm">Price Impact</span>
                                            <span className={`font-mono text-sm ${
                                                quote.price_impact < 0.1 ? 'text-green-600' : 
                                                quote.price_impact < 1 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {quote.price_impact}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-gray-500 text-sm">Minimum Received</span>
                                            <span className="text-gray-900 font-mono text-sm">
                                                {formatNumber(quote.min_output)} {quote.output.token}
                                            </span>
                                        </div>

                                        {/* Route Details */}
                                        {quote.route && quote.route.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs text-gray-500 mb-2">Route Details</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {quote.route.map((step, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {step.dex} ({step.percent}%)
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!quote && !error && !loading && (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <p className="text-gray-500 text-sm">Enter parameters and click "Get Quote"</p>
                                    </div>
                                )}

                                {loading && (
                                    <div className="text-center py-8">
                                        <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="text-gray-500 text-sm mt-3">Fetching best route from DFlow...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DEX Testing Tab */}
                {activeTab === 'test' && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">DEX Integration Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {dexStatuses.map((dex) => (
                                <button
                                    key={dex.name}
                                    onClick={() => testSingleDex(dex.name)}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition ${
                                        dex.status === 'active' ? 'border-green-200 bg-green-50' :
                                        dex.status === 'error' ? 'border-red-200 bg-red-50' :
                                        dex.status === 'testing' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-gray-200 bg-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{dex.logo}</span>
                                        <span className="font-medium text-sm">{dex.name}</span>
                                    </div>
                                    <div>
                                        {dex.status === 'active' && <span className="text-green-600 text-xs">✓</span>}
                                        {dex.status === 'testing' && <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>}
                                        {dex.status === 'error' && <span className="text-red-600 text-xs">✗</span>}
                                        {dex.status === 'active' && dex.latency && (
                                            <span className="text-xs text-gray-400 ml-2">{dex.latency.toFixed(0)}ms</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 text-center">
                            Testing DFlow aggregation across all Solana DEXes
                        </p>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && quote && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Swap Analytics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(quote.output.amount)}</p>
                                <p className="text-xs text-gray-500">Output Amount</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{formatNumber(quote.fee_amount, 8)}</p>
                                <p className="text-xs text-gray-500">MAX Fee (0.01%)</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{quote.price_impact}%</p>
                                <p className="text-xs text-gray-500">Price Impact</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-2xl font-bold text-gray-900">{quote.source}</p>
                                <p className="text-xs text-gray-500">Route Source</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
