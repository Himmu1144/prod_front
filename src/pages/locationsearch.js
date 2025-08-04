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
          console.log('[LocationSearch] Google Maps API script loaded');
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
        ],
      }
    );

    // Optional: bias to India
    const defaultBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(8.4, 68.7),
      new window.google.maps.LatLng(37.6, 97.25)
    );
    autoCompleteRef.current.setBounds(defaultBounds);

    autoCompleteRef.current.addListener('place_changed', () => {
      const place = autoCompleteRef.current.getPlace();
      console.log('[LocationSearch] place_changed triggered');
      console.log('[LocationSearch] Raw place object:', place);

      if (!place.geometry) {
        console.warn('[LocationSearch] No geometry available for this place');
        return;
      }

      // Log all address components
      console.log('[LocationSearch] address_components:', place.address_components);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const addressData = {
        formatted_address: place.formatted_address,
        name: place.name,
        lat,
        lng,
        address: place.formatted_address,
        city: '',
        state: '',
        zip: '',
        place_id: place.place_id,
        types: place.types,
        mapLink: `https://www.google.com/maps?q=${lat},${lng}`,
      };

      // Parse address components for city, state, and zip using includes()
      place.address_components.forEach((component) => {
        const types = component.types;
        console.log('[LocationSearch] component types:', types, 'long_name:', component.long_name);

        if (types.includes('locality') || types.includes('sublocality') || types.includes('postal_town')) {
          addressData.city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = component.long_name;
        }
        if (types.includes('postal_code')) {
          addressData.zip = component.long_name;
        }
      });

      console.log('[LocationSearch] Parsed addressData:', addressData);

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
    <input
      ref={inputRef}
      type="text"
      className={className}
      placeholder={placeholder}
      value={searchInput}
      onChange={handleInputChange}
    />
  );
};

export default LocationSearch;
