import React, { useState, useEffect, useRef, useContext} from 'react';
import { X, MapPin } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext'; // Add this import

const GarageSelector = ({ onClose, onSelectGarage }) => {
  const { token } = useContext(AuthContext); // Get token from context
  const [garages, setGarages] = useState([]);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchGarages = async () => {
      console.log('Token being sent:', token)
      try {
        // Adding authentication token
        const response = await axios.get('https://obc.work.gd/api/garages/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        console.log('API Response:', response.data);
        setGarages(response.data);
      } catch (err) {
        setError('Failed to load garages');
        console.error('Error fetching garages:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
    fetchGarages();
    }
  }, [token]);

  const searchInputRef = useRef(null);
  
  const filteredGarages = modelSearchQuery
    ? garages.filter(garage => 
      garage.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      garage.locality.toLowerCase().includes(modelSearchQuery.toLowerCase())
    )
    : garages;

  const handleSearch = (e) => {
    setModelSearchQuery(e.target.value);
  };

  const handleGarageSelect = (garage)=> {
    onSelectGarage(garage);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-8">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-medium">Select Garage</h2>
          <button className="text-white hover:text-gray-200" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="p-4">
        <input
          ref={searchInputRef}
          type="text"
          value={modelSearchQuery}
          onChange={handleSearch}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Type to search garages..."
        />
          
          <div className="bg-blue-50 p-2 mb-4 mt-4 rounded">
            <p className="text-gray-700">Recommended As Per Nearest Location</p>
          </div>
          
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center">Loading garages...</div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : filteredGarages.length > 0 ? (
              filteredGarages.map((garage, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4"
                onClick={()=> handleGarageSelect(garage)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-gray-700 font-medium mb-2">{garage.name}</h3>
                      <p className="text-sm text-gray-600">Locality : {garage.locality}</p>
                      <p className="text-sm text-gray-600">
                        Mechanic Name:{garage.mechanic},
                        Garage Mobile : {garage.mobile}
                      </p>
                    </div>
                    
                    <a href={garage.link} target='__blank'
                     className="flex items-center text-red-600 hover:text-red-700">
                      <MapPin size={20} />
                      <span className="ml-1">DIRECTIONS</span>
                    </a>
                    
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No matching garages found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GarageSelector;