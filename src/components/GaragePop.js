import React, { useState, useEffect, useRef, useContext } from 'react';
import { X, MapPin, ChevronDown, ChevronUp } from 'lucide-react'; // Added ChevronDown, ChevronUp
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
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
};


const DEFAULT_OPERATING_HOURS = {
  Monday: { open: '09:00', close: '18:00', is_closed: false },
  Tuesday: { open: '09:00', close: '18:00', is_closed: false },
  Wednesday: { open: '09:00', close: '18:00', is_closed: false },
  Thursday: { open: '09:00', close: '18:00', is_closed: false },
  Friday: { open: '09:00', close: '18:00', is_closed: false },
  Saturday: { open: '10:00', close: '17:00', is_closed: false },
  Sunday: { open: '00:00', close: '00:00', is_closed: true }, // Times are placeholders if is_closed is true
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_OF_WEEK_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const getDayOfWeek = (date = new Date()) => {
  return DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
};

const formatTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || timeStr.split(':').length !== 2) return 'N/A';
  // The input timeStr is already in 24-hour format (e.g., "09:00", "18:00")
  // So, we just return it directly if it's valid.
  const [hours, minutes] = timeStr.split(':');
  if (isNaN(parseInt(hours, 10)) || isNaN(parseInt(minutes, 10))) return 'N/A';
  return `${hours}:${minutes}`; // Return in 24-hour format
};

/**
 * NEW getGarageStatus function with updated logic.
 * This function determines the garage's current status text and color
 * based on the user's requirements.
 */
const getGarageStatus = (garageOperatingHours) => {
  const todayName = getDayOfWeek();
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const todayShort = DAYS_OF_WEEK_SHORT[todayIndex];

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const allHours = garageOperatingHours || DEFAULT_OPERATING_HOURS;
  const todayHours = allHours[todayName];

  // Case 1: Today is explicitly marked as closed (e.g., Sunday is_closed: true)
  if (!todayHours || todayHours.is_closed) {
    return {
      statusText: `Closed (${todayShort})`,
      statusColor: 'text-red-500',
      isCurrentlyOpen: false,
    };
  }

  // Case 2: Today has operating hours. Validate them.
  if (typeof todayHours.open !== 'string' || typeof todayHours.close !== 'string' ||
      !todayHours.open.includes(':') || !todayHours.close.includes(':')) {
    // Handle invalid time format for an operating day
    return {
        statusText: `Closed (schedule error)`,
        statusColor: 'text-red-500',
        isCurrentlyOpen: false,
    };
  }

  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  const formattedTodayOpen = formatTime(todayHours.open);
  const formattedTodayClose = formatTime(todayHours.close);

  // Subcase 2.1: Currently Open
  if (currentTime >= openTime && currentTime < closeTime) {
    return {
      // Requirement: Show today's full opening hours with a single day abbreviation
      statusText: `${formattedTodayOpen} - ${formattedTodayClose} (${todayShort})`,
      statusColor: 'text-green-600',
      isCurrentlyOpen: true,
    };
  }
  // Subcase 2.2: Currently Closed (but today is an operating day)
  else {
    // Subcase 2.2.1: Before opening time today
    if (currentTime < openTime) {
      // Requirement: Show the opening times for the day even if it's currently closed.
      return {
        statusText: `${formattedTodayOpen} - ${formattedTodayClose} (${todayShort})`,
        statusColor: 'text-red-500', // Red because it's not actually open yet
        isCurrentlyOpen: false,
      };
    }
    // Subcase 2.2.2: After closing time today
    else { // currentTime >= closeTime
      // Requirement: Just show that it's closed for the day.
      return {
        statusText: `Closed (${todayShort})`,
        statusColor: 'text-red-500',
        isCurrentlyOpen: false,
      };
    }
  }
};



const GarageSelector = ({ onClose, onSelectGarage, userLocation }) => {
  const { token } = useContext(AuthContext);
  const [garages, setGarages] = useState([]);
  const [sortedGarages, setSortedGarages] = useState([]);
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTimingsGarageId, setExpandedTimingsGarageId] = useState(null); // To track expanded garage
  
  useEffect(() => {
    const fetchGarages = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/garages/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
                // If not, it will use DEFAULT_OPERATING_HOURS
        setGarages(response.data.map(g => ({...g, operating_hours: g.operating_hours || DEFAULT_OPERATING_HOURS })));
      } catch (err) {
        setError('Failed to load garages');
        console.error('Error fetching garages:', err);
        // Fallback with default hours if API fails or doesn't provide them
        setGarages([]); 
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
      let garagesToSort = garages.map(g => ({
        ...g,
        // Ensure operating_hours exists, falling back to default if necessary
        operating_hours: g.operating_hours || DEFAULT_OPERATING_HOURS 
      }));
      
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
    } else if (!loading && garages.length === 0 && !error) {
        // Handle case where API returns empty list but no error
        // This might happen if you want to show garages even if API fails to provide operating_hours
        // For now, we assume operating_hours are part of the garage object or defaulted
        setSortedGarages([]);
    }
  }, [garages, userLocation, loading, error]);

  const searchInputRef = useRef(null);
  
  const filteredGarages = modelSearchQuery
    ? sortedGarages.filter(garage => 
      garage.name.toLowerCase().includes(modelSearchQuery.toLowerCase()) ||
      (garage.locality && garage.locality.toLowerCase().includes(modelSearchQuery.toLowerCase()))
    )
    : sortedGarages;

  const handleSearch = (e) => {
    setModelSearchQuery(e.target.value);
  };

  const handleGarageSelect = (garage) => {
    onSelectGarage(garage);
    onClose();
  };

  const toggleTimingsExpansion = (garageIdentifier) => {
    setExpandedTimingsGarageId(prevId => (prevId === garageIdentifier ? null : garageIdentifier));
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-8 z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-700 p-4 flex justify-between items-center z-10">
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
              filteredGarages.map((garage) => {
                              const status = getGarageStatus(garage.operating_hours || DEFAULT_OPERATING_HOURS);
                              const uniqueGarageId = garage.id || garage.name; // Use a consistent identifier
                              const isExpanded = expandedTimingsGarageId === uniqueGarageId;
              
                                                              return (
                                <div 
                                  key={uniqueGarageId} 
                                  className={`border border-gray-200 rounded-lg p-4 ${
                                    garage.is_active 
                                    ? 'hover:bg-gray-50' 
                                    : 'opacity-60 cursor-not-allowed bg-gray-50'
                                  }`}
                                >
                                  <div 
                                    className={garage.is_active ? 'cursor-pointer' : ''}
                                    onClick={() => garage.is_active && handleGarageSelect(garage)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className={`font-medium mb-1 ${!garage.is_active ? 'text-gray-400' : 'text-gray-700'}`}>
                                          {garage.name}
                                        </h3>
                                        <p className={`text-sm font-bold ${!garage.is_active ? 'text-gray-400' : 'text-gray-600'}`}>
                                          Locality: <span className="font-semibold">{garage.locality}</span>
                                        </p>
                                        <p className={`text-sm mb-1 font-bold ${!garage.is_active ? 'text-gray-400' : 'text-gray-600'}`}>
                                          Mechanic: <span className="font-semibold">{garage.mechanic}</span>, Mobile: <span className="font-semibold">{garage.mobile}</span>
                                        </p>
                                        {!garage.is_active && (
                                          <p className="text-xs text-red-500 mt-1">
                                            Inactive Workshop
                                          </p>
                                        )}
                                        {garage.distanceLabel && garage.is_active && (
                                          <p className="text-sm text-blue-600 font-medium mt-1">
                                            {garage.distanceLabel}
                                          </p>
                                        )}
                                      </div>
                                      
                                      <div className="flex flex-col items-end">
                                        {garage.is_active && (
                                          <a 
                                            href={garage.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()} 
                                          >
                                            <MapPin size={20} />
                                            <span className="ml-1">DIRECTIONS</span>
                                          </a>
                                        )}
                                        <text className={`text-sm`}>Night Shift: <span className={garage.night_shift ? 'text-green-600' : 'text-red-600'}>{garage.night_shift ? 'Yes' : 'No'}</span></text>

                                        {/* Compact timing card inside main garage card, below directions */}
                                        {garage.is_active && (
                                          <div className="relative mt-2 w-fit">
                                            <div
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTimingsExpansion(uniqueGarageId);
                                              }}
                                              className={`px-3 py-1.5 text-sm font-medium flex items-center justify-between cursor-pointer hover:bg-gray-50 ${status.statusColor} border border-gray-200 rounded`}
                                            >
                                              <span className="mr-2">{status.statusText}</span>
                                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </div>
                    
                                            {isExpanded && (
                                              <div className="absolute top-full right-0 mt-1 w-full z-10 bg-white border border-gray-200 rounded shadow-lg">
                                                <div className="px-3 py-2 text-xs">
                                                  <div className="space-y-0.5">
                                                  {DAYS_OF_WEEK.map(day => {
                                                    const dayHours = (garage.operating_hours || DEFAULT_OPERATING_HOURS)[day];
                                                    const dayShort = DAYS_OF_WEEK_SHORT[DAYS_OF_WEEK.indexOf(day)];
                                                    return (
                                                      <div key={day} className="flex justify-between">
                                                       
                                                        {dayHours && !dayHours.is_closed ? (
                                                          <span className="text-gray-800">{`${formatTime(dayHours.open)} - ${formatTime(dayHours.close)} (${dayShort})`}</span>
                                                        ) : (
                                                          <span className="text-red-500">{`Closed (${dayShort})`}</span>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                   </div>
                                  </div>

                                </div>
                              );
                            })
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