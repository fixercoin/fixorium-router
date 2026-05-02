import React from 'react';

const Products: React.FC = () => {
    const products = [
        {
            name: 'MAX Router (Solana)',
            description: 'High-performance DEX aggregator for Solana. Routes through Raydium, Meteora, PumpSwap, Orca, and more.',
            features: ['0.01% fee', 'Multi-hop routing', 'Split trades', 'MEV protection'],
            status: 'Live',
            statusColor: 'text-green-400',
            docs: 'https://fixorium.com.pk/max/docs',
            api: '/api/max/v1'
        },
        {
            name: 'MintMe Router',
            description: 'DEX aggregator for MintMe blockchain. Swap any token on MintMe with best rates.',
            features: ['Cross-chain support', 'Liquidity aggregation', 'Low fees'],
            status: 'Beta',
            statusColor: 'text-yellow-400',
            docs: 'https://fixorium.com.pk/mintme/docs',
            api: '/api/mintme/v1'
        },
        {
            name: 'Wallet SDK',
            description: 'Non-custodial wallet SDK for developers. Build web3 apps with ease.',
            features: ['Multi-chain support', 'Seed phrase management', 'Transaction signing'],
            status: 'Coming Soon',
            statusColor: 'text-blue-400',
            docs: 'https://fixorium.com.pk/wallet/docs',
            api: null
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Products</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Build the future of DeFi with Fixorium's suite of products
                </p>
            </div>

            <div className="space-y-8">
                {products.map((product, index) => (
                    <div key={index} className="bg-card border border-border rounded-xl p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                            <div>
                                <h2 className="text-2xl font-bold">{product.name}</h2>
                                <p className="text-gray-400 mt-1">{product.description}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className={`text-sm font-semibold ${product.statusColor}`}>{product.status}</span>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.features.map((feature, idx) => (
                                <span key={idx} className="px-3 py-1 bg-darker border border-border rounded-full text-xs text-gray-300">
                                    {feature}
                                </span>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                            {product.docs && (
                                <a href={product.docs} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-[#e8d58a] text-sm flex items-center gap-1">
                                    📖 Documentation →
                                </a>
                            )}
                            {product.api && (
                                <div className="text-gray-500 text-sm font-mono">API: {product.api}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Developer CTA */}
            <div className="bg-card border border-border rounded-xl p-8 mt-8 text-center">
                <h2 className="text-2xl font-bold mb-2">Start Building</h2>
                <p className="text-gray-400 mb-6">Get your API key and integrate MAX Router in minutes</p>
                <button className="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-[#e8d58a] transition">
                    Get API Key
                </button>
            </div>
        </div>
    );
};

export default Products;
