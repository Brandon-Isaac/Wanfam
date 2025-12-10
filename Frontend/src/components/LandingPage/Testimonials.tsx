  import React from 'react';


  // Mock testimonial data
  const testimonials = [
    {
      id: 1,
      name: 'John Kamau',
      location: 'Nakuru',
      type: 'Dairy Farmer',
      content: 'Since using WANFAM, I\'ve reduced medication costs by 30% and increased milk production. The vaccination reminders have been a game-changer.',
      avatar: 'JK'
    },
    {
      id: 2,
      name: 'Mary Njeri',
      location: 'Kiambu',
      type: 'Poultry Farmer',
      content: 'The feeding cost tracker helped me identify wasteful practices. Now I save on feed costs while keeping my animals healthier.',
      avatar: 'MN'
    },
    {
      id: 3,
      name: 'Peter Ochieng',
      location: 'Kisumu',
      type: 'Goat Farmer',
      content: 'I used to forget vaccination dates. Now the app reminds me, and I can show proper records to the vet. My animals are healthier.',
      avatar: 'PO'
    }
  ];

    const Testimonials: React.FC = () => {
        return (
              <section id="testimonials" className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">What Farmers Say</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Success stories from farmers using WANFAM CLCS
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.type}, {testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
        );
    }

export default Testimonials;