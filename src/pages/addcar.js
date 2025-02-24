import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';

const AddNewCar = ({ onClose, onSubmit, editingCar }) => {
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);

  // Only keep needed states
  const [modelToBrand, setModelToBrand] = useState({});
  const [allModels, setAllModels] = useState([]);
  const [formData, setFormData] = useState({
    carBrand: editingCar?.carBrand || '',
    carModel: editingCar?.carModel || '',
    fuel: editingCar?.fuel || '',
    year: editingCar?.year || '',
    chasisNo: editingCar?.chasisNo || '',
    regNo: editingCar?.regNo || '',
    variant: editingCar?.variant || ' '
  });
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [modelSearchQuery, setModelSearchQuery] = useState('');

  // Update the model dropdown section
const filteredModels = modelSearchQuery 
? allModels.filter(model => 
    model.toLowerCase().includes(modelSearchQuery.toLowerCase())
  )
: allModels;



  // Simplified useEffect
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await axios.get('https://obc.work.gd/api/car-data/');
    console.log('API Response:', response.data);
        
        // Create mappings and collect all unique models
        const modelMapping = {};
        const models = [];
        
        response.data.forEach(brand => {
          if (brand.models && Array.isArray(brand.models)) {
            brand.models.forEach(model => {
              // Ensure model has a name property
              if (model && model.name) {
                modelMapping[model.name] = brand.name;
                models.push(model.name);
              }
            });
          }
        });

        console.log('Model Mapping:', modelMapping); // Debug line
        console.log('All Models:', models); // Debug line
        
        setModelToBrand(modelMapping);
        setAllModels(models);
      } catch (error) {
        console.error('Error fetching car data:', error);
      }
    };

    fetchCarData();
  }, []);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectModel = (model) => {
    const correspondingBrand = modelToBrand[model];
    setFormData(prev => ({
      ...prev,
      carModel: model,
      carBrand: correspondingBrand // Automatically set the brand
    }));
    setIsModelOpen(false);
    setModelSearchQuery(''); // Clear search query after selection
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isModelOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isModelOpen]);

  const handleModelSearchClick = () => {
    setIsModelOpen(!isModelOpen);
    // Focus search input when opening
    if (!isModelOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 0);
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.carBrand || !formData.carModel || !formData.year) {
      alert('Please fill in all required fields');
      return;
    }

    // Pass the form data to parent component
    onSubmit(formData, !!editingCar);
    
    // Close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ padding: '20px' }}>
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="bg-red-600 p-4 flex justify-between items-center rounded-t-lg sticky top-0 z-10">
          <h2 className="text-white text-lg font-medium">Add New Car</h2>
          <button className="text-white hover:text-gray-200" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Car Brand Dropdown */}
            <div className="flex flex-col relative">
  <label className="text-sm text-gray-600 mb-1">Car Brand *</label>
  <input
    type="text"
    value={formData.carBrand}
    className="p-3 border border-gray-300 rounded-lg bg-gray-50"
    placeholder="Brand will be set automatically"
    readOnly
  />
</div>
            {/* Car Model Dropdown with Search */}
            <div className="flex flex-col relative">
              <label className="text-sm text-gray-600 mb-1">Car Model *</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full p-3 border border-gray-300 rounded-lg flex justify-between items-center bg-white"
                  onClick={handleModelSearchClick}
                >
                  <span className="text-gray-700">
                    {formData.carModel || 'Select Car Model'}
                  </span>
                  <ChevronDown size={20} className="text-gray-500" />
                </button>
                {/* Update the dropdown rendering */}
              {isModelOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Search car model..."
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredModels.length > 0 ? (
                      filteredModels.map((model) => (
                        <button
                          key={model}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          onClick={() => selectModel(model)}
                        >
                          {model}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">No models found</div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Rest of the form remains unchanged */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Fuel Type *</label>
              <select
                name="fuel"
                value={formData.fuel}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Year *</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter Year (e.g., 2022)"
                maxLength={4}
                onKeyPress={(e) => {
                  // Only allow numbers
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Chassis No.</label>
              <input
                type="text"
                name="chasisNo"
                value={formData.chasisNo}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter Chassis Number"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">Reg No.</label>
              <input
                type="text"
                name="regNo"
                value={formData.regNo}
                onChange={handleChange}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter Registration Number"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmit}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewCar;
