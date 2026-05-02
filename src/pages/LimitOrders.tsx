import React, { useState, useEffect } from 'react';
import { MAXLimitOrders, LimitOrder, LimitOrderParams } from '../sdk/limitOrders';
import { LimitOrderCard } from '../components/LimitOrderCard';

interface LimitOrdersProps {
  apiKey: string;
}

export const LimitOrders: React.FC<LimitOrdersProps> = ({ apiKey }) => {
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<LimitOrderParams>({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    inputAmount: 0,
    triggerPrice: 0,
    expiryDays: 7
  });

  const limitOrders = new MAXLimitOrders(apiKey);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await limitOrders.getAllOrders();
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
    setLoading(false);
  };

  const handleCreateOrder = async () => {
    try {
      const newOrder = await limitOrders.createOrder(formData);
      setOrders([newOrder, ...orders]);
      setShowCreateModal(false);
      setFormData({
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        inputAmount: 0,
        triggerPrice: 0,
        expiryDays: 7
      });
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Limit Orders</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
        >
          + Create Order
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No limit orders yet. Create your first order!
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <LimitOrderCard key={order.orderId} order={order} onUpdate={fetchOrders} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Limit Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Sell Token</label>
                <input
                  type="text"
                  value={formData.inputMint}
                  onChange={(e) => setFormData({ ...formData, inputMint: e.target.value })}
                  placeholder="Token mint address"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Buy Token</label>
                <input
                  type="text"
                  value={formData.outputMint}
                  onChange={(e) => setFormData({ ...formData, outputMint: e.target.value })}
                  placeholder="Token mint address"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Amount to Sell</label>
                <input
                  type="number"
                  value={formData.inputAmount}
                  onChange={(e) => setFormData({ ...formData, inputAmount: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Trigger Price</label>
                <input
                  type="number"
                  value={formData.triggerPrice}
                  onChange={(e) => setFormData({ ...formData, triggerPrice: parseFloat(e.target.value) })}
                  placeholder="Price in USDC"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Expiry (days)</label>
                <input
                  type="number"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData({ ...formData, expiryDays: parseInt(e.target.value) })}
                  placeholder="7"
                  className="w-full p-2 bg-darker border border-border rounded-lg text-white"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">Fee: 0.01% when order executes</p>
              </div>

              <button
                onClick={handleCreateOrder}
                className="w-full py-3 bg-primary text-black font-semibold rounded-lg hover:bg-[#e8d58a] transition"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
