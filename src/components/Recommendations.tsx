import { useEffect, useState } from "react";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Product, CartItem } from "../types";

interface RecommendationsProps {
  cart: CartItem[];
  viewingProductId: string | null;
  catalog: Product[];
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
}

interface AIRecommend {
  productId: string;
  reason: string;
}

export default function Recommendations({
  cart,
  viewingProductId,
  catalog,
  onQuickView,
  onAddToCart
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAIRecommendations() {
      setLoading(true);
      try {
        const response = await fetch("/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cartItems: cart.map(c => ({ productId: c.productId })),
            viewingProductId
          })
        });
        const data = await response.json();
        if (data.recommendations) {
          setRecommendations(data.recommendations);
        }
      } catch (err) {
        console.error("Failed to load AI recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAIRecommendations();
  }, [cart, viewingProductId]);

  // Map recommendation IDs to full Product entities
  const recommendedProducts = recommendations
    .map(rec => {
      const fullProd = catalog.find(p => p.id === rec.productId);
      return fullProd ? { ...fullProd, aiReason: rec.reason } : null;
    })
    .filter((p): p is Product & { aiReason: string } => p !== null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-100 bg-indigo-50/20 p-8 text-center my-8">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
        <p className="mt-3 text-sm font-medium text-indigo-600 font-mono">Synthesizing personalized AI matches...</p>
      </div>
    );
  }

  if (recommendedProducts.length === 0) return null;

  return (
    <section className="my-12 rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 blur-2xl rounded-full"></div>
      
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Sparkles className="h-4.5 w-4.5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-950 font-sans flex items-center gap-2">
            AI Personalized Picks <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wide">Gemini 3.5</span>
          </h2>
          <p className="text-xs text-gray-500 leading-none">Tailored suggestions computed dynamically from your interests & cart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendedProducts.map(p => (
          <div
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-white bg-white/70 backdrop-blur-xs p-4 transition hover:shadow-md"
          >
            {/* Visual Thumbnail */}
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 self-start px-2 py-0.5 rounded">
                  {p.category}
                </span>
                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1 group-hover:text-indigo-600 transition">
                  {p.name}
                </h4>
                <p className="text-sm font-extrabold text-gray-950 mt-0.5">${p.price}</p>
              </div>
            </div>

            {/* Glowing AI Explanation Bubble */}
            <div className="mt-3 flex-1 rounded-lg bg-indigo-50/50 p-2.5 text-[11px] text-indigo-900 leading-relaxed italic relative">
              <span className="font-semibold text-indigo-700 not-italic block mb-0.5">Why you'll love it:</span>
              "{p.aiReason}"
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={() => onQuickView(p)}
                className="text-[11px] font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-0.5"
              >
                <span>Quick View</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <button
                onClick={() => onAddToCart(p)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 shadow-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
