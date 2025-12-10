import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const { language } = useLanguage();
    return (
        <div>
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center" >
                <img src="favicon.ico" alt="WANFAM" className="h-8 w-8 mr-2" />
                <span className="text-green-700 font-bold text-xl" ><a href="#hero">WANFAM</a></span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#features" className="text-gray-600 hover:text-green-700 px-3 py-2 text-sm font-medium">Features</a>
                <a href="#benefits" className="text-gray-600 hover:text-green-700 px-3 py-2 text-sm font-medium">Benefits</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-green-700 px-3 py-2 text-sm font-medium">How It Works</a>
                <a href="#testimonials" className="text-gray-600 hover:text-green-700 px-3 py-2 text-sm font-medium">Testimonials</a>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:items-center">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                ><Link to="/register">
                  Get Started
                </Link>
                </button>
              </div>
              <div className="md:hidden flex items-center">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 hover:text-green-700 focus:outline-none"
                >
                  <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg">
              <a href="#features" className="text-gray-600 hover:text-green-700 block px-3 py-2 text-base font-medium">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-green-700 block px-3 py-2 text-base font-medium">Benefits</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-700 block px-3 py-2 text-base font-medium">How It Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-green-700 block px-3 py-2 text-base font-medium">Testimonials</a>
              <div className="mt-4">
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-green-700">
                  <Link to="/register">
                    Get Started
                  </Link>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
        </div>
    );
}

export default Header;