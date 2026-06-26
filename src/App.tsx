import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, PackageOpen, LayoutGrid, CheckCircle2, ShoppingBag } from "lucide-react";
import { Product, User, CartItem, Order } from "./types";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Recommendations from "./components/Recommendations";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import QuickViewModal from "./components/QuickViewModal";

export default function App() {
  // Authentication & Session state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cart state (persisted locally)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [currentView, setView] = useState<'store' | 'admin' | 'orders'>('store');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Catalog & Orders data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filters state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Load Auth Session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync Cart to localStorage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Unified Data Fetcher (Stabilized to prevent infinite loops)
  const fetchCatalogAndOrders = useCallback(async () => {
    setLoadingProducts(true);
    try {
      // Build filters querystring
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (sortBy) params.append("sortBy", sortBy);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
      if (data.categories) {
        setCategories(data.categories);
      }

      // Fetch Orders based on user identity/role
      if (token && user) {
        const orderEndpoint = user.role === 'admin' ? "/api/admin/orders" : "/api/orders/my-history";
        const oRes = await fetch(orderEndpoint, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const oData = await oRes.json();
        if (oData.orders) {
          setOrders(oData.orders);
        }
      }
    } catch (err) {
      console.error("Error fetching application data:", err);
    } finally {
      setLoadingProducts(false);
    }
  }, [search, category, minPrice, maxPrice, sortBy, token, user]);

  // Load data on filters/auth changes
  useEffect(() => {
    fetchCatalogAndOrders();
  }, [fetchCatalogAndOrders]);

  // Auth Callbacks
  const handleAuthSuccess = (authUser: User, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(authUser));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setView('store');
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.productId === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { productId: product.id, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    // Check stock limit
    const prod = products.find(p => p.id === productId);
    if (prod && quantity > prod.stock) {
      alert(`Only ${prod.stock} items currently in inventory.`);
      return;
    }

    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Checkout callbacks
  const handleCheckoutInitiate = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (order: Order) => {
    // Clear shopping cart
    setCart([]);
    // Update orders in dashboard state
    setOrders(prev => [order, ...prev]);
    // Refresh products catalog to reflect depleted stock
    fetchCatalogAndOrders();
  };

  // Helper filters resets
  const handleResetFilters = () => {
    setSearch("");
    setCategory("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-800 flex flex-col font-sans antialiased">
      {/* Global Navigation Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cart={cart}
        currentView={currentView}
        setView={setView}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'store' && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Visual branding showcase */}
            <Hero onExploreClick={() => {
              const el = document.getElementById("catalog-showcase");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }} />

            {/* AI Recommendation Hub */}
            <Recommendations
              cart={cart}
              viewingProductId={quickViewProduct?.id || null}
              catalog={products}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddToCart}
            />

            {/* Catalog Grid Area */}
            <div id="catalog-showcase" className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Left sidebar filters (Desktop) */}
              <div className="hidden lg:block space-y-6">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-gray-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Search & Filters</h3>
                </div>

                <div className="space-y-4">
                  {/* Category select buttons */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Category</label>
                    <div className="flex flex-col gap-1">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`text-left text-xs px-3 py-2 rounded-lg font-medium transition ${
                            category === cat 
                              ? "bg-indigo-50 text-indigo-700 font-bold" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price range */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Price Range ($)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleResetFilters}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Main Catalog View (Right Grid) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Search, Filter Summary, Sorting Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Search box input */}
                  <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search for premium audio, desk items, wallets..."
                      className="w-full rounded-xl border border-gray-100 pl-10 pr-4 py-3 text-xs bg-gray-50/50 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs transition"
                    />
                  </div>

                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-gray-400 font-semibold">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="newest">Newest Arrival</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Sliders Summary */}
                <div className="flex flex-wrap gap-2 lg:hidden">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
                        category === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid / Results */}
                {loadingProducts ? (
                  <div className="py-24 flex flex-col items-center justify-center space-y-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
                    <p className="text-xs font-mono text-gray-400">Polling curation database...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-24 text-center border border-dashed border-gray-100 rounded-2xl bg-white space-y-3">
                    <PackageOpen className="mx-auto h-12 w-12 text-gray-300 stroke-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">No curation results match your criteria</p>
                      <p className="text-xs text-gray-400 mt-1">Try relaxing your search terms or expanding your price parameters.</p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Reset Catalog Curation
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    {products.map(prod => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onAddToCart={handleAddToCart}
                        onQuickView={setQuickViewProduct}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {currentView === 'admin' && user?.role === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            userToken={token || ""}
            onRefreshData={fetchCatalogAndOrders}
          />
        )}

        {/* CUSTOMER ORDERS VIEW */}
        {currentView === 'orders' && user && (
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 font-sans">Purchase History</h1>
              <p className="text-xs text-gray-500 mt-1">Review, track, and reorder from your curated catalog receipts.</p>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-gray-100 rounded-2xl bg-white">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 stroke-1 mb-3" />
                <p className="text-sm font-semibold text-gray-950">You haven't placed any orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Ready to find some boutique gear? Jump back into the store!</p>
                <button
                  onClick={() => setView('store')}
                  className="mt-4 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Explore store
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-3 text-xs gap-2">
                      <div>
                        <p className="font-extrabold text-gray-900 font-mono">ID: {order.id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'delivered' ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-600"
                        }`}>
                          Status: {order.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <img src={item.image} className="h-10 w-10 rounded-lg object-cover border" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">${item.price} × {item.quantity}</p>
                          </div>
                          <span className="text-xs font-extrabold text-gray-900">${item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-xs font-semibold">
                      <span className="text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="h-4.5 w-4.5 text-green-500 stroke-2" />
                        <span>Fulfillment Standard Courier</span>
                      </span>
                      <span className="font-extrabold text-gray-950 text-sm">Receipt Total: ${order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Curated Boutique Inc. All items handpicked and certified under modern standards.</p>
          <p className="mt-1">MERN platform simulation utilizing Express, Node, Vite React, JWT and Google Gemini AI Recommendations.</p>
        </div>
      </footer>

      {/* MODALS & DRAWERS CONTAINER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        catalog={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutInitiate}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        catalog={products}
        userToken={token || ""}
        onOrderComplete={handleOrderComplete}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
