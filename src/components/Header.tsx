import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, History, Package } from "lucide-react";
import { User, CartItem } from "../types";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  cart: CartItem[];
  currentView: 'store' | 'admin' | 'orders';
  setView: (view: 'store' | 'admin' | 'orders') => void;
}

export default function Header({
  user,
  onLogout,
  onOpenAuth,
  onOpenCart,
  cart,
  currentView,
  setView
}: HeaderProps) {
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <button
          onClick={() => setView('store')}
          className="flex items-center gap-2 font-sans text-xl font-bold tracking-tight text-gray-900 transition hover:opacity-90"
        >
          <Package className="h-6 w-6 text-indigo-600" />
          <span>Curated<span className="font-light text-indigo-600">Boutique</span></span>
        </button>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setView('store')}
            className={`text-sm font-medium transition ${
              currentView === 'store' ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Store
          </button>

          {user && (
            <button
              onClick={() => setView('orders')}
              className={`flex items-center gap-1.5 text-sm font-medium transition ${
                currentView === 'orders' ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <History className="h-4 w-4" />
              <span>My Orders</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setView('admin')}
              className={`flex items-center gap-1.5 text-sm font-medium transition ${
                currentView === 'admin' ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Panel</span>
            </button>
          )}

          <div className="h-4 w-px bg-gray-200"></div>

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="group relative flex items-center p-2 text-gray-600 hover:text-gray-900"
          >
            <ShoppingBag className="h-6 w-6 transition group-hover:scale-105" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white ring-2 ring-white">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Account State */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs font-semibold text-gray-800">{user.name}</span>
                <span className="text-[10px] text-gray-400 capitalize">{user.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition shadow-sm hover:bg-indigo-500"
            >
              <UserIcon className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
