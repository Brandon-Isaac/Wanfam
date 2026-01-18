import React from 'react';

const FinancialRecommendations: React.FC = () => {

  const recommendations = [
    {
      id: 1,
      type: 'cost-saving',
      title: 'Optimize Feed Costs',
      description: 'Consider bulk purchasing to save 15-20% on feed expenses',
      priority: 'high',
      icon: 'fa-piggy-bank',
      color: 'green'
    },
    {
      id: 2,
      type: 'revenue',
      title: 'Diversify Income Streams',
      description: 'Explore selling organic dairy products for premium pricing',
      priority: 'medium',
      icon: 'fa-chart-line',
      color: 'blue'
    },
    {
      id: 3,
      type: 'investment',
      title: 'Technology Investment',
      description: 'Automated milking systems could increase efficiency by 30%',
      priority: 'low',
      icon: 'fa-robot',
      color: 'purple'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-500',
          button: 'bg-green-500 hover:bg-green-600'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          iconBg: 'bg-purple-500',
          button: 'bg-purple-500 hover:bg-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-500',
          button: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const getPriorityClasses = (priority: string) => {
    const color = getPriorityColor(priority);
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-700';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-700';
      case 'blue':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-lightbulb mr-3 text-yellow-500"></i>
            Financial Recommendations
          </h1>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors">
            <i className="fas fa-sync mr-2"></i>
            Refresh Insights
          </button>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-yellow-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                AI-powered financial recommendations based on your farm's performance and industry best practices.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {recommendations.map((rec) => {
            const colorClasses = getColorClasses(rec.color);
            return (
              <div key={rec.id} className={`${colorClasses.bg} border ${colorClasses.border} rounded-lg p-6 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`${colorClasses.iconBg} text-white w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <i className={`fas ${rec.icon} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">{rec.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityClasses(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{rec.description}</p>
                    </div>
                  </div>
                  <button className={`${colorClasses.button} text-white px-4 py-2 rounded-lg transition-colors text-sm`}>
                    Learn More
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <i className="fas fa-chart-bar text-5xl text-gray-300 mb-3"></i>
          <p className="text-gray-600">More recommendations coming soon</p>
          <p className="text-sm text-gray-500 mt-1">Based on your farm's financial data</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialRecommendations;
