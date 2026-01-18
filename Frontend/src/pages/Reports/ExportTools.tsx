import React, { useState } from 'react';

const ExportTools: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedData, setSelectedData] = useState<string[]>([]);

  const dataOptions = [
    { id: 'livestock', name: 'Livestock Records', icon: 'fa-cow' },
    { id: 'financial', name: 'Financial Data', icon: 'fa-dollar-sign' },
    { id: 'health', name: 'Health Records', icon: 'fa-heartbeat' },
    { id: 'feeding', name: 'Feeding Records', icon: 'fa-utensils' },
    { id: 'tasks', name: 'Task History', icon: 'fa-tasks' },
  ];

  const toggleDataSelection = (id: string) => {
    setSelectedData(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            <i className="fas fa-file-export mr-3 text-blue-500"></i>
            Export Tools
          </h1>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-400"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Export your farm data in various formats for backup, analysis, or reporting purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Data to Export</h3>
              <div className="space-y-2">
                {dataOptions.map(option => (
                  <label key={option.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedData.includes(option.id)}
                      onChange={() => toggleDataSelection(option.id)}
                      className="mr-3 w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <i className={`fas ${option.icon} mr-3 text-gray-600`}></i>
                    <span className="text-gray-700">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {['pdf', 'excel', 'csv', 'json'].map(format => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedFormat === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className={`fas fa-file-${format === 'excel' ? 'excel' : format} text-2xl mb-2`}></i>
                    <p className="text-sm font-medium uppercase">{format}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Export Preview</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Selected Items:</span>
                <span className="font-semibold">{selectedData.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Format:</span>
                <span className="font-semibold uppercase">{selectedFormat}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Size:</span>
                <span className="font-semibold">~0 MB</span>
              </div>
            </div>

            <button
              disabled={selectedData.length === 0}
              className={`w-full py-3 rounded-lg transition-colors ${
                selectedData.length > 0
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-download mr-2"></i>
              Export Data
            </button>

            <div className="mt-6 text-center">
              <i className="fas fa-cloud-download-alt text-6xl text-gray-300 mb-3"></i>
              <p className="text-gray-500 text-sm">Select data to preview export</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportTools;
