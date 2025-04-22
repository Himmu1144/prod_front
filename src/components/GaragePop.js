import React, { useState, useEffect, useRef, useContext } from 'react';
import { X, MapPin } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // If any coordinate is missing, return a large number so it sorts to the end
  if (!lat1 || !lon1 || !lat2 || !lon2) return Number.MAX_SAFE_INTEGER;
  
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
};

const GarageSelector = ({ onClose, onSelectGarage, userLocation }) => {
  const { token } = useContext(AuthContext);
  const [garages, setGarages] = useState([]);
  const [sortedGarages, setSortedGarages] = useState([]);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await axios.get('https://admin.onlybigcars.com/api/garages/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
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
  
  // Sort garages by distance whenever garages or userLocation changes
  useEffect(() => {
    if (garages.length > 0) {
      let garagesToSort = [...garages];
      
      // If we have user location, calculate distances and sort
      if (userLocation && userLocation.lat && userLocation.lng) {
        // Add distance property to each garage
        garagesToSort = garagesToSort.map(garage => {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            garage.lat,
            garage.lng
          );
          return { ...garage, distance };
        });
        
        // Sort by distance
        garagesToSort.sort((a, b) => a.distance - b.distance);
        
        // Add a label to garages with coordinates
        garagesToSort = garagesToSort.map(garage => ({
          ...garage,
          distanceLabel: garage.distance < Number.MAX_SAFE_INTEGER 
            ? `${garage.distance.toFixed(1)} km away` 
            : null
        }));
      }
      
      setSortedGarages(garagesToSort);
    }
  }, [garages, userLocation]);

  const searchInputRef = useRef(null);
  
  const filteredGarages = modelSearchQuery
    ? sortedGarages.filter(garage => 
      garage.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      garage.locality.toLowerCase().includes(modelSearchQuery.toLowerCase())
    )
    : sortedGarages;

  const handleSearch = (e) => {
    setModelSearchQuery(e.target.value);
  };

  const handleGarageSelect = (garage) => {
    onSelectGarage(garage);
    onClose();
  };

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
            <p className="text-gray-700">
              {userLocation ? 'Sorted by nearest location' : 'Recommended Garages'}
            </p>
          </div>
          
          <div className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center">Loading garages...</div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : filteredGarages.length > 0 ? (
              filteredGarages.map((garage, index) => (
                <div 
                  key={index} 
                  className={`border border-gray-200 rounded-lg p-4 ${
                    garage.is_active 
                    ? 'hover:bg-gray-50 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed bg-gray-50'
                  }`}
                  onClick={() => garage.is_active && handleGarageSelect(garage)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium mb-2 ${!garage.is_active ? 'text-gray-400' : 'text-gray-700'}`}>
                        {garage.name}
                      </h3>
                      <p className={`text-sm ${!garage.is_active ? 'text-gray-400' : 'text-gray-600'}`}>
                        Locality: {garage.locality}
                      </p>
                      <p className={`text-sm ${!garage.is_active ? 'text-gray-400' : 'text-gray-600'}`}>
                        Mechanic Name: {garage.mechanic},
                        Garage Mobile: {garage.mobile}
                      </p>
                      {!garage.is_active && (
                        <p className="text-xs text-red-500 mt-1">
                          Inactive Workshop
                        </p>
                      )}
                      {garage.distanceLabel && garage.is_active && (
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {garage.distanceLabel}
                        </p>
                      )}
                    </div>
                    
                    {garage.is_active && (
                      <a 
                        href={garage.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-red-600 hover:text-red-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin size={20} />
                        <span className="ml-1">DIRECTIONS</span>
                      </a>
                    )}
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