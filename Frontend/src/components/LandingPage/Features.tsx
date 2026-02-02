// import React from "react";
// import { useLanguage } from "../contexts/LanguageContext";
const Features = () => {
    // const { language } = useLanguage();
 const features = [
    {
      icon: 'fas fa-heartbeat',
      title: 'Health Management',
      description: 'Track vaccinations, treatments, and health history with automated reminders.'
    },
    {
      icon: 'fas fa-utensils',
      title: 'Feeding Scheduler',
      description: 'Create automated feeding plans based on animal type, age, and weight.'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Productivity Analysis',
      description: 'Monitor milk production, weight gain, and breeding success to calculate ROI.'
    },
   
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Access your livestock data from any device - no special hardware required.'
    }
  ];

return(
     <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Comprehensive Features</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your livestock effectively and improve your farming business
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-green-600 text-4xl mb-4">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
)
};

export default Features;
