import React from "react";
// import { useLanguage } from "../contexts/LanguageContext";

const Footer = () => {
    // const {language, setLanguage}= useLanguage();

    return (
        <div>
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">WANFAM CLCS</h3>
              <p className="text-gray-400">Comprehensive Livestock Care System for Kenyan farmers</p>
              <div className="flex mt-4 space-x-4">
                <a href="#facebook" className="text-gray-400 hover:text-white">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#twitter" className="text-gray-400 hover:text-white">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#instagram" className="text-gray-400 hover:text-white">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#benefits" className="text-gray-400 hover:text-white">Benefits</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white">How It Works</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#blog" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#faqs" className="text-gray-400 hover:text-white">FAQs</a></li>
                <li><a href="#support" className="text-gray-400 hover:text-white">Support</a></li>
                <li><a href="#community" className="text-gray-400 hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  <span>Nairobi, Kenya</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-2"></i>
                  <span>+254 741201155</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-2"></i>
                  <span>info@wanfam.co.ke</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 WANFAM CLCS. All rights reserved. | Developed by Isaac Datch & Alvin Kiptoo</p>
          </div>
        </div>
      </footer>
        </div>
  );
};

export default Footer;