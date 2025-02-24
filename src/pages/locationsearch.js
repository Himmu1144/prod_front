// import React, { useState, useEffect } from 'react';

// const LocationSearch = () => {
//   const [searchInput, setSearchInput] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [autocomplete, setAutocomplete] = useState(null);

//   useEffect(() => {
//     // Load Google Maps JavaScript API
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places`;
//     script.async = true;
//     script.onload = () => {
//       // Create autocomplete instance when script loads
//       const auto = new window.google.maps.places.Autocomplete(
//         document.getElementById('location-input'),
//         { types: ['address'] }
//       );
      
//       // Listen for place selection
//       auto.addListener('place_changed', () => {
//         const place = auto.getPlace();
//         console.log('Selected place:', place);
//         // Here you can handle the selected place data
//         // place.formatted_address - full address
//         // place.geometry.location - lat & lng
//       });
      
//       setAutocomplete(auto);
//     };
//     document.head.appendChild(script);
    
//     // Cleanup
//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   return (
//     <div className="w-full max-w-md mx-auto p-4">
//       <input
//         id="location-input"
//         type="text"
//         className="w-full p-2 border rounded-lg shadow-sm"
//         placeholder="Search for an address..."
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//       />
//     </div>
//   );
// };

// export default LocationSearch;

// import React, { useState, useRef, useEffect } from 'react';

// const LocationSearch = ({ onPlaceSelect }) => {
//   const [searchInput, setSearchInput] = useState('');
//   const autoCompleteRef = useRef(null);
//   const inputRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     if (window.google) {
//       initializeAutocomplete();
//       return;
//     }

//     const loadScript = () => {
//       if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
//         const script = document.createElement('script');
//         // Added bounds=in to prioritize Indian results while still allowing others
//         script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places&region=IN&language=en`;
//         script.async = true;
//         script.defer = true;
        
//         script.onload = () => {
//           setIsLoaded(true);
//           initializeAutocomplete();
//         };
        
//         document.head.appendChild(script);
//       }
//     };

//     loadScript();

//     return () => {
//       if (autoCompleteRef.current) {
//         window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
//       }
//     };
//   }, []);

//   const initializeAutocomplete = () => {
//     if (!inputRef.current || !window.google) return;

//     autoCompleteRef.current = new window.google.maps.places.Autocomplete(
//       inputRef.current,
//       {
//         // Types expanded to include more place types
//         types: ['establishment', 'geocode'],
//         // Removed country restriction to allow worldwide search
//         fields: [
//           'address_components',
//           'formatted_address',
//           'geometry',
//           'name',
//           'place_id',
//           'types'
//         ]
//       }
//     );

//     // Set initial bounds to India but allow expansion
//     const defaultBounds = new window.google.maps.LatLngBounds(
//       new window.google.maps.LatLng(8.4, 68.7), // SW corner of India
//       new window.google.maps.LatLng(37.6, 97.25) // NE corner of India
//     );
//     autoCompleteRef.current.setBounds(defaultBounds);

//     autoCompleteRef.current.addListener('place_changed', () => {
//       const place = autoCompleteRef.current.getPlace();
      
//       if (!place.geometry) {
//         console.log('No details available for this place');
//         return;
//       }

//       const addressData = {
//         formatted_address: place.formatted_address,
//         name: place.name, // Added name field for establishments
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//         address: '',
//         city: '',
//         state: '',
//         zip: '',
//         place_id: place.place_id,
//         types: place.types
//       };

//       // Parse address components
//       place.address_components.forEach(component => {
//         const type = component.types[0];
//         switch(type) {
//           case 'street_number':
//           case 'route':
//             addressData.address += component.long_name + ' ';
//             break;
//           case 'sublocality_level_1':
//           case 'locality':
//             addressData.city = component.long_name;
//             break;
//           case 'administrative_area_level_1':
//             addressData.state = component.short_name;
//             break;
//           case 'postal_code':
//             addressData.zip = component.long_name;
//             break;
//         }
//       });

//       addressData.address = addressData.address.trim();
      
//       if (onPlaceSelect) {
//         onPlaceSelect(addressData);
//       }

//       setSearchInput(place.formatted_address);
//     });
//   };

//   return (
//     <div className="w-full">
//       <input
//         ref={inputRef}
//         type="text"
//         className="w-full p-2 border rounded-lg shadow-sm"
//         placeholder="Search for an address, landmark, or place..."
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//       />
//     </div>
//   );
// };

// export default LocationSearch;


// import React, { useState, useRef, useEffect } from 'react';

// const LocationSearch = ({ onPlaceSelect }) => {
//   const [searchInput, setSearchInput] = useState('');
//   const autoCompleteRef = useRef(null);
//   const inputRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     if (window.google) {
//       initializeAutocomplete();
//       return;
//     }

//     useEffect(() => {
//         setSearchInput(value || '');
//     }, [value]); 

//     const loadScript = () => {
//       if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places&region=IN&language=en`;
//         script.async = true;
//         script.defer = true;
        
//         script.onload = () => {
//           setIsLoaded(true);
//           initializeAutocomplete();
//         };
        
//         document.head.appendChild(script);
//       }
//     };

//     loadScript();

//     return () => {
//       if (autoCompleteRef.current) {
//         window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
//       }
//     };
//   }, []);

//   const initializeAutocomplete = () => {
//     if (!inputRef.current || !window.google) return;

//     autoCompleteRef.current = new window.google.maps.places.Autocomplete(
//       inputRef.current,
//       {
//         types: ['establishment', 'geocode'],
//         fields: [
//           'address_components',
//           'formatted_address',
//           'geometry',
//           'name',
//           'place_id',
//           'types'
//         ]
//       }
//     );

//     const defaultBounds = new window.google.maps.LatLngBounds(
//       new window.google.maps.LatLng(8.4, 68.7),
//       new window.google.maps.LatLng(37.6, 97.25)
//     );
//     autoCompleteRef.current.setBounds(defaultBounds);

//     autoCompleteRef.current.addListener('place_changed', () => {
//       const place = autoCompleteRef.current.getPlace();
      
//       if (!place.geometry) {
//         console.log('No details available for this place');
//         return;
//       }

//       const addressData = {
//         formatted_address: place.formatted_address,
//         name: place.name,
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//         address: place.formatted_address, // Use the full formatted address
//         city: '',
//         state: '',
//         zip: '',
//         place_id: place.place_id,
//         types: place.types
//       };

//       // Parse address components for city, state, and zip
//       place.address_components.forEach(component => {
//         const type = component.types[0];
//         switch(type) {
//           case 'locality':
//             addressData.city = component.long_name;
//             break;
//           case 'administrative_area_level_1':
//             addressData.state = component.lon;
//             break;
//           case 'postal_code':
//             addressData.zip = component.long_name;
//             break;
//         }
//       });
      
//       if (onPlaceSelect) {
//         onPlaceSelect(addressData);
//       }

//       setSearchInput(place.formatted_address);
//     });
//   };

//   return (
//     <div className="w-full">
//       <input
//         ref={inputRef}
//         type="text"
//         className={className}
//         placeholder={placeholder}
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//       />
//     </div>
//   );
// };
// import React, { useState, useEffect } from 'react';

// const LocationSearch = () => {
//   const [searchInput, setSearchInput] = useState('');
//   const [suggestions, setSuggestions] = useState([]);
//   const [autocomplete, setAutocomplete] = useState(null);

//   useEffect(() => {
//     // Load Google Maps JavaScript API
//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places`;
//     script.async = true;
//     script.onload = () => {
//       // Create autocomplete instance when script loads
//       const auto = new window.google.maps.places.Autocomplete(
//         document.getElementById('location-input'),
//         { types: ['address'] }
//       );
      
//       // Listen for place selection
//       auto.addListener('place_changed', () => {
//         const place = auto.getPlace();
//         console.log('Selected place:', place);
//         // Here you can handle the selected place data
//         // place.formatted_address - full address
//         // place.geometry.location - lat & lng
//       });
      
//       setAutocomplete(auto);
//     };
//     document.head.appendChild(script);
    
//     // Cleanup
//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   return (
//     <div className="w-full max-w-md mx-auto p-4">
//       <input
//         id="location-input"
//         type="text"
//         className="w-full p-2 border rounded-lg shadow-sm"
//         placeholder="Search for an address..."
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//       />
//     </div>
//   );
// };

// export default LocationSearch;

// import React, { useState, useRef, useEffect } from 'react';

// const LocationSearch = ({ onPlaceSelect }) => {
//   const [searchInput, setSearchInput] = useState('');
//   const autoCompleteRef = useRef(null);
//   const inputRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     if (window.google) {
//       initializeAutocomplete();
//       return;
//     }

//     const loadScript = () => {
//       if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
//         const script = document.createElement('script');
//         // Added bounds=in to prioritize Indian results while still allowing others
//         script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places&region=IN&language=en`;
//         script.async = true;
//         script.defer = true;
        
//         script.onload = () => {
//           setIsLoaded(true);
//           initializeAutocomplete();
//         };
        
//         document.head.appendChild(script);
//       }
//     };

//     loadScript();

//     return () => {
//       if (autoCompleteRef.current) {
//         window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
//       }
//     };
//   }, []);

//   const initializeAutocomplete = () => {
//     if (!inputRef.current || !window.google) return;

//     autoCompleteRef.current = new window.google.maps.places.Autocomplete(
//       inputRef.current,
//       {
//         // Types expanded to include more place types
//         types: ['establishment', 'geocode'],
//         // Removed country restriction to allow worldwide search
//         fields: [
//           'address_components',
//           'formatted_address',
//           'geometry',
//           'name',
//           'place_id',
//           'types'
//         ]
//       }
//     );

//     // Set initial bounds to India but allow expansion
//     const defaultBounds = new window.google.maps.LatLngBounds(
//       new window.google.maps.LatLng(8.4, 68.7), // SW corner of India
//       new window.google.maps.LatLng(37.6, 97.25) // NE corner of India
//     );
//     autoCompleteRef.current.setBounds(defaultBounds);

//     autoCompleteRef.current.addListener('place_changed', () => {
//       const place = autoCompleteRef.current.getPlace();
      
//       if (!place.geometry) {
//         console.log('No details available for this place');
//         return;
//       }

//       const addressData = {
//         formatted_address: place.formatted_address,
//         name: place.name, // Added name field for establishments
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//         address: '',
//         city: '',
//         state: '',
//         zip: '',
//         place_id: place.place_id,
//         types: place.types
//       };

//       // Parse address components
//       place.address_components.forEach(component => {
//         const type = component.types[0];
//         switch(type) {
//           case 'street_number':
//           case 'route':
//             addressData.address += component.long_name + ' ';
//             break;
//           case 'sublocality_level_1':
//           case 'locality':
//             addressData.city = component.long_name;
//             break;
//           case 'administrative_area_level_1':
//             addressData.state = component.short_name;
//             break;
//           case 'postal_code':
//             addressData.zip = component.long_name;
//             break;
//         }
//       });

//       addressData.address = addressData.address.trim();
      
//       if (onPlaceSelect) {
//         onPlaceSelect(addressData);
//       }

//       setSearchInput(place.formatted_address);
//     });
//   };

//   return (
//     <div className="w-full">
//       <input
//         ref={inputRef}
//         type="text"
//         className="w-full p-2 border rounded-lg shadow-sm"
//         placeholder="Search for an address, landmark, or place..."
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//       />
//     </div>
//   );
// };

// export default LocationSearch;


// import React, { useState, useRef, useEffect } from 'react';

// const LocationSearch = ({ onPlaceSelect }) => {
//   const [searchInput, setSearchInput] = useState('');
//   const autoCompleteRef = useRef(null);
//   const inputRef = useRef(null);
//   const [isLoaded, setIsLoaded] = useState(false);

//   useEffect(() => {
//     if (window.google) {
//       initializeAutocomplete();
//       return;
//     }

//     useEffect(() => {
//         setSearchInput(value || '');
//     }, [value]); 

//     const loadScript = () => {
//       if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places&region=IN&language=en`;
//         script.async = true;
//         script.defer = true;
        
//         script.onload = () => {
//           setIsLoaded(true);
//           initializeAutocomplete();
//         };
        
//         document.head.appendChild(script);
//       }
//     };

//     loadScript();

//     return () => {
//       if (autoCompleteRef.current) {
//         window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
//       }
//     };
//   }, []);

//   const initializeAutocomplete = () => {
//     if (!inputRef.current || !window.google) return;

//     autoCompleteRef.current = new window.google.maps.places.Autocomplete(
//       inputRef.current,
//       {
//         types: ['establishment', 'geocode'],
//         fields: [
//           'address_components',
//           'formatted_address',
//           'geometry',
//           'name',
//           'place_id',
//           'types'
//         ]
//       }
//     );

//     const defaultBounds = new window.google.maps.LatLngBounds(
//       new window.google.maps.LatLng(8.4, 68.7),
//       new window.google.maps.LatLng(37.6, 97.25)
//     );
//     autoCompleteRef.current.setBounds(defaultBounds);

//     autoCompleteRef.current.addListener('place_changed', () => {
//       const place = autoCompleteRef.current.getPlace();
      
//       if (!place.geometry) {
//         console.log('No details available for this place');
//         return;
//       }

//       const addressData = {
//         formatted_address: place.formatted_address,
//         name: place.name,
//         lat: place.geometry.location.lat(),
//         lng: place.geometry.location.lng(),
//         address: place.formatted_address, // Use the full formatted address
//         city: '',
//         state: '',
//         zip: '',
//         place_id: place.place_id,
//         types: place.types
//       };

//       // Parse address components for city, state, and zip
//       place.address_components.forEach(component => {
//         const type = component.types[0];
//         switch(type) {
//           case 'locality':
//             addressData.city = component.long_name;
//             break;
//           case 'administrative_area_level_1':
//             addressData.state = component.lon;
//             break;
//           case 'postal_code':
//             addressData.zip = component.long_name;
//             break;
//         }
//       });
      
//       if (onPlaceSelect) {
//         onPlaceSelect(addressData);
//       }

//       setSearchInput(place.formatted_address);
//     });
//   };

//   return (
//     <div className="w-full">
//       <input
//         ref={inputRef}
//         type="text"
//         className={className}
//         placeholder={placeholder}
//         value={searchInput}
//         onChange={(e) => setSearchInput(e.target.value)}
//       />
//     </div>
//   );
// };

// export default LocationSearch;

import React, { useState, useRef, useEffect } from 'react';

const LocationSearch = ({ onPlaceSelect, value, onChange, className, placeholder }) => {
  const [searchInput, setSearchInput] = useState(value || '');
  const autoCompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Update searchInput when value prop changes
  useEffect(() => {
    setSearchInput(value || '');
  }, [value]);

  useEffect(() => {
    if (window.google) {
      initializeAutocomplete();
      return;
    }

    const loadScript = () => {
      if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAjtOice8zXgyYuCIR9MnLL12IKSRfrY7c&libraries=places&region=IN&language=en`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
          initializeAutocomplete();
        };
        
        document.head.appendChild(script);
      }
    };

    loadScript();

    return () => {
      if (autoCompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autoCompleteRef.current);
      }
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autoCompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['establishment', 'geocode'],
        fields: [
          'address_components',
          'formatted_address',
          'geometry',
          'name',
          'place_id',
          'types'
        ]
      }
    );

    const defaultBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(8.4, 68.7),
      new window.google.maps.LatLng(37.6, 97.25)
    );
    autoCompleteRef.current.setBounds(defaultBounds);

    autoCompleteRef.current.addListener('place_changed', () => {
      const place = autoCompleteRef.current.getPlace();
      
      if (!place.geometry) {
        console.log('No details available for this place');
        return;
      }

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const addressData = {
        formatted_address: place.formatted_address,
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address, // Use the full formatted address
        city: '',
        state: '',
        zip: '',
        place_id: place.place_id,
        types: place.types,
        mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
      };

      // Parse address components for city, state, and zip
      place.address_components.forEach(component => {
        const type = component.types[0];
        switch(type) {
          case 'locality':
            addressData.city = component.long_name;
            break;
          case 'administrative_area_level_1':
            addressData.state = component.long_name;
            break;
          case 'postal_code':
            addressData.zip = component.long_name;
            break;
        }
      });
      
      if (onPlaceSelect) {
        onPlaceSelect(addressData);
      }

      setSearchInput(place.formatted_address);
    });
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchInput(newValue);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    // <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        className={className}
        placeholder={placeholder}
        value={searchInput}
        onChange={handleInputChange}
      />
    // </div>
  );
};

export default LocationSearch;