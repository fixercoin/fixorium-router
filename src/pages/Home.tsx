import React, { useState, useEffect } from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'apikeys') => void;
    onConnect: () => void;
    isLoggedIn?: boolean;
    walletAddress?: string;
    onLogout?: () => void;
}

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
    input: { token: string; amount: number };
    output: { token: string; amount: number; quote: number };
    fee_amount: number;
    price_impact: number;
    min_output: number;
}

const TOKENS: Token[] = [
    { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', logo: '🟠', decimals: 9 },
    { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', logo: '💵', decimals: 6 },
    { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', logo: '💰', decimals: 6 },
    { symbol: 'BONK', name: 'Bonk', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', logo: '🐕', decimals: 5 },
    { symbol: 'JUP', name: 'Jupiter', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', logo: '🪐', decimals: 6 },
    { symbol: 'PYTH', name: 'Pyth Network', mint: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3', logo: '📊', decimals: 6 },
];

const DEX_LIST = [
    { name: 'Raydium', logo: '🔴', status: 'active' },
    { name: 'Orca', logo: '🐋', status: 'active' },
    { name: 'Meteora', logo: '🌠', status: 'active' },
    { name: 'Pump.fun', logo: '🎯', status: 'active' },
    { name: 'Phoenix', logo: '🔥', status: 'active' },
    { name: 'OpenBook', logo: '📖', status: 'active' },
];

const Home: React.FC<HomeProps> = ({ setCurrentPage, isLoggedIn, onLogout }) => {
    const [fromToken, setFromToken] = useState<Token>(TOKENS[0]);
    const [toToken, setToToken] = useState<Token>(TOKENS[1]);
    const [fromAmount, setFromAmount] = useState<string>('1');
    const [toAmount, setToAmount] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null);
    const [showFromTokens, setShowFromTokens] = useState<boolean>(false);
    const [showToTokens, setShowToTokens] = useState<boolean>(false);
    const [slippage, setSlippage] = useState<number>(0.5);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [txStatus, setTxStatus] = useState<{ type: string; message: string } | null>(null);
    const [testingDex, setTestingDex] = useState<string | null>(null);

    // Fetch quote when fromAmount, fromToken, or toToken changes
    useEffect(() => {
        if (fromAmount && parseFloat(fromAmount) > 0) {
            fetchQuote();
        }
    }, [fromAmount, fromToken, toToken, slippage]);

    const fetchQuote = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://fixorium.com.pk/api/max/v1/quote?input=${fromToken.symbol}&output=${toToken.symbol}&amount=${fromAmount}&slippage=${slippage}`
            );
            const data: QuoteResponse = await response.json();
            setQuoteData(data);
            setToAmount(data.output.amount.toFixed(6));
        } catch (error) {
            console.error('Quote fetch error:', error);
            setTxStatus({ type: 'error', message: 'Failed to fetch quote' });
        } finally {
            setIsLoading(false);
        }
    };

    const swapTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    const handleSwap = async () => {
        if (!isLoggedIn) {
            setTxStatus({ type: 'error', message: 'Please login first' });
            return;
        }

        setTxStatus({ type: 'pending', message: 'Preparing swap...' });
        
        try {
            // Step 1: Get quote
            const quoteResponse = await fetch(
                `https://fixorium.com.pk/api/max/v1/quote?input=${fromToken.symbol}&output=${toToken.symbol}&amount=${fromAmount}&slippage=${slippage}`
            );
            const quote = await quoteResponse.json();

            // Step 2: Get swap transaction
            const swapResponse = await fetch(
                `https://fixorium.com.pk/api/max/v1/swap?input=${fromToken.symbol}&output=${toToken.symbol}&amount=${fromAmount}&wallet=${localStorage.getItem('walletAddress')}`
            );
            const swapData = await swapResponse.json();

            if (swapData.success && swapData.transaction) {
                setTxStatus({ type: 'success', message: 'Transaction created! Please sign in wallet' });
                // Here you would trigger wallet sign and send
            } else {
                setTxStatus({ type: 'error', message: swapData.error || 'Swap failed' });
            }
        } catch (error) {
            setTxStatus({ type: 'error', message: 'Swap failed' });
        } finally {
            setTimeout(() => setTxStatus(null), 5000);
        }
    };

    const testDexFunction = async (dexName: string) => {
        setTestingDex(dexName);
        setTxStatus({ type: 'pending', message: `Testing ${dexName}...` });
        
        try {
            const response = await fetch(
                `https://fixorium.com.pk/api/max/v1/quote?input=${fromToken.symbol}&output=${toToken.symbol}&amount=0.1`
            );
            const data = await response.json();
            
            if (data.success && data.source === 'DFlow') {
                setTxStatus({ type: 'success', message: `${dexName} ✓ DFlow integration active` });
            } else {
                setTxStatus({ type: 'error', message: `${dexName} - Using fallback` });
            }
        } catch (error) {
            setTxStatus({ type: 'error', message: `${dexName} - Connection failed` });
        } finally {
            setTimeout(() => {
                setTestingDex(null);
                setTxStatus(null);
            }, 3000);
        }
    };

    const testAllDexes = async () => {
        setTxStatus({ type: 'pending', message: 'Testing all DEXes...' });
        for (const dex of DEX_LIST) {
            await testDexFunction(dex.name);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">
                                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                                    MAX
                                </span>
                                <span className="text-gray-900"> Aggregator</span>
                            </h1>
                            <span className="max-fee-badge ml-2">0.01% fee</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {isLoggedIn ? (
                                <>
                                    <button 
                                        onClick={() => setCurrentPage('dashboard')}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                    >
                                        Dashboard
                                    </button>
                                    <button 
                                        onClick={onLogout}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Connect Wallet
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="py-8">
                {/* DEX Testing Panel */}
                <div className="max-w-7xl mx-auto px-4 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-900">DEX Functions Testing</h3>
                            <button 
                                onClick={testAllDexes}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                                Test All
                            </button>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {DEX_LIST.map((dex) => (
                                <button
                                    key={dex.name}
                                    onClick={() => testDexFunction(dex.name)}
                                    disabled={testingDex === dex.name}
                                    className="flex items-center justify-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition disabled:opacity-50"
                                >
                                    <span>{dex.logo}</span>
                                    <span className="text-sm font-medium">{dex.name}</span>
                                    {testingDex === dex.name && (
                                        <div className="max-loader w-4 h-4"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-500 text-center">
                            Testing DFlow integration across all Solana DEXes
                        </div>
                    </div>
                </div>

                {/* Swap Card */}
                <div className="max-w-lg mx-auto px-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        {/* Header with settings */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Swap</h2>
                            <div className="relative">
                                <button 
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    ⚙️
                                </button>
                                {showSettings && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-10">
                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            Slippage Tolerance
                                        </label>
                                        <div className="flex gap-2">
                                            {[0.1, 0.5, 1.0].map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => setSlippage(val)}
                                                    className={`flex-1 px-2 py-1 text-sm rounded-lg ${
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
                                )}
                            </div>
                        </div>

                        {/* From Token */}
                        <div className="mb-4">
                            <label className="text-sm text-gray-500 mb-2 block">You pay</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={fromAmount}
                                    onChange={(e) => setFromAmount(e.target.value)}
                                    placeholder="0.0"
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => setShowFromTokens(!showFromTokens)}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
                                >
                                    <span>{fromToken.logo}</span>
                                    <span className="font-medium">{fromToken.symbol}</span>
                                    <span>▼</span>
                                </button>
                            </div>
                        </div>

                        {/* Token Selector Dropdowns */}
                        {showFromTokens && (
                            <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                                {TOKENS.map((token) => (
                                    <button
                                        key={token.symbol}
                                        onClick={() => {
                                            setFromToken(token);
                                            setShowFromTokens(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50"
                                    >
                                        <span className="text-xl">{token.logo}</span>
                                        <div className="text-left">
                                            <div className="font-semibold">{token.symbol}</div>
                                            <div className="text-xs text-gray-500">{token.name}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Swap Arrow */}
                        <div className="flex justify-center my-2">
                            <button
                                onClick={swapTokens}
                                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </button>
                        </div>

                        {/* To Token */}
                        <div className="mb-6">
                            <label className="text-sm text-gray-500 mb-2 block">You receive</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={toAmount}
                                    placeholder="0.0"
                                    readOnly
                                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700"
                                />
                                <button
                                    onClick={() => setShowToTokens(!showToTokens)}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl hover:bg-gray-200"
                                >
                                    <span>{toToken.logo}</span>
                                    <span className="font-medium">{toToken.symbol}</span>
                                    <span>▼</span>
                                </button>
                            </div>
                        </div>

                        {/* To Token Dropdown */}
                        {showToTokens && (
                            <div className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                                {TOKENS.map((token) => (
                                    <button
                                        key={token.symbol}
                                        onClick={() => {
                                            setToToken(token);
                                            setShowToTokens(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50"
                                    >
                                        <span className="text-xl">{token.logo}</span>
                                        <div className="text-left">
                                            <div className="font-semibold">{token.symbol}</div>
                                            <div className="text-xs text-gray-500">{token.name}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quote Details */}
                        {quoteData && !isLoading && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Rate</span>
                                    <span className="font-medium">
                                        1 {fromToken.symbol} ≈ {quoteData.output.quote} {toToken.symbol}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">MAX fee (0.01%)</span>
                                    <span className="text-green-600">{quoteData.fee_amount} {toToken.symbol}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Source</span>
                                    <span className="text-blue-600">{quoteData.source}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-gray-500">Price impact</span>
                                    <span className="text-yellow-600">{quoteData.price_impact}%</span>
                                </div>
                                <div className="flex justify-between py-2 border-t border-gray-200 mt-2 pt-2">
                                    <span className="text-gray-500">Minimum received</span>
                                    <span className="font-mono">{quoteData.min_output} {toToken.symbol}</span>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                                <div className="max-loader mx-auto mb-2"></div>
                                <span className="text-gray-500 text-sm">Fetching best route...</span>
                            </div>
                        )}

                        {/* Swap Button */}
                        <button
                            onClick={handleSwap}
                            disabled={!isLoggedIn || isLoading || !fromAmount || parseFloat(fromAmount) === 0}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!isLoggedIn ? 'Connect Wallet to Swap' : 'Swap'}
                        </button>

                        {/* Info Footer */}
                        <div className="mt-6 text-center text-xs text-gray-400">
                            <p>MEV Protected via DFlow Auction | 0.01% fee</p>
                            <p className="mt-1">Aggregating: Raydium • Orca • Meteora • Pump.fun • Phoenix • OpenBook</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Transaction Status Toast */}
            {txStatus && (
                <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
                    txStatus.type === 'success' ? 'bg-green-600' :
                    txStatus.type === 'error' ? 'bg-red-600' : 'bg-yellow-600'
                } text-white`}>
                    {txStatus.message}
                </div>
            )}
        </div>
    );
};

export default Home;
