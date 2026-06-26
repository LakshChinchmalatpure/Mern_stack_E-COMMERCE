import React from "react";
import { motion } from "motion/react";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition shadow-sm hover:shadow-md"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />

        {/* Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/20 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onQuickView(product)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-sm transition hover:scale-110 hover:bg-gray-100 hover:text-black"
            title="Quick View"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-800 shadow-sm">
            {product.category}
          </span>
          {product.featured && (
            <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Out of Stock banner */}
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <span className="rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
              Out of Stock
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 rounded-lg bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            Only {product.stock} left!
          </span>
        ) : null}
      </div>

      {/* Product Info Panel */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
            <span className="text-xs font-bold text-gray-700">{product.rating.toFixed(1)}</span>
            <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
          </div>
        </div>

        <h3 className="mt-2 text-sm font-semibold tracking-tight text-gray-900 group-hover:text-indigo-600 transition">
          <button onClick={() => onQuickView(product)} className="text-left focus:outline-none">
            {product.name}
          </button>
        </h3>

        <p className="mt-1 line-clamp-2 text-xs text-gray-500 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-base font-bold text-gray-900">${product.price}</span>
          <button
            onClick={() => !isOutOfStock && onAddToCart(product)}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-[1.02] active:scale-95"
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
