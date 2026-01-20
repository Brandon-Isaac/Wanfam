  import React from "react";
  import { Link } from "react-router-dom";
  // import { useLanguage } from "../contexts/LanguageContext";

  const Hero = () => {
    // const { language } = useLanguage();
  return (
  <div className="pt-16 bg-gradient-to-b from-green-50 to-white" id="hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Revolutionize Your <span className="text-green-600">Livestock Management</span>
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              WANFAM Comprehensive Livestock Care System helps Kenyan farmers track animal health, manage feeding schedules, and maximize productivity with an easy-to-use digital platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">          
                <Link to= './register'>
                <button className="bg-green-600 text-white px-8 py-3 rounded-md text-base font-medium hover:bg-green-700 shadow-md">Start Now</button>
                </Link>             
                <Link to="./login">
                <button className="bg-white text-green-700 border border-green-600 px-8 py-3 rounded-md text-base font-medium hover:bg-green-50">Login</button>
                </Link>            
            </div>
          </div>
        </div>
      </div>
    );
};

    export default Hero;