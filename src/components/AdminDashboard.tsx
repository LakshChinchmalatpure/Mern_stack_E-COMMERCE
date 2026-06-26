import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, LayoutGrid, PackageOpen, ClipboardList, TrendingUp, Sparkles, Loader2, RefreshCw, X } from "lucide-react";
import { Product, Order } from "../types";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  userToken: string;
  onRefreshData: () => void;
}

export default function AdminDashboard({
  products,
  orders,
  userToken,
  onRefreshData
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders'>('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    outOfStockCount: 0,
    categoryDistribution: [] as { name: string; value: number }[]
  });

  // CRUD Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingProductId, setEditingProductId] = useState("");
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    image: "",
    stock: 0
  });

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Fetch stats on mount / tab activation
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats", {
          headers: { "Authorization": `Bearer ${userToken}` }
        });
        const data = await response.json();
        if (data && !data.error) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    }
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, products, orders, userToken]);

  // Handle Product Create or Edit Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!productForm.name || productForm.price <= 0 || !productForm.category || !productForm.image || productForm.stock < 0) {
      setFormError("Please fill out all required fields with valid values");
      return;
    }

    try {
      const url = formMode === 'create' 
        ? "/api/admin/products" 
        : `/api/admin/products/${editingProductId}`;
      const method = formMode === 'create' ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify(productForm)
      });

      const data = await response.json();
      if (response.ok) {
        setFormSuccess(`Product successfully ${formMode === 'create' ? 'created' : 'updated'}!`);
        onRefreshData();
        setTimeout(() => {
          setShowProductForm(false);
          resetForm();
        }, 1000);
      } else {
        setFormError(data.error || "Failed to process product");
      }
    } catch (err) {
      setFormError("Server error. Please try again.");
    }
  };

  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      category: "",
      image: "",
      stock: 0
    });
    setFormError("");
    setFormSuccess("");
    setEditingProductId("");
  };

  const handleEditClick = (p: Product) => {
    setFormMode('edit');
    setEditingProductId(p.id);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock
    });
    setShowProductForm(true);
  };

  const handleDeleteClick = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product from the inventory? This cannot be undone.")) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${userToken}` }
      });
      if (response.ok) {
        onRefreshData();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete product");
      }
    } catch (err) {
      alert("Server connection error during deletion");
    }
  };

  // Update order status badge
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        onRefreshData();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update order status");
      }
    } catch (err) {
      alert("Network error updating order status");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Dashboard Top Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans flex items-center gap-2">
            <span>Admin Control Panel</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase tracking-wider">Superuser</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage system catalogs, review operational analytics, and route customer packages.</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'overview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Orders ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SALES METRICS */}
      {activeTab === 'overview' && (
        <div className="mt-8 space-y-8">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Gross Sales Revenue</span>
              <p className="text-2xl font-extrabold text-gray-950 mt-1">${stats.totalSales.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold mt-2">
                <span>+12.4% from last period</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Incoming Orders</span>
              <p className="text-2xl font-extrabold text-gray-950 mt-1">{stats.totalOrders}</p>
              <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold mt-2">
                <span>100% fulfillment rate</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Products</span>
              <p className="text-2xl font-extrabold text-gray-950 mt-1">{stats.totalProducts}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold mt-2">
                <span>Distributed over {stats.categoryDistribution.length} categories</span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 p-5 bg-white shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Out of Stock Items</span>
              <p className="text-2xl font-extrabold text-red-600 mt-1">{stats.outOfStockCount}</p>
              <div className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-2">
                <span>Requires immediate restock</span>
              </div>
            </div>
          </div>

          {/* Graphical Distributions */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Category Revenue Distribution Progress */}
            <div className="rounded-2xl border border-gray-100 p-6 bg-white shadow-xs lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Revenue Contribution by Category</h3>
                <p className="text-xs text-gray-500">Live operational distribution from customer purchases</p>
              </div>

              <div className="space-y-4 pt-2">
                {stats.categoryDistribution.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center italic">Waiting for initial checkout orders to compute trends...</p>
                ) : (
                  stats.categoryDistribution.map((cat, idx) => {
                    const pct = Math.round((cat.value / (stats.totalSales || 1)) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-gray-700">{cat.name}</span>
                          <span className="font-bold text-gray-950">${cat.value} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Restock Notification bento-box */}
            <div className="rounded-2xl border border-gray-100 p-6 bg-white shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  <span>Critical Restocks</span>
                  <span className="h-2 w-2 rounded-full bg-red-600"></span>
                </h3>
                <p className="text-xs text-gray-500">Inventory levels that are dangerously low (stock &lt; 3)</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pt-3 max-h-48">
                {products.filter(p => p.stock < 3).length === 0 ? (
                  <p className="text-xs text-green-600 font-medium py-6 text-center italic">All inventory levels are fully fortified.</p>
                ) : (
                  products.filter(p => p.stock < 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl bg-red-50/50 p-2 border border-red-50 text-xs">
                      <div className="flex gap-2 items-center">
                        <img src={p.image} className="h-8 w-8 rounded-lg object-cover" />
                        <span className="font-semibold text-gray-800 line-clamp-1">{p.name}</span>
                      </div>
                      <span className="font-bold text-red-600 bg-red-100/50 px-2 py-0.5 rounded">Stock: {p.stock}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY TABLE CRUD */}
      {activeTab === 'inventory' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Catalog List</h2>
            <button
              onClick={() => {
                setFormMode('create');
                resetForm();
                setShowProductForm(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>

          {/* Form Modal/Collapsible */}
          {showProductForm && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/10 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>{formMode === 'create' ? "Publish New Product" : "Edit Catalog Item"}</span>
                </h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {formError && <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 font-semibold">{formError}</div>}
              {formSuccess && <div className="rounded-lg bg-green-50 p-3 text-xs text-green-600 font-semibold">{formSuccess}</div>}

              <form onSubmit={handleProductSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="E.g., Carbon Desk Pad"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="E.g., Office & Furniture"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.price || ""}
                    onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    placeholder="49"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Stock Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    placeholder="10"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Image URL *</label>
                  <input
                    type="url"
                    required
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Meticulously crafted with robust design..."
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      resetForm();
                    }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition"
                  >
                    {formMode === 'create' ? "Publish Item" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xs">
            <table className="w-full min-w-max border-collapse text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Reviews & Rating</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-4 flex gap-3 items-center">
                      <img src={p.image} className="h-10 w-10 rounded-lg object-cover border border-gray-100" />
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{p.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">{p.category}</span>
                    </td>
                    <td className="p-4 text-gray-900 font-bold">${p.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.stock === 0 ? "bg-red-50 text-red-600" : p.stock <= 3 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">★ {p.rating.toFixed(1)} ({p.reviewsCount} reviews)</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-1 text-gray-400 hover:text-indigo-600 transition"
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(p.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS LIST */}
      {activeTab === 'orders' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Customer Fulfillment Logs</h2>
            <button
              onClick={onRefreshData}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-indigo-600"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Registry</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
              <PackageOpen className="mx-auto h-12 w-12 text-gray-300 stroke-1 mb-3" />
              <p className="text-sm font-semibold text-gray-900">No client orders registered yet</p>
              <p className="text-xs text-gray-400 mt-1">Orders will populate here automatically as shoppers checkout.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  {/* Order header information */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-3 text-xs">
                    <div>
                      <p className="font-extrabold text-gray-950 font-mono">Order ID: {order.id}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Customer info */}
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">
                        Customer: {order.userName} ({order.userEmail})
                      </span>

                      {/* Status Badges */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'paid' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>

                      {/* Fulfillment selector */}
                      <select
                        value={order.status}
                        onChange={e => handleOrderStatusChange(order.id, e.target.value)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold border focus:outline-none uppercase ${
                          order.status === 'delivered' 
                            ? "bg-green-500 text-white border-green-500" 
                            : order.status === 'shipped' 
                              ? "bg-indigo-500 text-white border-indigo-500" 
                              : "bg-amber-400 text-gray-950 border-amber-400"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Order Products */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center text-xs">
                        <img src={item.image} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">${item.price} × {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Billing Sum */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-50 text-xs font-semibold">
                    <span className="text-gray-500">Shipping Mode: Standard Express</span>
                    <span className="font-extrabold text-gray-950 text-sm">Total: ${order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
