import React, { useState, useContext } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { CartContext } from "../contexts/cartContext";
import { useAuth, UserButton } from "@clerk/clerk-react";
import { useSyncUser } from "../hooks/useSyncUser";
import CartSidebar from "./CartSidebar";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [active, setActive] = useState("home");
  const { totalItems } = useContext(CartContext);
  const { isSignedIn, isLoaded } = useAuth();

  // Sync user to database when they sign in
  useSyncUser();

  const navItems = [
    { id: "home", label: "Home", href: "#" },
    { id: "products", label: "Products", href: "#" },
    { id: "contact", label: "Contact", href: "#" },
  ];

  const handleNavClick = (id) => {
    setActive(id);
    setIsOpen(false);
  };

  return (
    <>
      <nav className="fixed top-4 inset-x-0 z-40">
        <div className="mx-auto max-w-6xl px-4">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-200/60 rounded-2xl px-4 md:px-6 py-3 flex items-center gap-4">
            {/* Logo Section */}
            <div className="flex items-center gap-3 cursor-pointer select-none">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center text-white font-semibold shadow-md">
                MS
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  My Store
                </p>
                <p className="text-lg font-bold text-slate-900 leading-tight">
                  Modern Finds
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 ml-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    active === item.id
                      ? "border-transparent bg-slate-900 text-white shadow-sm"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2.5 rounded-full text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Authentication Section */}
              {isLoaded && (
                <div className="hidden md:flex items-center gap-2">
                  {isSignedIn ? (
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                        },
                      }}
                    />
                  ) : (
                    <>
                      <a
                        href="/sign-in"
                        className="px-4 py-2 text-sm font-medium text-slate-700 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                      >
                        Sign In
                      </a>
                      <a
                        href="/sign-up"
                        className="px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400 shadow-md hover:shadow-lg transition-all"
                      >
                        Join Free
                      </a>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden mt-3 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-lg shadow-slate-200/60 overflow-hidden">
              <div className="flex flex-col divide-y divide-slate-100">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      active === item.id
                        ? "text-slate-900 bg-slate-100"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}

                {/* Mobile Auth Section */}
                {isLoaded && (
                  <div className="flex items-center justify-between px-4 py-3">
                    {isSignedIn ? (
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: "w-10 h-10",
                          },
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 w-full">
                        <a
                          href="/sign-in"
                          className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-center"
                        >
                          Sign In
                        </a>
                        <a
                          href="/sign-up"
                          className="flex-1 px-4 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400 shadow-md hover:shadow-lg transition-all text-center"
                        >
                          Join Free
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default Navbar;
