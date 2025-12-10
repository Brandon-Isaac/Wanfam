 import React from 'react';

 const steps = [
    {
      number: 1,
      title: 'Create Account',
      description: 'Sign up with your phone number or email - no credit card required.'
    },
    {
      number: 2,
      title: 'Add Your Animals',
      description: 'Input your livestock details including type, age, weight, and health status.'
    },
    {
      number: 3,
      title: 'Set Up Schedules',
      description: 'Create feeding, vaccination, and treatment schedules for your animals.'
    },
    {
      number: 4,
      title: 'Track & Analyze',
      description: 'Monitor productivity and get insights to improve your farming business.'
    }
  ];

 const HowItWorks = () => {
 return (
  <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Get started with WANFAM CLCS in just a few simple steps
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="bg-green-50 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-600 text-white text-xl font-bold mx-auto">
                  {step.number}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
}

export default HowItWorks;