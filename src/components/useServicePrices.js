import { useState, useEffect, useRef } from 'react';
import { getProductPrice } from './priceUtils';

export const useServicePrices = (services, selectedCarBrand, selectedCarModel) => {
  const [servicePrices, setServicePrices] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Use a ref to track previous values
  const prevProps = useRef({ services, selectedCarBrand, selectedCarModel });

  useEffect(() => {
    // Skip effect if dependencies haven't actually changed
    const prevServices = prevProps.current.services;
    const prevBrand = prevProps.current.selectedCarBrand;
    const prevModel = prevProps.current.selectedCarModel;
    
    if (
      !selectedCarBrand || 
      !selectedCarModel || 
      !services.length ||
      (
        selectedCarBrand === prevBrand &&
        selectedCarModel === prevModel &&
        services === prevServices
      )
    ) {
      return;
    }
    
    // Update ref with current values
    prevProps.current = { services, selectedCarBrand, selectedCarModel };
    
    const fetchPrices = async () => {
      setLoading(true);
      
      try {
        const pricePromises = services.map(async (service) => {
          const price = await getProductPrice(
            selectedCarBrand,
            selectedCarModel,
            service.title
          );
          
          return {
            id: service.id,
            title: service.title,
            price
          };
        });
        
        const prices = await Promise.all(pricePromises);
        
        // Convert array to object for easy lookup
        const pricesObj = prices.reduce((acc, item) => {
          acc[`${item.id}-${item.title}`] = item.price;
          return acc;
        }, {});
        
        setServicePrices(pricesObj);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrices();
  }, [services, selectedCarBrand, selectedCarModel]);

  return { servicePrices, loading };
};