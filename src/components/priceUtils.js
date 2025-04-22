import * as XLSX from 'xlsx';

// Cache the parsed Excel data to avoid re-reading the file
let cachedPriceData = null;

// Function to read and parse the Excel file
export const readPriceData = async () => {
  if (cachedPriceData) {
    return cachedPriceData;
  }

  try {
    // Fetch the Excel file with proper error handling
    const response = await fetch('/assets/Normal_Cars_Prices_CRM.xlsx');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check content type to avoid parsing HTML as Excel
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('Received HTML instead of Excel file');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Cache the data
    cachedPriceData = data;
    
    return data;
  } catch (error) {
    console.error('Error reading price data:', error);
    // Return an empty array instead of throwing to prevent UI breakage
    return [];
  }
};

// Function to get price for a specific product
export const getProductPrice = async (brand, model, productName) => {
  try {
    // Read price data (uses cache if available)
    const priceData = await readPriceData();
    
    if (!priceData || priceData.length === 0) {
      return "Determine";
    }
    
    // Find matching entry
    const entry = priceData.find(item => 
      item.brand?.toLowerCase() === brand?.toLowerCase() &&
      item.model?.toLowerCase() === model?.toLowerCase() &&
      item.product_name?.toLowerCase() === productName?.toLowerCase()
    );
    
    // Return discounted price if available, otherwise after_price, or default to "Determine"
    // if (entry) {
    //   if (entry.discounted_price && entry.discounted_price !== "") {
    //     return `₹${entry.discounted_price}`;
    //   } else if (entry.after_price && entry.after_price !== "") {
    //     return `₹${entry.after_price}`;
    //   }
    // }

    if (entry) {
        if (entry.discounted_price && entry.discounted_price !== "") {
          const intPrice = Math.round(parseFloat(entry.discounted_price));
          return `₹${intPrice}`;
        } else if (entry.after_price && entry.after_price !== "") {
          const intPrice = Math.round(parseFloat(entry.after_price));
          return `₹${intPrice}`;
        }
      }
    
    return "Determine";
  } catch (error) {
    console.error('Error getting product price:', error);
    return "Determine";
  }
};