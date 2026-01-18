import React, { useState, useContext } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { CartContext } from "../contexts/cartContext";
import CartSidebar from "./CartSidebar";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [active, setActive] = useState("home");
  const { totalItems } = useContext(CartContext);

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
      <nav className="fixed w-full top-0 left-0 bg-white shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img src="/vite.svg" className="h-8 w-8" alt="Logo" />
              <h1 className="text-xl font-bold text-gray-800">My Store</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    active === item.id
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right Section - Cart Icon and Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`block px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    active === item.id
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </a>
              ))}
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
