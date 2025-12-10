//  import React from "react";
// import { useLanguage } from "../contexts/LanguageContext";


 const Benefits = () => {
    // const Language = useLanguage();
  const benefits = [
    {
      icon: 'fas fa-kenya',
      title: 'Made for Kenyan Farmers',
      description: 'Designed with local farming practices, languages, and challenges in mind.'
    },
    {
      icon: 'fas fa-money-bill-wave',
      title: 'Affordable Solution',
      description: 'No expensive hardware required - works on the devices you already own.'
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Easy to Use',
      description: 'Simple interface designed for farmers with minimal digital experience.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Data Security',
      description: 'Your farm data is securely stored and easily exportable for loan applications.'
    }
  ];

    return (
      <section id="benefits" className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose WANFAM CLCS?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Designed specifically for small to medium-scale Kenyan farmers
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1534338580013-382cf48bd435?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Farmer using smartphone" 
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
            
            <div className="space-y-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 text-xl">
                      <i className={benefit.icon}></i>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{benefit.title}</h3>
                    <p className="mt-2 text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
};

export default Benefits;