import React from 'react';
import { LimitOrder } from '../sdk/limitOrders';

interface LimitOrderCardProps {
  order: LimitOrder;
  onUpdate: () => void;
}

export const LimitOrderCard: React.FC<LimitOrderCardProps> = ({ order, onUpdate }) => {
  const statusColors = {
    active: 'text-green-400 bg-green-500/10',
    filled: 'text-blue-400 bg-blue-500/10',
    cancelled: 'text-red-400 bg-red-500/10',
    expired: 'text-gray-400 bg-gray-500/10'
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs text-gray-400">Order #{order.orderId}</span>
          <span className={`ml-3 px-2 py-0.5 rounded-full text-xs ${statusColors[order.status]}`}>
            {order.status.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-400">Sell</div>
          <div className="text-lg font-semibold text-white">{order.inputAmount} {order.inputMint.slice(0, 6)}...</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Buy at</div>
          <div className="text-lg font-semibold text-primary">${order.triggerPrice}</div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
        <span>Expires: {new Date(order.expiresAt).toLocaleDateString()}</span>
        <span>Fee: 0.01%</span>
      </div>

      {order.status === 'active' && (
        <button className="w-full py-2 border border-red-500/50 text-red-400 text-sm rounded-lg hover:bg-red-500/10 transition">
          Cancel Order
        </button>
      )}
    </div>
  );
};
