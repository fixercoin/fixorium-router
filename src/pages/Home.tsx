import React from 'react';

interface HomeProps {
    setCurrentPage: (page: 'dashboard' | 'products') => void;
    onConnect: () => void;
}

const Home: React.FC<HomeProps> = ({ setCurrentPage, onConnect }) => {
    const products = [
        { name: 'Solana DEX Router', description: 'Aggregate liquidity across Raydium, Meteora, PumpSwap. Only 0.01% fee.', icon: '⚡', color: 'from-purple-500 to-pink-500' },
        { name: 'MintMe DEX Router', description: 'Cross-chain swaps on MintMe blockchain with best rates.', icon: '🌿', color: 'from-green-500 to-emerald-500' },
        { name: 'MAX Router API', description: 'Integrate Solana swaps into your app with simple REST API.', icon: '🔑', color: 'from-blue-500 to-cyan-500' },
        { name: 'Web3 Wallet', description: 'Non-custodial wallet for Solana, EVM chains, and MintMe.', icon: '👛', color: 'from-yellow-500 to-orange-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="text-center py-16">
                <div className="flex justify-center mb-6">
                    <img src="https://i.postimg.cc/c4nxmQGk/fixercoin.png" alt="Fixorium" className="w-24 h-24" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                    <span className="text-primary">Fixorium</span>
                    <br />
                    Multi-Chain DEX Router
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                    Aggregate liquidity across Solana, MintMe, and EVM chains. 
                    The lowest fees in DeFi — only <span className="text-primary font-bold">0.01%</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => setCurrentPage('dashboard')} className="px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition text-lg">
                        Launch App
                    </button>
                    <button onClick={onConnect} className="px-8 py-3 border border-border text-white font-bold rounded-xl hover:bg-card transition text-lg">
                        Connect Wallet
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-border">
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary">0.01%</div>
                    <div className="text-sm text-gray-400">Platform Fee</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary">10+</div>
                    <div className="text-sm text-gray-400">DEXs Integrated</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary">3</div>
                    <div className="text-sm text-gray-400">Networks</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary">∞</div>
                    <div className="text-sm text-gray-400">Tokens Supported</div>
                </div>
            </div>

            {/* Products Section */}
            <div className="py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <div key={index} className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center text-2xl mb-4`}>
                                {product.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                            <p className="text-gray-400 text-sm">{product.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* API Section */}
            <div className="bg-card border border-border rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Get Your MAX Router API Key</h2>
                <p className="text-gray-400 mb-6">Integrate Solana swaps into your application with our simple REST API</p>
                <button onClick={() => { onConnect(); setCurrentPage('dashboard'); }} className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition">
                    Get Started
                </button>
            </div>
        </div>
    );
};

export default Home;
