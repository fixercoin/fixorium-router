import React, { useState, useEffect } from 'react';
import ApiKeyModal from '../components/ApiKeyModal';

interface DashboardProps {
    walletAddress: string;
}

interface DeveloperData {
    id: string;
    walletAddress: string;
    email: string;
    companyName: string;
    apiKeys: Array<{
        id: string;
        name: string;
        apiKey: string;
        createdAt: number;
        requests: number;
    }>;
}

interface TokenPrice {
    symbol: string;
    name: string;
    price: number;
    priceChange24h: number;
    volume24h: number;
    liquidity: number;
    chain: string;
}

const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
    const [showApiModal, setShowApiModal] = useState(false);
    const [developerData, setDeveloperData] = useState<DeveloperData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);
    const [pricesLoading, setPricesLoading] = useState(true);
    const [stats, setStats] = useState({ totalVolume: 0, totalFees: 0, totalRequests: 0 });

    // Token addresses to fetch
    const tokens = [
        { symbol: 'SOL', name: 'Solana', address: 'So11111111111111111111111111111111111111112' },
        { symbol: 'BTC', name: 'Bitcoin', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
        { symbol: 'ETH', name: 'Ethereum', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
        { symbol: 'BNB', name: 'BNB', address: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c' },
        { symbol: 'FIXERCOIN', name: 'Fixercoin', address: 'H4qKn8FMFha8jJuj8xMryMqRhH3h7GjLuxw7TVixpump' },
        { symbol: 'FXM', name: 'Fixorium', address: '7Fnx57ztmhdpL1uAGmUY1ziwPG2UDKmG6poB4ibjpump' },
        { symbol: 'LOCKER', name: 'Locker', address: 'EN1nYrW6375zMPUkpkGyGSEXW8WmAqYu4yhf6xnGpump' },
        { symbol: 'PINGX', name: 'Pingx', address: '7KS4DgKHmgSWYC4uGnSozLUon2bDEj6WKhRNSosmpump' },
    ];

    // Fetch live token prices from DexScreener
    const fetchTokenPrices = async () => {
        setPricesLoading(true);
        const prices: TokenPrice[] = [];

        for (const token of tokens) {
            try {
                const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${token.address}`);
                const data = await response.json();

                if (data.pairs && data.pairs.length > 0) {
                    // Find the best pair (highest liquidity)
                    let bestPair = data.pairs[0];
                    for (const pair of data.pairs) {
                        const pairLiquidity = pair.liquidity?.usd || 0;
                        const bestLiquidity = bestPair.liquidity?.usd || 0;
                        if (pairLiquidity > bestLiquidity) {
                            bestPair = pair;
                        }
                    }

                    const price = parseFloat(bestPair.priceUsd) || 0;
                    const priceChange24h = bestPair.priceChange?.h24 || 0;
                    const volume24h = bestPair.volume?.h24 || 0;
                    const liquidity = bestPair.liquidity?.usd || 0;
                    const chain = bestPair.chainId || 'Unknown';

                    prices.push({
                        symbol: token.symbol,
                        name: token.name,
                        price,
                        priceChange24h,
                        volume24h,
                        liquidity,
                        chain,
                    });
                } else {
                    // Fallback data if API fails
                    prices.push({
                        symbol: token.symbol,
                        name: token.name,
                        price: 0,
                        priceChange24h: 0,
                        volume24h: 0,
                        liquidity: 0,
                        chain: 'Unknown',
                    });
                }
            } catch (error) {
                console.error(`Failed to fetch price for ${token.symbol}:`, error);
                prices.push({
                    symbol: token.symbol,
                    name: token.name,
                    price: 0,
                    priceChange24h: 0,
                    volume24h: 0,
                    liquidity: 0,
                    chain: 'Unknown',
                });
            }
        }

        setTokenPrices(prices);
        setPricesLoading(false);
    };

    useEffect(() => {
        fetchDeveloperData();
        fetchTokenPrices();
        
        // Refresh prices every 30 seconds
        const interval = setInterval(fetchTokenPrices, 30000);
        return () => clearInterval(interval);
    }, [walletAddress]);

    const fetchDeveloperData = async () => {
        try {
            // In production, fetch from your API
            // const response = await fetch(`/api/max/v1/developers/${walletAddress}`);
            // const data = await response.json();
            
            // Demo data
            setDeveloperData({
                id: 'dev_123',
                walletAddress: walletAddress,
                email: 'developer@example.com',
                companyName: 'My Awesome App',
                apiKeys: [
                    { id: 'key_1', name: 'Production Key', apiKey: 'max_abc123...', createdAt: Date.now(), requests: 1234 },
                    { id: 'key_2', name: 'Development Key', apiKey: 'max_def456...', createdAt: Date.now(), requests: 567 }
                ]
            });
            setStats({ totalVolume: 125000, totalFees: 12.5, totalRequests: 1801 });
        } catch (error) {
            console.error('Failed to fetch developer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateApiKey = async (name: string, rateLimit: number) => {
        try {
            const response = await fetch('/api/max/v1/developers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, name, rateLimit })
            });
            const data = await response.json();
            if (data.success) {
                alert(`API Key Created!\n\nKey: ${data.apiKey}\nSecret: ${data.apiSecret}\n\nSave this secret - you won't see it again!`);
                fetchDeveloperData();
            }
        } catch (error) {
            console.error('Failed to create API key:', error);
        }
        setShowApiModal(false);
    };

    const formatPrice = (price: number) => {
        if (price === 0) return '$0.00';
        if (price < 0.000001) return `$${price.toExponential(4)}`;
        if (price < 0.001) return `$${price.toFixed(8)}`;
        if (price < 1) return `$${price.toFixed(6)}`;
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatVolume = (volume: number) => {
        if (volume === 0) return 'N/A';
        if (volume >= 1_000_000_000) return `$${(volume / 1_000_000_000).toFixed(1)}B`;
        if (volume >= 1_000_000) return `$${(volume / 1_000_000).toFixed(1)}M`;
        if (volume >= 1_000) return `$${(volume / 1_000).toFixed(1)}K`;
        return `$${volume.toFixed(0)}`;
    };

    if (loading && pricesLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Welcome back!</h1>
                <p className="text-gray-400">Manage your MAX Router integration</p>
            </div>

            {/* Live Token Prices Section */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Live Token Prices</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tokenPrices.map((token) => (
                        <div key={token.symbol} className="bg-card border border-border rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-white text-lg">{token.symbol}</div>
                                    <div className="text-xs text-gray-500">{token.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-semibold">{formatPrice(token.price)}</div>
                                    <div className={`text-xs ${token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-border">
                                <span>Vol: {formatVolume(token.volume24h)}</span>
                                <span>Liq: {formatVolume(token.liquidity)}</span>
                                <span className="text-primary">{token.chain}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {pricesLoading && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        <span className="text-xs text-gray-400">Refreshing prices...</span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">Total Volume</div>
                    <div className="text-2xl font-bold text-primary">${stats.totalVolume.toLocaleString()}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">Fees Collected</div>
                    <div className="text-2xl font-bold text-green-400">${stats.totalFees.toLocaleString()}</div>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">API Requests</div>
                    <div className="text-2xl font-bold text-primary">{stats.totalRequests.toLocaleString()}</div>
                </div>
            </div>

            {/* API Keys Section */}
            <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">API Keys</h2>
                    <button onClick={() => setShowApiModal(true)} className="px-4 py-2 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-[#e8d58a] transition">
                        + Create API Key
                    </button>
                </div>
                
                {developerData?.apiKeys.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No API keys yet. Create your first key to get started.</p>
                ) : (
                    <div className="space-y-4">
                        {developerData?.apiKeys.map((key) => (
                            <div key={key.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="font-semibold">{key.name}</div>
                                    <div className="text-sm font-mono text-gray-400">{key.apiKey}</div>
                                    <div className="text-xs text-gray-500 mt-1">Created: {new Date(key.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-400">Requests</div>
                                        <div className="font-semibold">{key.requests.toLocaleString()}</div>
                                    </div>
                                    <button className="text-red-400 hover:text-red-300 text-sm">Revoke</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Start Section */}
            <div className="bg-darker border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
                <div className="space-y-3">
                    <code className="block bg-black/50 p-3 rounded-lg text-sm text-gray-300">
                        curl -X GET "https://fixorium.com.pk/api/max/v1/quote?inputMint=So111...&outputMint=EPjFW...&amount=1000000" \
                        <br />  -H "X-API-Key: YOUR_API_KEY"
                    </code>
                    <a href="/max/docs" className="text-primary hover:text-[#e8d58a] text-sm inline-block">Read full documentation →</a>
                </div>
            </div>

            {/* API Key Modal */}
            {showApiModal && (
                <ApiKeyModal onClose={() => setShowApiModal(false)} onCreate={handleCreateApiKey} />
            )}
        </div>
    );
};

export default Dashboard;
