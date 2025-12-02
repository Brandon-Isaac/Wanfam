import React from "react";
const CallToAction: React.FC = () => {
    return (
          <section className="py-16 bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Ready to Transform Your Livestock Farming?</h2>
          <p className="mt-4 text-lg text-green-100 max-w-3xl mx-auto">
            Join hundreds of Kenyan farmers who are already benefiting from WANFAM Comprehensive Livestock Care System
          </p>
          <div className="mt-8">
            <button className="bg-white text-green-700 px-8 py-3 rounded-md text-base font-medium hover:bg-green-50 shadow-md">
              Get Started for Free
            </button>
          </div>
        </div>
      </section>
        );
}

export default CallToAction;