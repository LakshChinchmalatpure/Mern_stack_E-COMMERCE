import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { CartItem, Product } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  catalog: Product[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  catalog,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Hydrate cart items with complete product catalogs details
  const hydratedCart = cart.map(item => {
    const prod = catalog.find(p => p.id === item.productId);
    return {
      ...item,
      product: prod
    };
  }).filter(item => item.product !== undefined);

  const cartTotal = hydratedCart.reduce((sum, item) => {
    return sum + (item.product!.price * item.quantity);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"></div>

      {/* Slide panel */}
      <div className="absolute inset-y-0 right-0 max-w-full pl-10">
        <div className="w-screen max-w-md h-full flex flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-600" />
              <span>Shopping Cart</span>
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {hydratedCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 stroke-1 mb-3" />
                <p className="text-sm font-semibold text-gray-900">Your cart is empty</p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Explore our beautiful product listings and add some items to get started!</p>
              </div>
            ) : (
              hydratedCart.map(item => (
                <div key={item.productId} className="flex gap-4 border-b border-gray-50 pb-5">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                    <img
                      src={item.product!.image}
                      alt={item.product!.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 leading-tight">
                        {item.product!.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">{item.product!.category}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 border border-gray-100 rounded-lg p-0.5 bg-gray-50">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 transition rounded hover:bg-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold px-2 text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 text-gray-500 hover:text-gray-900 transition rounded hover:bg-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Price and Delete */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-gray-900">${item.product!.price * item.quantity}</span>
                        <button
                          onClick={() => onRemoveItem(item.productId)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Billing & Actions */}
          {hydratedCart.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-5 bg-gray-50/50 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-500">Subtotal</span>
                <span className="font-extrabold text-gray-950 text-base">${cartTotal}</span>
              </div>
              <p className="text-[10px] text-gray-400">Shipping, taxes, and discounts calculated during checkout.</p>
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-xs font-bold text-white transition shadow-sm hover:bg-indigo-500"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
