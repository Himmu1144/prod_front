import Layout from '../components/layout';
import GarageSelector from '../components/GaragePop.js';
import { Alert } from 'react-bootstrap';
import './editpage.css';
import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { Card, Button, Collapse, Form, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPencilAlt } from 'react-icons/fa';
import AddNewCar from './addcar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaChevronDown, FaChevronUp, FaEdit } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import LocationSearch from './locationsearch.js';
// import { useLoadScript } from '@react-google-maps/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JobCard from './JobCard';
import Bill from './bill.js';
import Estimate from './estimate.js';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Add this import 18 feb


// Add this before the EditPage component definition 18-2
const initialFormState = {
  overview: {
    tableData: [],
    total: 0
  },
  customerInfo: {
    mobileNumber: '',
    customerName: '',
    source: '',
    whatsappNumber: '',
    customerEmail: '',
    languageBarrier: false
  },
  location: {
    address: '',
    city: '',
    state: '',
    buildingName: '',
    mapLink: '',
    landmark: ''
  },
  cars: [], // Array to store multiple cars
  activeCar: null, // Currently selected car
  arrivalStatus: {
    leadStatus: '',
    arrivalMode: '',
    disposition: '',
    dateTime: '',
    batteryFeature: '',
    fuelStatus: '',
    speedometerRd: '',
    inventory: [],
    carDocumentDetails: [],
    otherCheckList: [],
    jobCardNumber: '',
    estimatedDeliveryTime: '',
    orderId: 'NA', // Add this new field
  },
  workshop: {
    name: '',
    mechanic: '',
    locality: '',
    mobile: '',
    status: 'Open'
  },
  basicInfo: {
    carType: '',
    caName: '',
    cceName: '', // Will be initialized with user's username
    caComments: '',
    cceComments: '',
    total: 0
  },
  created_at: null,
  updated_at: null,
};

const EditPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const seqNum = location.state?.seqNum;
  const [editingCar, setEditingCar] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [cards, setCards] = useState(false);



  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: "AIzaSyBlzkfa69pC6YAAomHbsYoDrKcrBU-5CQM",
  //   libraries: ["places"]
  // });

  const addressInputRef = useRef(null);
  const jobCardRef = useRef(null);
  const billRef = useRef(null);
  const estimateRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  

  const services = ['Car Service', 'AC Service & Repair','Complete Car Inspection','Denting & Painting','Detailing for Luxury Cars','Brakes & Suspension','Car Battery & Electricals','Tyre & Wheel Care','Cleaning & Grooming','Clutch & Body Parts','Insurance Services & SOS-Emergency','Windshields & Lights'];
  const [selectedService, setSelectedService] = useState('Car Service');

  const [selectedGarage, setSelectedGarage] = useState({
    name: 'Onlybigcars - Own',
    mechanic: 'Sahil',
    locality: 'Service & Repairing, AC Service & Repaire, Denting & Painting, Windshields & Light, Battery & Tyres',
    link:'https://g.co/kgs/X7g95w8',
    mobile: '8368092684'
  });

  const handleGarageSelect = (garage) => {
    // Update selectedGarage state
    setSelectedGarage({
      name: garage.name,
      mechanic: garage.mechanic,
      locality: garage.locality, 
      mobile:garage.mobile
    });
  
    // Sync with formState.workshop
    setFormState(prev => ({
      ...prev,
      workshop: {
        ...prev.workshop,
        name: garage.name,
        mechanic: garage.mechanic,
        locality: garage.locality,
        mobile:garage.mobile,
      }
    }));
  
    setShowGaragePopup(false);
  };

  // 18 feb start

  const StatusHistoryDisplay = ({ statusHistory }) => {
    const hasStatus = (statusToCheck) => {
      // Add debug logs
      console.log('Status History:', statusHistory);
      console.log('Checking for:', statusToCheck);
      
      if (!statusHistory) return false;
      
      const found = statusHistory.some(entry => 
        entry.status.toLowerCase().trim() === statusToCheck.toLowerCase().trim()
      );
      
      console.log(`${statusToCheck} found:`, found);
      return found;
    };
  
    // Define status checks in display order with exact matching strings
    const statusChecks = [
      { name: 'Job Card', present: hasStatus('Job Card') },
      { name: 'Estimate', present: hasStatus('Estimate') },
      { name: 'Bill', present: hasStatus('Bill') },
      { name: 'Completed', present: hasStatus('Completed') }
    ];
  
    return (
      <div className="p-4">
        <div className="grid gap-4">
          {statusChecks.map((status, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium">{status.name}</span>
              {status.present ? (
                <FaCheckCircle className="text-green-500 text-xl" />
              ) : (
                <FaTimesCircle className="text-red-500 text-xl" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  // 18 feb end


//   const generateOrderId = (mobileNumber) => {
//   // Get current time in IST
//   const now = new Date();
//   // Add 5 hours and 30 minutes for IST offset
//   now.setHours(now.getHours() + 5);
//   now.setMinutes(now.getMinutes() + 30);
  
//   const year = now.getFullYear().toString().slice(-2);
//   const month = (now.getMonth() + 1).toString().padStart(2, '0');
//   const day = now.getDate().toString().padStart(2, '0');
//   const hour = now.getHours().toString().padStart(2, '0');
//   const minute = now.getMinutes().toString().padStart(2, '0');
  
//   // Get last 4 digits of mobile number
//   const lastFour = mobileNumber.slice(-4).padStart(4, '0');
  
//   // Combine all parts
//   return `${year}${lastFour}${month}${day}${hour}${minute}`;
// };


  
  const [formState, setFormState] = useState({
    overview: {
      tableData: [],
      caComments: '',
      total: 0,
      discount: 0, // Add this new field
      finalAmount: 0, // Add this new field
    },
    customerInfo: {
      mobileNumber: '',
      customerName: '',
      source: '',
      whatsappNumber: '',
      customerEmail: '',
      languageBarrier: false
    },
    location: {
      address: '',
      city: '',
      state: '',
      buildingName: '',
      mapLink: '',
      landmark: ''
    },
    cars: [],
    selectedServices: [],
    arrivalStatus: {
      leadStatus: '',
      arrivalMode: '',
      disposition: '',
      dateTime: '',
      batteryFeature: '', // Add this new field
      fuelStatus: '', // Add this new field
      speedometerRd: '', // Add this new field
      inventory: [],
      additionalWork: '',
      carDocumentDetails: [],
      otherCheckList: [],
      estimatedDeliveryTime: '', // Add this new field
      status_history: [], // 18 feb
      finalAmount: 0,
      orderId: 'NA', // Add this new field
    },
    workshop: {
      name: selectedGarage.name,
      mechanic: selectedGarage.mechanic,
      locality: selectedGarage.locality,
      mobile: selectedGarage.mobile,
      status: 'Open', // or any default value
    },
    basicInfo: {
      carType : '',
      caName : '',
      cceName: user?.username || '', // Initialize with logged in username
      caComments :'',
      cceComments : '',
      total: 0, // Sync with basicInfo,

    },
  });

  // Fetch lead data if ID exists
  useEffect(() => {

    if (location.state?.customerInfo) {

      setFormState(prev => ({

          ...prev,

          customerInfo: {

              ...prev.customerInfo,

              ...location.state.customerInfo

          },
          basicInfo: {
            ...prev.basicInfo,
            // Initialize technician comments with customer name 
            caComments: location.state.customerInfo.customerName ? `${location.state.customerInfo.customerName} to be done` : '' //14-2
          }

      }));

    } 

    if (id) {
      const fetchLead = async () => {
        try {
          console.log("Fetching lead with ID:", id); // Debug log
          const response = await axios.get(
            `https://obc.work.gd/api/leads/${id}/`,
            {
              headers: {
                'Authorization': `Token ${token}`
              }
            }
          );
          
          // Restructure the incoming data to match formState structure
          const leadData = response.data[0];

          const customerResponse = await axios.get(
            `https://obc.work.gd/api/customers/${leadData.number}/`,
            {
              headers: {
                'Authorization': `Token ${token}`
              }
            }
          );
  

          const technicianComments = leadData.products?.map(product => 
            product.name ? `${product.name} to be done` : ''
          )//14-2
          .filter(Boolean)
          .join('\n') || ''; //14-2
          console.log('This is the legendary lead data',leadData)
          setFormState({
            ...formState, //14-2
            overview: {
              tableData: leadData.products || [],
              caComments: technicianComments, //14-2
              total: leadData.estimated_price || 0,
              discount: leadData.overview.discount || 0, // Add this new field
              finalAmount: leadData.overview.finalAmount || leadData.overview.total || 0, // Add this new field
            },
            customerInfo: {
              mobileNumber: leadData.number || '',
              customerName: leadData.name || '',
              source: leadData.source || '',
              whatsappNumber: leadData.whatsapp_number || '',
              customerEmail: leadData.email || '',
              languageBarrier: leadData.language_barrier || false
            },
            location: {
              address: leadData.address || '',
              city: leadData.city || '',
              state: leadData.state || '',
              buildingName: leadData.building || '',
              mapLink: leadData.map_link || '',
              landmark: leadData.landmark || ''
            },
            cars: [{
              carBrand: leadData.car.brand,
              carModel: leadData.car.model,
              fuel: leadData.car.fuel,
              variant: leadData.car.variant,
              year: leadData.car.year,
              chasisNo: leadData.car.chasis_no,
              regNo: leadData.car.reg_no
            }],
            arrivalStatus: {
              leadStatus: leadData.lead_status || '',
              previousStatus: leadData.lead_status,
              arrivalMode: leadData.arrival_mode || '',
              disposition: leadData.disposition || '',
              dateTime: leadData.arrival_time ? new Date(leadData.arrival_time).toISOString().slice(0, 16) : '',
              jobCardNumber: leadData.job_card_number || '', // Add this new field
              estimatedDeliveryTime: leadData.estimated_delivery_time ? new Date(leadData.estimated_delivery_time).toISOString().slice(0, 16) : '', // Add this new field
              status_history: leadData.status_history || [], // 18 feb
              finalAmount: leadData.final_amount || 0,
              batteryFeature: leadData.battery_feature || '', // Add this new field
              additionalWork: leadData.additional_work || '',
              fuelStatus: leadData.fuel_status || '', // Add this new field 
              speedometerRd: leadData.speedometer_rd || '', // Add this new field
              inventory: leadData.inventory || [],
              orderId: leadData.orderId || 'NA' // Add this new field
              
            },
            workshop: {
              name: leadData.workshop_details?.name || '',
              locality: leadData.workshop_details?.locality || '',
              status: leadData.workshop_details?.status || '',
              mobile: leadData.workshop_details?.mobile || '',
            },
            basicInfo: {
              ...formState.basicInfo,//14-2
              carType: leadData.lead_type || '',
              caName : leadData.caName || '',
              cceName : leadData.cceName || '',
              caComments : technicianComments, //14-2
              cceComments : leadData.cceComments || '',
              total: leadData.estimated_price || 0,
            },
            created_at: leadData.created_at,
            updated_at: leadData.updated_at,
          });

          setDiscount(leadData.overview.discount || 0); // Add this new field
          

          // Check if orderId is not 'NA' and set cards to true
        if (leadData.orderId && leadData.orderId !== 'NA') {
          setCards(true);
        }

          // Also update selectedGarage if workshop data exists
          if (leadData.workshop_details) {
            setSelectedGarage({
              name: leadData.workshop_details.name,
              locality: leadData.workshop_details.locality,
              distance: leadData.workshop_details.distance || '',
              status: leadData.workshop_details.status || 'Open'
            });
          }

          // Update selected service if available
          if (leadData.service_type) {
            setSelectedService(leadData.service_type);
          }


            // Update source if available
        if (leadData.source) {
          setSource(leadData.source);
        }

        // Set customer details
        if (leadData.customer) {
          setCustomer(leadData.customer.customer_name || '');
          setCustomerNumber(leadData.customer.mobile_number || '');
        }

        } catch (error) {
          console.error("Error fetching lead:", error);
          setError("Failed to load lead data");
        }
      };
      fetchLead();
    }
  }, [id, token]);

  // useEffect(() => {
  //   if (isLoaded && addressInputRef.current) {
  //     const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current);
  //     autocomplete.addListener('place_changed', () => {
  //       const place = autocomplete.getPlace();
  //       if (place.geometry) {
  //         const location = {
  //           address: place.formatted_address,
  //           city: place.address_components?.find(c => c.types.includes('locality'))?.long_name || '',
  //           state: place.address_components?.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '',
  //           mapLink: `https://www.google.com/maps/place/${encodeURIComponent(place.formatted_address)}`
  //         };
  //         handlePlaceSelect(location);
  //       }
  //     });
  //   }
  // }, [isLoaded]);

  const calculateTotalAmount = (tableData) => {
    return tableData.reduce((sum, row) => {
      const rowTotal = parseFloat(row.total) || 0;
      return sum + rowTotal;
    }, 0);
  };

  // Modify the existing table row total change handler
  const handleTotalChange = (index, value) => {
    const newTableData = [...formState.overview.tableData];
    newTableData[index].total = value === '' ? 0 : parseFloat(value) || 0;
    
    // Calculate new total amount
    const newTotal = calculateTotalAmount(newTableData);
    
    setFormState(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        tableData: newTableData,

        total: newTotal || 0,
        finalAmount: newTotal || 0 // Sync final amount with total
      },
      basicInfo: {
        ...prev.basicInfo,
        total: newTotal || 0// Sync total with basicInfo
      }

    }));
  };

  // Add this new function after handleTotalChange 14-2
  const updateTechnicianComments = (tableData) => {
    const names = tableData
      .map(row => row.name ? `${row.name} to be done` : '')
      .filter(Boolean)  // Remove empty names
      .join('\n');     // Join with newlines
    
    setFormState(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        caComments: names
      }
    }));
  };

  const handlePlaceSelect = (addressData) => {
    setFormState(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        mapLink: addressData.mapLink
      }
    }));
  };

  const addServiceToTable = (service) => {
    const cleanWorkdone = () => {
      if (service.title === "Comprehensive Service" || 
        service.title === "Standard Service" || 
        service.title === "Basic Service") {
      // Get the active view's services
      const serviceList = activeViews[service.title] === 'workshop' 
        ? service.workshopServices 
        : service.doorstepServices;
      
      // Parse the HTML string to get list items
      const parser = new DOMParser();
      const doc = parser.parseFromString(serviceList, 'text/html');
      const items = doc.querySelectorAll('li');
      
      // Convert NodeList to array of text content
      return Array.from(items)
        .map(item => item.textContent.trim())
        .join(', ');
    } else {
      // For other services, keep the existing logic
      const description = service.description;
      const parser = new DOMParser();
      const doc = parser.parseFromString(description, 'text/html');
      const items = doc.querySelectorAll('li');
      return Array.from(items)
        .map(item => item.textContent.trim())
        .join(', ');
    }
  
    };
  
    const newTableRow = {
    type: selectedService,
    name: service.title,
    workdone: cleanWorkdone(),
    determined: false, 
    total: 0
    };

    const newTableData = [...formState.overview.tableData, newTableRow]; //14-2

    setFormState(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        tableData: newTableData
      }
    }));

    updateTechnicianComments(newTableData);
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = async (section, field, value) => {
    setFormState(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  
    // If the field is mobileNumber and length is 10, fetch customer data
    if (section === 'customerInfo' && field === 'mobileNumber' && value.length === 10) {
      try {
        const response = await axios.get(
          `https://obc.work.gd/api/customers/${value}/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
  
        const customerData = response.data;
        
        // Update form state with fetched data
        setFormState(prev => ({
          ...prev,
          customerInfo: {
            ...prev.customerInfo,
            customerName: customerData.customerName || '',
            whatsappNumber: customerData.whatsappNumber || '',
            customerEmail: customerData.customerEmail || '',
            languageBarrier: customerData.languageBarrier || false
          },
          location: {
            ...prev.location,
            address: customerData.location?.address || '',
            city: customerData.location?.city || '',
            state: customerData.location?.state || '',
            buildingName: customerData.location?.buildingName || '',
            landmark: customerData.location?.landmark || '',
            mapLink: customerData.location?.mapLink || ''
          },
          // cars: customerData.cars || []
        }));
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error fetching customer data:', error);
        }
      }
    }
  };

 
  

  const handleAddCar = (carData, isEdit) => {
    if (isEdit) {
      // Update existing car
      setFormState(prev => ({
        ...prev,
        cars: prev.cars.map(car => 
          car.chasisNo === editingCar.chasisNo ? carData : car
        )
      }));
    } else {
      // Add new car
      setFormState(prev => ({
        ...prev,
        cars: [...prev.cars, carData]
      }));
    }
  };

  // Add this function before the handleSubmit function
  const validateForm = () => {
    const errors = {};
    
    // Required fields validation with specific styling
    const requiredFields = [
      { field: 'carType', value: formState.basicInfo.carType, label: 'Lead type' },
      { field: 'mobileNumber', value: formState.customerInfo.mobileNumber, label: 'Mobile number' },
      // { field: 'customerName', value: formState.customerInfo.customerName, label: 'Customer name' },
      { field: 'source', value: formState.customerInfo.source, label: 'Source' },
      { field: 'address', value: formState.location.address, label: 'Address' },
      { field: 'caComments', value: formState.basicInfo.caComments, label: 'Technician comments' },
      { field: 'leadStatus', value: formState.arrivalStatus.leadStatus, label: 'Lead status' },
      { field: 'arrivalMode', value: formState.arrivalStatus.arrivalMode, label: 'Arrival mode' },
      { field: 'dateTime', value: formState.arrivalStatus.dateTime, label: 'Date and time' },
      { field: 'caName', value: formState.basicInfo.caName, label: 'Technician' },
      { field: 'cceName', value: formState.basicInfo.cceName, label: 'CCE name' },
    ];
  
  //   requiredFields.forEach(({ field, value, label }) => {
  //     if (!value || value.trim() === '') {
  //       errors[field] = `${label} is required`;
  //     }
  //   });
  
  //   if (!formState.cars || formState.cars.length === 0) {
  //     errors.car = 'At least one car is required';
  //   }
  
  //   return errors;
  // };

  const missingFields = requiredFields.filter(({ value }) => !value || value.trim() === '');
  
  if (missingFields.length > 0) {
    errors.required = (
      <ul>
        {missingFields.map(({ label }, index) => (
          <li key={index}>{`${label} is required`}</li>
        ))}
      </ul>
    );
  }

  if (!formState.cars || formState.cars.length === 0) {
    errors.car = 'At least one car is required';
  }

  // Table rows validation
  if (!formState.overview.tableData || formState.overview.tableData.length === 0) {
    errors.table = 'At least one service must be added to the overview table';
  }

  return errors;
};

  const formatLeadId = (mobileNumber, seqNum) => {
    if (!mobileNumber || !seqNum) return null;
    return `L-${mobileNumber}-${seqNum}`;
  };

  // Modify handleSubmit to handle both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();

     // Check if the previous status is "Completed"
  if (location.state?.previousStatus === "Completed") {
    setShowPopup(true);
    return;
  }

    setIsSubmitting(true);
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      const errorList = Object.values(errors)
        .filter(error => error) // Remove any null/undefined values
        .map(error => typeof error === 'string' ? error : error.props.children);
        
      setError(
        <div>
          <ul className="list-none">
            {errorList.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      );
      setIsSubmitting(false);
      return;
    }
  
    try {
      // ... rest of your submission logic
    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  
  
// Starting from here - copy paste update


const formatBold = (text) => `*${text}*`;

const formatColumns = (label, value, bold = false) => {
  const leftCol = label.padEnd(15);  // Left-aligned, 20 chars wide
  const rightCol = (value || 'N/A').padStart(25);  // Right-aligned, 25 chars wide
  return bold ? formatBold(`${leftCol}${rightCol}`) : `${leftCol}${rightCol}`;
};

const formatMultiLine = (label, value, bold = false) => {
  const lines = [
    label,
    value || 'N/A'
  ];
  return bold ? lines.map(line => formatBold(line)).join('\n') : lines.join('\n');
};



const formatCarDetails = (cars) => {
  if (!cars || cars.length === 0) return ['N/A', 'N/A'];
  const car = cars[0];
  const carName = `${car.carBrand} ${car.carModel}`;
  const variantDetails = `${car.year} ${car.fuel}`;
  return [carName, variantDetails];
};

const formattedData = [
  formatColumns('Name:', formState.customerInfo.customerName, true),
  formatColumns('Number:', formState.customerInfo.mobileNumber, true),
  '',
  formatMultiLine('Car:', formState.cars.length > 0 ? formState.cars.map(car => `${car.carBrand} ${car.carModel}`).join(', ') : 'N/A', true),
  formatMultiLine('Variant:', formState.cars.length > 0 ? formState.cars.map(car => `${car.year} ${car.fuel}`).join(', ') : 'N/A', true),
  '',
  formatColumns('Vin No.:', formState.cars[0]?.chasisNo),
  formatColumns('Reg No.:', formState.cars[0]?.regNo),
  formatColumns('Arrival:', formState.arrivalStatus.arrivalMode),
  formatColumns('Date:', formState.arrivalStatus.dateTime, true),
  '',
  formatMultiLine('Add:', formState.location.address),
  '',
  formatMultiLine('Map Link:', formState.location.mapLink, true),
  '',
  formatMultiLine('Work Summary:', formState.overview.tableData.map(item => item.name).join(', '), true),
  '',
  formatColumns('Total Amount:', `₹${formState.overview.total}`, true),
  '',
  formatMultiLine('Workshop Name:', formState.workshop.name, true),
  '',
  formatColumns('Lead Status:', formState.arrivalStatus.leadStatus),
  formatColumns('Lead Source:', formState.customerInfo.source),
  formatColumns('Office CCE:', formState.basicInfo.cceName),
  formatColumns('Technician:', formState.basicInfo.caName),
  '',
  formatColumns('Lead ID:', id ? id : formatLeadId(formState.customerInfo.mobileNumber, seqNum))
].join('\n');// Ending here - copy paste update

  
         // Copy to clipboard
         try {
             await navigator.clipboard.writeText(formattedData);
             
         } catch (error) {
             console.error("Clipboard error:", error);
             
         }
    
    try {
        const formData = {
          ...formState,
          leadId: formatLeadId(formState.customerInfo.mobileNumber, seqNum)
        };

        const url = id 
            ? `https://obc.work.gd/api/leads/${id}/update/`
            : 'https://obc.work.gd/api/edit-form-submit/';
            
        const method = id ? 'put' : 'post';
        
        const response = await axios[method](
            url,
            formData,
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        navigate('/', { 
            state: { 
                message: id ? 'Lead updated successfully!' : 'Lead added successfully!' 
            }
        });
    } catch (error) {
        setError(error.response?.data?.message || 'Something went wrong!');
    } finally {
        setIsSubmitting(false);
    }
};

  // const [serviceCards, setServiceCards] = useState({
  //   'Car Service': [
  //     {
  //       id: 1,
  //       title: "Comprehensive Service",
  //       duration: "6 Hrs Taken",
  //       frequency: "Every 10,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 2, 
  //       title: "Standard Service",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)", 
  //       price: "Determine"
  //     },
  //     {
  //       id: 3,
  //       title: "Basic Service", 
  //       duration: "2 Hrs Taken",
  //       frequency: "Every 3,000 km (Recommended)",
  //       price: "Determine"
  //     }
  //   ],
  //   'AC Service & Repair': [
  //     {
  //       id: 1,
  //       title: "Comprehensive AC Service",
  //       duration: "6 Hrs Taken",
  //       frequency: "Every 10,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 2,
  //       title: "Regular AC Service",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 3,
  //       title: "AC Blower Motor Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 4,
  //       title: "Cooling Coil Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 5,
  //       title: "Condenser Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 5,
  //       title: "Compressor Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 6,
  //       title: "Heating coil Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 7,
  //       title: "V-Belt Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 8,
  //       title: "Radiator Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 9,
  //       title: "Radiator Fan Motor Replacement",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
  //     {
  //       id: 10,
  //       title: "Radiator Flush & Clean",
  //       duration: "4 Hrs Taken",
  //       frequency: "Every 5,000 km (Recommended)",
  //       price: "Determine"
  //     },
      
  //   ],
    
  // });  

  const serviceCards = {
    'Car Service': [
      {
        id: 1,
        title: "Comprehensive Service",
        duration: "6 Hrs Taken",
        frequency: "Every 10,000 km (Recommended)",
        workshopServices: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Air Filter Replacement</li><li>Oil Filter Replacement</li><li>AC Filter Replacement</li><li>Wiper Fluid Replacement</li><li>Battery Water Top Up</li><li>Coolant Top Up (300 ml)</li><li>Brake Fluid Top Up</li><li>All brake pads cleaning</li><li>Clutch plate check up</li><li>AC check up</li><li>Car Wash</li><li>All suspension check up</li><li>ECM Errors Check & Reset</li><li>Spark/Heater Plugs Checking</li><li>Fuel Filter Checking</li><li>Interior Cleaning</li><li>Tyre Alignment Check</li><li>Tyre Balancing Check</li><li>4 door greasing</li><li>Dashboard polish</li><li>Tyre polish</li><li>car wash</li><li>Car Scanning</li><li>Anti Rat Treatment</li><li>AC Vent Fumigation</li></ul>",
        doorstepServices: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Air Filter Replacement</li><li>Oil Filter Replacement</li><li>AC Filter Replacement</li><li>Wiper Fluid Replacement</li><li>Battery Water Top Up</li><li>Coolant Top Up (300 ml)</li><li>Brake Fluid Top Up</li><li>Front Brake Pads Check</li><li>Rear Brake Pads Check</li><li>ECM Errors Check & Reset</li><li>Tyre Alignment Check</li><li>Tyre Balancing Check</li><li>Car Scanning</li><li>Anti Rat Treatment</li><li>AC Vent Fumigation</li></ul>",
        price: "Determine"
      },
      {
        id: 2,
        title: "Standard Service",
        duration: "4 Hrs Taken",
        frequency: "Every 5,000 km (Recommended)",
        workshopServices: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Air Filter Replacement</li><li>Oil Filter Replacement</li><li>Wiper Fluid Replacement</li><li>AC Filter Cleaning</li><li>Car Scanning</li><li>Front Brake Pads Check</li><li>Car Wash</li><li>Rear Brake Pads Check</li><li>Spark/Heater Plugs Checking</li><li>Fuel Filter Checking</li><li>Coolant Top Up (200 ml)</li><li>Brake Fluid Top Up</li><li>Battery Water Top Up</li></ul>",
        doorstepServices: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Air Filter Replacement</li><li>Oil Filter Replacement</li><li>Wiper Fluid Replacement</li><li>AC Filter Cleaning</li><li>Car Scanning</li><li>Front Brake Pads Check</li><li>Rear Brake Pads Check</li><li>Fuel Filter Checking</li><li>Coolant Top Up (200 ml)</li><li>Brake Fluid Top Up</li><li>Battery Water Top Up</li></ul>",
        
        price: "Determine"
      },
      {
        id: 3,
        title: "Basic Service",
        duration: "2 Hrs Taken",
        frequency: "Every 3,000 km (Recommended)",
        workshopServices: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Wiper Fluid Replacement</li><li>Oil Filter Replacement</li><li>Air Filter Cleaning</li><li>Spark/Heater Plugs Checking</li><li>Coolant Top Up (200 ml)</li><li>Battery Water Top Up</li></ul>",
        doorstepServices: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Wiper Fluid Replacement</li><li>Oil Filter Replacement</li><li>Air Filter Cleaning</li><li>Coolant Top Up (200 ml)</li><li>Battery Water Top Up</li></ul>",
        price: "Determine"
      }
    ],
    'AC Service & Repair': [
      {
        id: 1,
        title: "Comprehensive AC Service",
        description: "<ul><li> AC Vent Cleaning</li><li>AC Leak Test</li><li>Dashboard Removing Refitting</li><li>Dashboard Cleaning</li><li>AC Gas(upto 600gms)</li><li>Condenser Cleaning</li><li>AC Filter Cleaning</li></ul>",
        price: "Determine"
      },
      {
        id: 2,
        title: "Regular AC Service",
        description: "<ul><li>Engine Oil Replacement (Fully Synthetic)</li><li>Air Filter Replacement</li><li>Interior Vacuuming (Carpet & Seats)</li><li>Oil Filter Replacement</li><li>AC Filter Cleaning</li><li>AC Vent Cleaning</li><li>AC Gas (upto 400 grams)</li><li>Condenser Cleaning</li><li>AC Inspection</li></ul>",
        price: "Determine"
      },
      {
        id: 3,
        title: "AC Blower Motor Replacement",
        description: "<ul><li>AC Blower Motor Replacement(OES)</li><li>AC Filter, Vents, Casting Cost Additional</li><li>Spare Part Cost Only</li><li>Wiring Cost Additional(If Needed)</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 4,
        title: "Cooling Coil Replacement",
        description: "<ul><li> Cooling Coil Replacement(OES)</li><li>Spare Part Cost Only</li><li>AC Pipe, Valve, Sensors Cost Additional</li><li>AC Gas, Compressor Oil Cost Additional</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {id: 5,
        title: "Condenser Replacement",
        description: "<ul><li>Condenser Replacement(OES)</li><li>Spare Part Cost Only</li><li>AC Pipe, Valve, Sensors Cost Additional</li><li>AC Gas, Compressor Oil Cost Additional</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 6,
        title: "Compressor Replacement",
        description: "<ul><li>✓ Compressor Replacement(OES)</li><li>Spare Part Cost Only</li><li>AC Pipe, Valve, Sensors Cost Additional</li><li>AC Gas, Compressor Oil Cost Additional</li><li>Free Pickup & Drop</li></ul>"
      },
      {
        id: 7,
        title: "Heating coil Replacement",
        title: "Heating coil Replacement",
        description: "<ul><li>Heating Coil Replacement(OES)</li><li>Hoses Additional(If Required)</li><li>Spare Part Cost Only</li><li>Coolant and Radiator Flush Cost Additional</li><li>Free Pickup & Drop</li></ul>", 
        price: "Determine"
      },
      {
        id: 8,
        title: "V-Belt Replacement",
        description: "<ul><li>V-Belt Replacement(OES)</li><li>Spare Part Cost Only</li><li>Pulleys, Bearing, Timimg Cost Additional</li><li>Scanning Cost Additional</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 9,
        title: "Radiator Replacement",
        description: "<ul><li>Radiator Replacement(OES)</li><li>Radiator Hoses, Thermostat Valves Cost Additional</li><li>Spare Part Cost Only</li><li>Coolant Cost Additional</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 10,
        title: "Radiator Fan Motor Replacement",
        description: "<ul><li>Radiator Fan Motor Replacement(OES)</li><li>Coolant and Radiator Flush Cost Additional</li><li>Spare Part Cost Only</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 11,
        title: "Radiator Flush & Clean",
        description: "<ul><li>Coolant Draining</li><li>Radiator Flushing</li><li>Anti-Freeze Coolant Replacement</li><li>Radiator Cleaning</li><li>Coolant Leakage Inspection</li></ul>",
        price: "Determine"
      }
    ],
    'Complete Car Inspection': [
        {
          id: 1,
          title: "Second Hand Car Inspection",
          description: "<ul><li>50 Points Check-List</li><li>Expert Mechanic Design</li><li>Physical Car Diagnosis</li><li>Upfront Estimate</li><li>Get Car Valuation</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Complete Suspension Inspection",
          description: "<ul><li>Front Shocker Check(OES)</li><li>Rear Shocker Check</li><li>Shocker Mount Check</li><li>Link Rod Inspection</li><li>Jumping Rod Bush Check</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Car Waterlog Assistance",
          description: "<ul><li> Full Car Scanning</li><li>25- Points Check List</li><li>Detailed Health Card</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "Car Fluid Check",
          description: "<ul><li>Brake Fluid Check</li><li>Coolant Check</li><li>Engine Oil Check</li><li>Power Steering Oil Check</li><li>Battery Water Inspection</li><li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "Engine Scanning",
          description: "<ul><li>Electrical Scanning</li><li>Error Code Deletion</li><li>Sensor Reset</li><li>Inspection of Exhaust Smoke</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Insurance Claim Inspection",
          description: "<ul><li>Policy Inspection</li><li>Claim Intimation</li><li>Co-ordination with Insurance Company</li><li>Insurance Claim Advice</li><li>Surveyors Estimate Approval</li><li>2 Year Warranty on Paint Jobs</li><li>Body Damage Inspection</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Road Trip Inspection",
          description: "<ul><li>Wheel Alignment & Balancing</li><li>Full Car Scanning</li><li>Detailed Health Card</li><li>Fluid Leakage Inspection</li><li>Free Pickup & Drop</li></ul>", 
          price: "Determine"
        }
    ],
    'Denting & Painting': [
        {
          id: 1,
          title: "Alloy Paint",
          description: "<ul><li>High Temperature Paint</li><li>Grade A Primer Applied</li><li>4 Layers of Painting</li><li>Alloy Preservation</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Bonnet Paint",
          description: "<ul><li>Removal of Minor Dent & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Boot Paint",
          description: "<ul><li>Removal of Minor Dent & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "Front Bumper Paint",
          description: "<ul><li>Removal of Minor Dent & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "Full Body Dent Paint",
          description: "<ul><li>Removal of Minor Dent & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Left Fender Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Left Front Door Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>", 
          price: "Determine"
        },
        {
          id: 8,
          title: "Left Rear Door Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Pannel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 9,
          title: "Left Quarter Panel Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 10,
          title: "Left Running Board Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 11,
          title: "Right Fender Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>", 
          price: "Determine"
        },
        {
          id: 12,
          title: "Right Front Door Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>", 
          price: "Determine"
        },
        {
          id: 13,
          title: "Right Rear Door Paint",
          description: "<ul><li></li></ul>",
          price: "Determine"
        },
        {
          id: 14,
          title: "Right Quarter Panel Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 15,
          title: "Right Running Board Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 16,
          title: "Rear Bumper Paint",
          description: "<ul><li>Removal of Minor Dents & Scratches</li><li>Grade A Primer Applied</li><li>High Quality DuPont Paint</li><li>Clear Coat Protective Layer Paint</li><li>Panel Rubbing & Polishing</li></ul>", 
          price: "Determine"
        }
    ],
    'Detailing for Luxury Cars': [
        {
          id: 1,
          title: "Ceramic Coating",
          description: "<ul><li>Protection Against UV Rays & Color Fading</li><li>Complete Car Detailing</li><li>Advanced Nano Ceramic Technology</li><li>Free Manual Maintenance</li><li>Free Ceramic Coating On Alloy</li><li>UV Rays Protection | 3M Product</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Graphene Coating- 10H",
          description: "<ul><li>Protects Against UV Rays & Color Fading</li><li>Free Annual Maintenance</li><li>Complete Car Detailing</li><li>Free Coating on Alloy</li><li>Double Layer Graphene Protection</li><li>Premium Gloss Finish</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Teflon Coating",
          description: "<ul><li> Pre-Coating Rubbing & Polishing</li><li>Ultra Shine Polishing</li><li>Removes Minor Scratches</li><li>Exterior Car Wash</li><li>Full Body 3M Teflon Coating</li><li>3M Exterior Anti-Rust Treatment</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "Meguiar's Teflon Coating",
          description: "<ul><li> Pre-Coating Rubbing & Polishing</li><li>Ultra Shine Polishing</li><li>Removes Minor Scratches</li><li>Exterior Car Wash</li><li>Full Body Meguiar's Teflon Coating</li><li>Meguiar’s Exterior Anti-Rust Treatment</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "PPF- Garware Plus",
          description: "<ul><li>Self Healing | Scratch Proof</li><li>PPF Paint Protection Film</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "PPF- Garware Premium",
          description: "<ul><li>PPF Paint Protection Film</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Car Rubbing & Polishing",
          description: "<ul><li>Pressure Car Wash</li><li>Tyre Dressing</li><li>Alloy Polishing</li><li>Machine Rubbing</li><li>Rubbing with 3M Compound</li><li>3M Wax Polishing</li></ul>", 
          price: "Determine"
        },
        {
          id: 8,
          title: "Anti Rust Underbody Coating",
          description: "<ul><li>Underbody Teflon Coating</li><li>Protective Anti Corrosion Treatment</li></ul>",
          price: "Determine"
        },
        {
          id: 9,
          title: "Silencer Coating",
          description: "<ul><li> Silencer Anti Rust Coating</li><li>Silencer Corrosion Protection</li><li>2 Layers of Protection</li></ul>",
          price: "Determine"
        }
    ],
    'Brakes & Suspension': [
        {
          id: 1,
          title: "Brakes Drums Turning",
          description: "<ul><li>Brake Drums Turning</li><li>Opening & Fitting of Brake Drums</li><li>Free Pickup & Drop</li><li>Refacing of Brake Drums</li><li>Applicable for Set of 2 Brake Drums</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Caliper Pin Replacement",
          description: "<ul><li>Caliper Pin Replacement (OES)</li><li>Spare Part Price Only</li><li>Caliper Assembly Cost Additional</li><li>Inspection of Break System Included</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Disc Turning",
          description: "<ul><li> Opening & Fitting of Brake Discs</li><li>Resurfacing of Brake Discs/Rotors</li><li>Applicable for the Set of 2 Discs (2 Wheels)</li><li>Inspection of Break Discs</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "Handbrake Wire Replacement",
          description: "<ul><li> Handbrake Wire Replacement(Single OES Unit)</li><li>Brake Drum Inspection</li><li>Free Pickup & Drop</li><li>Electronic Parking Brake Cost Additional</li><li>Wheel Cylinder, Ratchet, Clamps Cost Additional</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "Front Brake Pads Replacement",
          description: "<ul><li>Opening & Fitting of Front Brake Pads</li><li>Front Brake Pads Replacement (OES)</li><li>Applicable for Set of 2 Front Brake Pads</li><li>Inspection of Front Brake Calipers</li><li>Front Brake Disc Cleaning</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Front Brake Discs",
          description: "<ul><li> Front Brake Disc Replacement (Single OES Unit)</li><li>Reduces Vibrations & Break Noises</li><li>Increases Break Life & Safety</li><li>Inspection of Break System Included</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Rear Brake Pads Replacement",
          description: "<ul><li>Opening & Fitting of Rear Brake Pads</li><li>Rear Brake Pads Replacement (OES)</li><li>Applicable for Set of 2 Rear Brake Pads</li><li>Inspection of Rear Brake Calipers</li><li>Rear Brake Disc Cleaning</li></ul>", 
          price: "Determine"
        },
        {
          id: 8,
          title: "Wheel Cylinder Replacement",
          description: "<ul><li> Wheel Cylinder Replacement (OES)</li><li>Free Pickup & Drop</li><li>Spare Part Price Only</li><li>Brake Shoe & Brake Fluid Cost Additional</li></ul>",
          price: "Determine"
        },
        {
          id: 9,
          title: "Complete Suspension Inspection",
          description: "<ul><li>Front Shocker Check(OES)</li><li>Rear Shocker Check</li><li>Shocker Mount Check<li><li>Link Rod Inspection</li><li>Jumping Rod Bush Check</li></ul",
          price: "Determine"
        },
        {
          id: 10,
          title: "Door Latch Replacement",
          description: "<ul><li> Inner Door Latch Mechanism Part Replacement</li><li>OES Spare Part Cost Only</li><li>Outside Door Handle Cost Additional(If Needed)</li><li>Paint/Trim Cost Additional(If Needed)</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 11,
          title: "EPS Module Repair",
          description: "<ul><li> EPS Module Repair</li><li>Steering Rack, Steering Motor Additional if Needed</li><li>Torque Sensor Additional if Needed</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 12,
          title: "ECM Repair",
          description: "l<ul><li>ECM Repair</li><li>Repairing of Electrical Circuits with Diodes & Capacitor</li><li>Opening & Fiting of ECM</li><li>Circuit Board & Programming Cost Additional(If Needed)</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 13,
          title: "Faulty Electricals",
          description: "<ul><li>Full Car Scanning</li><li>25 Points Check-List</li><li>Detailed Health Card</li><li>Power Window Switch Cost Additional</li><li>Free Pickup & Drop</li></ul>", 
          price: "Determine"
        },
        {
          id: 14,
          title: "Front Shock Absorber Replacement",
          description: "<ul><li>Shocker Strut/ Damper OES Replacement</li><li>Opening & Fitting of Front Shock Absorber</li><li>Shocker Mount, Shocker Coil Spring Additional Charges</li><li>Free Pickup & Drop</li><li>Airmatic Shock Absorber Cost Additional</li></ul>",
          price: "Determine"
        },
        {
          id: 15,
          title: "Front Shocker Mount Replacement",
          description: "<ul><li> Front Shocker Mount Replacement(OES Single Unit)</li><li>Spare Part Price Only</li><li>Shocker Mount bearing, Cap Cost Additional</li><li>Airmatic Shock Absorber Mount Cost Additional</li><li>Wheel Alignment Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 16,
          title: "Front Axle Repair",
          description: "<ul><li>Front Axle Repair(Single Unit)</li><li>Opening & Fitting of Front Axle</li><li>Includes Replacement of Axle Bearing & Boot</li><li>Airmatic Shock Absorber Mount Cost Additional</li><li>Wheel Bearing Cost Additional(If Required)</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 17,
          title: "Fuel Pump Replacement",
          description: "<ul><li> Fuel Pump Replacement</li><li>OES Spare Part Price Only</li><li>Fuel Line & Injectors Cleaning Cost Additional(If Needed)</li><li>Fuel Pipes Cost Additional(If Needed)</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 18,
          title: "Link Rod Replacement",
          description: "<ul><li>Link Rod Replacement(OES Single Unit)</li><li>Complete Suspension Inspection</li><li>Spare Part Price Only</li><li>Wheel Alignment Cost Additional</li><li>Free Pickup & Drop</li></ul>", 
          price: "Determine"
        },
        {
          id: 19,
          title: "Mud Flaps",
          description: "<ul><li>Mud Flaps Set of 4</li><li>Prevents Soil Accumulation</li><li>Protects Car Underbody</li><li>Easy Fitment</li></ul>",
          price: "Determine"
        },
        {
          id: 20,
          title: "Power Window Repair",
          description: "<ul><li>Power Window Mechanism Repair</li><li>OES Spare Part Cost Only</li><li>Power Window Motor Cost Additional</li><li>Power Window Switch Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 21,
          title: "Rear Shock Absorber Replacement",
          description: "<ul><li>Shocker Strut/Damper OES Replacement(Single Unit)</li><li>Spare Part Price Only</li><li>Shocker Mount, Shocker Coil Spring Additional Charges</li><li>Airmatic Shock Absorber Cost Additional(If Applicable</li><li>Free Pickup & Drop</li></ul>", 
          price: "Determine"
        },
        {
          id: 22,
          title: "Steering & Inspection",
          description: ">ul><li>Steering System Inspection</li><li>Complete Suspension Inspection</li><li>25-Points Check-List</li><li>Free Pick & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 23,
          title: "Suspension Lower Arm Replacement",
          description: "<ul><li> Suspension Lower Arm</li><li>Replacement(OES Single Unit)</li><li>Complete Suspension Inspection</li><li>Spare Part Price Only</li><li>Wheel Alignment Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 24,
          title: "Steering Rack Repair",
          description: "<ul><li>Steering Rack Repair</li><li>Steering Bush Kit, Lathe Work, Wheel Alignment Included</li><li>Steering Rod Resurfacing</li><li>Calibration and Pinion Cost Addition (If Needed)</li><li>Free Pickup & Drop</li></ul>", 
          price: "Determine"
        },
        {
          id: 25,
          title: "Starter Motor Repair",
          description: "<ul><li>Starter Motor Repair</li><li>Opening & Fitting of Starter Motor</li><li>Armature Additional(If Required)</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 26,
          title: "Tie Rod End Replacement",
          description: "<ul><li>Tie Rod End Replacement(OES)</li><li>Complete Suspension Inspection</li><li>Spare Part Price Only</li><li>Camber Bolt & Wheel</li><li>Alignment Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 27,
          title: "Water Pump Replacement",
          description: "<ul><li>Water Pump Replacement(OES)</li><li>Coolant & Radiator</li><li>Flush Cost Additional</li><li>Spare Part Cost Only</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 28,
          title: "Gear Box Mounting Replacement",
          description: "<ul><li>Gear Box Mounting Replacement(OES)</li><li>Spare Part Price Only</li><li>Single Unit Only</li><li>Free Pickup & Drop</li></ul>", 
          price: "Determine"
        },
        {
          id: 29,
          title: "Engine Mounting Replacement",
          description: "<ul><li>Engine Mounting Replacement(OES)</li><li>Spare Part Price Only</li><li>Single Unit Only</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 30,
          title: "Radiator Fan Motor Replacement",
          description: "<ul><li>Radiator Fan Motor Replacement(OES)Coolant and Radiator Flush Cost Additional</li><li>Spare Part Cost Only<li></li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 31,
          title: "Radiator Replacement",
          description: "<ul><li> Radiator Replacement(OES)</li><li>Radiator Hoses, Thermostat Valves Cost Additional</li><li>Spare Part Cost Only</li><li>Coolant Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        }
    ],
    'Car Battery & Electricals': [
        {
          id: 1,
          title: "Amaron (55 Months Warranty)",
          description: "<ul><li> Free Pickup & Drop Old Battery</li><li>Price Included Free Installation</li><li>Available at Doorstep</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Amaron (72 Months Warranty)",
          description: "<ul><li>Free Pickup & Drop</li><li>Old Battery Price Included</li><li>Available at Doorstep</li><li>Free Installation</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Exide(66 Months Warranty)",
          description: "<ul><li>Free Installation</li><li>Old Battery Price Included</li><li>Available at Doorstep</li><li>Power Window Switch Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "Livguard(60 Months Warranty)",
          description: "<ul><li>Free Installation</li><li>Old Battery Price Included</li><li>Available at Doorstep</li><li>Power Window Switch Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "Alternator Replacement",
          description: "<ul><li>Alternator Replacement</li><li>Opening & Fitting of Alternator</li><li>Alternator Belt Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Alternator Repair",
          description: "<ul><li>Alternator Repair</li><li>Opening & Fitting of Alternator</li><li>Alternator Belt Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        }
    ],
    'Tyre & Wheel Care': [
        {
          id: 1,
          title: "Pirelli XL P Zero J",
          description: "<ul><li>Free Pick & Drop</li><li>Alignment & Balancing Charge Extra</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection for Tread</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Continental Conti Sport",
          description: "<ul><li>Free Pick & Drop</li><li>Alignment & Balancing Charge Extra</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection for Tread</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Michelin Primacy 3 ST",
          description: "<ul><li> Free Pick & Drop</li><li>Alignment & Balancing Charge Extra</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection for Tread</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "MRF ZVTV",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "MRF ZV2K",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Apollo Amazer 4G Life",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Bridgestone S322",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 8,
          title: "Bridgestone Turanza AR20",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 9,
          title: "CEAT Secura Drive",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 10,
          title: "GoodYear DP B1",
          description: "<ul><li>Free Pickup & Drop</li><li>Tyre Replacement at Service Center</li><li>Tyre Inspection For Thread</li><li>Alignment & Balancing Charges Extra</li></ul>",
          price: "Determine"
        },
        {
          id: 11,
          title: "Complete Wheel Care",
          description: "<ul><li>Automated Wheel Balancing</li><li>Weight Correction</li><li>Alloy Weights Additional</li><li>Laser Assissted Wheel Alignment</li><li>Steering Adjustment & Correction</li><li>Camber & Caster Adjustment</li><li>All Four Tyre Rotation as Per Tread Wear</li></ul>",
          price: "Determine"
        },
        {
          id: 12,
          title: "Mud Flaps",
          description: "<ul><li>Mud Flaps Set of 4</li><li>Prevents Soil Accumulation</li><li>Protects Car Underbody</li><li>Easy Fitment</li></ul>",
          price: "Determine"
        }
    ],
    'Cleaning & Grooming': [
        {
          id: 1,
          title: "Car Interior Spa",
          description: "<ul><li>Pressure Car Wash</li><li>Anti Viral & Bacterial Treatment</li><li>Interior Vacuum Cleaning</li><li>Dashboard Polishing</li><li>Interior Wet Shampooing and Detailing</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Car Wash & Wax",
          description: "<ul><li>Car Wash</li><li>Interior Vacuuming</li><li>Dashborad & Tyre Polish</li><li>Body Wax</li></ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Car Rubbing & Polishing",
          description: "<ul><li>Machine Rubbing with Compound</li><li>Wax Polishing</li><li>Pressure Car Wash</li><li>Tyre Dressing</li><li>Alloy Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "360° Deep Cleaning",
          description: "<ul><li>Exterior Rubbing & Polishing</li><li>Interior Wet Shampooing & Detailing</li><li>Interior Vacuum Cleaning</li><li>Pressure Washing</li><li>Tyre Dressing & Alloy Polishing</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "Deep All Round Spa",
          description: "<ul><li>Interior Vacuum Cleaning</li><li>Dashboard Polishing</li><li>Interior Wet Shampooing and Detailing</li><li>Pressure Car Wash</li><li>Rubbing with Compound</li><li>Wax Polishing</li><li>Machine Rubbing</li><li>Tyre Dressing</li><li>Alloy Polishing</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Rat/ Pest Repellent Treatment",
          description: "<ul><li>Rat Repellent Treatment</li><li>Sprayed on Underbody & Engine Bay</li><li>Protects Car Wiring from Pests</li><li>Prevents Pest Breeding inside Car</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Sunroof Service",
          description: "<ul><li>Roof Opening + Refitting</li><li>Sunroof Lubrication</li><li>Sunroof Cleaning</li><li>Drainage Tube Clog/Debris Removal</li></ul>",
          price: "Determine"
        }
    ],
    'Clutch & Body Parts': [
        {
          id: 1,
          title: "Clutch & Transmission Troubles",
          description: "<ul><li>25 Points Check-List</li><li> Physical Car Diagnosis</li><li> Clutch & Gear Box Inspection</li><li> Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 2,
          title: "Clutch Set Replacement",
          description: "<ul><li>Clutch Set OES</li><li>Opening & Fitting of Clutch Set</li><li>Clutch Cable, Clutch Cylinder,Flywheel, Slave Cylinder is Add Ons.</li><li>Clutch Oil, Gear Oil Cost Additional</li><li>Automatic Transmission Clutch rates may vary</li><li>Free Pick Up & Drop.</li><ul>",
          price: "Determine"
        },
        {
          id: 3,
          title: "Clutch Bearing Replacement",
          description: "<ul><li>✓ Clutch Bearing OES Replacement</li><li>Spare Part Price Only</li><li>Clutch Set, Clutch Cable / Wire, Clutch Cylinder,Flywheel, Hydraulic Bearing in Add Ons</li><li>Clutch Oil, Gear Oil Cost Additional</li><li>Automatic Transmission Clutch rates may vary</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 4,
          title: "ABS Issue",
          description: "<ul><li>Full Car Scanning</li><li>25 Points Check-List</li><li>Brake Electrical System Inspection</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 5,
          title: "Boot Replacement",
          description: "<ul><li>Boot Replacement(Single Unit)</li><li>Opening & Fitting of Boot</li><li>Hinges, Rod Spring / Shocker Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 6,
          title: "Bonnet Replacement",
          description: "<ul><li>Bonnet Replacement(Single Unit)</li><li>Opening & Fitting of Bonnet</li><li>Hinges, Stay Rod/ Shocker, Lock Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 7,
          title: "Flywheel Replacement",
          description: "<ul><li>Flywheel OES Replacement</li><li>Spare Part Price Only</li><li>Clutch Set, Clutch Bearing, Clutch Cable, Clutch Cylinder, Slave Cylinder in Add Ons</li><li>Automatic Transmission Clutch rates may vary</li><li>Clutch Oil, Gear Oil Additional</li><li>Free Pickup & Drop</li><li>AC Filter Cleaning</li></ul>",
          price: "Determine"
        },
        {
          id: 8,
          title: "Flywheel Turning",
          description: "<ul><li> Resurfacing of Flywheel</li><li>Inspection of Clutch System</li><li>Opening & Fitting of Flywheel Cost Additional</li><li>Clutch Plate, Clutch Bearing, Pressure Plate & Clutch Cable Cost Additional</li><li>Automatic Transmission Clutch rates may vary</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 9,
          title: "Front Bumper Replacement",
          description: "<ul><li>Opening & Fitting of Front Bumper</li><li>Front Bumper Replacement(Black Color)</li><li>Free Pickup & Drop</li><li>Brackets, Grills, Cladding Additional</li><li>Paint Cost Additional</li></ul>",
          price: "Determine"
        },
        {
          id: 10,
          title: "Fender Replacement",
          description: "<ul><li>Fender Replacement(Single Unit)</li><li>Opening & Fitting of Fender</li><li>Fender Lining, Indicator, Hinge/Support Cost Additional</li><li>Trim, Lock, Window Glass & Channel Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 11,
          title: "Left Front Door Replacement",
          description: "<ul><li>Left Front Door Replacement (Single Unit)</li><li>Opening & Fitting of Left Front Door</li><li>Hinges, Weatherstrip, Handle, Cost Additional</li><li>Trim, Lock, Window Glass & Channel Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 12,
          title: "Left Rear Door Replacement",
          description: "<ul><li>Left Rear Door Replacement (Single Unit)</li><li>Opening & Fitting of Left Rear Door</li><li>Hinges, Weatherstrip, Handle, Cost Additional</li><li>Trim, Lock, Window Glass & Channel Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 13,
          title: "Rear Bumper Replacement",
          description: "<ul><li>Opening & Fitting of Rear Bumper</li><li>Rear Bumper Replacement(Black Color)</li><li>Free Pickup & Drop</li><li>Brackets, Grills, Cladding Additional</li><li>Paint Cost Additional</li></ul>",
          price: "Determine"
        },
        {
          id: 14,
          title: "Right Front Door Replacement",
          description: "<ul><li>Right Front Door Replacement(Single Unit)</li><li>Opening & Fitting of Right Front Door</li><li>Hinges, Weatherstrip, Handle, Cost Additional</li><li>Trim, Lock, Window Glass & Channel Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        },
        {
          id: 12,
          title: "Right Rear Door Replacement",
          description: "<ul><li>Right Rear Door Replacement(Single Unit)</li><li>Opening & Fitting of Right Rear Door</li><li>Hinges, Weatherstrip, Handle, Cost Additional</li><li>Trim, Lock, Window Glass & Channel Cost Additional</li><li>Paint Cost Additional</li><li>Free Pickup & Drop</li></ul>",
          price: "Determine"
        }
    ],
    'Insurance Services & SOS-Emergency': [
      {
        id: 1,
        title: "Know Your Policy",
        description: "<ul><li>Complete Information About Your Policy</li><li>Expenditure Assissment</li><li>Suggessions on Purchase of New Policy</li><li>Connect with Insurance Agent</li><li>Vehicle IDV and Premium Rate Suggestions</li></ul>",
        price: "Determine"
      },
      {
        id: 2,
        title: "Accidental Denting & Painting (Insurance)",
        description: "<ul><li>Accidental Repair in Insurance</li><li>Claim Intimation</li><li>Surveyor Estimate Approval</li><li>Body Panel Replacement (If Required)</li><li>File Charge Included</li></ul>",
        price: "Determine"
      },
      {
        id: 3,
        title: "Car Flood Damage (Insurance)",
        description: "<ul><li>Repairing of Flood Damage in Insurance</li><li>Claim Intimation</li><li>Surveyor Estimate Approval</li><li>File Charge Included</li></ul>",
        price: "Determine"
      },
      {
        id: 4,
        title: "Windshield Replacement (Insurance)",
        description: "<ul><li>Windshield Replacement/Repair</li><li>Claim Intimation</li><li>Surveyor Estimate Approval</li><li>Co-ordination with Insurance Company</li><li>Available at Doorstep</li></ul>",
        price: "Determine"
      },
      {
        id: 5,
        title: "Insurance Claim Inspection",
        description: "<ul><li>Policy Inspection</li><li>Claim Intimation</li><li>Co-ordination with Insurance Company</li><li>Insurance Claim Advice</li><li>Surveyors Estimate Approval</li><li>2 Year Warranty on Paint Jobs</li><li>Body Damage Inspection</li></ul>",
        price: "Determine"
      },
      {
        id: 6,
        title: "Car Self Starter Issue",
        description: "<ul><li>Critical System Points Check</li><li>Underbody Inspection</li><li>Car Battery Check</li></ul>",
        price: "Determine"
      },
      {
        id: 7,
        title: "Battery Jumpstart",
        description: "<ul><li>Detailed Health Card</li><li>50 Points Check</li><li>Takes 4 Hours</li></ul>",
        price: "Determine"
      },
      {
        id: 8,
        title: "Car Fluid Leakage",
        description: "<ul><li>Detailed Health Card</li><li>50 Points Check</li><li>Takes 4 Hours</li></ul>",
        price: "Determine"
      },
      {
        id: 9,
        title: "Engine Scanning",
        description: "<ul><li>Electrical Scanning</li><li>Error Code Deletion</li><li>Sensor Reset</li><li>Inspection of Exhaust Smoke</li></ul>",
        price: "Determine"
      },
      {
        id: 10,
        title: "Wheel-Lift Tow (20 Km)",
        description: "<ul><li>Flat Bed Towing</li><li>Upto 10 Kms</li><li>Wheel Lift Towing</li></ul>",
        price: "Determine"
      },
      {
        id: 11,
        title: "Flat-Bed Tow (20 Km)",
        description: "<ul><li>Flat Bed Towing</li><li>Upto 10 Kms</li><li>Wheel Lift Towing</li></ul>",
        price: "Determine"
      },
      {
        id: 12,
        title: "Clutch Breakdown",
        description: "<ul><li>In Case of Stucked Gear</li><li>In Case of Clutch Pedal Free</li><li>Wheel Lift Towing</li></ul>",
        price: "Determine"
      }
    ],
    'Windshields & Lights': [
      {
        id: 1,
        title: "Front Windshield Replacement",
        description: "<ul><li> Windshield (ISI Approved)</li><li>Windshield Price Only</li><li>Sensors Charges Additional(If Applicable)</li><li>Consumables- Sealant/Bond/Adhesive</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 2,
        title: "Rear Windshield Replacement",
        description: "<ul><li>Windshield (ISI Approved)</li><li>Windshield Price Only</li><li>Free Pickup & Drop</li><li>Defogger Charges Additional (If Application)</li><li>Consumables- Sealant/Bond/Adhesive</li><li>Free Pickup & Drop</li></ul>",
        price: "Determine"
      },
      {
        id: 3,
        title: "Door Glass Replacement",
        description: "<ul><li>Door Glass AIS Approved</li><li>Glass Price Only</li><li>Consumables- Bond/ Adhesive</li><li>Free Pickup & Drop</li><li>UV Glass Charges Additional (If Applicable)</li></ul>",
        price: "Determine"
      },
      {
        id: 4,
        title: "Fog Light",
        description: "<ul><li>Fog Light Assembly Replacement (Single Unit)</li><li>Spare Part Price Only</li><li>Free Pickup & Drop</li><li>Switch/Harness Wiring Check</li><li>Projector/LEDs/DRLs Additional (If Applicable)</li></ul>",
        price: "Determine"
      },
      {
        id: 5,
        title: "Front Headlight",
        description: "<ul><li>Headlight OES (Price for Single Unit)</li><li>Spare Part Price Only</li><li>Free Pickup & Drop</li><li>Projector/LEDs/DRLs Additional (If Applicable)</li></ul>",
        price: "Determine"
      },
      {
        id: 6,
        title: "Rear Taillight",
        description: "<ul><li>Tail Light OES (Price for Single Unit)</li><li>Spare Part Price Only</li><li>Free Pickup & Drop</li><li>Bulbs/LEDs Additional (If Applicable)</li><li>Tail Light Price will differ from car model to model</li></ul>",
        price: "Determine"
      },
      {
        id: 7,
        title: "Side Mirror Replacement",
        description: "<ul><li>Side Mirror Replacement OES (Single Unit)</li><li>Spare Part Price Only</li><li>Free Pickup & Drop</li><li>Semi & Fully Automatic Side Mirror Cost Additional</li><li>Switch/Wiring Harness Cost Additional</li></ul>",
        price: "Determine"
      }
    ]   
};
  
  // Get all service cards flattened into a single array
  const allServices = Object.values(serviceCards).flat();
  // Modified search handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Modify the overview table section in the return statement to include row deletion
  const handleDeleteRow = (index) => {
    const newTableData = formState.overview.tableData.filter((_, i) => i !== index); //14-2
    setFormState(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        tableData: newTableData,
        total: calculateTotalAmount(newTableData) || 0
      }
    }));

    updateTechnicianComments(newTableData); //14-2
  };

  //14-2
  const handleNameChange = (index, value) => {
    const newTableData = [...formState.overview.tableData];
    newTableData[index].name = value;
    
    setFormState(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        tableData: newTableData
      }
    }));
  
    // Update technician comments whenever name changes
    updateTechnicianComments(newTableData);
  };
  //..


  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  // Get the appropriate cards based on selected service
  const getDisplayCards = () => {
    if (!selectedService || !serviceCards[selectedService]) {
      return [];
    }
    return serviceCards[selectedService];
  };

   // Filter services based on search query
   const filteredServices = useMemo(() => {
    const allServices = Object.values(serviceCards).flat();
    if (!searchQuery) {
      return getDisplayCards();
    }
    return allServices.filter(service =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, selectedService, serviceCards]);

  const [showAlert, setShowAlert] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [isOpenRight, setIsOpenRight] = useState(false); // Changed to true for default open state
  const [isOpenLeft, setIsOpenLeft] = useState(false); // Changed to true for default open state

  const [source, setSource] = useState('Checkout');
  const [customer, setCustomer] = useState('Customer');
  const [customerNumber, setCustomerNumber] = useState('6381234057');
  const [dateValue, setDateValue] = useState('')
  const [showGaragePopup, setShowGaragePopup] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);

// 2. Add state for job card modal
const [showJobCard, setShowJobCard] = useState(false);
const [showBill, setShowBill] = useState(false);
const [showEstimate, setShowEstimate] = useState(false);


const handleDiscountChange = (value) => {
  const discountAmount = parseFloat(value) || 0;
  const total = formState.overview.total || 0; //20-2
  const finalAmount = Math.max(total - discountAmount, 0);
  
  
  setDiscount(value);
  setFormState(prev => ({
    ...prev,
    overview: {
      ...prev.overview,
      discount: discountAmount,
      finalAmount: finalAmount
    }
  }));
};

  // First, add the state for tracking active view
const [activeViews, setActiveViews] = useState({
  "Comprehensive Service":'workshop',
  "Standard Service": 'workshop',
  "Basic Service":'workshop'
});

  const formatDescription = (description) => {
    // Remove HTML tags and extract list items
    const stripHtml = (html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const items = doc.querySelectorAll('li');
      return Array.from(items).map(item => item.textContent.trim());
    };
  
    return (
      <div className="description-container" style={{
        maxHeight: '100px',
        overflowY: 'auto',
        padding: '8px'
      }}>
        {stripHtml(description).map((item, index) => (
          <div key={index} className="description-item" style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <span style={{
              marginRight: '8px',
              marginTop: '2px'
            }}>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  };

  // Car Card Component
  const CarCard = ({ car, onEdit }) => (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div>
          <img
            src="https://onlybigcars.com/wp-content/uploads/2024/12/image_22.jpeg"
            alt={`${car.carBrand} ${car.carModel}`}
            className="mb-2"
          />
          <div className='flex justify-between'>
            <div>
              <div className="text-sm font-medium">{`${car.carBrand} ${car.carModel}`}</div>
              <div className="text-xs text-gray-600">{`${car.fuel} ${car.year} ${car.regNo || ''}`}</div>
              <div className="text-xs text-gray-500">{car.chasisNo}</div>
            </div>
            <div className="flex justify-end mt-2">
              <button
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                onClick={() => onEdit(car)}
              >
                <FaEdit size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add this function after other state definitions
  // const handleAddEmptyRow = () => {
  //   const emptyRow = {
  //     type: '',
  //     name: '',
  //     comments: '',
  //     workdone: '',
  //     determined: false,
  //     qt: 1,
  //     total: 0
  //   };
  
  //   setFormState(prev => {
  //     const newTableData = [...prev.overview.tableData, emptyRow];
  //     return {
  //       ...prev,
  //       overview: {
  //         ...prev.overview,
  //         tableData: [...prev.overview.tableData, emptyRow],
  //         total: calculateTotalAmount(newTableData)
  //       }
  //     };
  //   });
  // };

// Add this function after other state definitions
const handleAddEmptyRow = () => {
  const emptyRow = {
    type: 'Service',
    name: 'Sub Service',
    comments: '',
    workdone: 'Work to be done',
    determined: false,
    qt: 1,
    total: 0
  };

  setFormState(prev => {
    const newTableData = [...prev.overview.tableData, emptyRow];
    return {
      ...prev,
      overview: {
        ...prev.overview,
        tableData: newTableData,
        total: calculateTotalAmount(newTableData)
      },
      basicInfo: {
        ...prev.basicInfo,
        caComments: newTableData
          .map(row => `${row.name} to be done`)
          .filter(Boolean)
          .join('\n')
      }
    };
  });
};

  // First add this CSS at the top of your file or in your CSS file
const serviceCardStyles = {
  descriptionContainer: {
    maxHeight: "100px",
    overflowY: "auto",
    // padding: "8px",
    marginBottom: "2px"
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "2px"
  },
  bullet: {
    marginRight: "8px",
    marginTop: "2px"
  },
  description: {
    flex: 1
  }
};

const statusHierarchy = [
  "test", "Assigned", "Follow Up", "Dead", "Communicate To Ops", 
  "Referred To Ops", "Converted", "At Workshop", 
  "Walkin", "Pickup", "Doorstep", "Job Card", "Estimate", "Bill", "Completed"
];

// Function to check if an option should be disabled
const shouldDisableOption = (optionValue, previousStatus) => {
  if (!previousStatus) return false;
  
  const previousIndex = statusHierarchy.indexOf(previousStatus);
  const optionIndex = statusHierarchy.indexOf(optionValue);
  
  // If previous status was one of these, disable all options before it
  if (["Job Card", "Estimate", "Bill", "Completed"].includes(previousStatus)) {
    return optionIndex < previousIndex;
  }
  
  return false;
};

const fetchCustomerData = async (mobileNumber) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/customer/${mobileNumber}`, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return null;
  }
};

// 3. Add function to handle Generate Card button click
const handleGenerateCard = async () => {
  setShowJobCard(true);
  try {
    // Wait longer for component to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (jobCardRef.current) {
      await jobCardRef.current.generatePDF();
    
    } else {
      throw new Error('Job card reference not available');
    }
  } catch (error) {
    console.error('Error generating job card:', error);
  } finally {
    setShowJobCard(false);
  }
};

const handleGenerateBill = async () => {
  setShowBill(true);
  try {
    // Wait longer for component to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (billRef.current) {
      await billRef.current.generatePDF();
    
    } else {
      throw new Error('Job card reference not available');
    }
  } catch (error) {
    console.error('Error generating job card:', error);
  } 
};



const handleGenerateEstimate = async () => {
  setShowEstimate(true);
  try {
    // Wait longer for component to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (estimateRef.current) {
      await estimateRef.current.generatePDF();
    
    } else {
      throw new Error('Job card reference not available');
    }
  } catch (error) {
    console.error('Error generating job card:', error);
  } 
};

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        {/* {showAlert && (
          <Alert
            variant="primary"
            onClose={() => setShowAlert(false)}
            dismissible
            className="edit-page-alert"
            style={{ marginTop: '0.2em' }}
          >

            <p>Try to pitch for Pickup, as Pickup conversion is~50% higher then walkin.</p>
          </Alert>
        )} */}

        {/* Left Sidebar - Fixed */}

        <div className="flex h-[calc(90vh-76px)]" style={{ padding: "6px", marginBottom: "5em" }}>
          <div className="w-1/4 bg-gray-50 p-2 top-[76px] h-[calc(90vh-76px)] overflow-y-auto">
            <div className="dropdown-container">
              <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="dark"
                className={`w-full d-flex justify-content-between align-items-center rounded-bottom-0 ${isOpen ? 'border-bottom-0' : ''}`}
              >
                Last Service
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </Button>

              <Collapse in={isOpen}>
                <div>
                  <Card className="rounded-top-0 border-top-0">
                    <Card.Body>
                      <div>
                        <Button variant="outline-dark" className="w-full text-left cce_btn">
                          CCE Comments
                        </Button>
                      </div>


                      <div>
                        <div className="mt-3">
                          <p className="mb-1">Clutch Set Replacement L 6599 Clutch Bearing Replacement M:2008</p>
                          <p className="text-muted mb-0">CCE-Gqn HqAmanjeet Kumar</p>
                          <small className="text-muted">09:52am 15-May-23</small>
                        </div>

                        <div className="mt-3">
                          <p className="mb-1">Live-assigned lead to Gqn Hq-Amanjeet Kumar</p>
                          <p className="text-muted mb-0">CCE:ML User</p>
                          <small className="text-muted">09:47am 15-May-23</small>
                        </div>


                      </div>

                    </Card.Body>
                  </Card>
                </div>
              </Collapse>
            </div>


            <div className="dropdown-container" style={{ marginTop: "15px" }}>
              <Button
                onClick={() => setIsOpenRight(!isOpenRight)}
                variant="dark"
                className={`w-full d-flex justify-content-between align-items-center rounded-bottom-0 ${isOpenRight ? 'border-bottom-0' : ''}`}
              >
                Actions Taken
                {isOpenRight ? <FaChevronUp /> : <FaChevronDown />}
              </Button>

              <Collapse in={isOpenRight}>
                <div>
                  <Card className="rounded-top-0 border-top-0">
                    <Card.Body>
                      <div>Right content</div>
                    </Card.Body>
                  </Card>
                </div>
              </Collapse>
            </div>


            {/* // Update your existing status history section 18 feb */ }
<div className="dropdown-container" style={{ marginTop: "15px" }}>
  <Button
    onClick={() => setIsOpenLeft(!isOpenLeft)}
    variant="dark"
    className={`w-full d-flex justify-content-between align-items-center rounded-bottom-0 ${isOpenLeft ? 'border-bottom-0' : ''}`}
  >
    Status History
    {isOpenLeft ? <FaChevronUp /> : <FaChevronDown />}
  </Button>

  <Collapse in={isOpenLeft}>
    <div>
      <Card className="rounded-top-0 border-top-0">
        <Card.Body>
          {/* 18 feb */}
        <StatusHistoryDisplay statusHistory={formState.arrivalStatus.status_history || []} />  
        </Card.Body>
      </Card>
    </div>
  </Collapse>
</div>
            {/* <div className="dropdown-container" style={{ marginTop: "15px" }}>
              <Button
                onClick={() => setIsOpenLeft(!isOpenLeft)}
                variant="dark"
                className={`w-full d-flex justify-content-between align-items-center rounded-bottom-0 ${isOpenLeft ? 'border-bottom-0' : ''}`}
              >
                Lead Timeline
                {isOpenLeft ? <FaChevronUp /> : <FaChevronDown />}
              </Button>

              <Collapse in={isOpenLeft}>
                <div>
                  <Card className="rounded-top-0 border-top-0">
                    <Card.Body>
                      <div>Left content</div>
                    </Card.Body>
                  </Card>
                </div>
              </Collapse>
            </div> */}



          </div>




          {/* Middle Section - Scrollable */}


          <div className="w-3/4 p-1 overflow-y-auto h-[calc(90vh-76px)]" >



            {/* <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded-md">
                          ACTIVE
                      </span>
                      <h2 className="text-xl font-bold mb-4">Main Content</h2> */}


            {/* Add dummy content to test scrolling */}
            {/* {Array(20).fill(0).map((_, i) => (
                          <div key={i} className="mb-4">
                              <h3>Section {i + 1}</h3>
                              <p>Content for section {i + 1}</p>
                          </div>
                      ))} */}


            <div className="section1" style={{
              display: 'flex', justifyContent: "start",
              flexDirection: 'row', alignItems: 'center'
            }}>
              {/* <div className="section1-left" style={{maxWidth: "50%", border:"1px solid red"}}> 
                              <div style={{background:"#dee1e6", width:'auto'}}>
                                  sadw
                              </div>
                          </div>


                          <div className="section1-right" style={{width: "50%",border:"1px solid red"}}> Right sec </div> */}

            </div>


            <div className="p-2 border border-gray-200 w-full font-sans relative">

              <div className='relative' style={{ padding: "6px", border: "6px solid #f9f9fb", borderRadius: "4px" }}>
                {/* Top Section */}
                <div className="flex justify-between">
                  {/* Order Info Box */}
                  <div className="p-3 border border-gray-200 rounded" style={{ backgroundColor: "#DEE1E6" }}>
                    <div style={{ backgroundColor: "white", border: "1px solid black", borderRadius: "4px", padding: "10px" }}>
                      <p className="text-sm m-0"> {formatLeadId(formState.customerInfo.mobileNumber, seqNum) || id || 'No Lead ID'}</p>
                      <p className="text-sm my-1"> Converted By: {formState.basicInfo.cceName || 'Not Assigned'}</p>
                    </div>
                    {/* Payment Status Box */}
                    <div className="mt-3 p-3 rounded" style={{ background: "#DEE1E6" }}>
                      {/* <p className="text-sm m-0">Payment Status: Payment Failed</p> */}
                      <p className="text-sm my-1">Amount Paid: {formState.overview.total || 0} Rs.</p>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="text-left p-2">
                    {/* <p className="text-sm m-0">L-6381234057_9FX7U</p> */}
                    <p className="text-sm my-1 font-bold">{formState.cars[0] 
    ? `${formState.cars[0].carBrand} ${formState.cars[0].carModel} ${formState.cars[0].year || ''}`
    : 'No Car Selected'}</p>
                    <p className="text-xs text-gray-500 my-1">Updated At:</p>
<p className="text-xs m-0">
  {formState.updated_at ? new Date(formState.updated_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) : 'NA'}
</p>
<p className="text-xs text-gray-500 my-1">Created At:</p>
<p className="text-xs m-0">
  {formState.created_at ? new Date(formState.created_at).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) : 'NA'}
</p>
                  </div>



                </div>

                <div className='flex justify-between'>
                  {/* Add Lead Button */}
                  <div className="mt-2">
                    {/* <button type='button' className="px-3 py-1 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-300" style={{ fontSize: "14px" }}>
                      Add Lead
                    </button> */}
                  </div>


                  {/* Dropdown Menu - positioned absolutely */}
                  <div className="mt-2">
                    <select
                      value={formState.basicInfo.carType} // Add this
                      onChange={(e) => handleInputChange('basicInfo', 'carType', e.target.value)} // Add this
                      className={`p-2 border rounded min-w-[120px] ${
                        !formState.basicInfo.carType ? 'border-red-300' : 'border-gray-200'
                      }`}
                      required
                      
                    >
                      <option value="">Lead Type*</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Normal">Normal</option>
                      
                    </select>
                    {validationErrors.carType && (
  <div className="text-red-500 text-xs mt-1">
    {validationErrors.carType}
  </div>
)}
                  </div>

                </div>

              </div>

              {/* Bottom Section */}
              <div className="mt-4 p-3 flex gap-4">
                <div className="flex-1">
                  <input
                    type="tel"
                    value={formState.customerInfo.mobileNumber}
                    onChange={(e) => handleInputChange('customerInfo', 'mobileNumber', e.target.value)}
                    className={`w-full p-2 border rounded ${
                      validationErrors.mobileNumber 
                        ? 'form-field-invalid' 
                        : formState.customerInfo.mobileNumber 
                          ? 'form-field-valid' 
                          : ''
                    }`}
                    placeholder="Mobile Number*"
                    required
                    maxLength={10}
  pattern="[0-9]{10}"
  onKeyPress={(e) => {
    // Only allow numbers
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }}
                  />
                  {validationErrors.mobileNumber && (
  <div className="text-red-500 text-xs mt-1">
    {validationErrors.mobileNumber}
  </div>
)}
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    value={formState.customerInfo.customerName}
                    onChange={(e) => handleInputChange('customerInfo', 'customerName', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="Customer Name"
                  />
                </div>
                
                <div className="flex-1">
                  <select
                    value={formState.customerInfo.source}
                    onChange={(e) => handleInputChange('customerInfo', 'source', e.target.value)}
                    disabled={formState.customerInfo.source === 'Website'}
                    className={`w-full p-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 font-medium text-gray-700 ${
                      formState.customerInfo.source === 'Website' ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50'
                    }`}
                    required
                  >
                    <option value="">Source*</option>
                    <option value="inbound">inbound</option>
                    <option value="outbound">outbound</option>
                    <option value="Website">Website</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Whatsapp">Whatsapp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Reference">Reference</option>
                    <option value="Repeat">Repeat</option>
                    <option value="B2B">B2B</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div className="p-3 flex gap-4">
                <div className="flex-1">
                  <input
                    type="tel"
                    value={formState.customerInfo.whatsappNumber}
                    onChange={(e) => handleInputChange('customerInfo', 'whatsappNumber', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="Whatsapp Number"
                  />
                </div>

                <div className="flex-1">
                  <input
                    type="email"
                    value={formState.customerInfo.customerEmail}
                    onChange={(e) => handleInputChange('customerInfo', 'customerEmail', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="Customer Email"
                  />
                </div>

              {/* Replace language barrier button with checkbox */}
{/* <div className="flex-1">
  <label className="flex items-center space-x-2 cursor-pointer">
    <input
      type="checkbox"
      checked={formState.customerInfo.languageBarrier}
      onChange={(e) => handleInputChange('customerInfo', 'languageBarrier', e.target.checked)}
      className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
    />
    <span className="text-gray-700">Language Barrier</span>
  </label>
</div> */}

              </div>

              {/* Description Section */}
              <div className="m-3 mt-2 bg-gray-50 p-4 rounded">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs">
                    i
                  </div>
                  <p className="text-sm font-bold m-0">Source Description</p>
                </div>
                <p className="text-xs text-gray-600 m-0">
                Please state: This call is concerning the interest you have shown in our services. Kindly include the customer's name, the car model they are interested in, and their location before beginning your pitch.
                </p>
              </div>


            </div>


            <div className="w-full p-2 rounded-lg">
              {/* Location Header */}
              <div className="text-gray-700 mb-4 mt-3" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Location</div>

              {/* Location Form */}
              {/* Location Form */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
<LocationSearch 
  ref={addressInputRef}
  value={formState.location.address}
  onChange={(e) => handleInputChange('location', 'address', e.target.value)}
  onPlaceSelect={handlePlaceSelect}
  className="p-2 border border-gray-300 rounded-md"
  placeholder="Address*"
  required 
/>
  <input
    type="text"
    value={formState.location.city}
    onChange={(e) => handleInputChange('location', 'city', e.target.value)}
    className="p-2 border border-gray-300 rounded-md"
    placeholder="City"
    required
  />
  <input
    type="text"
    value={formState.location.state}
    onChange={(e) => handleInputChange('location', 'state', e.target.value)}
    className="p-2 border border-gray-300 rounded-md"
    placeholder="State"
    required
  />
</div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  value={formState.location.buildingName}
                  onChange={(e) => handleInputChange('location', 'buildingName', e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                  placeholder="Building/Flat (Optional)"
                />
                <input
                  type="text"
                  value={formState.location.mapLink}
                  onChange={(e) => handleInputChange('location', 'mapLink', e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                  placeholder="Map Link"
                />
                <input
                  type="text"
                  value={formState.location.landmark}
                  onChange={(e) => handleInputChange('location', 'landmark', e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                  placeholder="Landmark (Optional)"
                />
              </div>

              {/* Add New Car Button */}
              <button 
  type='button'
  className={`px-3 py-2 rounded-md mb-6 ${
    formState.cars.length > 0 
    ? 'bg-gray-400 cursor-not-allowed' 
    : 'bg-red-600 hover:bg-red-700'
  } text-white`}
  style={{ fontSize: '14px', fontWeight: '500' }}
  onClick={() => {
    setEditingCar(null);
    setShowAddCarModal(true);
  }}
  disabled={formState.cars.length > 0}
>
  + Add New Car*
</button>

              {/* Car Cards Container */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
                {/* Car Card 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formState.cars.map((car, index) => (
            <CarCard 
              key={index} 
              car={car} 
              onEdit={() => {/* handle edit */

                setEditingCar(car);
                setShowAddCarModal(true);
              }}
            />
          ))}
        {/* </div> */}

                {/* Car Card 2 */}
                

                {/* Car Card 3 */}
                
              </div>
            </div>

            <div className="w-full p-2 rounded-lg">
                      <div className="text-gray-700 mb-4 mt-3" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Our Feature Services</div>
            <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 mb-4 border rounded"
          />
                      <div style={{ display: 'flex', flexWrap: 'wrap' }}> 
                        {services.map((service, index) => (
                          <Button 
                            variant='outline-danger' 
                            key={index} 
                            outline 
                            color="danger" 
                            style={{ 
                              margin: '5px',
                              backgroundColor: selectedService === service ? '#dc3545' : 'transparent',
                              color: selectedService === service ? 'white' : '#dc3545'
                            }}
                            onClick={() => handleServiceClick(service)}
                          > 
                            {service} 
                          </Button>
                        ))} 
                      </div>
            
                      <div className="text-gray-700 mb-2 mt-3" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Our Products</div>
          
          {/* Add Search Bar */}
          
{/* search div product */}
<div className="w-full">
            <div className="flex overflow-x-auto gap-4 p-4 scrollbar-hide snap-x snap-mandatory">
              {filteredServices.map((service) => (
  <div key={`${service.id}-${service.title}`} className="flex-none w-[calc(33.333%-1rem)] snap-center border border-gray-200 rounded-lg p-2 bg-white hover:shadow-lg transition-shadow">
    <div className="mb-4" style={{ padding: "15px", border: "1px solid black", borderRadius: "4px", height: "200px" }}>
      <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
      <ul className="list-none p-0 space-y-1">
        {(service.title === "Comprehensive Service" || 
          service.title === "Standard Service" || 
          service.title === "Basic Service") ? (
          <div className="description-container" style={serviceCardStyles.descriptionContainer}
          dangerouslySetInnerHTML={{
            __html: activeViews[service.title] === 'workshop' 
              ? service.workshopServices 
              : service.doorstepServices
          }}
          />
        ) : (
          <div className="description-container" style={serviceCardStyles.descriptionContainer}
          dangerouslySetInnerHTML={{ __html: service.description }}
          />
        )}
      </ul>
    </div>

    {(service.title === "Comprehensive Service" || 
      service.title === "Standard Service" || 
      service.title === "Basic Service") ? (
      // Show Workshop/Doorstep buttons for specific services
      <div className="flex gap-2 mb-4">
        <button 
          type="button" // Add this
          onClick={() => setActiveViews(prev=>({
            ...prev,
            [service.title]:'workshop'
          }))}
          className={`flex-1 py-2 px-4 rounded transition-colors ${
            activeViews[service.title] === 'workshop' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Workshop
        </button>
        <button 
          type="button" // Add this
          onClick={() => setActiveViews(prev=>({
            ...prev,
            [service.title]:'doorstep'
          }))}
          className={`flex-1 py-2 px-4 rounded transition-colors ${
            activeViews[service.title] === 'doorstep' 
              ? 'bg-gray-800 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Doorstep
        </button>
      </div>
    ) : (
      // Show View Warranty button for other services
      <button type='button' className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 mb-4">
        View Warranty
      </button>
    )}

    <div className="flex items-center justify-between">
      <span className="text-gray-600">Price: {service.price}</span>
      <button 
        type="button"
        onClick={() => addServiceToTable(service)}
        className="bg-gray-800 text-white w-8 h-8 rounded-full hover:bg-gray-700 flex items-center justify-center"
      >
        +
      </button>
    </div>
  </div>
))}
            </div>
          </div>
                    </div>

            {/* Overview section */}
            <div className="w-full p-2 rounded-lg">
              {/* <div className="text-gray-700 mb-2" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Overview</div> */}

              {/*  Write the overview section here */}
              <div className="w-full p-2 rounded-lg">
              <div className="text-gray-700 mb-2 flex justify-between items-center" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>
  <span>Work Summary*</span>
  <button
    type="button"
    onClick={handleAddEmptyRow}
    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
  >
    Add New Row
  </button>
</div>
          <div className="w-full mt-3">
            <table className="w-full">
              <thead>
                <tr className="bg-red-500 text-white">
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Sub Category</th>
                  {/* <th className="p-3 text-left">Comments</th> */}
                  <th className="p-3 text-left">Workdone</th>
                  {/* <th className="p-3 text-left">Determined</th> */}
                  {/* <th className="p-3 text-left">Qt</th> */}
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {formState.overview.tableData.map((row, index) => (
                  <tr key={index} className="bg-gray-50">
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.type}
                        onChange={(e) => {
                          const newTableData = [...formState.overview.tableData];
                          newTableData[index].type = e.target.value;
                          setFormState(prev => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              tableData: newTableData
                            }
                          }));
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    {/* <td className="p-3">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => {
                          const newTableData = [...formState.overview.tableData];
                          newTableData[index].name = e.target.value;
                          setFormState(prev => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              tableData: newTableData
                            }
                          }));
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td> */}
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.name}
                         onChange={(e) => handleNameChange(index, e.target.value)}
    className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-3">
  <textarea
    value={row.workdone}
    onChange={(e) => {
      const newTableData = [...formState.overview.tableData];
      newTableData[index].workdone = e.target.value;
      setFormState(prev => ({
        ...prev,
        overview: {
          ...prev.overview,
          tableData: newTableData
        }
      }));
    }}
    onInput={(e) => {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    className="w-full p-1 border rounded resize-none"
    style={{ minHeight: '80px' }}
  />
</td>
                    {/* <td className="p-3">
                      <input
                        type="text"
                        value={row.workdone}
                        onChange={(e) => {
                          const newTableData = [...formState.overview.tableData];
                          newTableData[index].workdone = e.target.value;
                          setFormState(prev => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              tableData: newTableData
                            }
                          }));
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td> */}
                    {/* <td className="p-3">
                      <input
                        type="checkbox"
                        checked={row.determined}
                        onChange={(e) => {
                          const newTableData = [...formState.overview.tableData];
                          newTableData[index].determined = e.target.checked;
                          setFormState(prev => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              tableData: newTableData
                            }
                          }));
                        }}
                        className="h-4 w-4"
                      />
                    </td> */}
                    {/* <td className="p-3">
                      <input
                        type="number"
                        value={row.qt}
                        onChange={(e) => {
                          const newTableData = [...formState.overview.tableData];
                          newTableData[index].qt = e.target.value;
                          setFormState(prev => ({
                            ...prev,
                            overview: {
                              ...prev.overview,
                              tableData: newTableData
                            }
                          }));
                        }}
                        className="w-16 text-center p-1 border rounded"
                      />
                    </td> */}
                    <td className="p-3">
      <input
        type="number"
        value={row.total}
        onChange={(e) => handleTotalChange(index, e.target.value)}
        min="0" // 18 Feb
        className="w-16 text-center p-1 border rounded"
      />
    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

{/* Inside the overview section in EditPageCopy.js, after the table */}
<div className="flex gap-4 mt-3">
  <div className="flex-1">
    <textarea
      value={formState.basicInfo.caComments}
      onChange={(e) => handleInputChange('basicInfo', 'caComments', e.target.value)}
      placeholder="Comments For Technician*"
      className="w-full p-3 border rounded h-20 resize-none"
      required
    />
  </div>

  <div className="w-70 space-y-4">


<div className="bg-gray-50 p-4 rounded space-y-4">
  <div className="flex justify-between items-center">
    <span>Sub Total: </span>
    <span><strong>₹{formState.overview.total}</strong></span>
  </div>
  
  <div className="flex justify-between items-center gap-4">
    <span>Discount: </span>
    <div className="flex items-center gap-2">
      <input 
        type="number"
        min="0"
        max={formState.overview.total}
        value={discount}
        onChange={(e) => handleDiscountChange(e.target.value)}
        className="w-24 p-1 border rounded text-right"
        placeholder="0"
      />
      <span className="text-gray-600">₹</span>
    </div>
  </div>

  <div className="border-t pt-2 flex justify-between font-bold">
    <span>Final Amount: </span>
    <span>₹{formState.overview.finalAmount}</span>
  </div>
</div>
    
  </div>
</div>
          </div>
        </div>


            {/* Last Arrival and Garage Section */}

            <div className="w-full p-2 rounded-lg">
              <div className="text-gray-700 mb-2" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Status</div>



              {/* Location Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 mt-4">

              {/* // Replace the wasJobCard condition with this */}
<select
  value={formState.arrivalStatus.leadStatus}
  onChange={(e) => handleInputChange('arrivalStatus', 'leadStatus', e.target.value)}
  className="p-2 border border-gray-300 rounded-md"
>
  <option value="">Lead Status</option>
  <option value="test" disabled={shouldDisableOption("test", location.state?.previousStatus)}>test</option>
  <option value="Assigned" disabled={shouldDisableOption("Assigned", location.state?.previousStatus)}>Assigned</option>
  <option value="Follow Up" disabled={shouldDisableOption("Follow Up", location.state?.previousStatus)}>Follow Up</option>
  <option value="Dead" disabled={shouldDisableOption("Dead", location.state?.previousStatus)}>Dead</option>
  <option value="Duplicate" disabled={shouldDisableOption("Duplicate", location.state?.previousStatus)}>Duplicate</option>
  <option value="Communicate To Ops" disabled={shouldDisableOption("Communicate To Ops", location.state?.previousStatus)}>Communicate To Ops</option>
  <option value="Referred To Ops" disabled={shouldDisableOption("Referred To Ops", location.state?.previousStatus)}>Referred To Ops</option>
  {/* <option value="Converted" disabled={shouldDisableOption("Converted", location.state?.previousStatus)}>Converted</option> */}
  
  {/* <option value="Completed" disabled={shouldDisableOption("Completed", location.state?.previousStatus)}>Completed</option> */}
  <option value="Walkin" disabled={shouldDisableOption("Walkin", location.state?.previousStatus)}>Walkin</option>
  <option value="Pickup" disabled={shouldDisableOption("Pickup", location.state?.previousStatus)}>Pickup</option>
  <option value="Doorstep" disabled={shouldDisableOption("Doorstep", location.state?.previousStatus)}>Doorstep</option>
  <option value="At Workshop" disabled={shouldDisableOption("At Workshop", location.state?.previousStatus)}>At Workshop</option>
  <option value="Job Card" disabled={shouldDisableOption("Job Card", location.state?.previousStatus)}>Job Card</option>
  <option value="Estimate" disabled={shouldDisableOption("Estimate", location.state?.previousStatus)}>Estimate</option>
  {/* <option value="Bill" disabled={shouldDisableOption("Bill", location.state?.previousStatus)}>Bill</option> */}
  <option value="Completed" disabled={shouldDisableOption("Completed", location.state?.previousStatus)}>Completed</option>

</select>

<select
                    value={formState.arrivalStatus.arrivalMode}
                    onChange={(e) => handleInputChange('arrivalStatus', 'arrivalMode', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Arrival Mode*</option>
                    <option value="Walkin">Walkin</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Doorstep">Doorstep</option>
                  </select>
                  <select
  value={formState.arrivalStatus.disposition}
  onChange={(e) => handleInputChange('arrivalStatus', 'disposition', e.target.value)}
  className="p-2 border border-gray-300 rounded-md"
>
<option value="">Select Disposition</option>
  <option value="Settled By Local Workshop">Settled By Local Workshop</option>
  <option value="Client Will Visit workshop">Client Will Visit workshop</option>
  <option value="Pickup Needed">Pickup Needed</option>
  <option value="Doorstep Needed">Doorstep Needed</option>
  <option value="Not Interested">Not Interested</option>
  <option value="Wrong Number">Wrong Number</option>
  <option value="Out of Service Area">Out of Service Area</option>
  <option value="Invalid Lead">Invalid Lead</option>
  <option value="Marketing Leads">Marketing Leads</option>
  <option value="Workshop Tie-ups">Workshop Tie-ups</option>
  <option value="Test Leads">Test Leads</option>
  <option value="Others">Others</option>
</select>
                <input
                  type="text"
                  onFocus={(e) => e.target.type = 'datetime-local'}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.type = 'text'
                    }
                  }}
                  value={formState.arrivalStatus.dateTime}
                  onChange={(e) => handleInputChange('arrivalStatus', 'dateTime', e.target.value)}
                  placeholder="Date and Time*"
                  className="p-2 border border-gray-300 rounded-md w-full"
                  required
                />



    {/* New fields that appear when Job Card is selected */}
    {formState.arrivalStatus.leadStatus === 'Job Card' && (
      <>
        <input
          type="text"
          value={formState.arrivalStatus.batteryFeature}
          onChange={(e) => handleInputChange('arrivalStatus', 'batteryFeature', e.target.value)}
          placeholder="Battery Feature"
          className="p-2 border border-gray-300 rounded-md w-full"
        />
        <input
          type="text"
          value={formState.arrivalStatus.fuelStatus}
          onChange={(e) => handleInputChange('arrivalStatus', 'fuelStatus', e.target.value)}
          placeholder="Fuel Status (Ex. 50%)"
          className="p-2 border border-gray-300 rounded-md w-full"
        />
        

<textarea
  value={formState.arrivalStatus.inventory}
  onChange={(e) => handleInputChange('arrivalStatus', 'inventory', e.target.value)}
  placeholder="Inventory (one per line)
  - Item 1
  - Item 2
  "
  className="p-2 border border-gray-300 rounded-md w-full"
  rows={4}
  style={{ resize: 'vertical' }}
/>
{/* <textarea
  value={formState.arrivalStatus.carDocumentDetails}
  onChange={(e) => handleInputChange('arrivalStatus', 'carDocumentDetails', e.target.value)}
  placeholder="Document Details (one per line)
  - Item 1
  - Item 2
  "
  className="p-2 border border-gray-300 rounded-md w-full"
  rows={4}
  style={{ resize: 'vertical' }}
/>
<textarea
  value={formState.arrivalStatus.otherCheckList}
  onChange={(e) => handleInputChange('arrivalStatus', 'otherCheckList', e.target.value)}
  placeholder="Other's Check List (one per line)
  - Item 1
  - Item 2
  "
  className="p-2 border border-gray-300 rounded-md w-full"
  rows={4}
  style={{ resize: 'vertical' }}
/> */}

       <input
          type="text"
          value={formState.arrivalStatus.speedometerRd}
          onChange={(e) => handleInputChange('arrivalStatus', 'speedometerRd', e.target.value)}
          placeholder="Speedmometer Rd"
          className="p-2 border border-gray-300 rounded-md w-full"
        />
       <input
          type="text"
          value={formState.arrivalStatus.additionalWork}
          onChange={(e) => handleInputChange('arrivalStatus', 'additionalWork', e.target.value)}
          placeholder="Additional Work"
          className="p-2 border border-gray-300 rounded-md w-full"
        />


        
        {/* <input
          type="text"
          onFocus={(e) => e.target.type = 'datetime-local'}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.type = 'text'
            }
          }}
          value={formState.arrivalStatus.estimatedDeliveryTime}
          onChange={(e) => handleInputChange('arrivalStatus', 'estimatedDeliveryTime', e.target.value)}
          placeholder="Estimated Delivery Time"
          className="p-2 border border-gray-300 rounded-md w-full"
        /> */}
      </>
    )}

{formState.arrivalStatus.leadStatus === 'Completed' && (
  <div className="mt-4 p-3 flex gap-4">
    <div className="flex-1">
      <input
        type="number"
        value={formState.arrivalStatus.finalAmount}
        onChange={(e) => handleInputChange('arrivalStatus', 'finalAmount', e.target.value)}
        placeholder="Final Amount"
        className="w-full p-2 border border-gray-300 rounded-md"
        required
      />
    </div>
  </div>
)}

{/* {formState.arrivalStatus.leadStatus === 'Completed' && (
  <div className="mt-4 p-3 flex gap-4">
    <div className="flex-1">
      <input
        type="number"
        value={formState.arrivalStatus.finalAmount}
        onChange={(e) => handleInputChange('arrivalStatus', 'finalAmount', e.target.value)}
        placeholder="Final Amount"
        className="w-full p-2 border border-gray-300 rounded-md"
        required
      />
    </div>
  </div>
)} */}
              </div>


            </div>



            {/* Garage Details */}

            <div className="w-full p-2 rounded-lg">
              <div className="text-gray-700 mb-2" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Workshop Details*</div>

              <div className="p-4">

                {/* Recommended Pickup Section */}
                        <Card className="mb-4" style={{ border: "none" }}>
                          <Card.Body>
                          <div className="d-flex gap-3">
                            {/* Left container */}
                            <div className="w-3/4 p-4" style={{ background: "#DEE1E6", borderRadius: "4px" }}>
                            <div className="d-flex justify-content-between">
                              <div className="d-flex align-items-center gap-2">
                              <FaMapMarkerAlt size={24} className="text-danger" />
                              <div>
                                <div className="fw-medium">{selectedGarage.name}</div>
                                <div className="text-muted d-flex gap-2">
                                <span>Mechanic: {selectedGarage.mechanic}</span>
                                <span>Locality: {selectedGarage.locality}</span>
                                <span>Mobile: {selectedGarage.mobile}</span>
                                </div>
                              </div>
                              </div>
                            </div>
                            </div>

                            {/* Right button container - matches height automatically */}
                            <div className="flex-1 d-flex" style={{ background: "#DEE1E6", borderRadius: "4px" }}>
                            <Button
                              type='button'
                              variant="outline-dark"
                              className="w-100 d-flex align-items-center justify-content-center" style={{ border: "none" }}
                              onClick={() => setShowGaragePopup(true)}
                            >
                              <FaPencilAlt size={14} className="me-1" />
                              Change Workshop
                              </Button>
                              {showGaragePopup && (
                            <GarageSelector 
                              onClose={() => setShowGaragePopup(false)} 
                              onSelectGarage={handleGarageSelect}
                            />
                            )}
                            </div>
                          </div>
                          </Card.Body>
                        </Card>

                        {/* Dropdown Sections */}
                <Row className="mb-4">
                  <Col md={6}>
                    <div className="bg-light p-3 rounded">
                      <div className="text-muted mb-2">Technician*</div>
                      <Form.Select
  value={formState.basicInfo.caName}
  onChange={(e) => handleInputChange('basicInfo', 'caName', e.target.value)}
  className="bg-light"
  required
>
<option value="">Select Technician</option>
  <option value="Anjali">Anjali</option>
  <option value="Loknath">Loknath</option>
  <option value="Abhishek">Abhishek</option>
  <option value="Sahil">Sahil</option>
  <option value="Gokul">Gokul</option>
</Form.Select>
                    </div>
                  </Col>

                  <Col md={6}>
                    <div className="bg-light p-3 rounded">
                      <div className="text-muted mb-2">CCE*</div>
                      <Form.Control
  value={formState.basicInfo.cceName || user?.username}
  onChange={(e) => handleInputChange('basicInfo', 'cceName', e.target.value)}
  className="bg-light"
  disabled
/>
                    </div>
                  </Col>
                </Row>

                {/* Comments Section */}
                <Form.Group>
                  <Form.Control
                    as="textarea"
                    value={formState.basicInfo.cceComments}
                    onChange={(e) => handleInputChange('basicInfo', 'cceComments', e.target.value)}
                    placeholder="Comments From CCE*"
                    required
                    style={{ height: '120px', resize: 'none' }}
                  />
                </Form.Group>
              </div>

            </div>


            {/* Sticky Footer */}
            <div className="fixed bottom-0 right-0  w-full border-t shadow-lg p-3 flex justify-end gap-3" style={{background:"#F3F4F6"}}>
           

                  <Button 
                    variant="outline-danger" 
                    type="button" 
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  
                  {/* Add Generate Card button when lead status is Job Card */}
                  {cards && (['Job Card', 'Estimate', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
        <Button
            variant="outline-dark"
            type="button"
            disabled={isSubmitting}
            onClick={handleGenerateCard}
        >
            Generate Card
        </Button>

        
                  
        
    )}

{ cards && (['Job Card', 'Estimate', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
   
   
   <Button
   variant="outline-dark"
   type="button"
   disabled={isSubmitting}
   onClick={handleGenerateEstimate}
   >
   Generate Estimate
   </Button>

)}

    
{/* <button 
onClick={handleGenerateBill} 
className="bg-blue-600 text-white px-4 py-2 rounded"
>
Generate Bill
</button> */}

{/* <Button
    variant="outline-dark"
    type="button"
    disabled={isSubmitting}
    onClick={handleGenerateBill}
    >
    Generate Bill
    </Button> */}
       



                  
                  <Button 
                    variant="danger" 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Copy'}
                  </Button>
              </div>

              {/* {error && (
                <div className="text-red-500 text-sm mt-2">
                  {error}
                </div>
              )} */}


{showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded shadow-lg">
      <h2 className="text-xl font-bold mb-4">Cannot Edit Lead</h2>
      <p>You cannot edit a lead after completion. In order to make any changes, please mail at info@onlybigcars.com.</p>
      <button 
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={() => setShowPopup(false)}
      >
        Close
      </button>
    </div>
  </div>
)}

{/* // Update the error display component */}
{error && (
  <div className="error-card">
    <div className="error-header">
      <h3>Please fill the following fields:</h3>
      <button 
        type="button"
        onClick={() => setError(null)}
        className="error-close-btn"
        aria-label="Close"
      >
        ×
      </button>
    </div>
    <div className="error-content">
      {typeof error === 'string' ? (
        <p>{error}</p>
      ) : error}
    </div>
  </div>
)}
          </div>

        </div>
        {showAddCarModal && (
      <AddNewCar 
        onClose={() => setShowAddCarModal(false)}
        onSubmit={handleAddCar}
        editingCar={editingCar}
      />
    )}
        </div>
        {/* 5. Add JobCard component at the bottom of the return statement, before closing form tag */}
        {/* Update the JobCard component */}
{showJobCard && (
  <div style={{ width: '100%', minHeight: '100vh', position: 'absolute', left: '-9999px' }}>
    <JobCard 
      ref={jobCardRef}
      data={{
        customerName: formState.customerInfo.customerName,
        carBrand: formState.cars[0]?.carBrand || '',
        carModel: formState.cars[0]?.carModel || '',
        regNumber: formState.cars[0]?.regNo || '',
        carYearFuel: `${formState.cars[0]?.year || ''} ${formState.cars[0]?.fuel || ''}`,
        orderId: formState.arrivalStatus.orderId || '',
        customerMobile: formState.customerInfo.mobileNumber,
        whatsappNum: formState.customerInfo.whatsappNumber,
        batteryFeature: formState.arrivalStatus.batteryFeature,
        additionalWork: formState.arrivalStatus.additionalWork,
        inventory: formState.arrivalStatus.inventory,
        // carDocumentDetails: formState.arrivalStatus.carDocumentDetails,
        // otherCheckList: formState.arrivalStatus.otherCheckList,
        fuelStatus: formState.arrivalStatus.fuelStatus,
        speedometerRd: formState.arrivalStatus.speedometerRd,
        workshop: formState.workshop.name,
        arrival_time: new Date(formState.arrivalStatus.dateTime).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        estimatedTime: new Date(formState.arrivalStatus.estimatedDeliveryTime).toLocaleTimeString(),
        estimatedDate: new Date(formState.arrivalStatus.estimatedDeliveryTime).toLocaleDateString(),
        workDetails: formState.overview.tableData.map(item => ({
          description: item.type,
          workDone: item.workdone,
          labour: 0,
          quantity: 1,
          unitPrice: parseFloat(item.total) || 0,
          discount: 0,
          netAmount: parseFloat(item.total) || 0
        })),
        workSummary: formState.overview.tableData.map(item => ({
          type: item.type,
          name: item.name,
          workdone: item.workdone,
          total: item.total
        })),
        invoiceSummary: {
          netAmount: formState.overview.total,
          discount: parseFloat(discount) || 0,
          // totalAmount: formState.overview.finalAmount,
          totalPayable: formState.overview.finalAmount
        }
      }}
    />
  </div>
)}


{showBill && (
  <div style={{ width: '100%', minHeight: '100vh', position: 'absolute', left: '-9999px' }}>
    <Bill 
      ref={billRef}
      data={{
        customerName: formState.customerInfo.customerName,
        carBrand: formState.cars[0]?.carBrand || '',
        carModel: formState.cars[0]?.carModel || '',
        regNumber: formState.cars[0]?.regNo || '',
        carYearFuel: `${formState.cars[0]?.year || ''} ${formState.cars[0]?.fuel || ''}`,
        handoverDate: new Date(formState.arrivalStatus.dateTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        orderId: formState.arrivalStatus.jobCardNumber || '',
        speedRd: formState.arrivalStatus.speedometerRd,
        // If you have these fields in your formState, else use fallback values
        carColor: formState.cars[0]?.color || '',
        vinNo: formState.cars[0]?.vin || '',
        customerAdd: formState.location.address || '',
        workshop: formState.workshop.name,
        // Convert invoiceSummary to an array as expected in Bill.js
        invoiceSum: [
          {
            netAmt: formState.overview.total,
            dis: 0,
            totalPay: formState.overview.total
          }
        ],
        // Adjust work details field names to match Bill.js
        workDetail: formState.overview.tableData.map(item => ({
          descriptions: item.type,
          workDn: item.workdone,
          quant: 1,
          unitPr: parseFloat(item.total) || 0,
          dis: 0,
          netAmt: parseFloat(item.total) || 0
        })),
        totalUnitPriceBill: formState.overview.total,
        totalDiscountedPriceBill: 0,
        finalPriceBill: formState.overview.total,
        totalPayablePriceBill: formState.overview.total
      }}
    />
  </div>
)}

{showEstimate && (
  <div style={{ width: '100%', minHeight: '100vh', position: 'absolute', left: '-9999px' }}>
    <Estimate 
      ref={estimateRef}
      data={{
        customerName: formState.customerInfo.customerName,
        customerMobile: formState.customerInfo.mobileNumber,
        orderId: formState.arrivalStatus.orderId || '',
        batteryFeature: formState.arrivalStatus.batteryFeature,
        additionalWork: formState.arrivalStatus.additionalWork,
        carBrand: formState.cars[0]?.carBrand || '',
        carModel: formState.cars[0]?.carModel || '',
        regNumber: formState.cars[0]?.regNo || '',
        carYearFuel: `${formState.cars[0]?.year || ''} ${formState.cars[0]?.fuel || ''}`,
        fuelStatus: formState.arrivalStatus.fuelStatus,
        handoverDate: new Date(formState.arrivalStatus.dateTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
       
        speedRd: formState.arrivalStatus.speedometerRd,
        // If you have these fields in your formState, else use fallback values
        carColor: formState.cars[0]?.color || '',
        vinNo: formState.cars[0]?.vin || '',
        customerAdd: formState.location.address || '',
        workshop: formState.workshop.name,
        // Convert invoiceSummary to an array as expected in Bill.js
        invoiceSum: [
          {
            netAmt: formState.overview.total,
            dis: formState.overview.discount,
            totalPay: formState.overview.finalAmount
          }
        ],
        // Adjust work details field names to match Bill.js
        workDetail: formState.overview.tableData.map(item => ({
          descriptions: item.type,
          workDn: item.workdone,
          quant: 1,
          unitPr: parseFloat(item.total) || 0,
          dis: 0,
          netAmt: parseFloat(item.total) || 0
        })),
        totalUnitPriceBill: formState.overview.total,
        totalDiscountedPriceBill: 0,
        finalPriceBill: formState.overview.total,
        totalPayablePriceBill: formState.overview.total,
        totalPayable: formState.overview.finalAmount
      }}
    />
  </div>
)}

      </form>
    </Layout>
  );
};

export default EditPage;