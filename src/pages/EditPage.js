import Layout from '../components/layout';
import GarageSelector from '../components/GaragePop.js';
import { Alert } from 'react-bootstrap';
import './editpage.css';
import React, { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { Card, Button, Collapse, Form, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPencilAlt , FaEdit, FaTimes} from 'react-icons/fa';
import AddNewCar from './addcar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import LocationSearch from './locationsearch.js';
// import { useLoadScript } from '@react-google-maps/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JobCard from './JobCard';
import Bill from './bill.js';
import WxBill from './wxbill';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Estimate from './estimate.js';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// import { toast } from 'react-toastify';




import { useServicePrices } from '../components/useServicePrices';




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
    gstin: '',
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
  gstDetail: {
    customer_name: '',
    customer_address: '',
    customer_gstin: '',
    customer_state: '',
    wx_name: '',
    wx_address: '',
    wx_gstin: '',
    wx_state: ''
  },

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedCarIndex, setSelectedCarIndex] = useState(0);
  // Add this line near the top of your component
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [isFromWorkshop, setIsFromWorkshop] = useState(false);

  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [imageTooltipText, setImageTooltipText] = useState('');
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [showDesignerPopup, setShowDesignerPopup] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    customer_name: '',
    customer_address: '',
    customer_gstin: '',
    customer_state: '',
    wx_name: '',
    wx_address: '',
    wx_gstin: '',
    wx_state: ''
  });
  const [gstMode, setGstMode] = useState(null);
  const [isSavingGst, setIsSavingGst] = useState(false);
  const [isSendingJobCard, setIsSendingJobCard] = useState(false);
  // Add these with your other state declarations
  const [isSendingEstimate, setIsSendingEstimate] = useState(false);
  // Add this with your other state declarations
  const [showSendCardPopup, setShowSendCardPopup] = useState(false);
  // Add these with your other state declarations
const [hasShownJobCardReminder, setHasShownJobCardReminder] = useState(false);
const [hasShownEstimateReminder, setHasShownEstimateReminder] = useState(false);
const [showReminderPopup, setShowReminderPopup] = useState(false);
const [reminderType, setReminderType] = useState(''); // 'jobcard' or 'estimate'
  // const [showEstimate, setShowEstimate] = useState(false);
const [showWarrantyPopup, setShowWarrantyPopup] = useState(false);
const [warrantyDetails, setWarrantyDetails] = useState({
  warranty: '',
});
const [isRephrasing, setIsRephrasing] = useState(false);
  

// Add this with other state declarations around line 90-100
const [statusCounterData, setStatusCounterData] = useState({
  follow_up_count: 0,
  dead_count: 0,
  duplicate_count: 0,
  communicate_to_ops_count: 0,
  referred_to_ops_count: 0,
  walkin_count: 0,
  pickup_count: 0,
  doorstep_count: 0,
  at_workshop_count: 0,
  job_card_count: 0,
  payment_due_count: 0,
  commission_due_count: 0,
  completed_count: 0
});


  
  

  // Add this near your other state definitions in EditPage component




  const [previousLeads, setPreviousLeads] = useState([]);
  const [isLoadingPreviousLeads, setIsLoadingPreviousLeads] = useState(false);

  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: "AIzaSyBlzkfa69pC6YAAomHbsYoDrKcrBU-5CQM",
  //   libraries: ["places"]
  // });
  const prevStatusRef = useRef(null);
  const addressInputRef = useRef(null);
  const jobCardRef = useRef(null);
  const billRef = useRef(null);
  const wxBillRef = useRef();
  const estimateRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max size
      
      if (!isValidType) {
        setImageTooltipText('Only image files are allowed');
        setTimeout(() => setImageTooltipText(''), 3000);
        return false;
      }
      
      if (!isValidSize) {
        setImageTooltipText('Images must be under 5MB each');
        setTimeout(() => setImageTooltipText(''), 3000);
        return false;
      }
      
      return true;
    });
    
    setSelectedImages(prev => [...prev, ...validFiles]);
  };

// Function to remove a newly selected image
const handleRemoveImage = (index) => {
  const updatedImages = [...selectedImages];
  updatedImages.splice(index, 1);
  setSelectedImages(updatedImages);
};

// Function to remove an existing image
const handleRemoveExistingImage = (index) => {
  const updatedExistingImages = [...existingImageUrls];
  updatedExistingImages.splice(index, 1);
  setExistingImageUrls(updatedExistingImages);
};

  const [searchQuery, setSearchQuery] = useState('');
  

  const services = ['Car Service', 'AC Service & Repair','Complete Car Inspection','Denting & Painting','Detailing for Luxury Cars','Brakes & Suspension','Car Battery & Electricals','Tyre & Wheel Care','Cleaning & Grooming','Clutch & Body Parts','Insurance Services & SOS-Emergency','Windshields & Lights'];
  const [selectedService, setSelectedService] = useState('Car Service');

  const [selectedGarage, setSelectedGarage] = useState({
    name: 'Onlybigcars - Own Agra Mathura Road',
    mechanic: 'Sahil',
    locality: 'Locality: 98V7+C38, Faridabad, Haryana',
    link:'https://g.co/kgs/X7g95w8',
    mobile: '9999967591'
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



const handleGstDetailsChange = (field, value) => {
    setGstDetails(prev => ({ ...prev, [field]: value }));
  };


const handleSaveGstDetails = () => {
    // Update the main formState with the temporary details from the UI
    setFormState(prev => ({
        ...prev,
        gstDetail: { ...gstDetails }
    }));
    toast.info("GST details saved. Click the main save button to persist changes.");
     // Close the popup after saving
    setShowDesignerPopup(false);
};



  // Add this function to check if reminder should be shown
const checkAndShowReminder = () => {
  const currentStatus = formState.arrivalStatus.leadStatus;
  
  // Check for JobCard reminder
  if (currentStatus === 'Job Card' && 
      statusCounterData.job_card_count === 0 && 
      !hasShownJobCardReminder) {
    setReminderType('jobcard');
    setShowReminderPopup(true);
    setHasShownJobCardReminder(true);
    return true;
  }
  
  // Check for Estimate reminder  
  if (currentStatus === 'Payment Due' && 
      statusCounterData.payment_due_count === 0 && 
      !hasShownEstimateReminder) {
    setReminderType('estimate');
    setShowReminderPopup(true);
    setHasShownEstimateReminder(true);
    return true;
  }
  
  return false;
};

  // 18 feb start
  // Update the StatusHistoryDisplay component for better error handling and debugging
  const StatusHistoryDisplay = ({ statusHistory }) => {
    console.log('StatusHistoryDisplay received:', statusHistory);
    
    // Define all possible statuses in your system
    const allStatuses = [
      "Assigned", "Follow Up", "Dead", "Duplicate", "Communicate To Ops", 
      "Referred To Ops", "Walkin", "Pickup", "Doorstep", "At Workshop", 
      "Job Card", "Payment Due", "Commision Due", "Completed"
    ];
    
    const hasStatus = (statusToCheck) => {
      try {
        // If statusHistory isn't an array or is empty, return false immediately
        if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
          console.log(`Status history is empty or not an array. Type: ${typeof statusHistory}`);
          return false;
        }
        
        // Try to find the status in the array - handle different data structures
        const found = statusHistory.some(entry => {
          // For object entries with a status property
          if (entry && typeof entry === 'object' && entry.status) {
            return entry.status.toLowerCase().trim() === statusToCheck.toLowerCase().trim();
          }
          
          // For string entries
          if (typeof entry === 'string') {
            return entry.toLowerCase().trim() === statusToCheck.toLowerCase().trim();
          }
          
          return false;
        });
        
        return found;
      } catch (error) {
        console.error('Error in hasStatus:', error);
        return false;
      }
    };
  
    // Get the timestamp for the LAST occurrence of a status
    const getLatestStatusTimestamp = (statusToCheck) => {
      if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
        return null;
      }
      
      // Go through history in reverse to find the last occurrence
      for (let i = statusHistory.length - 1; i >= 0; i--) {
        const entry = statusHistory[i];
        
        if (entry && typeof entry === 'object' && entry.status) {
          if (entry.status.toLowerCase().trim() === statusToCheck.toLowerCase().trim()) {
            return new Date(entry.timestamp).toLocaleString();
          }
        }
      }
      
      return null;
    };
  
    // Get all unique comments for a status, from newest to oldest
    const getStatusComments = (statusToCheck) => {
      if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
        return [];
      }
      
      // Get all entries for this status, in reverse order (newest first)
      const matchingEntries = statusHistory
        .filter(entry => 
          entry && 
          typeof entry === 'object' && 
          entry.status && 
          entry.status.toLowerCase().trim() === statusToCheck.toLowerCase().trim()
        )
        .reverse();
      
      // Extract unique comments
      const uniqueComments = [];
      
      matchingEntries.forEach(entry => {
        const comment = entry.comment;
        
        // Skip entries without comments
        if (!comment) return;
        
        // Check if this comment is contained in any comment that's already in our list
        const isContainedInExisting = uniqueComments.some(existingComment => 
          existingComment.includes(comment) && existingComment !== comment
        );
        
        // If not already contained in a previous comment, add it
        if (!isContainedInExisting) {
          uniqueComments.push(comment);
        }
      });
      
      return uniqueComments;
    };
  
    // Render component with updated logic
    return (
      <div className="status-history-container p-4">
        {!Array.isArray(statusHistory) || statusHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-3">
            No status history available
          </div>
        ) : (
          <div className="grid gap-4">
            {allStatuses.map((status, index) => {
              const hasThisStatus = hasStatus(status);
              
              if (!hasThisStatus) {
                // If status doesn't exist, render the gray version
                return (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex flex-col w-[85%]">
                      <span className="font-medium">{status}</span>
                    </div>
                    <FaTimesCircle className="text-red-500 text-xl" />
                  </div>
                );
              }
              
              // Get timestamp of latest occurrence
              const timestamp = getLatestStatusTimestamp(status);
              
              // Get all unique comments for this status
              const comments = getStatusComments(status);
              
              return (
                <div 
                  key={index}
                  className="flex justify-between items-center p-3 rounded-lg bg-green-50"
                >
                  <div className="flex flex-col w-[85%]">
                    <span className="font-medium">{status}</span>
                    {timestamp && (
                      <span className="text-xs text-gray-500">{timestamp}</span>
                    )}
                    
                    {/* // Inside the StatusHistoryDisplay component's return statement, find this section: */}
{comments.length > 0 && (
  <div className="text-sm text-gray-600 mt-1">
    {/* Replace this code */}
    {/*
    {comments.map((comment, commentIndex) => (
      <div key={commentIndex} className={commentIndex > 0 ? "mt-2" : ""}>
        {comment.length > 100 ? (
          <CommentWithReadMore text={comment} maxLength={100} />
        ) : (
          `"${comment}"`
        )}
      </div>
    ))}
    */}
    
    {/* With this code */}
    <CommentWithReadMore text={comments} maxLength={100} />
  </div>
)}
                  </div>
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  const CommentWithReadMore = ({ text, maxLength }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const toggleReadMore = (e) => {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    };
    
    if (!text) return null;
    
    // Check if text is an array and join with newlines
    const combinedText = Array.isArray(text) ? text.join("\n\n") : text;
    
    // Instead of truncating at an arbitrary character count,
    // we'll show a reasonable block of text
    let displayText = combinedText;
    let shouldShowButton = false;
    
    if (!isExpanded && combinedText.length > maxLength) {
      // Try to find a natural breakpoint before maxLength
      const breakpoints = ['\n\n', '\n', '. ', '! ', '? '];
      let cutoffIndex = maxLength;
      
      for (const breakpoint of breakpoints) {
        const index = combinedText.indexOf(breakpoint, Math.floor(maxLength/2));
        if (index > 0 && index < maxLength) {
          cutoffIndex = index + breakpoint.length - (breakpoint === '\n' ? 0 : 1);
          break;
        }
      }
      
      displayText = combinedText.substring(0, cutoffIndex);
      shouldShowButton = true;
    }
    
    // Replace newlines with line break elements for display
    const formattedText = isExpanded ? 
      combinedText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      )) :
      displayText.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ));
    
    return (
      <>
        <span className="whitespace-pre-line">"{formattedText}{!isExpanded && shouldShowButton ? "..." : ""}"</span>
        {combinedText.length > maxLength && (
          <button
            onClick={toggleReadMore}
            className="ml-2 text-xs text-red-500 font-medium hover:text-red-700 focus:outline-none"
          >
            {isExpanded ? "Show Less" : "Read More"}
          </button>
        )}
      </>
    );
  };


  
  const shouldHideProducts=()=>{
    return formState.basicInfo.carType=== 'Sell/Buy'|| formState.basicInfo.carType=== 'Spares';
  }

  
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
      gstin: '', // Add this new field
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
      commissionDue: 0, // Add this new field
      commissionReceived: 0, // Add this new field
      commissionPercent: 0, // Add this new field
      pendingAmount: 0, // Add this new field
     
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
    sellBuyInfo: {
    dealerName: '',
    dealerNumber: '',
    dealerAddress: '',
    dealerEmail: '',
    repairingCost: '',
    sellingCost: '',
    purchaseCost: '',
    dealerCommission: '',
    profit: ''
  },
  gstDetail: {
    customer_name: '',
    customer_address: '',
    customer_gstin: '',
    customer_state: '',
    wx_name: '',
    wx_address: '',
    wx_gstin: '',
    wx_state: ''
  },
  });

  const fetchPreviousLeads = async (phoneNumber) => {
    if (!phoneNumber) return;
    
    try {
      setIsLoadingPreviousLeads(true);
      const response = await axios.get(
        `https://admin.onlybigcars.com/api/customers/${phoneNumber}/leads/?current_lead=${id || ''}`,
        {
          headers: {
            'Authorization': `Token ${token}`
          }
        }
      );
      setPreviousLeads(response.data || []);
    } catch (error) {
      console.error('Error fetching previous leads:', error);
    } finally {
      setIsLoadingPreviousLeads(false);
    }
  };
// Add this useEffect hook to the main EditPage component
useEffect(() => {
  if (formState.customerInfo.mobileNumber) {
    fetchPreviousLeads(formState.customerInfo.mobileNumber);
  }
}, [formState.customerInfo.mobileNumber, id]);


useEffect(() => {
  const fetchCarData = async () => {
      try {
          // Assuming '/api/car-data/' endpoint returns data structured like [{ name: 'Brand', models: [{ name: 'Model', image_url: '...' }] }]
          const response = await axios.get(`https://admin.onlybigcars.com/api/car-data/`, {
              headers: { Authorization: `Token ${token}` },
          });
          setCarBrandsData(response.data);
          console.log("Fetched car brand data:", response.data); // For debugging
      } catch (error) {
          console.error("Error fetching car brand/model data:", error);
          // Handle error (e.g., show a message to the user)
      }
  };
  if (token) {
      fetchCarData();
  }
}, [token]); // Dependency on token

// Add this with your other useEffect hooks
useEffect(() => {
  // When the bill designer popup is opened and a mode is selected
  if (showDesignerPopup && gstMode) {
    // Populate the temporary gstDetails state with the current data from formState
    setGstDetails(formState.gstDetail);
  }
}, [showDesignerPopup, gstMode, formState.gstDetail]);


useEffect(() => {
  const currentStatus = formState.arrivalStatus.leadStatus;
  
  // Check if status was changed to "Duplicate" and wasn't Duplicate before
  if (currentStatus === 'Duplicate' && prevStatusRef.current !== 'Duplicate') {
    console.log("Lead status changed to Duplicate, fetching previous lead data");
    
    // Get customer phone number
    const mobileNumber = formState.customerInfo.mobileNumber;
    console.log(`Customer mobile number: ${mobileNumber}, Lead ID: ${id}`);
    
    if (mobileNumber) {
      // Show loading indicator
      setIsSubmitting(true);
      
      // Use axios instead of fetch for better error handling and consistency
      axios.get(`https://admin.onlybigcars.com/api/customers/${mobileNumber}/leads/`, {
        params: { current_lead: id },
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        console.log("API Response received:", response.data);
        const data = response.data;
        
        if (data && data.length > 0) {
          // Get most recent lead
          const previousLead = data[0];
          console.log("Found previous lead data:", previousLead);
          
          // Debug all key fields we're trying to copy
          console.log("Fields to copy from previous lead:");
          console.log("- Source:", previousLead.source);
          console.log("- Address:", previousLead.address);
          console.log("- City:", previousLead.city);
          console.log("- State:", previousLead.state);
          console.log("- Building:", previousLead.building);
          console.log("- Landmark:", previousLead.landmark);
          console.log("- Map Link:", previousLead.map_link);
          console.log("- Lead Type:", previousLead.lead_type);
          console.log("- Arrival Mode:", previousLead.arrival_mode);
          console.log("- Products:", previousLead.products);
          
          // Update form state with data from previous lead
          setFormState(prevState => {
            const updatedState = {
              ...prevState,
              customerInfo: {
                ...prevState.customerInfo,
                source: previousLead.source || prevState.customerInfo.source, // Copy source from previous lead
              },
              location: {
                address: previousLead.address || prevState.location.address,
                city: previousLead.city || prevState.location.city,
                state: previousLead.state || prevState.location.state,
                buildingName: previousLead.building || prevState.location.buildingName,
                landmark: previousLead.landmark || prevState.location.landmark,
                mapLink: previousLead.map_link || prevState.location.mapLink
              },
              basicInfo: {
                ...prevState.basicInfo,
                carType: previousLead.lead_type || prevState.basicInfo.carType,
                caName: previousLead.caName || prevState.caName,
                cceComments: `${prevState.basicInfo.cceComments || ''}\n[AUTO] Data copied from previous lead ${previousLead.id || previousLead.lead_id} on ${new Date().toLocaleString()}`.trim(),
                caComments: `${prevState.basicInfo.caComments || ''}\n[AUTO] Data copied from previous lead ${previousLead.id || previousLead.lead_id} on ${new Date().toLocaleString()}`.trim(),
              },
              arrivalStatus: {
                ...prevState.arrivalStatus,
                leadStatus: 'Duplicate',
                arrivalMode: previousLead.arrival_mode || prevState.arrivalStatus.arrivalMode,
                disposition: previousLead.disposition || prevState.arrivalStatus.disposition,
                batteryFeature: previousLead.battery_feature || prevState.arrivalStatus.batteryFeature,
                gstin: previousLead.gstin || prevState.arrivalStatus.gstin,
                fuelStatus: previousLead.fuel_status || prevState.arrivalStatus.fuelStatus,
                speedometerRd: previousLead.speedometer_rd || prevState.arrivalStatus.speedometerRd,
                inventory: previousLead.inventory || prevState.arrivalStatus.inventory,
                additionalWork: previousLead.additional_work || prevState.arrivalStatus.additionalWork,
                // arrival_time: previousLead.arrival_time ,
              },
              workshop: previousLead.workshop_details || prevState.workshop,
              overview: {
  ...prevState.overview,
  tableData: (previousLead.products || prevState.overview.tableData).map(row => ({
    ...row,
    gst: row.gst !== undefined ? row.gst : 0 // If gst is missing, set to 0
  })),
  total: previousLead.estimated_price || prevState.overview.total,
  discount: previousLead.overview.discount || prevState.overview.discount,
  finalAmount: previousLead.overview.finalAmount || prevState.overview.finalAmount,
}
            };
            
              // Update the discount UI state as well
              setDiscount(previousLead.overview.discount || prevState.overview.discount || 0);
            
            console.log("Form state updated with previous lead data");
            return updatedState;
          });
          
          // Add a message to indicate successful auto-fill
          toast.success(`Auto-filled data from previous lead ${previousLead.id || previousLead.lead_id}`);
          console.log(`Auto-filled data from previous lead ${previousLead.id || previousLead.lead_id}`);
        } else {
          console.log("No previous leads found for this customer");
          toast.info("No previous leads found for this customer to auto-fill");
        }
        setIsSubmitting(false);
      })
      .catch(error => {
        console.error("Error fetching previous lead data:", error);
        
        // Enhanced error logging
        if (error.response) {
          console.error("API Error response:", {
            status: error.response.status,
            data: error.response.data
          });
        }
        
        toast.error("Failed to fetch previous lead data");
        setIsSubmitting(false);
      });
    }
  }
  
  // Update the previous status reference
  prevStatusRef.current = currentStatus;
}, [formState.arrivalStatus.leadStatus, id, token, formState.customerInfo.mobileNumber]);



  // Fetch lead data if ID exists
  useEffect(() => {
    console.log("Status History data:", formState.arrivalStatus.status_history);
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

    
    

    if (!id) {
      axios.get('https://admin.onlybigcars.com/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      })
      .then(response => {
        // Set admin status and users list
        setIsAdmin(response.data.is_admin || false);
        setUsers(response.data.users || []);
      })
      .catch(error => {
        console.error('Error fetching admin status:', error);
      });
    }

    if (id) {
      const fetchLead = async () => {
        try {
          console.log("Fetching lead with ID:", id); // Debug log
          const response = await axios.get(
            `https://admin.onlybigcars.com/api/leads/${id}/`,
            {
              headers: {
                'Authorization': `Token ${token}`
              }
            }
          );

           console.log("Full response from update_lead:", response.data); // ADD THIS DEBUG LOG

    // CAPTURE STATUS COUNTER DATA HERE
    if (response.data.status_counter) {
      setStatusCounterData(response.data.status_counter);
      console.log('Status Counter Data received after update:', response.data.status_counter);
    } else {
      console.log('No status_counter in response data');
    }
        
          
          // Restructure the incoming data to match formState structure
          const leadData = response.data[0];

        

           // If the lead has images, store them in state
        if (leadData.images && Array.isArray(leadData.images)) {
          setExistingImageUrls(leadData.images);
          console.log("Loaded existing images:", leadData.images);
        }
        
          
          const customerResponse = await axios.get(
            `https://admin.onlybigcars.com/api/customers/${leadData.number}/`,
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
          
            // Store all customer cars, not just the current car
        const allCars = leadData.customer_cars || [];
        
        // Find current car index in the array
        const currentCarId = leadData.current_car_id;
        let currentCarIndex = 0;
        
        if (currentCarId && allCars.length > 0) {
          const foundIndex = allCars.findIndex(car => car.id === currentCarId);
          if (foundIndex !== -1) {
            currentCarIndex = foundIndex;
          }
        }


         setFormState({
  ...formState, //14-2
  overview: {
    tableData: (leadData.products || []).map(row => ({
      ...row,
      gst: row.gst !== undefined ? row.gst : 0 // Ensure GST is present
    })),
    caComments: technicianComments, //14-2
    total: leadData.estimated_price || 0,
    discount: leadData.overview.discount || 0,
    finalAmount: leadData.overview.finalAmount || leadData.overview.total || 0,
  },

  sellBuyInfo: {
            dealerName: leadData.sellBuyInfo?.dealerName || '',
            dealerNumber: leadData.sellBuyInfo?.dealerNumber || '',
            dealerAddress: leadData.sellBuyInfo?.dealerAddress || '',
            dealerEmail: leadData.sellBuyInfo?.dealerEmail || '',
            sellingCost: leadData.sellBuyInfo?.sellingCost || '',
            repairingCost: leadData.sellBuyInfo?.repairingCost || '',
            purchaseCost: leadData.sellBuyInfo?.purchaseCost || '',
            dealerCommission: leadData.sellBuyInfo?.dealerCommission || '',
            profit: leadData.sellBuyInfo?.profit || '',
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
            cars: allCars,
            arrivalStatus: {
              leadStatus: leadData.lead_status || '',
              previousStatus: leadData.lead_status,
              arrivalMode: leadData.arrival_mode || '',
              disposition: leadData.disposition || '',
              // dateTime: leadData.arrival_time ? new Date(leadData.arrival_time).toISOString().slice(0, 16) : '',
              dateTime: leadData.arrival_time ? new Date(leadData.arrival_time).toLocaleString('sv-SE', {timeZone: 'Asia/Kolkata'}).slice(0, 16) : '',
              jobCardNumber: leadData.job_card_number || '', // Add this new field
              estimatedDeliveryTime: leadData.estimated_delivery_time ? new Date(leadData.estimated_delivery_time).toISOString().slice(0, 16) : '', // Add this new field
              status_history: leadData.status_history || [], // 18 feb
              finalAmount: leadData.final_amount || 0,
              commissionDue: leadData.commission_due || 0, // Add this new field
              commissionReceived: leadData.commission_received || 0, // Add this new field
              commissionPercent: leadData.commission_percent || 0, // Add this new field
              batteryFeature: leadData.battery_feature || '', // Add this new field
              gstin: leadData.gstin || '', // Add this new field
              pendingAmount: leadData.pending_amount || 0, // Add this new field
              additionalWork: leadData.additional_work || '',
              fuelStatus: leadData.fuel_status || '', // Add this new field 
              speedometerRd: leadData.speedometer_rd || '', // Add this new field
              inventory: leadData.inventory || [],
              orderId: leadData.orderId || 'NA', // Add this new field
              
            
              
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
            warranty:leadData.warranty || '', 
          });


          
           

          setDiscount(leadData.overview.discount || 0); // Add this new field
          // Set the current car index
          setSelectedCarIndex(currentCarIndex);

          // Check if orderId is not 'NA' and set cards to true
        if (leadData.orderId && leadData.orderId !== 'NA') {
          setCards(true);
        }

        // After setting the initial formState from leadData
// Add this code to handle GST details autofill



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

          // Set admin status and users list if provided in response
          if (response.data.is_admin !== undefined) {
            setIsAdmin(response.data.is_admin);
          }
          
          if (response.data.users) {
            setUsers(response.data.users);
          }


      

         
// need prod check
  //         const shouldAddDummyCar = isAdmin && id && formState.cars.length === 0 && !dummyCarAddedRef.current;
  
  // if (shouldAddDummyCar) {
  //   // Add dummy car for admin
  //   const dummyCar = {
  //     carBrand: 'Audi',
  //     carModel: 'A3',
  //     fuel: 'petrol',
  //     year: '2000',
  //     chasisNo: '',
  //     regNo: '',
  //     variant: ''
  //   };
    
  //   setFormState(prev => ({
  //     ...prev,
  //     cars: [...prev.cars, dummyCar]
  //   }));
    
  //   // Set the dummy car as selected
  //   setSelectedCarIndex(0);
    
  //   // Mark that we've added a dummy car to prevent infinite loop
  //   dummyCarAddedRef.current = true;
  // }

  
  // After setting the initial formState from leadData
// Replace this section (around line 936-968)

// Initialize GST details with values from leadData if available, otherwise use values from other fields
setFormState(prev => {
  // Create the gstDetail object with smart fallbacks
  const gstDetail = {
    // For customer details, check each field and use fallbacks in this order:
    // 1. Use existing GST detail if it exists and is not empty
    // 2. Use corresponding customer/location data
    // 3. Fall back to empty string
    customer_name: 
      (leadData.gstDetail?.customer_name) || 
      prev.customerInfo.customerName || 
      leadData.name || '',
      
    customer_address: 
      (leadData.gstDetail?.customer_address) || 
      prev.location.address || 
      leadData.address || '',
      
    customer_gstin: 
      (leadData.gstDetail?.customer_gstin) || 
      prev.arrivalStatus.gstin || '',
      
    customer_state: 
      (leadData.gstDetail?.customer_state) || 
      prev.location.state || 
      leadData.state || '',
    
    // For workshop details, similar approach
    wx_name: 
      (leadData.gstDetail?.wx_name) || 
      prev.workshop.name || '',
      
    wx_address: 
      (leadData.gstDetail?.wx_address) || 
      prev.workshop.locality || '',
      
    wx_gstin: 
      (leadData.gstDetail?.wx_gstin) || '',
      
    wx_state: 
      (leadData.gstDetail?.wx_state) || ''
  };

  return {
    ...prev,
    gstDetail: gstDetail
  };
});


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

// Add this with your other useState declarations
const [stateSearchCustomer, setStateSearchCustomer] = useState('');
const [stateSearchWorkshop, setStateSearchWorkshop] = useState('');
const [showCustomerStateDropdown, setShowCustomerStateDropdown] = useState(false);
const [showWorkshopStateDropdown, setShowWorkshopStateDropdown] = useState(false);

// List of Indian states and union territories
const indianStates = [
  // States
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

useEffect(() => {
  if (formState.basicInfo.carType === "Sell/Buy") {
    const repairingCost = parseFloat(formState.sellBuyInfo.repairingCost) || 0;
    const sellingCost = parseFloat(formState.sellBuyInfo.sellingCost) || 0;
    const purchaseCost = parseFloat(formState.sellBuyInfo.purchaseCost) || 0;
    const dealerCommission = parseFloat(formState.sellBuyInfo.dealerCommission) || 0;
    const profit = sellingCost - repairingCost - purchaseCost - dealerCommission;

    setFormState(prev => ({
      ...prev,
      sellBuyInfo: {
        ...prev.sellBuyInfo,
        profit: profit
      }
    }));
  }
  // eslint-disable-next-line
}, [
  formState.sellBuyInfo.repairingCost,
  formState.sellBuyInfo.sellingCost,
  formState.sellBuyInfo.purchaseCost,
  formState.sellBuyInfo.dealerCommission,
  formState.basicInfo.carType
]);

  // ... existing code around line 1119
useEffect(() => {
  function handleClickOutside(event) {
    // Close customer state dropdown if clicking outside
    if (showCustomerStateDropdown && 
        !event.target.closest('.customer-state-dropdown')) {
      setShowCustomerStateDropdown(false);
    }
    
    // Close workshop state dropdown if clicking outside
    if (showWorkshopStateDropdown && 
        !event.target.closest('.workshop-state-dropdown')) {
      setShowWorkshopStateDropdown(false);
    }
  }
  
  // Add event listener
  document.addEventListener('mousedown', handleClickOutside);
  
  // Clean up
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showCustomerStateDropdown, showWorkshopStateDropdown]);

// Reset reminder flags when status changes or counters update
useEffect(() => {
  // Reset JobCard reminder if status changes away from Job Card or counter becomes > 0
  if (formState.arrivalStatus.leadStatus !== 'Job Card' || statusCounterData.job_card_count > 0) {
    setHasShownJobCardReminder(false);
  }
  
  // Reset Estimate reminder if status changes away from Payment Due or counter becomes > 0
  if (formState.arrivalStatus.leadStatus !== 'Payment Due' || statusCounterData.payment_due_count > 0) {
    setHasShownEstimateReminder(false);
  }
}, [formState.arrivalStatus.leadStatus, statusCounterData.job_card_count, statusCounterData.payment_due_count]);

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
const handleGSTHeaderClick = () => {
  const newTableData = formState.overview.tableData.map(row => {
    const quantity = row.quantity || 1;
    let baseTotal;
    if (row.pricePerItem !== undefined) {
      baseTotal = row.pricePerItem * quantity;
    } else {
      const prevGST = parseFloat(row.gst ?? 18);
      baseTotal = prevGST > 0 ? (parseFloat(row.total) / (1 + prevGST / 100)) : parseFloat(row.total);
    }
    return {
      ...row,
      gst: 0,
      total: Math.round(baseTotal) // Ensure integer
    };
  });
  setFormState(prev => ({
    ...prev,
    overview: {
      ...prev.overview,
      tableData: newTableData,
      total: calculateTotalAmount(newTableData),
      finalAmount: calculateTotalAmount(newTableData) - (parseFloat(discount) || 0)
    }
  }));
};
const handleClick2Call = async (receiverNo) => {
  try {
    const response = await axios.post(
      'https://admin.onlybigcars.com/api/click2call/',
      { receiver_no: receiverNo },
      { headers: { Authorization: `Token ${token}` } }
    );
    
    // Use toast for success notification
    toast.success(response.data.message || 'Call initiated!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  } catch (error) {
    // Use toast for error notification instead of setError
    toast.error('Failed to initiate call: ' + (error.response?.data?.error || error.message), {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};
// handleGSTChange
const handleGSTChange = (index, value) => {
  const newGST = parseFloat(value) || 0;
  const newTableData = [...formState.overview.tableData];
  const row = newTableData[index];

  // Only update if GST value actually changed
  if (row.gst === newGST) return;

  // Calculate base price (without GST)
  const quantity = row.quantity || 1;
  let baseTotal;
  if (row.pricePerItem !== undefined) {
    baseTotal = row.pricePerItem * quantity;
  } else {
    // Remove previous GST if present
    const prevGST = parseFloat(row.gst ?? 18);
    baseTotal = prevGST > 0 ? (parseFloat(row.total) / (1 + prevGST / 100)) : parseFloat(row.total);
  }

  // Calculate new total with new GST
  const totalWithGST = Math.round(baseTotal + (newGST > 0 ? (baseTotal * newGST / 100) : 0));

  newTableData[index] = {
    ...row,
    gst: newGST,
    total: totalWithGST
  };

  setFormState(prev => ({
    ...prev,
    overview: {
      ...prev.overview,
      tableData: newTableData,
      total: calculateTotalAmount(newTableData),
      finalAmount: calculateTotalAmount(newTableData) - (parseFloat(discount) || 0)
    }
  }));
};
  

  // Update the calculateTotalAmount function
const calculateTotalAmount = (tableData) => {
  const sum = tableData.reduce((sum, row) => {
    const quantity = parseInt(row.quantity) || 1;
    const price = parseFloat(row.pricePerItem || row.total / quantity) || 0;
    const baseTotal = price * quantity;
    const gst = parseFloat(row.gst ?? 18);
    const totalWithGST = baseTotal + (gst > 0 ? (baseTotal * gst / 100) : 0);
    return sum + totalWithGST;
  }, 0);
  return Math.round(sum); // round here
};

  // Modify handleTotalChange to preserve price per item
const handleTotalChange = (index, value) => {
  const newTableData = [...formState.overview.tableData];
  const newBaseTotal = value === '' ? 0 : Math.round(parseFloat(value) || 0); // round here
  const quantity = newTableData[index].quantity || 1;
  newTableData[index].gst = 0;
  newTableData[index].pricePerItem = newBaseTotal / quantity;
  newTableData[index].total = newBaseTotal;

  const newTotalAmount = calculateTotalAmount(newTableData);

  setFormState(prev => ({
    ...prev,
    overview: {
      ...prev.overview,
      tableData: newTableData,
      total: newTotalAmount,
      finalAmount: newTotalAmount
    },
    basicInfo: {
      ...prev.basicInfo,
      total: newTotalAmount
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

  const [userLocation, setUserLocation] = useState(null);

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
    setUserLocation({
      lat: addressData.lat,
      lng: addressData.lng
    });
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
    


  const serviceKey = `${service.id}-${service.title}`;
  let servicePrice = 0;
  if (servicePrices[serviceKey] && servicePrices[serviceKey] !== "Determine") {
    const priceString = servicePrices[serviceKey].replace('₹', '');
    servicePrice = parseFloat(priceString) || 0;
  }
  const gst = 18;
  const totalWithGST = Math.round(servicePrice + (gst > 0 ? (servicePrice * gst / 100) : 0));

  const newTableRow = {
    type: selectedService,
    name: service.title,
    workdone: cleanWorkdone(),
    determined: false,
    quantity: 1,
    pricePerItem: servicePrice,
    gst: gst,
    total: totalWithGST // <-- total includes GST
  };

  const newTableData = [...formState.overview.tableData, newTableRow];

  setFormState(prev => ({
    ...prev,
    overview: {
      ...prev.overview,
      tableData: newTableData,
      total: calculateTotalAmount(newTableData),
      finalAmount: calculateTotalAmount(newTableData)
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
          `https://admin.onlybigcars.com/api/customers/${value}/`,
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
  
        const customerData = response.data;

        const cars = customerData.cars || [];
        
        
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
          cars: cars || [] // Set all cars from the customer data
        }));
         // If we have cars, select the first one by default
         if (customerData.cars && customerData.cars.length > 0) {
          setSelectedCarIndex(0);
        }
      
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error fetching customer data:', error);
        }
      }
    }
  };

 
  
  const handleAddCar = (carData, isEdit) => {
    console.log("handleAddCar called with:", carData, "isEdit:", isEdit); // Log input
    console.log("Current carBrandsData:", carBrandsData); // Log available brand data

    // Find the image URL from carBrandsData
    let imageUrl = null; // Default to null
    const brandData = carBrandsData.find(b => b.name === carData.carBrand); // Case-insensitive comparison
    if (!carBrandsData || carBrandsData.length === 0) {
  alert("Car brand data not loaded yet. Please wait a moment and try again.");
  return;
}
    console.log("Found brandData:", brandData); // Log found brand

    if (brandData) {
        // Ensure brandData.models is an array before using find
        const modelsArray = Array.isArray(brandData.models) ? brandData.models : [];
        const modelData = modelsArray.find(m => m.name === carData.carModel);
        console.log("Found modelData:", modelData); // Log found model

        if (modelData && modelData.image_url) {
            imageUrl = modelData.image_url;
            console.log("Found imageUrl:", imageUrl); // Log the found URL
        } else {
            console.warn("imageUrl not found in modelData or modelData is missing.");
        }
    } else {
        console.warn("brandData not found for:", carData.carBrand);
    }

    // Log if image URL wasn't found (for debugging)
    if (!imageUrl) {
        console.warn(`Final imageUrl for ${carData.carBrand} ${carData.carModel} is null. Using default.`);
    }

    // Add the imageUrl to the carData object
    const carWithImage = { ...carData, imageUrl: imageUrl };
    console.log("Car object being added/updated:", carWithImage); // Log the final car object

    setFormState(prev => {
        // ... (rest of the state update logic remains the same) ...
        let updatedCars;
        let editIndex = -1; // Initialize editIndex

        if (isEdit && editingCar) {
            // Find the index using a reliable unique identifier (id)
             editIndex = prev.cars.findIndex(car => car.id === editingCar.id);

            if (editIndex !== -1) {
                updatedCars = [...prev.cars];
                // Ensure existing car data is preserved, only update fields from carWithImage
                updatedCars[editIndex] = { ...updatedCars[editIndex], ...carWithImage };
            } else {
                console.warn("Editing car not found in state, adding as new.");
                // Add as new if not found, generate a temporary client-side ID if needed
                const newCar = { ...carWithImage, id: `temp-${Date.now()}` };
                updatedCars = [...prev.cars, newCar];
                editIndex = updatedCars.length - 1; // Set index to the newly added car
            }
        } else {
            // Check if car already exists (optional, prevents duplicates on add)
            const exists = prev.cars.some(car =>
                car.carBrand === carWithImage.carBrand &&
                car.carModel === carWithImage.carModel &&
                car.year === carWithImage.year &&
                car.regNo === carWithImage.regNo // Add more fields if needed for uniqueness
            );
            if (!exists) {
                 // Add new car with image, generate a temporary client-side ID if needed
                 const newCar = { ...carWithImage, id: `temp-${Date.now()}` };
                 updatedCars = [...prev.cars, newCar];
                 editIndex = updatedCars.length - 1; // Set index to the newly added car
            } else {
                 console.warn("Attempted to add a duplicate car.");
                 updatedCars = [...prev.cars]; // Keep existing cars if duplicate
                 // Find the index of the existing car to select it
                 editIndex = prev.cars.findIndex(car =>
                    car.carBrand === carWithImage.carBrand &&
                    car.carModel === carWithImage.carModel &&
                    car.year === carWithImage.year &&
                    car.regNo === carWithImage.regNo
                 );
            }
        }

        // Ensure selectedCarIndex is valid after adding/editing
        const newSelectedCarIndex = editIndex !== -1 ? editIndex : Math.max(0, updatedCars.length - 1);
        setSelectedCarIndex(newSelectedCarIndex); // Update selectedCarIndex state

        return {
            ...prev,
            cars: updatedCars
        };
    });
    setShowAddCarModal(false);
    setEditingCar(null);
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

  // For non-admin users, enforce all validations
  if (!isAdmin) {
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

    if(formState.basicInfo.cceComments.length < 30) { 
      errors.cceComments = 'CCE Comments should be at least 30 characters long';
    }
    
    // Table rows validation
    if (!formState.overview.tableData || formState.overview.tableData.length === 0) {
      errors.table = 'At least one service must be added to the overview table';
    }
  } else {
    // For admin users, only validate mobile number as it's essential for the system
    if (!formState.customerInfo.mobileNumber || formState.customerInfo.mobileNumber.trim() === '') {
      errors.required = (
        <ul>
          <li>Mobile number is required even for admin users</li>
        </ul>
      );
    }
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

  //  Check if the previous status is "Completed"
  if (location.state?.previousStatus === "Completed") {
    setShowPopup(true);
    return;
  }

  // Set the current car index
  setSelectedCarIndex(currentCarIndex);

    setIsSubmitting(true);
    
    const errors = validateForm();



        // Inside the handleSubmit function, replace the car selection code with this:

// // Create a deep copy of the form state
// const formData = JSON.parse(JSON.stringify(formState));

// // Debug the cars array and selected index before processing
// alert(`Before selection:
// Number of cars: ${formData.cars.length}
// Selected index: ${selectedCarIndex}
// First car: ${formData.cars[0]?.carBrand} ${formData.cars[0]?.carModel}
// ${formData.cars.length > 1 ? 'Second car: ' + formData.cars[1]?.carBrand + ' ' + formData.cars[1]?.carModel : ''}
// `);

// // Use only the selected car (corrected code)
// if (formData.cars.length > 0) {
//   // Make sure selectedCarIndex is valid and within bounds
//   if (selectedCarIndex >= 0 && selectedCarIndex < formData.cars.length) {
//     const selectedCar = formData.cars[selectedCarIndex];
//     formData.cars = [selectedCar];
//   } else {
//     // Fallback to the first car if index is invalid
//     formData.cars = [formData.cars[0]];
//   }
// }



// // Debug the result after selection
// alert(`After selection:
// Selected car: ${formData.cars[0]?.carBrand} ${formData.cars[0]?.carModel}
// Cars array length: ${formData.cars.length}
// `);


    
    
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
  

    // Check if reminder should be shown BEFORE proceeding with save
  const shouldShowReminder = checkAndShowReminder();
  if (shouldShowReminder) {
    setIsSubmitting(false);
    return; // Don't proceed with save, show reminder first
  }




// Create a deep copy of submission data
const submissionData = JSON.parse(JSON.stringify(formState));


  
// Starting from here - copy paste update


// const formatBold = (text) => `*${text}*`;

// const formatColumns = (label, value, bold = false) => {
//   const leftCol = label.padEnd(10);  // Left-aligned, 20 chars wide
//   const rightCol = (value || 'N/A').padStart(15);  // Right-aligned, 25 chars wide
//   return bold ? formatBold(`${leftCol}${rightCol}`) : `${leftCol}${rightCol}`;
// };

// const formatMultiLine = (label, value, bold = false) => {
//   const lines = [
//     label,
//     value || 'N/A'
//   ];
//   return bold ? lines.map(line => formatBold(line)).join('\n') : lines.join('\n');
// };



 

const formatBold = (text) => `*${text}*`;
const formatColumns = (label, value, bold = false) => {
  const leftCol = label;
  const rightCol = value || 'N/A';
  // Add exactly 4 spaces between label and value
  const spacing = '    '; // 4 spaces
  return `${leftCol}${spacing}${bold ? formatBold(rightCol) : rightCol}`;
};

const formatMultiLine = (label, value, bold = false) => {
  const formattedValue = bold ? formatBold(value || 'N/A') : (value || 'N/A');
  const lines = [
    label,
    formattedValue
  ];
  return lines.join('\n');
};


const formatCarDetails = (cars) => {
  if (!cars || cars.length === 0) return ['N/A', 'N/A'];
  const car = cars[0];
  const carName = `${car.carBrand} ${car.carModel}`;
  const variantDetails = `${car.year} ${car.fuel}`;
  return [carName, variantDetails];
};
const formattedData = [
  formatColumns('Name:', (formState.customerInfo.customerName || '').trim(), true),
  formatColumns('Number:', (formState.customerInfo.mobileNumber || '').trim(), true),
  '',
  formatColumns('Car:', formState.cars[selectedCarIndex] ? `${formState.cars[selectedCarIndex].carBrand} ${formState.cars[selectedCarIndex].carModel}`.trim() : 'N/A', true),
  formatColumns('Variant:', formState.cars[selectedCarIndex] ? `${formState.cars[selectedCarIndex].year} ${formState.cars[selectedCarIndex].fuel}`.trim() : 'N/A', true),
  '',
  formatColumns('Vin No.:', formState.cars[selectedCarIndex]?.chasisNo),
  formatColumns('Reg No.:', formState.cars[selectedCarIndex]?.regNo),
  formatColumns('Arrival:', (formState.arrivalStatus.arrivalMode || '').trim(), true),
  formatColumns('Date:', formState.arrivalStatus.dateTime ? formState.arrivalStatus.dateTime.replace('T', ' ').trim() : '', true),
  '',
  formatColumns('Add:', (formState.location.address || '').trim(), true),
  '',
  formatMultiLine('Map Link:', (formState.location.mapLink || '').trim(), true),
  '',
  formatColumns('Work Summary:', formState.overview.tableData.map(item => item.name).join(', ').trim(), true),
  '',
  formatColumns('Total Amount:', `₹${formState.overview.finalAmount}`.trim(), true),
  '',
  formatMultiLine('Workshop Name:', (formState.workshop.name || '').trim()),
  '',
  formatColumns('Lead Status:', formState.arrivalStatus.leadStatus, true),
  formatColumns('Lead Source:', formState.customerInfo.source, true),
  formatColumns('Office CCE:', formState.basicInfo.cceName, true),
  formatColumns('Technician:', formState.basicInfo.caName, true),
  '',
  formatColumns('Lead ID:', id ? id : formatLeadId(formState.customerInfo.mobileNumber, seqNum))
].join('\n');
  
         // Copy to clipboard
         try {
             await navigator.clipboard.writeText(formattedData);
             
         } catch (error) {
             console.error("Clipboard error:", error);
             
         }

         // Add this before the axios call in handleSubmit
         // Clean up and format overview data before submission
const cleanedOverview = {
  ...submissionData.overview,
  total: parseFloat(submissionData.overview.total) || 0,
  discount: parseFloat(submissionData.overview.discount) || 0,
  finalAmount: parseFloat(submissionData.overview.finalAmount) || 0,
  tableData: submissionData.overview.tableData.map(item => ({
    ...item,
    total: parseFloat(item.total) || 0,
    determined: !!item.determined
  }))
};

submissionData.overview = cleanedOverview;
         
         try {
           const formDataToSubmit = {
             ...submissionData,
             leadId: formatLeadId(submissionData.customerInfo.mobileNumber, seqNum)
            };
            
            console.log("Form data being submitted:", JSON.stringify(formDataToSubmit, null, 2));
     

  // Ensure only the selected car is included in the submission
  if (submissionData.cars && submissionData.cars.length > 0) {
    // Use a safe index (if selectedCarIndex is out of bounds, use 0)
    const safeIndex = Math.min(selectedCarIndex, submissionData.cars.length - 1);
    // Extract just the selected car
    const selectedCar = submissionData.cars[safeIndex];
    // Replace the cars array with just the selected car
    submissionData.cars = [selectedCar];
  }
  

  const formData = new FormData();

  // Create a copy of submissionData to include existing images
  const formDataWithImages = {
    ...submissionData,  // <-- Use submissionData instead of formState
    // Add the existing images to the data being sent
    existingImages: existingImageUrls
  };
  
  // Add form data as JSON (including existingImages)
  formData.append('data', JSON.stringify(formDataWithImages));
    
 // Add new images if any
 if (selectedImages.length > 0) {
   setIsUploadingImages(true);
   selectedImages.forEach(image => {
     formData.append('images', image);
   });
 }


        const url = id 
            ? `https://admin.onlybigcars.com/api/leads/${id}/update/`
            : 'https://admin.onlybigcars.com/api/edit-form-submit/';
            
        const method = id ? 'put' : 'post';
        
        // const response = await axios[method](
        //     url,
        //     formDataToSubmit,
        //     {
        //         headers: {
        //             'Authorization': `Token ${token}`,
        //             'Content-Type': 'application/json'
        //         }
        //     }
        // );

        const response = await axios({
          method: id ? 'put' : 'post',
          url: url,
          data: formData,
          headers: {
            'Authorization': `Token ${token}`,
            // Don't set Content-Type when using FormData - it will be set automatically with boundary
          }
        });
        
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
        description: "<ul><li>AC Filter Cleaning</li><li>AC Vent Cleaning</li><li>AC Gas (upto 400 grams)</li><li>Condenser Cleaning</li><li>AC Inspection</li></ul>",
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

const handleDeleteCar = (index) => {
  setFormState(prev => {
    const newCars = [...prev.cars];
    newCars.splice(index, 1);
    
    return {
      ...prev,
      cars: newCars
    };
  });
  
  // If the selected car is deleted, select the first car
  if (selectedCarIndex === index) {
    setSelectedCarIndex(0);
  } 
  // If the deleted car was before the selected one, adjust the index
  else if (selectedCarIndex > index) {
    setSelectedCarIndex(selectedCarIndex - 1);
  }
};

// Add this to your CarCard component
{/* <button
  className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500"
  onClick={(e) => {
    e.stopPropagation();
    handleDeleteCar(index);
  }}
>
  <FaTimes size={16} />
</button> */}
  
  // Get all service cards flattened into a single array
  const allServices = Object.values(serviceCards).flat();
  // Modified search handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Modify the overview table section in the return statement to include row deletion
  const handleDeleteRow = (index) => {
    const newTableData = formState.overview.tableData.filter((_, i) => i !== index); //14-2
    const newTotal = calculateTotalAmount(newTableData) || 0;
    setFormState(prev => ({
      ...prev,
      overview: {
        ...prev.overview,
        tableData: newTableData,
        total: calculateTotalAmount(newTableData) || 0,
        finalAmount: calculateTotalAmount(newTableData) 
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
  // const getDisplayCards = () => {
  //   if (!selectedService || !serviceCards[selectedService]) {
  //     return [];
  //   }
  //   return serviceCards[selectedService];
  // };

  const getDisplayCards = useCallback(() => {
    if (!selectedService || !serviceCards[selectedService]) {
      return [];
    }
    return serviceCards[selectedService];
  }, [selectedService]); // Only depend on selectedService
  

   // Simplified implementation to prevent infinite updates
// const filteredServices = useMemo(() => {
//   const baseServices = serviceCards[selectedService] || [];
//   if (!searchQuery) {
//     return baseServices;
//   }
//   return baseServices.filter(service =>
//     service.title.toLowerCase().includes(searchQuery.toLowerCase())
//   );
// }, [searchQuery, selectedService]); // Remove serviceCards from dependencies

const filteredServices = useMemo(() => {
  if (!searchQuery) {
    return getDisplayCards();
  }
  
  // Only flatten the services when actually searching
  const allServices = Object.values(serviceCards).flat();
  return allServices.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [searchQuery, getDisplayCards]); // No longer depends on serviceCards


  const [showAlert, setShowAlert] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const [isOpenLeft, setIsOpenLeft] = useState(false); // Set to true by default to show status history
  
  const [source, setSource] = useState('Checkout');
  const [customer, setCustomer] = useState('Customer');
  const [customerNumber, setCustomerNumber] = useState('6381234057');
  const [dateValue, setDateValue] = useState('')
  const [showGaragePopup, setShowGaragePopup] = useState(false);
   const [carBrandsData, setCarBrandsData] = useState([]); 
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

  // Car Card Component with Delete Button
// Update the CarCard component styling:

const CarCard = ({ car, index, isSelected, onEdit, onDelete }) => (
  <div 
    className={`border ${isSelected ? 'border-red-500 shadow-md' : 'border-gray-200'} 
               rounded-lg p-4 bg-white relative transition-all 
               hover:shadow-lg ${isSelected ? 'scale-102' : 'hover:scale-101'}`}
  >
    <input 
      type="radio"
      name="selectedCar"
      checked={isSelected}
      onChange={() => {}} // This will be handled by parent div click
      className="absolute top-2 left-2 z-10"
    />
    <div className="mt-6">
    <img
      src={car.imageUrl || "https://onlybigcars.com/wp-content/uploads/2024/12/image_22.jpeg"} // Use car.imageUrl or a default placeholder
      alt={`${car.carBrand || 'Car'} ${car.carModel || ''}`}
      className="mb-2 h-32 w-full object-contain rounded" // Added height, width, object-fit, and rounded corners
      onError={(e) => { e.target.onerror = null; e.target.src="https://onlybigcars.com/wp-content/uploads/2024/12/image_22.jpeg"; }} // Fallback on image load error
    />
      <div className='flex justify-between'>
        <div>
          <div className="text-sm font-medium">{`${car.carBrand} ${car.carModel}`}</div>
          <div className="text-xs text-gray-600">{`${car.fuel} ${car.year} ${car.regNo || ''}`}</div>
          <div className="text-xs text-gray-500">{car.chasisNo}</div>
        </div>
        <div className="flex flex-col space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <FaTimes size={16} />
          </button>
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

  
// Add new handler for quantity changes
// Add this function to handle quantity changes
const handleQuantityChange = (index, value) => {
  const newQuantity = parseInt(value) || 1; // Default to 1 if invalid
  const newTableData = [...formState.overview.tableData];
  
  // Store the original price per item if not already saved
  if (!newTableData[index].pricePerItem) {
    newTableData[index].pricePerItem = parseFloat(newTableData[index].total) || 0;
  }
  
  // Update quantity
  newTableData[index].quantity = newQuantity;
  
  // Calculate new row total based on price per item × quantity
  const pricePerItem = newTableData[index].pricePerItem;
  newTableData[index].total = pricePerItem * newQuantity;
  
  // Update form state with new table data and recalculated totals
  setFormState(prev => ({
    ...prev,
    overview: {
      ...prev.overview,
      tableData: newTableData,
      total: calculateTotalAmount(newTableData),
      finalAmount: calculateTotalAmount(newTableData) - (parseFloat(discount) || 0)
    },
    basicInfo: {
      ...prev.basicInfo,
      total: calculateTotalAmount(newTableData)
    }
  }));
};


// Add this function after other state definitions
const handleAddEmptyRow = () => {
  const emptyRow = {
  type: 'Service',
  name: 'Sub Service',
  comments: '',
  workdone: 'Work to be done',
  determined: false,
  quantity: 1,
  total: 0,
  gst: 18 // <-- new field
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

const handleOpenWarrantyPopup = () => {
  console.log('Opening warranty popup');
  setWarrantyDetails({ // Populate with existing warranty from form state
    warranty: formState.warranty || '',
  });
  setShowWarrantyPopup(true);
};

const handleWarrantyInputChange = (value) => {
  setWarrantyDetails({ warranty: value });
};

const handleSaveWarranty = () => {
  setFormState(prev => ({
    ...prev,
    warranty: warrantyDetails.warranty
  }));
  setShowWarrantyPopup(false);
  toast.info("Warranty saved. Click the main save button to persist changes.");
};


const handleRephraseWarranty = async () => {
  if (!warrantyDetails.warranty || !warrantyDetails.warranty.trim()) {
      toast.warn('Please enter some text to rephrase.', { position: "top-right" });
      return;
  }

  setIsRephrasing(true);
  try {
      const response = await axios.post(
          'https://admin.onlybigcars.com/api/rephrase-text/',
          { text: warrantyDetails.warranty },
          {
              headers: {
                  'Authorization': `Token ${token}`,
              }
          }
      );

      if (response.data && response.data.rephrased_text) {
          handleWarrantyInputChange(response.data.rephrased_text);
          console.log('Rephrased text:', response.data.rephrased_text);
          toast.success('Text rephrased successfully!', { position: "top-right" });
      } else {
          toast.error(response.data.error || 'Failed to get rephrased text.', { position: "top-right" });
      }
  } catch (error) {
      console.error('Error rephrasing text:', error);
      toast.error(error.response?.data?.error || 'An error occurred while rephrasing.', { position: "top-right" });
  } finally {
      setIsRephrasing(false);
  }
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

// const statusHierarchy = [
//   "test", "Assigned", "Follow Up", "Dead", "Communicate To Ops", 
//   "Referred To Ops", "Converted", "At Workshop", 
//   "Walkin", "Pickup", "Doorstep", "Job Card", "Estimate", "Bill", "Completed"
// ];

// // Function to check if an option should be disabled
// const shouldDisableOption = (optionValue, previousStatus) => {
//   if (!previousStatus) return false;
  
//   const previousIndex = statusHierarchy.indexOf(previousStatus);
//   const optionIndex = statusHierarchy.indexOf(optionValue);
  
//   // If previous status was one of these, disable all options before it
//   if (["Job Card", "Estimate", "Bill", "Completed"].includes(previousStatus)) {
//     return optionIndex < previousIndex;
//   }
  
//   return false;
// };
const statusHierarchy = [
  "test","Assigned", "Follow Up", "Dead", "Communicate To Ops", 
 "Referred To Ops", "Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep", "Completed", "Job Card", "Estimate","Payment Due" ,"Commision Due"
];
const statusHierarchy1 = [
  "test", "Assigned","Follow Up", "Dead", "Communicate To Ops", 
 "Referred To Ops" ,"Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep",  "Estimate", "Completed","Payment Due" ,"Commision Due" ,"Job Card"
];
const statusHierarchy2 = [
  "test", "Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep",  "Estimate","Payment Due" ,"Commision Due" ,"Job Card", "Completed","Assigned","Follow Up", "Dead", "Communicate To Ops", 
 "Referred To Ops" ,"Duplicate"
];
const statusHierarchy3 = [
  "test", "Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep",  "Estimate","Payment Due" ,"Commision Due" ,"Job Card", "Completed","Follow Up","Assigned", "Dead", "Communicate To Ops", 
 "Referred To Ops" ,"Duplicate"
];
const statusHierarchy4 = [
  "test", "Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep",  "Estimate","Payment Due" ,"Commision Due" ,"Job Card", "Completed","Dead","Assigned","Follow Up",  "Communicate To Ops", 
 "Referred To Ops" ,"Duplicate"
];
const statusHierarchy5 = [
  "test", "Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep",  "Estimate","Payment Due" ,"Commision Due" ,"Job Card", "Completed","Assigned","Follow Up", "Dead", "Communicate To Ops", 
 "Referred To Ops" ,"Duplicate"
];
const statusHierarchy6 = [
  "test",  "At Workshop", "Job Card",
  "Payment Due", "Commision Due", "Completed",
  "Walkin", "Pickup", "Doorstep","Communicate To Ops","Referred To Ops", "Assigned", "Follow Up", "Dead", "Duplicate", 
];
const statusHierarchy7 = [
  "test",  "At Workshop", "Job Card",
  "Payment Due", "Commision Due", "Completed",
  "Referred To Ops", "Walkin", "Pickup", "Doorstep","Assigned", "Follow Up", "Dead", "Duplicate", "Communicate To Ops",
];
const statusHierarchy8 = [
  "test", "Payment Due", "Commision Due", "Completed","Walkin", "At Workshop", "Job Card",
  "Referred To Ops",  "Pickup", "Doorstep","Assigned", "Follow Up", "Dead", "Duplicate", "Communicate To Ops",
];
const statusHierarchy9 = [
  "test", "Payment Due", "Commision Due", "Completed", "Pickup","Walkin", "At Workshop", "Job Card",
  "Referred To Ops",  "Doorstep","Assigned", "Follow Up", "Dead", "Duplicate", "Communicate To Ops",
];
const statusHierarchy10 = [
  "test", "Payment Due", "Commision Due", "Completed",  "Doorstep","Pickup","Walkin", "At Workshop", "Job Card",
  "Referred To Ops", "Assigned", "Follow Up", "Dead", "Duplicate", "Communicate To Ops",
];
const statusHierarchy11 = [
  "test", "Payment Due", "Commision Due", "Completed", "At Workshop",  "Doorstep","Pickup","Walkin", "Job Card",
  "Referred To Ops", "Assigned", "Follow Up", "Dead", "Duplicate", "Communicate To Ops",
];// Function to check if an option should be disabled
const statusHierarchy12 = [
 "test", "Assigned","Follow Up", "Dead", "Communicate To Ops", 
 "Referred To Ops" ,"Converted", "At Workshop", 
 "Walkin", "Pickup", "Doorstep",  "Estimate","Commision Due" ,"Payment Due" ,"Job Card", "Completed"
];// Function to check if an option should be disabled
const shouldDisableOption = (optionValue, previousStatus) => {
  
  if (!previousStatus) {
    const previousIndex2 = statusHierarchy2.indexOf("Assigned");
    const optionIndex2 = statusHierarchy2.indexOf(optionValue);
    return optionIndex2 < previousIndex2;
  }

 const previousIndex = statusHierarchy.indexOf(previousStatus);
 const optionIndex = statusHierarchy.indexOf(optionValue);
 const previousIndex1 = statusHierarchy1.indexOf(previousStatus);
 const optionIndex1 = statusHierarchy1.indexOf(optionValue);
 const previousIndex2 = statusHierarchy2.indexOf(previousStatus);
 const optionIndex2 = statusHierarchy2.indexOf(optionValue);
 const previousIndex3 = statusHierarchy3.indexOf(previousStatus);
 const optionIndex3 = statusHierarchy3.indexOf(optionValue);
 const previousIndex4 = statusHierarchy4.indexOf(previousStatus);
 const optionIndex4 = statusHierarchy4.indexOf(optionValue);
 const previousIndex5 = statusHierarchy5.indexOf(previousStatus);
 const optionIndex5 = statusHierarchy5.indexOf(optionValue);
 const previousIndex6 = statusHierarchy6.indexOf(previousStatus);
 const optionIndex6 = statusHierarchy6.indexOf(optionValue);
 const previousIndex7 = statusHierarchy7.indexOf(previousStatus);
 const optionIndex7 = statusHierarchy7.indexOf(optionValue);
 const previousIndex8 = statusHierarchy8.indexOf(previousStatus);
 const optionIndex8 = statusHierarchy8.indexOf(optionValue);
 const previousIndex9 = statusHierarchy9.indexOf(previousStatus);
 const optionIndex9 = statusHierarchy9.indexOf(optionValue);
 const previousIndex10 = statusHierarchy10.indexOf(previousStatus); 
 const optionIndex10 = statusHierarchy10.indexOf(optionValue); // If previous status was one of these, disable all options before it
 const previousIndex11 = statusHierarchy11.indexOf(previousStatus); 
 const optionIndex11 = statusHierarchy11.indexOf(optionValue); // If previous status was one of these, disable all options before it
 const previousIndex12 = statusHierarchy12.indexOf(previousStatus); 
 const optionIndex12 = statusHierarchy12.indexOf(optionValue); // If previous status was one of these, disable all options before it
 if (["Job Card"].includes(previousStatus)) {
   return optionIndex < previousIndex;
 }
 if (["Estimate"].includes(previousStatus)) {
   return optionIndex1 < previousIndex1;
 }
 if (["Completed"].includes(previousStatus)) {
   return optionIndex1 < previousIndex1;
 }
 if (["Payment Due"].includes(previousStatus)) {
   return optionIndex1 < previousIndex1;
 }
 if (["Commision Due"].includes(previousStatus)) {
   return optionIndex12 < previousIndex12;
 }
 if (["Assigned"].includes(previousStatus)) {
   return optionIndex2 < previousIndex2;
 }

 if (["Follow Up"].includes(previousStatus)) {
   return optionIndex3 < previousIndex3;
 }
 if (["Dead"].includes(previousStatus)) {
   return optionIndex4 < previousIndex4;
 }
 if (["Duplicate"].includes(previousStatus)) {
   return optionIndex5 < previousIndex5;
 }
 if (["Communicate To Ops"].includes(previousStatus)) {
   return optionIndex6 < previousIndex6;
 }
 if (["Referred To Ops"].includes(previousStatus)) {
   return optionIndex7 < previousIndex7;
 } 
 if (["Walkin"].includes(previousStatus)) {
   return optionIndex8 < previousIndex8;
 } 
 if (["Pickup"].includes(previousStatus)) {
   return optionIndex9 < previousIndex9;
 } 
 if (["Doorstep"].includes(previousStatus)) {
   return optionIndex10 < previousIndex10;
 } 
 if (["At Workshop"].includes(previousStatus)) {
   return optionIndex11 < previousIndex11;
 } return false;
};


const sellBuyStatusFlow = [
  "Purchase",
  "S/B At Workshop",
  "RFS",
  "Sold",
  "S/B Commision Due",
  "Purchase Due",
  "S/B Completed"
];

function getNextSellBuyStatus(previousStatus) {
  if (!previousStatus) return sellBuyStatusFlow[0]; // No previous, start with "Purchase"
  const idx = sellBuyStatusFlow.indexOf(previousStatus);
  if (idx === -1 || idx === sellBuyStatusFlow.length - 1) return null; // Not found or already at last
  return sellBuyStatusFlow[idx + 1];
}


const fetchCustomerData = async (mobileNumber) => {
  try {
    const response = await fetch(`https://admin.onlybigcars.com/api/customers/${mobileNumber}`, {
      headers: {
        'Authorization': `Token ${token}`,
      }
    });
    // Update formState with customer cars
    if (response.data.cars && response.data.cars.length > 0) {
      setFormState(prev => ({
        ...prev,
        cars: response.data.cars, // Set all cars from customer data
        // Other customer fields already being set
      }));
      
      // Set the first car as selected by default
      setSelectedCarIndex(0);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    return null;
  }
};

const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
const [isGeneratingWxBill, setIsGeneratingWxBill] = useState(false); // Add this
const handleGenerateCard = async () => {
  console.log('pdf function is called');
  setIsGeneratingPDF(true); // Start animation
  setShowJobCard(true);
  try {
    // Wait longer for component to fully render
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    if (jobCardRef.current) {
      await jobCardRef.current.generatePDF();
      console.log("Pdf is generated");
    } else {
      throw new Error('Job card reference not available');
    }
  } catch (error) {
    console.error('Error generating job card:', error);
  } finally {
    setIsGeneratingPDF(false); // Stop animation regardless of outcome
  }
};

const [isGeneratingBill, setIsGeneratingBill] = useState(false);

// const handleSendJobCard = async () => {
//   if (!formState.customerInfo.whatsappNumber && !formState.customerInfo.mobileNumber) {
//     toast.error('No WhatsApp number found for customer', {
//       position: "top-right",
//       autoClose: 3000,
//     });
//     return;
//   }

//   setIsSendingJobCard(true);
//   setShowJobCard(true);
  
//   try {
//     // Wait for component to render
//     await new Promise(resolve => setTimeout(resolve, 4000));
    
//     if (jobCardRef.current) {
//       // Generate PDF blob
//       const pdfBlob = await jobCardRef.current.generatePDFBlob();
      
//       if (!pdfBlob) {
//         throw new Error('Failed to generate PDF blob');
//       }

//       // Prepare form data to send to backend
//       const formData = new FormData();
//       formData.append('pdf', pdfBlob, `JobCard-${formState.customerInfo.customerName || 'Customer'}.pdf`);
//       formData.append('whatsapp_number', formState.customerInfo.whatsappNumber || formState.customerInfo.mobileNumber);
//       formData.append('customer_name', formState.customerInfo.customerName || 'Customer');
//       formData.append('lead_id', id || '');

//       // Send to backend
//       const response = await axios.post(
//         'https://admin.onlybigcars.com/api/send-jobcard/',
//         formData,
//         {
//           headers: {
//             'Authorization': `Token ${token}`,
//             'Content-Type': 'multipart/form-data',
//           }
//         }
//       );

//       if (response.data.success) {
//         toast.success('JobCard sent successfully to customer!', {
//           position: "top-right",
//           autoClose: 3000,
//         });
//       } else {
//         toast.error(response.data.message || 'Failed to send JobCard', {
//           position: "top-right",
//           autoClose: 3000,
//         });
//       }
//     } else {
//       throw new Error('JobCard reference not available');
//     }
//   } catch (error) {
//     console.error('Error sending JobCard:', error);
//     toast.error('Failed to send JobCard: ' + (error.response?.data?.message || error.message), {
//       position: "top-right",
//       autoClose: 4000,
//     });
//   } finally {
//     setIsSendingJobCard(false);
//     setShowJobCard(false);
//   }
// };


// const handleGenerateBill = async () => {
//   setShowBill(true);
//   try {
//     // Wait longer for component to fully render
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     if (billRef.current) {
//       await billRef.current.generatePDF();
    
//     } else {
//       throw new Error('Job card reference not available');
//     }
//   } catch (error) {
//     console.error('Error generating job card:', error);
//   } 
// };

// ...existing code...

const handleSendJobCard = async () => {
  if (!formState.customerInfo.whatsappNumber && !formState.customerInfo.mobileNumber) {
    toast.error('No WhatsApp number found for customer', {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }

  setIsSendingJobCard(true);
  setShowJobCard(true);
  
  try {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    if (jobCardRef.current) {
      // Generate PDF blob
      const pdfBlob = await jobCardRef.current.generatePDFBlob();
      
      if (!pdfBlob) {
        throw new Error('Failed to generate PDF blob');
      }

      // Prepare form data to send to backend
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `JobCard-${formState.customerInfo.customerName || 'Customer'}.pdf`);
      formData.append('whatsapp_number', formState.customerInfo.whatsappNumber || formState.customerInfo.mobileNumber);
      formData.append('customer_name', formState.customerInfo.customerName || 'Customer');
      formData.append('lead_id', id || '');
      
      // Add car details for dynamic filename
      formData.append('car_brand', formState.cars[0]?.carBrand || '');
      formData.append('car_model', formState.cars[0]?.carModel || '');
      formData.append('order_id', formState.arrivalStatus.orderId || '');

      console.log('Sending JobCard request with:', {
        whatsapp_number: formState.customerInfo.whatsappNumber || formState.customerInfo.mobileNumber,
        customer_name: formState.customerInfo.customerName || 'Customer',
        lead_id: id || '',
        car_brand: formState.cars[0]?.carBrand || '',
        car_model: formState.cars[0]?.carModel || '',
        order_id: formState.arrivalStatus.orderId || '',
        pdf_size: pdfBlob.size
      });

      // Send to backend
      const response = await axios.post(
        'https://admin.onlybigcars.com/api/send-jobcard/',
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            // Don't set Content-Type manually when using FormData
          }
        }
      );

      if (response.data.success) {
    toast.success(`JobCard sent successfully! File: ${response.data.filename}`, {
      position: "top-right",
      autoClose: 4000,
    });
    
    // Update the statusCounterData state in real-time
    setStatusCounterData(prevData => ({
      ...prevData,
      job_card_count: prevData.job_card_count + 1
    }));
    
    // Close the reminder popup and proceed with save
    setShowReminderPopup(false);
    // setTimeout(() => {
    //   handleSubmit(new Event('submit'));
    // }, 100);
    
  } else {
    toast.error(response.data.message || 'Failed to send JobCard', {
      position: "top-right",
      autoClose: 3000,
    });
  }
    } else {
      throw new Error('JobCard reference not available');
    }
  } catch (error) {
    console.error('Error sending JobCard:', error);
    console.error('Error details:', error.response?.data);
    toast.error('Failed to send JobCard: ' + (error.response?.data?.message || error.message), {
      position: "top-right",
      autoClose: 4000,
    });
  } finally {
    setIsSendingJobCard(false);
    setShowJobCard(false);
  }
};

const handleSendEstimate = async () => {
  if (!formState.customerInfo.whatsappNumber && !formState.customerInfo.mobileNumber) {
    toast.error('No WhatsApp number found for customer', {
      position: "top-right",
      autoClose: 3000,
    });
    return;
  }

  setIsSendingEstimate(true);
  setShowEstimate(true);
  
  try {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    if (estimateRef.current) {
      // Generate PDF blob
      const pdfBlob = await estimateRef.current.generatePDFBlob();
      
      if (!pdfBlob) {
        throw new Error('Failed to generate estimate PDF');
      }

      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare form data
      const formData = new FormData();
      
      // Generate dynamic filename (same logic as JobCard)
      const sanitizeForFilename = (text) => text ? text.replace(/[^a-zA-Z0-9\-_]/g, '_') : '';
      const brandPart = sanitizeForFilename(formState.cars[0]?.carBrand || '');
      const modelPart = sanitizeForFilename(formState.cars[0]?.carModel || '');
      const orderPart = formState.arrivalStatus.orderId ? `-${sanitizeForFilename(formState.arrivalStatus.orderId)}` : '';
      const dynamicFilename = `Estimate-${brandPart}-${modelPart}${orderPart}.pdf`;

      formData.append('pdf', pdfBlob, dynamicFilename);
      formData.append('whatsapp_number', formState.customerInfo.whatsappNumber || formState.customerInfo.mobileNumber);
      formData.append('customer_name', formState.customerInfo.customerName || 'Customer');
      formData.append('lead_id', id || '');
      formData.append('car_brand', formState.cars[0]?.carBrand || '');
      formData.append('car_model', formState.cars[0]?.carModel || '');
      formData.append('order_id', formState.arrivalStatus.orderId || '');

      // Log details for debugging
      console.log('Sending Estimate with details:', {
        whatsapp_number: formState.customerInfo.whatsappNumber || formState.customerInfo.mobileNumber,
        customer_name: formState.customerInfo.customerName || 'Customer',
        lead_id: id || '',
        car_brand: formState.cars[0]?.carBrand || '',
        car_model: formState.cars[0]?.carModel || '',
        order_id: formState.arrivalStatus.orderId || '',
        pdf_size: pdfBlob.size
      });

      // Send to backend
      const response = await axios.post(
        'https://admin.onlybigcars.com/api/send-estimate/',
        formData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            // Don't set Content-Type manually when using FormData
          }
        }
      );

      if (response.data.success) {
    toast.success(`Estimate sent successfully! File: ${response.data.filename}`, {
      position: "top-right",
      autoClose: 4000,
    });
    
    // Update the statusCounterData state in real-time
    setStatusCounterData(prevData => ({
      ...prevData,
      payment_due_count: prevData.payment_due_count + 1
    }));
    
    // Close the reminder popup and proceed with save
    setShowReminderPopup(false);
    // setTimeout(() => {
    //   handleSubmit(new Event('submit'));
    // }, 100);
    
  } else {
    toast.error(response.data.message || 'Failed to send Estimate', {
      position: "top-right",
      autoClose: 3000,
    });
  }
    } else {
      throw new Error('Estimate reference not available');
    }
  } catch (error) {
    console.error('Error sending Estimate:', error);
    console.error('Error details:', error.response?.data);
    toast.error('Failed to send Estimate: ' + (error.response?.data?.message || error.message), {
      position: "top-right",
      autoClose: 4000,
    });
  } finally {
    setIsSendingEstimate(false);
    setShowEstimate(false);
  }
};

// ...existing code...

const handleGenerateBill = async () => {
  setIsGeneratingBill(true);
  setShowBill(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (billRef.current) {
      await billRef.current.generatePDF();
    } else {
      throw new Error('Bill reference not available');
    }
  } catch (error) {
    console.error('Error generating bill:', error);
  } finally {
    setIsGeneratingBill(false);
  }
};

const handleGenerateWxBill = async () => {
  setShowBill(true); // Show the hidden WxBill component
  setIsGeneratingWxBill(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (wxBillRef.current) {
      await wxBillRef.current.generatePDF();
    } else {
      throw new Error('Workshop bill reference not available');
    }
  } catch (error) {
    console.error('Error generating workshop bill:', error);
  } finally {
    setIsGeneratingWxBill(false);
    setShowDesignerPopup(false);
  }
};

// First, create a new function to handle commission calculations
const calculateCommissionDetails = (finalAmount, commissionDue, commissionReceived) => {
  const finalAmountNum = parseFloat(finalAmount) || 0;
  const commissionDueNum = parseFloat(commissionDue) || 0;
  const commissionReceivedNum = parseFloat(commissionReceived) || 0;
  
  // Calculate total commission
  const totalCommission = commissionDueNum + commissionReceivedNum;
  
  // Calculate commission percentage
  const commissionPercent = finalAmountNum > 0 
    ? ((totalCommission / finalAmountNum) * 100).toFixed(2)
    : '0';

  return {
    totalCommission,
    commissionPercent
  };
};

// Modify the handleInputChange function for commission-related fields
// const handleCommissionChange = (field, value) => {
//   const finalAmount = field === 'finalAmount' 
//     ? value 
//     : formState.arrivalStatus.finalAmount;
    
//   const commissionDue = field === 'commissionDue' 
//     ? value 
//     : formState.arrivalStatus.commissionDue;
    
//   const commissionReceived = field === 'commissionReceived' 
//     ? value 
//     : formState.arrivalStatus.commissionReceived;

//   const { commissionPercent } = calculateCommissionDetails(
//     finalAmount,
//     commissionDue,
//     commissionReceived
//   );

//   setFormState(prev => ({
//     ...prev,
//     arrivalStatus: {
//       ...prev.arrivalStatus,
//       [field]: value,
//       commissionPercent: `${commissionPercent}%`
//     }
//   }));
// };

// Then update the input fields:

// const handleCommissionChange = (field, value) => {
//   const finalAmount = field === 'finalAmount' 
//     ? parseFloat(value) || 0 
//     : parseFloat(formState.arrivalStatus.finalAmount) || 0;
    
//   let commissionDue = parseFloat(formState.arrivalStatus.commissionDue) || 0;
//   let commissionReceived = parseFloat(formState.arrivalStatus.commissionReceived) || 0;
//   let commissionPercent = parseFloat(formState.arrivalStatus.commissionPercent) || 0;

//   // Handle different field updates
//   if (field === 'commissionPercent') {
//     // When percentage is entered, calculate commission received
//     const percentValue = parseFloat(value) || 0;
//     commissionReceived = (finalAmount * percentValue) / 100;
//     commissionDue = 0; // Reset Commision Due
//     commissionPercent = percentValue;
//   } else {
//     // For other fields, calculate percentage normally
//     if (field === 'commissionDue') {
//       commissionDue = parseFloat(value) || 0;
//     }
//     if (field === 'commissionReceived') {
//       commissionReceived = parseFloat(value) || 0;
//     }
    
//     const totalCommission = commissionDue + commissionReceived;
//     commissionPercent = finalAmount > 0 
//       ? ((totalCommission / finalAmount) * 100).toFixed(2)
//       : 0;
//   }
// Then update the input fields:

  // Update form state with all calculated values
//   setFormState(prev => ({
//     ...prev,
//     arrivalStatus: {
//       ...prev.arrivalStatus,
//       finalAmount,
//       commissionDue,
//       commissionReceived,
//       commissionPercent: `${commissionPercent}%`
//     }
//   }));
// };


// const handleCommissionChange = (field, value) => {
//   // Special handling for empty value vs 0
//   if (value === '') {
//     // When field is cleared, reset it to empty string to show placeholder
//     setFormState(prev => ({
//       ...prev,
//       arrivalStatus: {
//         ...prev.arrivalStatus,
//         [field]: ''
//       }
//     }));
//     return;
//   }
  
//   // Handle zero as a special case
//   const fieldValue = value === '0' ? 0 : (parseFloat(value) || '');
  
//   // Handle each field based on its type
//   if (field === 'finalAmount') {
//     const finalAmount = fieldValue !== '' ? fieldValue : 0;
//     const currentPercent = parseFloat(formState.arrivalStatus.commissionPercent) || 0;
//     const commissionReceived = finalAmount > 0 ? (finalAmount * currentPercent) / 100 : 0;
    
//     setFormState(prev => ({
//       ...prev,
//       arrivalStatus: {
//         ...prev.arrivalStatus,
//         finalAmount: value, // Keep the original string input
//         commissionReceived: commissionReceived === 0 ? '' : commissionReceived,
//         commissionDue: ''
//       }
//     }));
//   } 
//   else if (field === 'commissionPercent') {
//     const percentValue = fieldValue !== '' ? fieldValue : 0;
//     const finalAmount = parseFloat(formState.arrivalStatus.finalAmount) || 0;
//     const commissionReceived = finalAmount > 0 ? (finalAmount * percentValue) / 100 : 0;
    
//     setFormState(prev => ({
//       ...prev,
//       arrivalStatus: {
//         ...prev.arrivalStatus,
//         commissionPercent: value, // Keep the original string input
//         commissionReceived: commissionReceived === 0 ? '' : commissionReceived,
//         commissionDue: ''
//       }
//     }));
//   }
//   else {
//     // For commissionDue and commissionReceived
//     const finalAmount = parseFloat(formState.arrivalStatus.finalAmount) || 0;
//     let commissionDue = parseFloat(formState.arrivalStatus.commissionDue) || 0;
//     let commissionReceived = parseFloat(formState.arrivalStatus.commissionReceived) || 0;
    
//     if (field === 'commissionDue') commissionDue = fieldValue !== '' ? fieldValue : 0;
//     if (field === 'commissionReceived') commissionReceived = fieldValue !== '' ? fieldValue : 0;
    
//     const totalCommission = commissionDue + commissionReceived;
//     const percentValue = finalAmount > 0 ? ((totalCommission / finalAmount) * 100) : 0;

//     setFormState(prev => ({
//       ...prev,
//       arrivalStatus: {
//         ...prev.arrivalStatus,
//         [field]: value, // Keep the original string input
//         commissionPercent: percentValue === 0 ? '' : percentValue
//       }
//     }));
//   }
// };
const handleCommissionChange = (field, value) => {
  // Handle empty input by clearing the specific field
  // This allows placeholders to show and zeros to be erased
  if (value === '') {
    setFormState(prev => ({
      ...prev,
      arrivalStatus: {
        ...prev.arrivalStatus,
        [field]: '' // Set to empty string instead of 0 to allow placeholder to show
      }
    }));
    return;
  }
  
  // Convert value to number for calculations
  const fieldValue = parseFloat(value);
  
  // Handle NaN or invalid input
  if (isNaN(fieldValue)) {
    return;
  }

  // Different logic based on which field is being changed
  if (field === 'finalAmount') {
    const finalAmount = fieldValue;
    const currentPercent = parseFloat(formState.arrivalStatus.commissionPercent) || 0;
    
    if (finalAmount === 0) {
      // If finalAmount is set to 0, clear all commission values
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          finalAmount: 0,
          commissionDue: '',
          commissionReceived: '',
          commissionPercent: ''
        }
      }));
    } else if (currentPercent > 0) {
      // If percent exists, calculate commission based on new amount
      const commissionReceived = (finalAmount * currentPercent) / 100;
      
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          finalAmount: finalAmount,
          commissionReceived: commissionReceived,
          commissionDue: ''
        }
      }));
    } else {
      // Just update the final amount
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          finalAmount: finalAmount
        }
      }));
    }
  } 
  else if (field === 'commissionPercent') {
    const percentValue = fieldValue;
    const finalAmount = parseFloat(formState.arrivalStatus.finalAmount) || 0;
    
    if (percentValue === 0) {
      // If percent is set to 0, clear all commission values
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          commissionPercent: 0,
          commissionReceived: '',
          commissionDue: ''
        }
      }));
    } else if (finalAmount > 0) {
      // Calculate commission based on percent
      const commissionReceived = (finalAmount * percentValue) / 100;
      
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          commissionPercent: percentValue,
          commissionReceived: commissionReceived,
          commissionDue: ''
        }
      }));
    } else {
      // Just update the percent
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          commissionPercent: percentValue
        }
      }));
    }
  }
  else {
    // For commissionDue and commissionReceived
    const finalAmount = parseFloat(formState.arrivalStatus.finalAmount) || 0;
    let commissionDue = parseFloat(formState.arrivalStatus.commissionDue) || 0;
    let commissionReceived = parseFloat(formState.arrivalStatus.commissionReceived) || 0;
    
    if (field === 'commissionDue') commissionDue = fieldValue;
    if (field === 'commissionReceived') commissionReceived = fieldValue;
    
    // Clear other field when setting one to 0
    if (fieldValue === 0) {
      if (field === 'commissionDue') {
        setFormState(prev => ({
          ...prev,
          arrivalStatus: {
            ...prev.arrivalStatus,
            commissionDue: 0
          }
        }));
      } else if (field === 'commissionReceived') {
        setFormState(prev => ({
          ...prev,
          arrivalStatus: {
            ...prev.arrivalStatus,
            commissionReceived: 0
          }
        }));
      }
      return;
    }
    
    const totalCommission = commissionDue + commissionReceived;
    
    if (finalAmount > 0) {
      const percentValue = (totalCommission / finalAmount) * 100;
      
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          [field]: fieldValue,
          commissionPercent: percentValue
        }
      }));
    } else {
      // Just update the field without calculating percent
      setFormState(prev => ({
        ...prev,
        arrivalStatus: {
          ...prev.arrivalStatus,
          [field]: fieldValue
        }
      }));
    }
  }
};

const selectedCarBrand = formState.cars[selectedCarIndex]?.carBrand || '';
const selectedCarModel = formState.cars[selectedCarIndex]?.carModel || '';
const [priceError, setPriceError] = useState(null);

// Use our custom hook to get prices
const { servicePrices, loading: loadingPrices } = useServicePrices(
  filteredServices, 
  selectedCarBrand, 
  selectedCarModel
);


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
      <ToastContainer />
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
    Last Services
    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
  </Button>

  <Collapse in={isOpen}>
    <div>
      <Card className="rounded-top-0 border-top-0">
        <Card.Body>
          

          <div>
            {isLoadingPreviousLeads ? (
              <div className="text-center my-3">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Loading previous services...
              </div>
            ) : previousLeads && previousLeads.length > 0 ? (
              previousLeads.map((lead, index) => (
                <div 
                className="mt-3 p-2 border rounded cursor-pointer hover:bg-gray-100 transition-colors" 
                key={index}
                onClick={() => navigate(`/edit/${lead.id}`)}
                style={{ cursor: 'pointer' }}
                >

                  <p className="mb-1">
                    <strong>Lead ID: {lead.id}</strong> - {lead.products?.map(product => product.name).join(', ')}
                  </p>
                  <div className="text-muted mb-0 flex justify-between">
    <span>CCE: {lead.cceName}</span>
    <span>{lead.lead_status}</span>
  </div>
                  <small className="text-muted">
                    {new Date(lead.created_at).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </small>
                </div>
              ))
            ) : (
              <div className="mt-3">
                <p className="text-muted">No previous services found for this customer.</p>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  </Collapse>
</div>

            {/* <div className="dropdown-container" style={{ marginTop: "15px" }}>
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
            </div> */}


            {/* // Update your existing status history section 18 feb */ }

            {/* // Then, modify your left sidebar dropdown containers to ensure they stay open properly */}
            {/* <div className="dropdown-container" style={{ marginTop: "15px" }}>
  <Button
    onClick={() => setIsOpenLeft(!isOpenLeft)}
    variant="dark"
    className={`w-full d-flex justify-content-between align-items-center rounded-bottom-0 ${isOpenLeft ? 'border-bottom-0' : ''}`}
  >
    Status History
    {isOpenLeft ? <FaChevronUp /> : <FaChevronDown />}
  </Button>

  <Collapse in={isOpenLeft} mountOnEnter={true} unmountOnExit={false}>
    <div>
      <Card className="rounded-top-0 border-top-0">
        <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <StatusHistoryDisplay statusHistory={formState.arrivalStatus.status_history || []} />  
        </Card.Body>
      </Card>
    </div>
  </Collapse>
</div> */}


<div className="dropdown-container" style={{ marginTop: "15px" }}>
  <Button
    onClick={() => setIsOpenLeft(!isOpenLeft)}
    variant="dark"
    className={`w-full d-flex justify-content-between align-items-center rounded-bottom-0 ${isOpenLeft ? 'border-bottom-0' : ''}`}
  >
    Status History
    {isOpenLeft ? <FaChevronUp /> : <FaChevronDown />}
  </Button>

  <Collapse in={isOpenLeft} mountOnEnter={true} unmountOnExit={false}>
    <div>
      <Card className="rounded-top-0 border-top-0">
        <Card.Body>
          <StatusHistoryDisplay statusHistory={formState.arrivalStatus.status_history} />
          
          {/* Add Status Counter Display */}
          {/* <div className="mt-4 p-3 bg-gray-50 rounded">
            <h5 className="mb-3 font-medium">Status Counters</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Follow Up:</span>
                <span className="font-medium">{statusCounterData.follow_up_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Dead:</span>
                <span className="font-medium">{statusCounterData.dead_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Job Card:</span>
                <span className="font-medium">{statusCounterData.job_card_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium">{statusCounterData.completed_count}</span>
              </div>
              <div className="flex justify-between">
                <span>At Workshop:</span>
                <span className="font-medium">{statusCounterData.at_workshop_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Due:</span>
                <span className="font-medium">{statusCounterData.payment_due_count}</span>
              </div>
           
            </div>
          </div> */}
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
                      <p className="text-sm my-1">Amount Paid: {formState.overview.finalAmount || 0} Rs.</p>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="text-left p-2">
                    {/* <p className="text-sm m-0">L-6381234057_9FX7U</p> */}
                    <p className="text-sm my-1 font-bold">
  {formState.cars.length > 0 
    ? `${formState.cars[selectedCarIndex]?.carBrand || ''} ${formState.cars[selectedCarIndex]?.carModel || ''} ${formState.cars[selectedCarIndex]?.year || ''}`
    : 'No Car Selected'}
</p>
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
                  {/* <div className="mt-2">
                    <select
                      value={formState.basicInfo.carType} // Add this
                      onChange={(e) => handleInputChange('basicInfo', 'carType', e.target.value)} // Add this
                      className={`p-2 border rounded min-w-[120px] ${
                        !formState.basicInfo.carType ? 'border-red-300' : 'border-gray-200'
                      }`}
                      required={!isAdmin}
                      
                    >
                      <option value="">Lead Type*</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Normal">Normal</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Sell/Buy">Sell/Buy</option>
                      <option value="Spares">Spares</option>
                      
                    </select>
                    {validationErrors.carType && (
  <div className="text-red-500 text-xs mt-1">
    {validationErrors.carType}
  </div>
)}
                  </div> */}

{/*               

<div className="mt-2 flex items-center gap-2">

   <button
    className="group/btn inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all duration-150 min-w-[60px]"
    onClick={() => formState.customerInfo.mobileNumber ? handleClick2Call(formState.customerInfo.mobileNumber) : setError('No phone number available to call')}
    title="Click2Call"
  >
    <svg 
      className="w-3.5 h-3.5" 
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
    <span>Call</span>
  </button>
  

  <select
    value={formState.basicInfo.carType}
    onChange={(e) => handleInputChange('basicInfo', 'carType', e.target.value)}
    className={`p-2 border rounded min-w-[120px] ${
      !formState.basicInfo.carType ? 'border-red-300' : 'border-gray-200'
    }`}
    required={!isAdmin}
  >
    <option value="">Lead Type*</option>
    <option value="Luxury">Luxury</option>
    <option value="Normal">Normal</option>
    <option value="Insurance">Insurance</option>
    <option value="Sell/Buy">Sell/Buy</option>
    <option value="Spares">Spares</option>
  </select>
  
 
  
  {validationErrors.carType && (
    <div className="text-red-500 text-xs mt-1">
      {validationErrors.carType}
    </div>
  )}
</div> */}
<div className="mt-2 flex items-center gap-2">
  <select
    value={formState.basicInfo.carType}
    onChange={(e) => handleInputChange('basicInfo', 'carType', e.target.value)}
    className={`px-3 py-2 text-sm font-medium border rounded-md min-w-[140px] h-10 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-150 ${
      !formState.basicInfo.carType ? 'border-red-300' : 'border-gray-200'
    }`}
    required={!isAdmin}
  >
    <option value="">Lead Type*</option>
    <option value="Luxury">Luxury</option>
    <option value="Normal">Normal</option>
    <option value="Insurance">Insurance</option>
    <option value="Sell/Buy">Sell/Buy</option>
    <option value="Spares">Spares</option>
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
              {/* <div className="mt-4 p-3 flex gap-4">
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
                </div> */}
   <div className="mt-4 p-3 flex gap-4">
  <div className="flex-1">
    <div className="relative flex">
      <input
        type="tel"
        value={formState.customerInfo.mobileNumber}
        onChange={(e) => handleInputChange('customerInfo', 'mobileNumber', e.target.value)}
        className={`flex-1 p-2 border rounded-l border-r-0 ${
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
      <button
        className="flex items-center justify-center px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-r border border-emerald-500 shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
        onClick={() => formState.customerInfo.mobileNumber ? handleClick2Call(formState.customerInfo.mobileNumber) : setError('No phone number available to call')}
        title="Click2Call"
        type="button"
      >
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      </button>
    </div>
    {validationErrors.mobileNumber && (
      <div className="text-red-500 text-xs mt-1">
        {validationErrors.mobileNumber}
      </div>
    )}
  </div>
{/* </div> */}

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
                    <option value="Test">Test</option>
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
  required={!isAdmin} 
/>
  <input
    type="text"
    value={formState.location.city}
    onChange={(e) => handleInputChange('location', 'city', e.target.value)}
    className="p-2 border border-gray-300 rounded-md"
    placeholder="City"
    required={!isAdmin}
  />
  <input
    type="text"
    value={formState.location.state}
    onChange={(e) => handleInputChange('location', 'state', e.target.value)}
    className="p-2 border border-gray-300 rounded-md"
    placeholder="State"
    required={!isAdmin}
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
              {/* <button 
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
</button> */}

<button 
  type='button'
  className={`px-3 py-2 rounded-md mb-3 bg-red-600 hover:bg-red-700 text-white`}
  style={{ fontSize: '14px', fontWeight: '500' }}
  onClick={() => {
    setEditingCar(null);
    setShowAddCarModal(true);
  }}
>
  + Add New Car*
</button>


              {/* Car Cards Container */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
                {/* Car Card 1 */}
                {/* // Replace your existing car cards rendering section with this: */}
                {/* // Replace the cars container with this: */}

{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {formState.cars.map((car, index) => (
    <div 
      key={index} 
      className="relative cursor-pointer transition-transform hover:transform hover:scale-102"
      onClick={() => {
        setSelectedCarIndex(index);
        console.log(`Car ${index} selected: ${car.carBrand} ${car.carModel}`);
      }}
    >
      <CarCard 
        car={car}
        index={index}
        isSelected={selectedCarIndex === index}
        onEdit={() => {
          setEditingCar(car);
          setShowAddCarModal(true);
        }}
        onDelete={handleDeleteCar}
      />
    </div>
  ))} 
              </div> */}
              <div className="w-full">
  {/* Car Slider Navigation */}
  {formState.cars.length > 3 && (
    <div className="flex justify-between items-center mb-2">
      <button 
        type="button"
        onClick={() => {
          const newIndex = Math.max(0, selectedCarIndex - 1);
          setSelectedCarIndex(newIndex);
          document.getElementById(`car-card-${newIndex}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>
      
      <span className="text-sm font-medium">
        {selectedCarIndex + 1} of {formState.cars.length}
      </span>
      
      <button 
        type="button"
        onClick={() => {
          const newIndex = Math.min(formState.cars.length - 1, selectedCarIndex + 1);
          setSelectedCarIndex(newIndex);
          document.getElementById(`car-card-${newIndex}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 p-2 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
  )}

  {/* Car Slider Container */}
  <div 
    className="flex overflow-x-auto pb-2 space-x-4 snap-x snap-mandatory scrollbar-hide" 
    style={{ 
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
  >
    {formState.cars.map((car, index) => (
      <div 
        id={`car-card-${index}`}
        key={index} 
        className="flex-none w-[calc(100%-1rem)] sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] snap-center"
        onClick={() => {
          setSelectedCarIndex(index);
          console.log(`Car ${index} selected: ${car.carBrand} ${car.carModel}`);
        }}
      >
        <CarCard 
          car={car}
          index={index}
          isSelected={selectedCarIndex === index}
          onEdit={() => {
            setEditingCar(car);
            setShowAddCarModal(true);
          }}
          onDelete={handleDeleteCar}
        />
      </div>
    ))}
  </div>
  
  {/* Add Dots Navigation for Mobile */}
  {formState.cars.length > 1 && (
    <div className="flex justify-center mt-2 space-x-2">
      {formState.cars.map((_, index) => (
        <button 
          key={index}
          type="button"
          onClick={() => {
            setSelectedCarIndex(index);
            document.getElementById(`car-card-${index}`)?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'center'
            });
          }}
          className={`w-3 h-3 rounded-full ${selectedCarIndex === index ? 'bg-red-500' : 'bg-gray-300'}`}
          aria-label={`Go to car ${index + 1}`}
        />
      ))}
    </div>
  )}
</div>
            </div>

            {/* // Add this after your cars container: */}

            {formState.cars.length > 0 && (
  <div className="bg-gray-100 p-3 mt-2 rounded-lg">
    <p className="text-sm font-medium text-center">
      Selected Car: 
      <span className="font-bold text-red-600 ml-2">
        {formState.cars[selectedCarIndex]?.carBrand} {formState.cars[selectedCarIndex]?.carModel}, 
        {formState.cars[selectedCarIndex]?.year} ({formState.cars[selectedCarIndex]?.fuel})
      </span>
    </p>
  </div>
)}



{formState.basicInfo.carType === "Sell/Buy" && (
  <div className="w-full p-2 rounded-lg">
    <div className="text-gray-700 mb-4" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>
      Sell/Buy
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <input
        type="text"
        value={formState.sellBuyInfo.dealerName}
        onChange={e => handleInputChange('sellBuyInfo', 'dealerName', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Dealer Name"
      />
      <input
  type="tel"
  value={formState.sellBuyInfo.dealerNumber}
  onChange={e => {
    // Allow only digits and max 10 characters
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    handleInputChange('sellBuyInfo', 'dealerNumber', val);
  }}
  className="p-2 border border-gray-300 rounded-md"
  placeholder="Dealer Number"
  maxLength={10}
  pattern="[0-9]{10}"
  // required
/>
      {/* <input
        type="text"
        value={formState.sellBuyInfo.dealerAddress}
        onChange={e => handleInputChange('sellBuyInfo', 'dealerAddress', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Dealer Address"
      /> */}
      <input
        type="email"
        value={formState.sellBuyInfo.dealerEmail}
        onChange={e => handleInputChange('sellBuyInfo', 'dealerEmail', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Dealer Email"
      />
      <input
        type="number"
        min="0"
        value={formState.sellBuyInfo.repairingCost}
        onChange={e => handleInputChange('sellBuyInfo', 'repairingCost', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Repairing Cost"
      />
      <input
        type="number"
        min="0"
        value={formState.sellBuyInfo.sellingCost}
        onChange={e => handleInputChange('sellBuyInfo', 'sellingCost', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Selling Cost"
      />
      <input
        type="number"
        min="0"
        value={formState.sellBuyInfo.purchaseCost}
        onChange={e => handleInputChange('sellBuyInfo', 'purchaseCost', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Purchase Cost"
      />
      <input
        type="number"
        min="0"
        value={formState.sellBuyInfo.dealerCommission}
        onChange={e => handleInputChange('sellBuyInfo', 'dealerCommission', e.target.value)}
        className="p-2 border border-gray-300 rounded-md"
        placeholder="Dealer Commission"
      />
     <input
  type="number"
  // min="0"
  value={formState.sellBuyInfo.profit}
  readOnly
  className={`p-2 border border-gray-300 rounded-md bg-gray-100 
    ${formState.sellBuyInfo.profit < 0 ? 'text-red-600' : 'text-green-600'}`}
  placeholder="Profit"
/>
    </div>
  </div>
)}

       
            <div className="w-full p-2 rounded-lg">
                      <div className="text-gray-700 mb-4 mt-1" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Our Feature Services</div>
            <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 mb-4 border rounded"
          />
                       {!shouldHideProducts()&&(
                                  <>
                                            <div className="text-gray-700 mb-4 mt-3" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Our Feature Services</div>
                                  
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
                                  </>
                                  )}
                        {!shouldHideProducts()&&(
            <>
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
    <span className="text-gray-600">
  Price: {
    priceError ? "Determine" : 
    (loadingPrices ? "Loading..." : servicePrices[`${service.id}-${service.title}`] || "Determine")
  }
</span>
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

           </>
            )}

             {/* Show a message when products section is hidden */}
  {shouldHideProducts() && (
    <div className="text-center py-8 text-gray-500">
      <p className="text-lg">Products section is not available for {formState.basicInfo.carType} leads</p>
      <p className="text-sm">Please use the "Add New Row" button in the Work Summary section to add items manually</p>
    </div>
  )}
                    </div>

            {/* Overview section */}
            <div className="w-full p-2 rounded-lg">
              {/* <div className="text-gray-700 mb-2" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Overview</div> */}

              {/*  Write the overview section here */}
              <div className="w-full p-2 rounded-lg">
              <div className="text-gray-700 mb-2 flex justify-between items-center" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>
  <span>Work Summary*</span>
  
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={handleOpenWarrantyPopup}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
    >
      Add Warranty
    </button>
    <button
      type="button"
      onClick={handleAddEmptyRow}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
    >
      Add New Row
    </button>
  </div>
</div>
          <div className="w-full mt-3">
            <table className="w-full">
              <thead>
              <tr className="bg-red-500 text-white">
  <th className="p-3 text-left">Category</th>
  <th className="p-3 text-left">Sub Category</th>
  <th className="p-3 text-left">Workdone</th>
  <th className="p-3 text-left">Qty</th>
  <th className="p-3 text-left cursor-pointer" onClick={handleGSTHeaderClick}>GST</th> {/* Add this */}
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
    value={row.quantity || 1}
    onChange={(e) => handleQuantityChange(index, e.target.value)}
    min="1"
    className="w-16 text-center p-1 border rounded"
  />
</td>
<td className="p-3">
  <input
    type="number"
    value={row.gst ?? 18}
    min="0"
    max="100"
    onChange={e => handleGSTChange(index, e.target.value)}
    className="w-16 text-center p-1 border rounded"
  />
</td>
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
      className="w-full p-3 border rounded h-30 resize-none"
      required={!isAdmin}
    />
    <div className="flex-1 flex items-center justify-end gap-2">
      <Button
        variant="outline-dark"
        type="button"
        onClick={handleGenerateEstimate}
        className="h-fit"
      >
        Generate Estimate
      </Button>
      
      {/* Send Estimate Button beside Generate Estimate */}
      {cards && (['Estimate', 'Job Card', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
        <Button
          variant="outline-success"
          type="button"
          disabled={isSubmitting || isSendingEstimate}
          onClick={handleSendEstimate}
          className="position-relative d-flex align-items-center h-fit"
        >
          {isSendingEstimate ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <span className="animate-pulse">Sending Estimate...</span>
            </>
          ) : (
            <>
              <span className="me-2">
                {statusCounterData.payment_due_count >= 1 ? 'Resend Estimate' : 'Send Estimate'}
              </span>
              {statusCounterData.payment_due_count >= 1 && (
                <span 
                  className="badge bg-success"
                  title={`Estimate sent ${statusCounterData.payment_due_count} time(s)`}
                >
                  {statusCounterData.payment_due_count}
                </span>
              )}
            </>
          )}
        </Button>
      )}
    </div>
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
    <span>Total Amount: </span>
    <span>₹{formState.overview.finalAmount}</span>
  </div>
</div>
    
  </div>
</div>
          </div>
        </div>
        {/* Add the new always-visible Estimate button here */}



            {/* Last Arrival and Garage Section */}

            <div className="w-full p-2 rounded-lg">
              <div className="text-gray-700 mb-2" style={{ padding: "15px", borderRadius: "5px", background: "#F2F2F2" }}>Status</div>



              {/* Location Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 mt-4">

              {/* // Replace the wasJobCard condition with this */}
{/* <select
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
  
  <option value="Walkin" disabled={shouldDisableOption("Walkin", location.state?.previousStatus)}>Walkin</option>
  <option value="Pickup" disabled={shouldDisableOption("Pickup", location.state?.previousStatus)}>Pickup</option>
  <option value="Doorstep" disabled={shouldDisableOption("Doorstep", location.state?.previousStatus)}>Doorstep</option>
  <option value="At Workshop" disabled={shouldDisableOption("At Workshop", location.state?.previousStatus)}>At Workshop</option>
  <option value="Job Card" disabled={shouldDisableOption("Job Card", location.state?.previousStatus)}>Job Card</option>
  <option value="Estimate" disabled={shouldDisableOption("Estimate", location.state?.previousStatus)}>Estimate</option>

  <option value="Completed" disabled={shouldDisableOption("Completed", location.state?.previousStatus)}>Completed</option>

</select> */}
 
<select
  value={formState.arrivalStatus.leadStatus}
  onChange={(e) => handleInputChange('arrivalStatus', 'leadStatus', e.target.value)}
  className="p-2 border border-gray-300 rounded-md"
>
  <option value="">Lead Status</option>
  {formState.basicInfo.carType === "Sell/Buy" ? (
    // Show all Sell/Buy statuses, but only enable the next allowed one
    sellBuyStatusFlow.map((status, idx) => {
      const previousStatus = location.state?.previousStatus || null;
      const nextStatus = getNextSellBuyStatus(previousStatus);
      const shouldDisable = status !== nextStatus;
      return (
        <option key={status} value={status} disabled={shouldDisable}>
          {status}
        </option>
      );
    })
  ) :  (
    <>
  <option value="test" disabled={shouldDisableOption("test", location.state?.previousStatus)}>test</option>
  <option value="Assigned" disabled={shouldDisableOption("Assigned", location.state?.previousStatus)}>Assigned</option>
  <option value="Follow Up" disabled={shouldDisableOption("Follow Up", location.state?.previousStatus)}>Follow Up</option>
  <option value="Dead" disabled={shouldDisableOption("Dead", location.state?.previousStatus)}>Dead</option>
  <option value="Duplicate" disabled={shouldDisableOption("Duplicate", location.state?.previousStatus)}>Duplicate</option>
  <option value="Communicate To Ops" disabled={shouldDisableOption("Communicate To Ops", location.state?.previousStatus)}>Communicate To Ops</option>
  <option value="Referred To Ops" disabled={shouldDisableOption("Referred To Ops", location.state?.previousStatus)}>Referred To Ops</option>
  <option value="Walkin" disabled={shouldDisableOption("Walkin", location.state?.previousStatus)}>Walkin</option>
  <option value="Pickup" disabled={shouldDisableOption("Pickup", location.state?.previousStatus)}>Pickup</option>
  <option value="Doorstep" disabled={shouldDisableOption("Doorstep", location.state?.previousStatus)}>Doorstep</option>
  <option value="At Workshop" disabled={shouldDisableOption("At Workshop", location.state?.previousStatus)}>At Workshop</option>
  <option value="Job Card" disabled={shouldDisableOption("Job Card", location.state?.previousStatus)}>Job Card</option>
  {/* <option value="Estimate" disabled={shouldDisableOption("Estimate", location.state?.previousStatus)}>Estimate</option> */}
  <option value="Payment Due" disabled={shouldDisableOption("Payment Due", location.state?.previousStatus)}>Payment Due</option>
  <option value="Commision Due" disabled={shouldDisableOption("Commision Due", location.state?.previousStatus)}>Commision Due</option>
  <option value="Completed" disabled={shouldDisableOption("Completed", location.state?.previousStatus)}>Completed</option>
</>  )}
</select> 


{/* 
<select
  value={formState.arrivalStatus.leadStatus}
  onChange={(e) => handleInputChange('arrivalStatus', 'leadStatus', e.target.value)}
  className="p-2 border border-gray-300 rounded-md"
>
<option value="">Lead Status</option>
<option value="test">test</option>
<option value="Assigned">Assigned</option>
<option value="Follow Up">Follow Up</option>
<option value="Dead">Dead</option>
<option value="Duplicate">Duplicate</option>
<option value="Communicate To Ops">Communicate To Ops</option>
<option value="Referred To Ops">Referred To Ops</option>
<option value="Walkin">Walkin</option>
<option value="Pickup">Pickup</option>
<option value="Doorstep">Doorstep</option>
<option value="At Workshop">At Workshop</option>
<option value="Job Card">Job Card</option>
<option value="Estimate">Estimate</option>
<option value="Payment Due">Payment Due</option>
<option value="Commision Due">Commision Due</option>
<option value="Completed">Completed</option>

</select> */}


<select
                    value={formState.arrivalStatus.arrivalMode}
                    onChange={(e) => handleInputChange('arrivalStatus', 'arrivalMode', e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                    required={!isAdmin}
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
  <option value="Price Issue">Price Issue</option>
  <option value="Not Answering">Not Answering</option>
  <option value="Workshop Not Responding">Workshop Not Responding</option>
  <option value="Workshop Not Available">Workshop Not Available</option>
  <option value="Language Barrier">Language Barrier</option>
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
                  required={!isAdmin}
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
          required
        />
        <input
          type="text"
          value={formState.arrivalStatus.fuelStatus}
          onChange={(e) => handleInputChange('arrivalStatus', 'fuelStatus', e.target.value)}
          placeholder="Fuel Status (Ex. 50%)"
          className="p-2 border border-gray-300 rounded-md w-full"
          required
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
          placeholder="Odometer"
          className="p-2 border border-gray-300 rounded-md w-full"
          required
          
        />
       <input
          type="text"
          value={formState.arrivalStatus.additionalWork}
          onChange={(e) => handleInputChange('arrivalStatus', 'additionalWork', e.target.value)}
          placeholder="Additional Work"
          className="p-2 border border-gray-300 rounded-md w-full"
          
        />
        
      </>
    )}

{(formState.arrivalStatus.leadStatus === 'Payment Due' || formState.arrivalStatus.leadStatus === 'Commision Due' || formState.arrivalStatus.leadStatus === 'Completed') && (
  <>
    <div className="relative border border-gray-300 rounded-md bg-white group">
      <input
        type="text"
        value={formState.arrivalStatus.finalAmount === 0 ? '0' : (formState.arrivalStatus.finalAmount || '')}
        onChange={(e) => handleCommissionChange('finalAmount', e.target.value)}
        className="w-full p-2 border-0 focus:outline-none rounded-md peer"
        disabled={location.state?.previousStatus === "Completed"}
        required
        id="finalAmount"
      />
      <label 
        htmlFor="finalAmount" 
        className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        Final Amount
      </label>
    </div>
   

    
  </> 
)}



{(formState.arrivalStatus.leadStatus === 'Payment Due') && (
  <>
<div className="relative border border-gray-300 rounded-md bg-white group">
      <input
        type="text"
        value={formState.arrivalStatus.pendingAmount === 0 ? '0' : (formState.arrivalStatus.pendingAmount || '')}
        onChange={(e) => handleInputChange('arrivalStatus', 'pendingAmount', e.target.value)}
        className="w-full p-2 border-0 focus:outline-none rounded-md peer"
        // disabled={location.state?.previousStatus === "Completed"}
        required
        id="pendingAmount"
      />
      <label 
        htmlFor="finalAmount" 
        className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        Pending Amount
      </label>
    </div>
  
    </> 
  )}

    {/* Add this code after the existing lead status conditional renders */}

{(formState.arrivalStatus.leadStatus === 'Commision Due' || formState.arrivalStatus.leadStatus === 'Completed') && (
  <>
 <div className="relative border border-gray-300 rounded-md bg-white group">
      <input
        type="text" 
        value={formState.arrivalStatus.commissionDue === 0 ? '0' : formState.arrivalStatus.commissionDue}
        onChange={(e) => handleCommissionChange('commissionDue', e.target.value)}
        className="w-full p-2 border-0 focus:outline-none rounded-md peer"
        disabled={location.state?.previousStatus === "Completed"}
        required
        id="commissionDue"
      />
      <label 
        htmlFor="commissionDue" 
        className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        Commision Due
      </label>
    </div>

    <div className="relative border border-gray-300 rounded-md bg-white group">
      <input
        type="text" 
        value={formState.arrivalStatus.commissionReceived === 0 ? '0' : formState.arrivalStatus.commissionReceived}
        onChange={(e) => handleCommissionChange('commissionReceived', e.target.value)}
        className="w-full p-2 border-0 focus:outline-none rounded-md peer"
        disabled={location.state?.previousStatus === "Completed"}
        required
        id="commissionReceived"
      />
      <label 
        htmlFor="commissionReceived" 
        className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
      >
        Commission Received
      </label>
    </div>



<div className="relative">
  <input
    type="text"
    value={formState.arrivalStatus.commissionPercent === 0 ? '0' : formState.arrivalStatus.commissionPercent}
    onChange={(e) => handleCommissionChange('commissionPercent', e.target.value)}
    placeholder="Commission Percent"
    className="p-2 pr-7 border border-gray-300 rounded-md w-full"
    disabled={location.state?.previousStatus === "Completed"}
    required
  />
  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
    %
  </div>
</div>
  </>
)}

{formState.arrivalStatus.leadStatus === "Job Card" && (
  <div className="mt-4 p-3 border border-gray-200 rounded-md">
    <h3 className="text-md font-medium mb-3">Vehicle Images</h3>
    
    {/* Image upload section - no changes needed here */}
    <div className="mb-4">
      <label 
        htmlFor="imageUpload" 
        className="flex justify-center items-center p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
      >
         <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-1 text-sm text-gray-600">
            Click to upload images or drag and drop
          </p>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG
          </p>
        </div>
        <input 
          type="file" 
          id="imageUpload" 
          multiple 
          accept="image/*" 
          onChange={handleImageChange} 
          className="hidden"
        />
      </label>
    </div>
    
    {/* Display existing images with X button */}
    {existingImageUrls.length > 0 && (
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Saved Images ({existingImageUrls.length})</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingImageUrls.map((imageUrl, index) => (
            <div key={`existing-${index}`} className="relative group">
              <img
                src={imageUrl}
                alt={`Saved ${index}`}
                className="h-24 w-24 object-cover rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveExistingImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 transition-opacity"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    
    {/* Display newly selected images with X button */}
    {selectedImages.length > 0 && (
      <div>
        <div className="text-sm font-medium mb-2">New Images ({selectedImages.length})</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {selectedImages.map((image, index) => (
            <div key={`new-${index}`} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index}`}
                className="h-24 w-24 object-cover rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600 transition-opacity"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-xs mt-1 truncate">{image.name}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}



{/* 
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
)} */}

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
                              userLocation={userLocation}
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
  required={!isAdmin}
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
                      {/* <Form.Control
  value={formState.basicInfo.cceName || user?.username}
  onChange={(e) => handleInputChange('basicInfo', 'cceName', e.target.value)}
  className="bg-light"
  disabled
/> */}

{isAdmin ? (
  <Form.Select
    value={formState.basicInfo.cceName}
    onChange={(e) => handleInputChange('basicInfo', 'cceName', e.target.value)}
    className="bg-light"
  >
    <option value="">Select CCE</option>
    {users.map(user => (
      <option key={user.id} value={user.username}>{user.username}</option>
    ))}
  </Form.Select>
) : (
  <Form.Control
    value={formState.basicInfo.cceName || user?.username}
    onChange={(e) => handleInputChange('basicInfo', 'cceName', e.target.value)}
    className="bg-light"
    disabled
  />
)}
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
                    required={!isAdmin}
                    style={{ height: '120px', resize: 'none' }}
                  />
                </Form.Group>
              </div>

            </div>


            {/* Sticky Footer */}
            <div className="fixed bottom-0 right-0  w-full border-t shadow-lg p-3 flex justify-end gap-3" style={{background:"#F3F4F6"}}>
           

            {!id && (
                      <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isFromWorkshop}
                          onChange={(e) => {
                            setIsFromWorkshop(e.target.checked);
                            // When checkbox is checked, set the CCE name to "workshop"
                            if (e.target.checked) {
                              setFormState(prev => ({
                                ...prev,
                                basicInfo: {
                                  ...prev.basicInfo,
                                  cceName: "workshop"
                                }
                              }));
                            } else {
                              // When unchecked, restore the original user's username
                              setFormState(prev => ({
                                ...prev,
                                basicInfo: {
                                  ...prev.basicInfo,
                                  cceName: user?.username || ''
                                }
                              }));
                            }
                          }}
                          className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500 mr-2"
                        />
                        <span className="text-gray-700 font-medium">From workshop?</span>
                      </label>
                    </div>
                    )}
                    
                    {/* Add empty div for spacing when id exists (editing mode) */}
                    {id && <div></div>}
                                    {/* Right side with buttons */}
                    <div className="flex justify-end gap-3">

                  <Button 
                    variant="outline-danger" 
                    type="button" 
                    onClick={() => navigate('/')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                {/* {cards && (['Job Card', 'Estimate', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
        <Button
  variant="outline-dark"
  type="button"
  disabled={isSubmitting || isGeneratingBill}
  onClick={handleGenerateBill}
  className="position-relative"
>
  {isGeneratingBill ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      <span className="animate-pulse">Generating PDF...</span>
    </>
  ) : (
    'Generate Bill'
  )}
</Button>      
    )} */}

    {cards && (['Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
  <>
    <Button
      variant="outline-dark"
      type="button"
      onClick={() => setShowDesignerPopup(true)}
      disabled={isSubmitting}
    >
      Generate Bill
    </Button>
   
  </>
)}


                  
                  {/* Add Generate Card button when lead status is Job Card */}
                  {cards && (['Job Card', 'Estimate', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
        <Button
        variant="outline-dark"
        type="button"
        disabled={isSubmitting || isGeneratingPDF}
        onClick={handleGenerateCard}
        className="position-relative"
      >
        {isGeneratingPDF ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span className="animate-pulse">Generating PDF...</span>
          </>
        ) : (
          'Generate Card'
        )}
      </Button>

        
                  
        
    )}

    {/* {cards && (['Job Card', 'Estimate', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
  <Button
    variant="outline-success"
    type="button"
    disabled={isSubmitting || isSendingJobCard}
    onClick={handleSendJobCard}
    className="position-relative"
  >
    {isSendingJobCard ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <span className="animate-pulse">Sending JobCard...</span>
      </>
    ) : (
      'Send JobCard'
    )}
  </Button>
)} */}


{/* Option 2: Badge indicator approach */}
{/* {cards && (['Job Card', 'Estimate', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
  <Button
    variant="outline-success"
    type="button"
    disabled={isSubmitting || isSendingJobCard}
    onClick={handleSendJobCard}
    className="position-relative d-flex align-items-center"
  >
    {isSendingJobCard ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <span className="animate-pulse">Sending JobCard...</span>
      </>
    ) : (
      <>
        <span className="me-2">
          {statusCounterData.job_card_count >= 1 ? 'Resend JobCard' : 'Send JobCard'}
        </span>
        {statusCounterData.job_card_count >= 1 && (
          <span 
            className="badge bg-success"
            title={`JobCard sent ${statusCounterData.job_card_count} time(s)`}
          >
            {statusCounterData.job_card_count}
          </span>
        )}
      </>
    )}
  </Button>
)}

{cards && (['Estimate', 'Job Card', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
  <Button
    variant="outline-success"
    type="button"
    disabled={isSubmitting || isSendingEstimate}
    onClick={handleSendEstimate}
    className="position-relative d-flex align-items-center"
  >
    {isSendingEstimate ? (
      <>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        <span className="animate-pulse">Sending Estimate...</span>
      </>
    ) : (
      <>
        <span className="me-2">
          {statusCounterData.payment_due_count >= 1 ? 'Resend Estimate' : 'Send Estimate'}
        </span>
        {statusCounterData.payment_due_count >= 1 && (
          <span 
            className="badge bg-success"
            title={`Estimate sent ${statusCounterData.payment_due_count} time(s)`}
          >
            {statusCounterData.payment_due_count}
          </span>
        )}
      </>
    )}
  </Button>
)} */}


{/* Replace both Send JobCard and Send Estimate buttons with this single button */}
{cards && (['Job Card', 'Estimate', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
  <Button
    variant="outline-success"
    type="button"
    disabled={isSubmitting}
    onClick={() => setShowSendCardPopup(true)}
    className="position-relative d-flex align-items-center"
  >
    <span className="me-2">Send Card</span>
   
  </Button>
)}


{/* { cards && (['Job Card', 'Estimate', 'Payment Due', 'Commision Due', 'Bill', 'Completed'].includes(formState.arrivalStatus.leadStatus)) && (
   
   
   <Button
   variant="outline-dark"
   type="button"
   disabled={isSubmitting}
   onClick={handleGenerateEstimate}
   >
   Generate Estimate
   </Button>

)} */}

    
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
                    variant={location.state?.previousStatus === "Completed" ? "secondary" : "danger"}
                    type="submit" 
                    disabled={isSubmitting || location.state?.previousStatus === "Completed" || 
                      (formState.basicInfo.cceName !== user?.username && formState.basicInfo.cceName !== "workshop" && !isAdmin)}
                    title={formState.basicInfo.cceName !== user?.username && formState.basicInfo.cceName !== "workshop" && !isAdmin ? 
                      "You can only save leads assigned to you or from workshop" : ""}
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Copy'}
                  </Button></div>
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
        carBrandsData={carBrandsData} 
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
        carBrand: formState.cars[selectedCarIndex]?.carBrand || '',
        carModel: formState.cars[selectedCarIndex]?.carModel || '',
        regNumber: formState.cars[selectedCarIndex]?.regNo || '',
        carYearFuel: `${formState.cars[selectedCarIndex]?.year || ''} ${formState.cars[selectedCarIndex]?.fuel || ''}`,
        orderId: formState.arrivalStatus.orderId || '',
        customerMobile: formState.customerInfo.mobileNumber,
        whatsappNum: formState.customerInfo.whatsappNumber,
        batteryFeature: formState.arrivalStatus.batteryFeature,
        gstin: formState.arrivalStatus.gstin,
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
        },
        images: existingImageUrls
      }}
    />
  </div>
)}


{/* {showBill && (
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
)} */}

{showBill && (
  <div style={{ width: '100%', minHeight: '100vh', position: 'absolute', left: '-9999px' }}>
    <Bill 
      ref={billRef}
      data={{
        customerName: formState.customerInfo.customerName,
        customerMobile: formState.customerInfo.mobileNumber,
        carBrand: formState.cars[selectedCarIndex]?.carBrand || '',
        carModel: formState.cars[selectedCarIndex]?.carModel || '',
        regNumber: formState.cars[selectedCarIndex]?.regNo || '',
        carYearFuel: `${formState.cars[selectedCarIndex]?.year || ''} ${formState.cars[selectedCarIndex]?.fuel || ''}`,
        handoverDate: new Date(formState.arrivalStatus.dateTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        orderId: formState.arrivalStatus.orderId || '',
        speedometerRd: formState.arrivalStatus.speedometerRd,
        carColor: formState.cars[0]?.color || '',
        vinNo: formState.cars[0]?.vin || '',
        customerAdd: formState.location.address || '',
        workshop: formState.workshop.name,
        batteryFeature: formState.arrivalStatus.batteryFeature || '',
        gstin: formState.arrivalStatus.gstin || '',
        fuelStatus: formState.arrivalStatus.fuelStatus || '',
        // --- NEW: Invoice Summary with GST ---
        invoiceSum: [
          {
            netAmt: formState.overview.total,
            gst: formState.overview.total * 0.18, // 18% GST, adjust as needed
            dis: formState.overview.discount || 0,
            totalPay: formState.overview.finalAmount
          }
        ],
        workDetail: formState.overview.tableData.map(item => ({
          descriptions: item.type,
          workDn: item.workdone,
          quant: item.quantity || 1,
          unitPr: parseFloat(item.pricePerItem) || 0,
          gst: parseFloat(item.gst) || 0,
          dis: 0, // If you have per-row discount, use it here
          netAmt: parseFloat(item.total) || 0
        })),
        totalUnitPriceBill: formState.overview.total,
        totalDiscountedPriceBill: formState.overview.discount || 0,
        finalPriceBill: formState.overview.finalAmount,
        totalPayablePriceBill: formState.overview.finalAmount,
        workshopAddress: formState.workshop.locality || '', // or .address if you store it as address
        customerGSTIN: '', // leave blank for now
        customerDetailName: formState.gstDetail.customer_name || formState.customerInfo.customerName,
        customerDetailAddress: formState.gstDetail.customer_address || formState.location.address,
        customerDetailGSTIN: formState.gstDetail.customer_gstin || 'N/A',
        customerDetailState: formState.gstDetail.customer_state || '',
        additionalWorkItems: formState.arrivalStatus.additionalWork,
        // --- NEW: Work Detail with GST per row ---
      }}
    />
  </div>
)}

{showBill && (
  <div style={{ width: '100%', minHeight: '100vh', position: 'absolute', left: '-9999px' }}>
    <WxBill
      ref={wxBillRef}
      data={{
        // Pass the same data structure as Bill, or adjust as needed for wxbill.js
        customerName: formState.customerInfo.customerName,
        customerMobile: formState.customerInfo.mobileNumber,
        carBrand: formState.cars[selectedCarIndex]?.carBrand || '',
        carModel: formState.cars[selectedCarIndex]?.carModel || '',
        regNumber: formState.cars[selectedCarIndex]?.regNo || '',
        carYearFuel: `${formState.cars[selectedCarIndex]?.year || ''} ${formState.cars[selectedCarIndex]?.fuel || ''}`,
        handoverDate: new Date(formState.arrivalStatus.dateTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        orderId: formState.arrivalStatus.orderId || '',
        speedometerRd: formState.arrivalStatus.speedometerRd,
        carColor: formState.cars[0]?.color || '',
        vinNo: formState.cars[0]?.vin || '',
        customerAdd: formState.location.address || '',
        workshop: formState.workshop.name,
        batteryFeature: formState.arrivalStatus.batteryFeature || '',
        gstin: formState.arrivalStatus.gstin || '',
        fuelStatus: formState.arrivalStatus.fuelStatus || '',
        invoiceSum: [
          {
            netAmt: formState.overview.total,
            gst: formState.overview.total * 0.18,
            dis: formState.overview.discount || 0,
            totalPay: formState.overview.finalAmount
          }
        ],
        workDetail: formState.overview.tableData.map(item => ({
          descriptions: item.type,
          workDn: item.workdone,
          quant: item.quantity || 1,
          unitPr: parseFloat(item.pricePerItem) || 0,
          gst: parseFloat(item.gst) || 0,
          dis: 0,
          netAmt: parseFloat(item.total) || 0
        })),
        totalUnitPriceBill: formState.overview.total,
        totalDiscountedPriceBill: formState.overview.discount || 0,
        finalPriceBill: formState.overview.finalAmount,
        totalPayablePriceBill: formState.overview.finalAmount,
        workshopAddress: formState.workshop.locality || '',
        customerGSTIN: '',
        commissionReceived: formState.arrivalStatus.commissionReceived || 0,
        commissionDue: formState.arrivalStatus.commissionDue || 0,
        workshopDetailName: formState.gstDetail.wx_name || formState.workshop.name,
        workshopDetailAddress: formState.gstDetail.wx_address || formState.workshop.locality,
        workshopDetailGSTIN: formState.gstDetail.wx_gstin || 'N/A',
        workshopDetailState: formState.gstDetail.wx_state || '',
        additionalWorkItems: formState.arrivalStatus.additionalWork,
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
        gstin: formState.arrivalStatus.gstin,
        additionalWork: formState.arrivalStatus.additionalWork,
        carBrand: formState.cars[selectedCarIndex]?.carBrand || '',
        carModel: formState.cars[selectedCarIndex]?.carModel || '',
        regNumber: formState.cars[selectedCarIndex]?.regNo || '',
        carYearFuel: `${formState.cars[selectedCarIndex]?.year || ''} ${formState.cars[selectedCarIndex]?.fuel || ''}`,
        fuelStatus: formState.arrivalStatus.fuelStatus,
        handoverDate: new Date(formState.arrivalStatus.dateTime).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        // Add these two properly formatted fields
    estimatedTime: new Date(formState.arrivalStatus.dateTime).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    estimatedDate: new Date(formState.arrivalStatus.dateTime).toLocaleDateString('en-IN', {
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
        invoiceSummary: [
          {
            netAmount: formState.overview.total,
            discount: formState.overview.discount,
            totalPayable: formState.overview.finalAmount
          }
        ],
        // Adjust work details field names to match Bill.js
        workDetails: formState.overview.tableData.map(item => ({
          description: item.type,
          workDone: item.workdone,
          quantity: item.quantity || 1,
          netAmount: parseFloat(item.total) || 0
        })),
        totalUnitPrice: formState.overview.total,
        totalDiscountedPrice: 0,
        finalPriceBill: formState.overview.total,
        totalPayable: formState.overview.finalAmount,
        date: formState.arrivalStatus.dateTime, // Add the full arrival date time
        warranty: formState.warranty,
      }}
    />
  </div>
)}
{/* 
{showDesignerPopup && (
<div
  className="fixed inset-0 z-50 flex items-center justify-center"
  style={{ background: "rgba(0,0,0,0.57)" }} // 7% black
>
    <div className="bg-white rounded-lg shadow-lg p-8 w-80 flex flex-col items-center relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
        onClick={() => setShowDesignerPopup(false)}
        aria-label="Close"
      >
        ×
      </button>
      <h2 className="text-lg font-bold mb-6 text-gray-800">Choose Type</h2>
      
       <Button
  variant="danger"
  type="button"
  disabled={isSubmitting || isGeneratingBill}
  onClick={handleGenerateBill}
  className="w-full mb-4 py-2 text-lg"
>
  {isGeneratingBill ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      <span className="animate-pulse">Generating PDF...</span>
    </>
  ) : (
    'Customer'
  )}
</Button>  
      <Button
  variant="dark"
  className="w-full py-2 text-lg"
  type="button"
  disabled={isSubmitting || isGeneratingWxBill}
  onClick={handleGenerateWxBill}
>
  {isGeneratingWxBill ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      <span className="animate-pulse">Generating PDF...</span>
    </>
  ) : (
    'Workshop'
  )}
</Button>
    </div>
  </div>
)} */}

{/* 
{showDesignerPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.57)" }}>
    <div className="bg-white rounded-lg shadow-lg p-8 w-80 flex flex-col items-center relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
        onClick={() => setShowDesignerPopup(false)}
        aria-label="Close"
      >×</button>
      <h2 className="text-lg font-bold mb-6 text-gray-800">Choose Type</h2>
      {!gstMode && (
        <div className="flex gap-4 w-full mb-4">
          <Button variant="danger" className="flex-1" onClick={() => setGstMode('customer')}>Customer</Button>
          <Button variant="dark" className="flex-1" onClick={() => setGstMode('workshop')}>Workshop</Button>
        </div>
      )}
      {gstMode === 'customer' && (
        <div className="w-full space-y-3">
          <input className="w-full p-2 border rounded" placeholder="Customer Name"
            value={formState.gstDetail.customer_name}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_name: e.target.value }
            }))}
          />
          <input className="w-full p-2 border rounded" placeholder="Customer Address"
            value={formState.gstDetail.customer_address}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_address: e.target.value }
            }))}
          />
          <input className="w-full p-2 border rounded" placeholder="Customer GSTIN"
            value={formState.gstDetail.customer_gstin}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_gstin: e.target.value }
            }))}
          />
          <input className="w-full p-2 border rounded" placeholder="Customer State"
            value={formState.gstDetail.customer_state}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_state: e.target.value }
            }))}
          />
          <Button className="w-full mt-2" variant="danger" onClick={() => {
            setShowDesignerPopup(false);
            setGstMode(null);
            // Optionally trigger bill preview here
          }}>Generate Customer Bill</Button>
        </div>
      )}
      {gstMode === 'workshop' && (
        <div className="w-full space-y-3">
          <input className="w-full p-2 border rounded" placeholder="Workshop Name"
            value={formState.gstDetail.wx_name}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_name: e.target.value }
            }))}
          />
          <input className="w-full p-2 border rounded" placeholder="Workshop Address"
            value={formState.gstDetail.wx_address}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_address: e.target.value }
            }))}
          />
          <input className="w-full p-2 border rounded" placeholder="Workshop GSTIN"
            value={formState.gstDetail.wx_gstin}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_gstin: e.target.value }
            }))}
          />
          <input className="w-full p-2 border rounded" placeholder="Workshop State"
            value={formState.gstDetail.wx_state}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_state: e.target.value }
            }))}
          />
          <Button className="w-full mt-2" variant="dark" onClick={() => {
            setShowDesignerPopup(false);
            setGstMode(null);
            // Optionally trigger wxbill preview here
          }}>Generate Workshop Bill</Button>
        </div>
      )}
      {gstMode && (
        <Button variant="outline-secondary" className="mt-4" onClick={() => setGstMode(null)}>Back</Button>
      )}
    </div>
  </div>
)} */}
{/* 
{showDesignerPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.57)" }}>
    <div className="bg-white rounded-lg shadow-lg p-8 w-80 flex flex-col items-center relative">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
        onClick={() => setShowDesignerPopup(false)}
        aria-label="Close"
      >×</button>
      <h2 className="text-lg font-bold mb-6 text-gray-800">Choose Type</h2>
      {!gstMode && (
        <div className="flex gap-4 w-full mb-4">
          <Button variant="danger" className="flex-1" onClick={() => setGstMode('customer')}>Customer</Button>
          <Button variant="dark" className="flex-1" onClick={() => setGstMode('workshop')}>Workshop</Button>
        </div>
      )}
      {gstMode === 'customer' && (
  <div className="w-full space-y-3">
    <input 
      className="w-full p-2 border rounded" 
      placeholder="Customer Name"
      value={formState.gstDetail.customer_name || formState.customerInfo.customerName}
      onChange={e => setFormState(prev => ({
        ...prev,
        gstDetail: { ...prev.gstDetail, customer_name: e.target.value }
      }))}
    />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Customer Address"
            value={formState.gstDetail.customer_address || formState.location.address}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_address: e.target.value }
            }))}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Customer GSTIN"
            value={formState.gstDetail.customer_gstin || formState.arrivalStatus.gstin}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_gstin: e.target.value }
            }))}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Customer State"
            value={formState.gstDetail.customer_state || formState.location.state}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, customer_state: e.target.value }
            }))}
          />
          <Button className="w-full mt-2" variant="danger" onClick={handleGenerateBill}>Generate Customer Bill</Button>
        </div>
      )}
      {gstMode === 'workshop' && (
        <div className="w-full space-y-3">
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Workshop Name"
            value={formState.gstDetail.wx_name || formState.workshop.name}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_name: e.target.value }
            }))}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Workshop Address"
            value={formState.gstDetail.wx_address || formState.workshop.locality}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_address: e.target.value }
            }))}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Workshop GSTIN"
            value={formState.gstDetail.wx_gstin}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_gstin: e.target.value }
            }))}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Workshop State"
            value={formState.gstDetail.wx_state || formState.location.state}
            onChange={e => setFormState(prev => ({
              ...prev,
              gstDetail: { ...prev.gstDetail, wx_state: e.target.value }
            }))}
          />
          <Button className="w-full mt-2" variant="dark" onClick={handleGenerateWxBill}>Generate Workshop Bill</Button>
        </div>
      )}
      {gstMode && (
        <Button variant="outline-secondary" className="mt-4" onClick={() => setGstMode(null)}>Back</Button>
      )}
    </div>
  </div>
)} */}

{/* Send Card Popup */}
{showSendCardPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.57)" }}>
    <div className="bg-white rounded-lg shadow-lg p-8 w-96 flex flex-col items-center relative">
      {/* Close button */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
        onClick={() => setShowSendCardPopup(false)}
        aria-label="Close"
      >
        ×
      </button>
      
      <h2 className="text-lg font-bold mb-6 text-gray-800">Send Card</h2>
      
      {/* Send JobCard Button */}
      <Button
        variant="outline-success"
        type="button"
        disabled={isSubmitting || isSendingJobCard}
        onClick={() => {
          // setShowSendCardPopup(false);
          handleSendJobCard();
        }}
        className="w-full mb-4 py-3 text-lg position-relative d-flex align-items-center justify-content-center"
      >
        {isSendingJobCard ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span className="animate-pulse">Sending JobCard...</span>
          </>
        ) : (
          <>
            <span className="me-2">
              {statusCounterData.job_card_count >= 1 ? 'Resend JobCard' : 'Send JobCard'}
            </span>
            {statusCounterData.job_card_count >= 1 && (
              <span 
                className="badge bg-success"
                title={`JobCard sent ${statusCounterData.job_card_count} time(s)`}
              >
                {statusCounterData.job_card_count}
              </span>
            )}
          </>
        )}
      </Button>
      
      {/* Send Estimate Button */}
      <Button
        variant="outline-info"
        type="button"
        disabled={isSubmitting || isSendingEstimate}
        onClick={() => {
          // setShowSendCardPopup(false);
          handleSendEstimate();
        }}
        className="w-full py-3 text-lg position-relative d-flex align-items-center justify-content-center"
      >
        {isSendingEstimate ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <span className="animate-pulse">Sending Estimate...</span>
          </>
        ) : (
          <>
            <span className="me-2">
              {statusCounterData.payment_due_count >= 1 ? 'Resend Estimate' : 'Send Estimate'}
            </span>
            {statusCounterData.payment_due_count >= 1 && (
              <span 
                className="badge bg-info"
                title={`Estimate sent ${statusCounterData.payment_due_count} time(s)`}
              >
                {statusCounterData.payment_due_count}
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  </div>
)}

{/* Reminder Popup */}
{showReminderPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.57)" }}>
    <div className="bg-white rounded-lg shadow-lg p-8 w-96 flex flex-col items-center relative">
      {/* Close button */}
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
        onClick={() => {
          setShowReminderPopup(false);
          // DON'T continue with save - just close popup
        }}
        aria-label="Close"
      >
        ×
      </button>
      
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-yellow-600 text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">Reminder</h2>
        <p className="text-gray-600">
          {reminderType === 'jobcard' 
            ? 'No JobCard has been sent yet. Would you like to send the JobCard to the customer?'
            : 'No Estimate has been sent yet. Would you like to send the Estimate to the customer?'
          }
        </p>
      </div>
      
      <div className="flex gap-3 w-full">
        
        {/* Skip & Save Button */}
        <Button
          variant="outline-secondary"
          type="button"
          onClick={() => {
            setShowReminderPopup(false);
            // Continue with save without sending
            setTimeout(() => {
              handleSubmit(new Event('submit'));
            }, 100);
          }}
          className="flex-1 py-2"
        >
          Skip & Save
        </Button>
      </div>
    </div>
  </div>
)}



// Replace the existing showDesignerPopup block with this
{showDesignerPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.57)" }}>
    <div className="bg-white rounded-lg shadow-lg p-8 w-96 flex flex-col items-center relative">
      {/* Header with title and navigation */}
      <div className="w-full flex items-center justify-between mb-6">
        {gstMode && (
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setGstMode(null)}
            aria-label="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>
        )}
        
        <h2 className="text-lg font-bold text-gray-800 flex-1 text-center">
          {!gstMode ? "Bill To" : 
           gstMode === 'customer' ? "Customer GST" : "Workshop GST"}
        </h2>
        
        <button
          className="text-gray-400 hover:text-red-500 text-xl"
          onClick={() => setShowDesignerPopup(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Selection buttons */}
      {!gstMode && (
        <div className="flex gap-4 w-full mb-4">
          <Button 
            variant="danger" 
            className="flex-1 py-3 text-lg font-medium" 
            onClick={() => setGstMode('customer')}
          >
            Customer
          </Button>
          <Button 
            variant="dark" 
            className="flex-1 py-3 text-lg font-medium" 
            onClick={() => setGstMode('workshop')}
          >
            Workshop
          </Button>
        </div>
      )}

      {/* Customer GST Form */}
      {gstMode === 'customer' && (
        <div className="w-full space-y-4">
          <div className="relative border border-gray-300 rounded-md">
            <input 
              className="w-full p-3 border-0 focus:ring-2 focus:ring-red-500" 
              placeholder="Customer Name"
              // CORRECTION: Read from gstDetails state
              value={gstDetails.customer_name} 
              // CORRECTION: Write to gstDetails state
              onChange={e => handleGstDetailsChange('customer_name', e.target.value)}
            />
            <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">
              Customer Name
            </label>
          </div>

          <div className="relative border border-gray-300 rounded-md">
            <input 
              className="w-full p-3 border-0 focus:ring-2 focus:ring-red-500" 
              placeholder="Customer Address"
               // CORRECTION: Read from gstDetails state
              value={gstDetails.customer_address}
               // CORRECTION: Write to gstDetails state
              onChange={e => handleGstDetailsChange('customer_address', e.target.value)}
            />
            <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">
              Customer Address
            </label>
          </div>

          <div className="relative border border-gray-300 rounded-md">
            <input 
              className="w-full p-3 border-0 focus:ring-2 focus:ring-red-500" 
              placeholder="Customer GSTIN"
               // CORRECTION: Read from gstDetails state
              value={gstDetails.customer_gstin}
               // CORRECTION: Write to gstDetails state
              onChange={e => handleGstDetailsChange('customer_gstin', e.target.value)}
            />
            <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">
              Customer GSTIN
            </label>
          </div>

            {/* State Dropdown (already correct) */}
            <div className="relative border border-gray-300 rounded-md customer-state-dropdown">
                <input
                    className="w-full p-3 border-0 focus:ring-2 focus:ring-red-500"
                    placeholder="Customer State"
                    value={gstDetails.customer_state}
                    onChange={e => {
                        handleGstDetailsChange('customer_state', e.target.value);
                        setStateSearchCustomer(e.target.value);
                        setShowCustomerStateDropdown(true);
                    }}
                    onFocus={() => setShowCustomerStateDropdown(true)}
                />
                 <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">
                    Customer State
                </label>
                {showCustomerStateDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {indianStates
                        .filter(state => state.toLowerCase().includes(stateSearchCustomer.toLowerCase()))
                        .map((state, index) => (
                        <div
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                handleGstDetailsChange('customer_state', state);
                                setShowCustomerStateDropdown(false);
                            }}
                        >
                            {state}
                        </div>
                        ))}
                    </div>
                )}
            </div>

          <div className="flex gap-4 w-full mt-6">
            <Button 
              className="flex-1 py-3 text-lg font-medium" 
              variant="outline-dark" 
              onClick={handleSaveGstDetails} // This button saves the temporary state
              disabled={isSavingGst || isGeneratingBill}
            >
             {isSavingGst ? 'Saving...' : 'Save Details'}
            </Button>
            <Button 
              className="flex-1 py-3 text-lg font-medium" 
              variant="danger" 
              onClick={handleGenerateBill}
              disabled={isGeneratingBill || isSavingGst}
            >
              {isGeneratingBill ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span className="animate-pulse">Generating...</span>
                </>
              ) : (
                'Generate Bill'
            )}
          </Button>
        </div>
          </div>
      )}

      {/* Workshop GST Form */}
      {gstMode === 'workshop' && (
         <div className="w-full space-y-4">
            <div className="relative border border-gray-300 rounded-md">
                <input 
                    className="w-full p-3 border-0 focus:ring-2 focus:ring-dark" 
                    placeholder="Workshop Name"
                    // CORRECTION: Read from gstDetails state
                    value={gstDetails.wx_name}
                    // CORRECTION: Write to gstDetails state
                    onChange={e => handleGstDetailsChange('wx_name', e.target.value)}
                />
                <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">Workshop Name</label>
            </div>
             <div className="relative border border-gray-300 rounded-md">
                <input 
                    className="w-full p-3 border-0 focus:ring-2 focus:ring-dark" 
                    placeholder="Workshop Address"
                    value={gstDetails.wx_address}
                    onChange={e => handleGstDetailsChange('wx_address', e.target.value)}
                />
                <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">Workshop Address</label>
            </div>
             <div className="relative border border-gray-300 rounded-md">
                <input 
                    className="w-full p-3 border-0 focus:ring-2 focus:ring-dark" 
                    placeholder="Workshop GSTIN"
                    value={gstDetails.wx_gstin}
                    onChange={e => handleGstDetailsChange('wx_gstin', e.target.value)}
                />
                <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">Workshop GSTIN</label>
            </div>
             {/* State dropdown (already correct) */}
             <div className="relative border border-gray-300 rounded-md workshop-state-dropdown">
                <input
                    className="w-full p-3 border-0 focus:ring-2 focus:ring-dark"
                    placeholder="Workshop State"
                    value={gstDetails.wx_state}
                    onChange={e => {
                        handleGstDetailsChange('wx_state', e.target.value);
                        setStateSearchWorkshop(e.target.value);
                        setShowWorkshopStateDropdown(true);
                    }}
                    onFocus={() => setShowWorkshopStateDropdown(true)}
                 />
                <label className="absolute -top-2.5 left-2 bg-white px-1 text-xs text-gray-500">Workshop State</label>
                {showWorkshopStateDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {indianStates
                            .filter(state => state.toLowerCase().includes(stateSearchWorkshop.toLowerCase()))
                            .map((state, index) => (
                            <div key={index} className="p-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    handleGstDetailsChange('wx_state', state);
                                    setShowWorkshopStateDropdown(false);
                                }}
                            >{state}</div>
                        ))}
                    </div>
                 )}
            </div>

            <div className="flex gap-4 w-full mt-6">
                <Button 
                    className="flex-1 py-3 text-lg font-medium" 
                    variant="outline-dark" 
                    onClick={handleSaveGstDetails} // Saves the temporary state
                    disabled={isSavingGst || isGeneratingWxBill}
                >
                    {isSavingGst ? 'Saving...' : 'Save Details'}
                </Button>
                <Button 
                    className="flex-1 py-3 text-lg font-medium" 
                    variant="dark" 
                    onClick={handleGenerateWxBill}
                    disabled={isGeneratingWxBill || isSavingGst}
                >
                    {isGeneratingWxBill ? 'Generating...' : 'Generate Bill'}
                </Button>
            </div>
        </div>
      )}
    </div>
  </div>
)}


{showWarrantyPopup && (
     
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Warranty Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Warranty</label>
                <textarea
                  value={warrantyDetails.warranty}
                  onChange={(e) => handleWarrantyInputChange(e.target.value)}
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter warranty details..."
                ></textarea>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowWarrantyPopup(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRephraseWarranty}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-yellow-300"
                disabled={isRephrasing}
              >
                {isRephrasing ? 'Rephrasing...' : 'Rephrase It'}
              </button>
              <button
                type="button"
                onClick={handleSaveWarranty}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Warranty
              </button>
            </div>
          </div>
        </div>
      )}



      </form>
    </Layout>
  );
};

export default EditPage;





// https://admin.onlybigcars.com/api/callerdesk-webhook/?type=call_report&coins=4&Status=ANSWER&campid=&CallSid=1744881973.2699220&EndTime=2025-04-17%2015:00:02&Uniqueid=&Direction=IVR&StartTime=2025-04-17%2014:56:13&key_press=&call_group=callgroup1&error_code=0&CallDuration=231&SourceNumber=8700837048&TalkDuration=215&hangup_cause=ANSWER(16)&receiver_name=loknath&DialWhomNumber=09218028154&LegB_Start_time=2025-04-17%2014:56:16&CallRecordingUrl=https://newcallrecords.callerdesk.io/incoming/04_2025/17/86070/20250417-145615-4912-8062649373-1744881973.2699220.wav&LegA_Picked_time=2025-04-17%2014:56:13&LegB_Picked_time=2025-04-17%2014:56:28&DestinationNumber=9999967591

// https://admin.onlybigcars.com/api/callerdesk-webhook/?type=call_report&coins=4&Status=CANCEL&campid=&CallSid=1744881973.2699220&EndTime=2025-04-17%2015:00:02&Uniqueid=&Direction=IVR&StartTime=2025-04-17%2014:56:13&key_press=&call_group=callgroup1&error_code=0&CallDuration=231&SourceNumber=09958134912&TalkDuration=215&hangup_cause=ANSWER(16)&receiver_name=Anjali&DialWhomNumber=09218028154&LegB_Start_time=2025-04-17%2014:56:16&CallRecordingUrl=https://newcallrecords.callerdesk.io/incoming/04_2025/17/86070/20250417-145615-4912-8062649373-1744881973.2699220.wav&LegA_Picked_time=2025-04-17%2014:56:13&LegB_Picked_time=2025-04-17%2014:56:28&DestinationNumber=9999967591