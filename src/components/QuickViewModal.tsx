import { X, Star, ShoppingCart } from "lucide-react";
import { Product } from "../types";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

export default function QuickViewModal({ product, onClose, onAddToCart }: QuickViewModalProps) {
  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-xs"></div>

      {/* Card Body */}
      <div className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 hover:text-gray-900 shadow-xs"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Product Media */}
        <div className="md:w-1/2 aspect-square md:aspect-auto bg-gray-50 relative">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Metadata & Description */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                {product.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2 font-sans tracking-tight">{product.name}</h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
              <span className="font-bold text-gray-800">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.reviewsCount} verified reviews)</span>
            </div>

            <div className="text-2xl font-extrabold text-gray-950">${product.price}</div>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Product Details</span>
              <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold">Inventory Stock:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                product.stock === 0 ? "bg-red-50 text-red-600" : product.stock <= 3 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
              }`}>
                {product.stock === 0 ? "Out of stock" : `${product.stock} units remaining`}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4 mt-6">
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={isOutOfStock}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-semibold shadow-sm transition ${
                isOutOfStock
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.01]"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isOutOfStock ? "Sold Out" : "Add to Shopping Cart"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
