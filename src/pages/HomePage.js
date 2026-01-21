import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { Edit, Copy, Search, Plus, FileDown, X, FileUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DateRangeSelector from '../components/daterangeselector';
import StatusTimer from '../components/StatusTimer';
import './homepage.css';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';
import ExcelImport from '../components/ExcelImport';
import { State, City } from 'country-state-city';

const HomePage = () => {
    const dateRangeSelectorRef = useRef();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const location = useLocation();
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);
    const [garages, setGarages] = useState([]);
    const [garageSearchQuery, setGarageSearchQuery] = useState('');
    const [isGarageDropdownOpen, setIsGarageDropdownOpen] = useState(false);
    const [isWx, setIsWx] = useState(false);
    const [newCallNotification, setNewCallNotification] = useState(null);
    const [cities, setCities] = useState([]);
    const [locationSearchQuery, setLocationSearchQuery] = useState('');
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    // Add this with your other state declarations
    const [selectedStates, setSelectedStates] = useState([]);
    const [stateSearchQuery, setStateSearchQuery] = useState('');
    const [stateCityMap, setStateCityMap] = useState({}); // { [stateName]: [city1, city2, ...] }
    const [cityToState, setCityToState] = useState({});
    const [showImportButton, setShowImportButton] = useState(true);
    
    const locationDropdownRef = useRef(null);
    const garageDropdownRef = useRef(null);

    // Add new state
    const [welcomeData, setWelcomeData] = useState('');
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]); // Add state for users
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMessage, setSearchMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [userStatus, setUserStatus] = useState('Active');
    const [statusTime, setStatusTime] = useState(null);
    // const [isMobile, setIsMobile] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState([]);
        const [selectedCce, setSelectedCce] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const handleStatusChange = (newStatus, timestamp) => {
        setUserStatus(newStatus);
        setStatusTime(timestamp);
        // You may want to call fetchUserStatus() here too if needed
      };

    // Add these state variables at the top of your component
const [currentView, setCurrentView] = useState('default'); // 'default', 'filter', 'search'
const [savedSearchQuery, setSavedSearchQuery] = useState('');
const [savedFilterParams, setSavedFilterParams] = useState({});
const initialFilterState = {
    user: '', // Will be set based on isAdmin/cUser later
    source: '',
    status: '',
    location: [],
    arrivalMode: '',
    language_barrier: false,
    dateField: 'created_at',
    dateRange: { startDate: '', endDate: '' },
    garage: [],
    luxuryNormal: '', // Ensure this is included if it's part of your form
};
const [filterFormData, setFilterFormData] = useState(() => {
    // Initialize state from localStorage or use default
    const savedFilters = localStorage.getItem('homePageFilters');
    if (savedFilters) {
        try {
            const parsed = JSON.parse(savedFilters);
            // Coerce types to avoid old/corrupt data
            const coerced = {
                ...initialFilterState,
                ...parsed,
                location: Array.isArray(parsed.location)
                    ? parsed.location
                    : (parsed.location ? [parsed.location] : []),
                garage: Array.isArray(parsed.garage) ? parsed.garage : [],
            };
            return coerced;
        } catch (e) {
            console.error("Failed to parse saved filters, using defaults.", e);
            localStorage.removeItem('homePageFilters');
            return initialFilterState;
        }
    }
    return initialFilterState;
});

const [expandedLeadId, setExpandedLeadId] = useState(null);

    // Add pagination state
    const [dataFromFilter, setDataFromFilter] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Add ref for the table body
    const tableRef = useRef(null);
    const [seqNum, setSeqNum] = useState(null);
    const [cUser, setcUser] = useState(null);
    const [userStats, setUserStats] = useState({
        total_completed_leads: 0,
        gmv: 0,
        ats: 0
    });
    

    const scrollContainerRef = useRef(null); // Add this ref
    

    //14-2
    const truncateLeadId = (leadId) => {
        if (typeof leadId === 'string' || typeof leadId === 'number') {
            // return `${String(leadId).slice(0, 8)}... (hover)`;
            const stringId = String(leadId);
            if (stringId.length > 8) {
                return `${stringId.slice(0, 8)}... `;
            }
            return stringId;
        }
        return '';
    };

    // Add these state variables at the top of your component
    // const [totalLeads, setTotalLeads] = useState(0);
    const [totalEstimatedPrice, setTotalEstimatedPrice] = useState(0);
    const [estPricePerLead, setEstPricePerLead] = useState(0);
    const [totalFinalAmount, setTotalFinalAmount] = useState(0);
    const [finalAmountPerLead, setFinalAmountPerLead] = useState(0);
    const [totalCommissionDue, setTotalCommissionDue] = useState(0);
    const [totalCommissionReceived, setTotalCommissionReceived] = useState(0);
    const [totalCommissionExceptOwn, setTotalCommissionExceptOwn] = useState(0);
    const [showStatsContainer, setShowStatsContainer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);


    
        const handleSelectLead = (leadId) => {
            setSelectedLeads(prev =>
                prev.includes(leadId)
                    ? prev.filter(id => id !== leadId)
                    : [...prev, leadId]
            );
        };
    
        const handleSelectAllLeads = (e) => {
            if (e.target.checked) {
                const allLeadIds = leads.map(lead => lead.id);
                setSelectedLeads(allLeadIds);
            } else {
                setSelectedLeads([]);
            }
        };
    
        const handleBulkCceUpdate = async () => {
            if (selectedLeads.length === 0 || !selectedCce) {
                setAlertMessage('Please select at least one lead and a CCE.');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000);
                return;
            }
    
            try {
                const response = await axios.post(
                    'https://admin.onlybigcars.com/api/leads/bulk-update-cce/',
                    {
                        lead_ids: selectedLeads,
                        cce_username: selectedCce
                    },
                    { headers: { 'Authorization': `Token ${token}` } }
                );
                console.log(response.data);
    
                setAlertMessage(response.data.message);
                setShowSuccessAlert(true);
                setSelectedLeads([]);
                setSelectedCce('');
                fetchLeads(); // Refresh leads to show changes
                setTimeout(() => setShowSuccessAlert(false), 3000);
    
            } catch (error) {
                console.error('Error updating CCE:', error);
                setAlertMessage('Failed to update CCE. ' + (error.response?.data?.error || ''));
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 3000);
            }
        };
    const handleDeselectAll = () => {
    setSelectedLeads([]);
};

    // const fetchLeads = async () => {
    //     try {
    //         setIsLoading(true);
    //         const response = await axios.get(`https://admin.onlybigcars.com/?page=1`, {
    //             headers: { 'Authorization': `Token ${token}` }
    //         });
    
    //         setLeads(response.data.leads);
    //         setTotalPages(response.data.total_pages);
    //         setCurrentPage(1);
    //         setHasMore(response.data.current_page < response.data.total_pages);
    //         setSeqNum(response.data.seq_num);
    //         setCurrentView('default');
    //         setSavedSearchQuery('');
    //         setSavedFilterParams({});
    //     } catch (error) {
    //         console.error('Error fetching leads:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    

    // const fetchMoreLeads = async () => {
    //     console.log('Fetching more leads. Current page:', currentPage, 'View:', currentView);
    //     if (isLoading || !hasMore || currentPage >= totalPages) return;
    
    //     try {
    //         setIsLoading(true);
    //         const nextPage = currentPage + 1;
    //         let response;
    
    //         if (currentView === 'filter') {
    //             console.log('Fetching filtered leads with params:', savedFilterParams);
    //             response = await axios.post(
    //                 'https://admin.onlybigcars.com/api/leads/filter/',
    //                 { ...savedFilterParams, page: nextPage },
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         } else if (currentView === 'search') {
    //             console.log('Fetching search results with query:', savedSearchQuery);
    //             response = await axios.get(
    //                 `https://admin.onlybigcars.com/api/leads/search/?query=${savedSearchQuery}&page=${nextPage}`,
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         } else {
    //             console.log('Fetching default leads');
    //             response = await axios.get(
    //                 `https://admin.onlybigcars.com/?page=${nextPage}`,
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         }
    
    //         console.log('Received response:', response.data);
    
    //         // Append only new leads by filtering out any duplicates (using lead.id)
    //         setLeads(prev => {
    //             const newLeads = response.data.leads.filter(newLead =>
    //                 !prev.some(existingLead => existingLead.id === newLead.id)
    //             );
    //             return [...prev, ...newLeads];
    //         });
    //         setCurrentPage(nextPage);
    //         setTotalPages(response.data.total_pages);
    //         setTotalLeads(response.data.total_leads); // Update total leads count
    //         setHasMore(nextPage < response.data.total_pages);
    
    //     } catch (error) {
    //         console.error('Error fetching more leads:', error);
    //         setHasMore(false);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    
    // ...existing code...

const handleClick2Call = async (receiverNo) => {
  try {
    const response = await axios.post(
      'https://admin.onlybigcars.com/api/click2call/',
      { receiver_no: receiverNo },
      { headers: { Authorization: `Token ${token}` } }
    );
    setAlertMessage(response.data.message || 'Call initiated!');
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  } catch (error) {
    setAlertMessage('Failed to initiate call: ' + (error.response?.data?.error || error.message));
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000);
  }
};
// ...existing code...

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            const pageSize = isMobile ? 20 : 5; // 20 for mobile, 5 for desktop
            console.log('=== FRONTEND DEBUG ===');
            console.log('Is mobile:', isMobile);
            console.log('Page size:', pageSize);
            console.log('======================');
        
            const response = await axios.get(`https://admin.onlybigcars.com/?page=1&page_size=${pageSize}`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setLeads(response.data.leads);
            setTotalPages(response.data.total_pages);
            setCurrentPage(1);
    
            // IMPORTANT: Reset filter-related state
            setDataFromFilter(false);
            setShowStatsContainer(false);
    
            setTotalLeads(response.data.total_leads || 0);
            setTotalEstimatedPrice(0);
            setEstPricePerLead(0);
            setTotalFinalAmount(0);
            setFinalAmountPerLead(0);
            // setTotalCommissionDue(commissionStats.total_commission_due || 0);
            // setTotalCommissionReceived(commissionStats.total_commission_received || 0);
    
            setHasMore(response.data.current_page < response.data.total_pages);
            setSeqNum(response.data.seq_num);
            
            setCurrentView('default');
            setSavedSearchQuery('');
            setSavedFilterParams({});

            
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    
    const fetchMoreLeads = async () => {
        if (isLoading || !hasMore || currentPage >= totalPages) return;
    
        try {
            setIsLoading(true);
             const nextPage = currentPage + 1;
            const pageSize = isMobile ? 20 : 5; // Add this line
            let response;
    
         

        if (currentView === 'filter') {
            response = await axios.post(
                'https://admin.onlybigcars.com/api/leads/filter/',
                { ...savedFilterParams, page: nextPage, page_size: pageSize }, // Add page_size here
                { headers: { 'Authorization': `Token ${token}` } }
            );
        } else if (currentView === 'search') {
            response = await axios.get(
                `https://admin.onlybigcars.com/api/leads/search/?query=${savedSearchQuery}&page=${nextPage}&page_size=${pageSize}`, // Add page_size here
                { headers: { 'Authorization': `Token ${token}` } }
            );
        } else {
            response = await axios.get(
                `https://admin.onlybigcars.com/?page=${nextPage}&page_size=${pageSize}`, // Add page_size here
                { headers: { 'Authorization': `Token ${token}` } }
            );
        }
            // Append new leads, filtering out duplicates
            setLeads(prev => {
                const newLeads = response.data.leads.filter(newLead =>
                    !prev.some(existingLead => existingLead.id === newLead.id)
                );
                return [...prev, ...newLeads];
            });
            setCurrentPage(nextPage);
            setTotalPages(response.data.total_pages);
            // For additional pages, update the total if provided; otherwise add new count.
            if (response.data.total_leads) {
                setTotalLeads(response.data.total_leads);
            } else {
                setTotalLeads(prevTotal => prevTotal + response.data.leads.length);
            }
            setHasMore(nextPage < response.data.total_pages);
        } catch (error) {
            console.error('Error fetching more leads:', error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    


    const handleScroll = useCallback((e) => {
        const element = e.target;
        const scrollOffset = 50;
        
        if (
            !isLoading && 
            hasMore && 
            currentPage < totalPages &&
            element.scrollHeight - element.scrollTop <= element.clientHeight + scrollOffset
        ) {
            fetchMoreLeads();
        }
    }, [isLoading, hasMore, currentPage, totalPages]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchMessage('');
        try {
            const pageSize = isMobile ? 20 : 5; // Add this line
        
        const response = await axios.get(
            `https://admin.onlybigcars.com/api/leads/search/?query=${searchQuery}&page=1&page_size=${pageSize}`, // Add page_size here
            { headers: { 'Authorization': `Token ${token}` } }
        );
            // Update state
            setLeads(response.data.leads);
            setTotalPages(response.data.total_pages);
            setCurrentPage(1);
            setSavedSearchQuery(searchQuery); // Save the query
            setCurrentView('search'); // Set current view
            setSearchQuery('');
    
            // Reset filter flag for search view
            setDataFromFilter(false);
            setShowStatsContainer(false);
                
            setTotalLeads(response.data.total_leads);
            setHasMore(response.data.current_page < response.data.total_pages);
    
            if (response.data.leads.length === 0) {
                setSearchMessage(`No leads found for "${searchQuery}"`);
            }
            setSearchQuery('');
        } catch (error) {
            console.error('Error searching leads:', error);
            setSearchMessage('Error occurred while searching');
        }
    };

    // Add this function to your HomePage component
const handleGarageChange = (garageName) => {
    setFilterFormData(prev => {
        const updatedGarages = prev.garage.includes(garageName)
            ? prev.garage.filter(g => g !== garageName) // Remove if already selected
            : [...prev.garage, garageName]; // Add if not selected
        
        return {
            ...prev,
            garage: updatedGarages
        };
    });
};
   

const handleLocationChange = (cityName) => {
     const isSelecting = !filterFormData.location.includes(cityName);
    setFilterFormData(prev => {
        const updatedLocations = prev.location.includes(cityName)
            ? prev.location.filter(c => c !== cityName)
            : [...prev.location, cityName];
        return { ...prev, location: updatedLocations };
    });
    if (isSelecting) {
        const st = cityToState[cityName];
        if (st) {
            setSelectedStates(prev => (prev.includes(st) ? prev : [...prev, st]));
            
        }
    }
};

const handleStateToggle = (stateName) => {
    setSelectedStates(prev => 
        prev.includes(stateName)
            ? prev.filter(s => s !== stateName)
            : [...prev, stateName]
    );
};

// NEW: get cities visible in the right pane (union of selected states, filtered by city search)
const getVisibleCities = () => {
    const addIfMatches = (acc, list) => {
        list.forEach(c => {
            if (c.toLowerCase().includes(locationSearchQuery.toLowerCase())) acc.add(c);
        });
    };
    const union = new Set();
    if (!selectedStates.length) {
        // Union of all available cities (across all states)
        Object.values(stateCityMap).forEach(list => addIfMatches(union, list || []));
    } else {
        selectedStates.forEach(st => addIfMatches(union, stateCityMap[st] || []));
    }
    return Array.from(union).sort((a, b) => a.localeCompare(b));
};

// NEW: select/unselect all visible states (respecting stateSearchQuery)
const toggleAllStates = () => {
    const allStates = Object.keys(stateCityMap);
    const filteredStates = allStates.filter(s =>
        s.toLowerCase().includes(stateSearchQuery.toLowerCase())
    );
    const allSelected = filteredStates.every(s => selectedStates.includes(s));
    if (allSelected) {
        setSelectedStates(prev => prev.filter(s => !filteredStates.includes(s)));
    } else {
        const merged = new Set([...selectedStates, ...filteredStates]);
        setSelectedStates(Array.from(merged));
    }
};

// UPDATED: select/unselect all visible cities (respecting selected states + city search)
const toggleAllLocations = () => {
    const filteredCities = getVisibleCities(); // now from right pane
    const allSelected = filteredCities.every(city =>
        filterFormData.location.includes(city)
    );

    if (allSelected) {
        setFilterFormData(prev => ({
            ...prev,
            location: prev.location.filter(loc => !filteredCities.includes(loc))
        }));
    } else {
        setFilterFormData(prev => ({
            ...prev,
            location: [...new Set([...prev.location, ...filteredCities])]
        }));
    }
};

// Add this function after handleGarageChange
const getCityVariations = (cityName) => {
    const cityMap = {
      'bangalore': ['bangalore', 'bengaluru'],
      'bengaluru': ['bangalore', 'bengaluru'],
      'bombay': ['mumbai', 'bombay'],
      'mumbai': ['mumbai', 'bombay'],
      'delhi': ['delhi', 'new delhi'],
      'calcutta': ['kolkata', 'calcutta'],
      'kolkata': ['kolkata', 'calcutta'],
      'madras': ['chennai', 'madras'],
      'chennai': ['chennai', 'madras'],
      'gurugram': ['gurugram', 'gurgaon']
    };
    
    return cityMap[cityName.toLowerCase()] || [cityName.toLowerCase()];
  };

// Add this function after handleGarageChange
const toggleAllGarages = () => {
    // Get the currently filtered garages based on search
    const filteredGarageNames = garages
        .filter(garage =>
            garage.name.toLowerCase().includes(garageSearchQuery.toLowerCase()) ||
            (garage.mechanic && garage.mechanic.toLowerCase().includes(garageSearchQuery.toLowerCase())) ||
            (garage.locality && garage.locality.toLowerCase().includes(garageSearchQuery.toLowerCase()))
        )
        .map(garage => garage.name);

         // Modify your garage filter to use the new function
const filteredGarages = garages.filter(garage => {
    const query = garageSearchQuery.toLowerCase();
    
    // Check if query might be a city name with variations
    const cityVariations = getCityVariations(query);
    
    // Check name match
    if (garage.name.toLowerCase().includes(query)) return true;
    
    // Check mechanic match
    if (garage.mechanic && garage.mechanic.toLowerCase().includes(query)) return true;
    
    // Check locality match with city variations
    if (garage.locality) {
      // First try direct match
      if (garage.locality.toLowerCase().includes(query)) return true;
      
      // Then try all city variations
      for (const cityVariation of cityVariations) {
        if (garage.locality.toLowerCase().includes(cityVariation)) return true;
      }
    }
    
    return false;
  });
    
    
    // Check if all filtered garages are already selected
    const allSelected = filteredGarageNames.every(name => 
        filterFormData.garage.includes(name)
    );
    
    // If all are selected, unselect all. Otherwise, select all
    if (allSelected) {
        // Remove all filtered garages from selection
        setFilterFormData(prev => ({
            ...prev,
            garage: prev.garage.filter(name => !filteredGarageNames.includes(name))
        }));
    } else {
        // Add all filtered garages to selection (avoiding duplicates)
        setFilterFormData(prev => {
            const currentGarages = [...prev.garage];
            filteredGarageNames.forEach(name => {
                if (!currentGarages.includes(name)) {
                    currentGarages.push(name);
                }
            });
            return {
                ...prev,
                garage: currentGarages
            };
        });
    }
};

const handleDateRangeChange = (range) => {
    // setDateRange([range.startDate, range.endDate]); // No longer needed
    setFilterFormData((prevData) => ({
        ...prevData,
        dateRange: {
            startDate: range.startDate,
            endDate: range.endDate
        }
    }));
};
    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilterFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFilterSubmit = async (e) => {
        e.preventDefault();
        setSearchMessage('');
        // Reset total leads (and optionally other pagination states) before filtering
        setIsGarageDropdownOpen(false);
        setTotalLeads(0);
        setCurrentPage(1);
        setTotalPages(1);
        setIsLoading(true); // Add loading state here
        setShowImportButton(false); // Add this line to hide import button
        try {
             const pageSize = isMobile ? 20 : 5; // Add this line
        
        const filterPayload = {
            ...filterFormData,
            dateRange: {
                ...filterFormData.dateRange,
                dateField: filterFormData.dateField
            },
            page_size: pageSize // Add this line
        };
            const response = await axios.post(
                'https://admin.onlybigcars.com/api/leads/filter/',
               { ...filterPayload, page: 1 },
                { headers: { 'Authorization': `Token ${token}` }}
            );
    
            // Debug logs
            console.log("Filter response:", response.data);
            console.log("Statistics in response:", {
                'total_estimated_price': response.data.total_estimated_price,
                'est_price_per_lead': response.data.est_price_per_lead,
                'total_final_amount': response.data.total_final_amount,
                'final_amount_per_lead': response.data.final_amount_per_lead
            });
            
            // Update state with filter results
            setLeads(response.data.leads);
            setTotalPages(response.data.total_pages);
            setSavedFilterParams(filterFormData);
            setCurrentView('filter');
            
            // Set statistics data from filter response
            setTotalLeads(response.data.total_leads || 0);
            setTotalEstimatedPrice(response.data.total_estimated_price || 0);
            setEstPricePerLead(response.data.est_price_per_lead || 0);

            setTotalFinalAmount(response.data.total_final_amount || 0);
            setFinalAmountPerLead(response.data.final_amount_per_lead || 0);

            const commissionStats = response.data.commission_stats || {};
            setTotalCommissionDue(commissionStats.total_commission_due || 0);
            setTotalCommissionReceived(commissionStats.total_commission_received || 0);
            setTotalCommissionExceptOwn(commissionStats.total_commission_except_own || 0);

            // IMPORTANT: Set these flags explicitly and unconditionally for filter view
            setDataFromFilter(true);
            setShowStatsContainer(true);
            
            setHasMore(response.data.current_page < response.data.total_pages);
    
            if (response.data.leads.length === 0) {
                setSearchMessage('No leads found for the selected filters');
            }
        } catch (error) {
            console.error('Error filtering leads:', error);
            setSearchMessage('Error occurred while filtering');
            // Reset stats data on error
            setDataFromFilter(false);
            setShowStatsContainer(false);
        } finally {
            setIsLoading(false);
        }
    };
    

    // 18 feb start 

    const formatLeadDataForClipboard = (lead) => {
        
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
          formatColumns('Name:', lead.name, true),
          formatColumns('Number:', lead.number, true),
          '',
          formatColumns('Car:', lead.vehicle, true),
          // Alternative if properties are nested under a car object
formatColumns('Variant:', lead.car ? `${lead.car.year || ''} ${lead.car.fuel || ''}` : 'N/A', true),
          '',
          formatColumns('Vin No.:', lead.vinNumber),
          formatColumns('Reg No.:', lead.regNumber),
          formatColumns('Arrival:', lead.arrival_mode),
          // With this improved version that handles the 'T' character
formatColumns('Date:', lead.arrival_time ? 
    (typeof lead.arrival_time === 'string' && lead.arrival_time.includes('T') ? 
      lead.arrival_time.replace('T', ' ') : 
      new Date(lead.arrival_time).toLocaleString('en-IN')) 
    : 'N/A', true),
          '',
          formatColumns('Add:', lead.address || 'N/A'),
          '',
          formatMultiLine('Map Link:', lead.map_link || 'N/A', true),
          '',
          formatColumns('Work Summary:', lead.products?.map(product => product.name).join(', ') || 'N/A', true),
          '',
          formatColumns('Total Amount:', `${lead.estimated_price || 'N/A'}`, true),
          '',
          formatMultiLine('Workshop Name:', lead.workshop_details?.name || 'N/A', false),
          '',
          formatColumns('Lead Status:', lead.status),
          formatColumns('Lead Source:', lead.source),
          formatColumns('Office CCE:', lead.cceName),
          formatColumns('Technician:', lead.caName),
          '',
          formatColumns('Lead ID:', lead.id)
        ].join('\n');
      
        return formattedData;
      };


      const handleCopyClick = async (lead) => {
        try {
          const formattedData = formatLeadDataForClipboard(lead);
          await navigator.clipboard.writeText(formattedData);
          
          // Show success message
          setAlertMessage('Lead details copied to clipboard');
          setShowSuccessAlert(true);
          setTimeout(() => {
            setShowSuccessAlert(false);
            setAlertMessage('');
          }, 3000);
        } catch (error) {
          console.error('Failed to copy:', error);
          setAlertMessage('Failed to copy lead details');
          setShowSuccessAlert(true);
          setTimeout(() => {
            setShowSuccessAlert(false);
            setAlertMessage('');
          }, 3000);
        }
      };

      // 18 feb end

      const handleReset = (e) => {
        if (e && e.target && e.target.form) {
            e.target.form.reset(); // Reset form visually if event is passed
        }
        // Reset state to initial values, considering admin/user status
        const defaultFilters = {
            ...initialFilterState,
            user: isAdmin ? '' : (cUser || '') // Set user based on current context
        };
        setFilterFormData(defaultFilters);
        setSelectedStates([]);
        setStateSearchQuery('');
        setLocationSearchQuery('');
    
        // Reset dependent UI states
        setDataFromFilter(false);
        setShowStatsContainer(false);
        setShowImportButton(true); // Add this line to show import button
        if (dateRangeSelectorRef.current && typeof dateRangeSelectorRef.current.reset === 'function') {
            dateRangeSelectorRef.current.reset(); // Reset the DateRangeSelector component
        }
        setSavedFilterParams({}); // Clear saved parameters for fetching more
        setCurrentView('default'); // Reset view type
        setSearchMessage(''); // Clear any messages
    
        // Clear the saved filters from localStorage
        localStorage.removeItem('homePageFilters');
        console.log("Filters reset and localStorage cleared.");
    
        // Optional: Refetch default leads after reset
        fetchLeads();
    };
    // http://34.131.86.189

    // Add this useEffect near the top of your HomePage component
useEffect(() => {
    const checkIfMobile = () => {
        const isMobileDevice = window.innerWidth <= 768;
        console.log('=== MOBILE DETECTION ===');
        console.log('Window width:', window.innerWidth);
        console.log('Is mobile:', isMobileDevice);
        console.log('========================');
        setIsMobile(isMobileDevice);
    };
    
    checkIfMobile(); // Check on initial load
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
}, []);

useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                locationDropdownRef.current &&
                !locationDropdownRef.current.contains(event.target)
            ) {
                setIsLocationDropdownOpen(false);
            }
            if (
                garageDropdownRef.current &&
                !garageDropdownRef.current.contains(event.target)
            ) {
                setIsGarageDropdownOpen(false);
            }
        };

        // Add event listener when a dropdown is open
        if (isLocationDropdownOpen || isGarageDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Cleanup the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLocationDropdownOpen, isGarageDropdownOpen]); 

    useEffect(() => {
    console.log('Here we are - ')
    // Fetch welcome message and users
    axios.get('https://admin.onlybigcars.com/', {
        headers: {
            Authorization: `Token ${token}`
        }
    })
        .then(response => {
            setWelcomeData(response.data.message);
            setUsers(response.data.users);
            setUserStats(response.data.user_stats || {});
            setGarages(response.data.garages);
            setCities(response.data.cities || []);
            setIsAdmin(response.data.is_admin || false); 
            setIsWx(response.data.is_wx || false);
            if (!response.data.is_admin && response.data.current_username) {
                setcUser(response.data.current_username);
                setFilterFormData(prev => ({
                ...prev,
                user: response.data.current_username
                }));
            }
            console.log('the admin is set - ', response.data.is_admin)
        })
        .catch(error => console.error('Error fetching home data through hom view:', error));
}, [token]);

// NEW: derive state -> available cities from `cities`
useEffect(() => {
    // normalize with alias handling
    const normalizeCityName = (name) => {
        if (!name) return '';
        const s = String(name).trim().toLowerCase();
        const alias = {
            'bengaluru': 'bangalore',
            'bangalore': 'bangalore',
            'bombay': 'mumbai',
            'mumbai': 'mumbai',
            'new delhi': 'delhi',
            'delhi': 'delhi',
            'calcutta': 'kolkata',
            'kolkata': 'kolkata',
            'madras': 'chennai',
            'chennai': 'chennai',
            'gurgaon': 'gurugram',
            'gurugram': 'gurugram'
        };
        return alias[s] || s;
    };

    if (!cities || !cities.length) {
        setStateCityMap({});
        return;
    }

    // Map normalized -> Set of original city names from API (preserve original labels)
    const normalizedToOriginals = new Map();
    cities.forEach(orig => {
        const norm = normalizeCityName(orig);
        if (!normalizedToOriginals.has(norm)) normalizedToOriginals.set(norm, new Set());
        normalizedToOriginals.get(norm).add(orig);
    });

    const statesInIndia = State.getStatesOfCountry('IN') || [];
    const nextMap = {};

    statesInIndia.forEach(st => {
        const cscCities = City.getCitiesOfState('IN', st.isoCode) || [];
        const matchedOriginals = new Set();

        cscCities.forEach(csc => {
            const norm = normalizeCityName(csc.name);
            const originals = normalizedToOriginals.get(norm);
            if (originals && originals.size) {
                originals.forEach(o => matchedOriginals.add(o));
            }
        });

        if (matchedOriginals.size > 0) {
            nextMap[st.name] = Array.from(matchedOriginals).sort((a, b) =>
                String(a).localeCompare(String(b))
            );
        }
    });
    const reverse = {};
    Object.keys(nextMap).forEach(stName => {
        nextMap[stName].forEach(city => {
            reverse[city] = stName;
        });
    });

    setStateCityMap(nextMap);
    setCityToState(reverse);
}, [cities]);

    useEffect(() => {
        fetchLeads();
    }, [token]);

    useEffect(() => {
        if (location.state?.message) {
            setAlertMessage(location.state.message);
            setShowSuccessAlert(true);
            // Clear location state
            window.history.replaceState({}, document.title);
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                setShowSuccessAlert(false);
                setAlertMessage('');
            }, 3000);
        }
    }, [location]);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);




// Effect to restore DateRangeSelector state after filterFormData is potentially restored
useEffect(() => {
    // Check if dates exist in the (potentially restored) filterFormData
    const { startDate, endDate } = filterFormData.dateRange || {};
    
    if (startDate && endDate && dateRangeSelectorRef.current && 
        typeof dateRangeSelectorRef.current.setDates === 'function') {
        
        // Validate dates before setting them
        try {
            // Parse dates and check if they're valid
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                console.log("Restoring valid dates in DateRangeSelector:", startDate, endDate);
                dateRangeSelectorRef.current.setDates(startDate, endDate);
            } else {
                console.error("Invalid dates found in saved filters, will not restore:", { startDate, endDate });
                // Clear invalid dates
                setFilterFormData(prev => ({
                    ...prev,
                    dateRange: { startDate: '', endDate: '' }
                }));
            }
        } catch (e) {
            console.error("Error parsing saved dates:", e);
            // Clear invalid dates
            setFilterFormData(prev => ({
                ...prev,
                dateRange: { startDate: '', endDate: '' }
            }));
        }
    }
    
    // Check if we should apply restored filters automatically
    const isRestored = localStorage.getItem('homePageFilters');
    if (isRestored) {
        // Existing logic...
        const parsed = JSON.parse(isRestored);
        const wasFiltered = Object.keys(parsed).some(key =>
            key !== 'user' && key !== 'dateField' && key !== 'language_barrier' && 
            parsed[key] && (!Array.isArray(parsed[key]) || parsed[key].length > 0) && 
            (!(typeof parsed[key] === 'object' && key === 'dateRange') || 
                (parsed[key].startDate && parsed[key].endDate))
        );
        
        if (wasFiltered) {
            console.log("Filters were restored from localStorage. UI updated.");
        }
    }
}, []); // Run only once on mount

    
   // Modify the checkForNewCalls function within your useEffect
useEffect(() => {
    // Function to check for new calls
    const checkForNewCalls = async () => {
      console.log("🔍 Checking for new calls...");
      try {
        // Get the last lead ID you've seen
        const lastSeenLeadId = localStorage.getItem('lastSeenLeadId') || '';
        console.log("📱 Last seen lead ID:", lastSeenLeadId);
        
        // Get recent calls (implement this API endpoint in your backend)
        console.log("📞 Calling API: /api/recent-calls/");
        const response = await axios.get(
          'https://admin.onlybigcars.com/api/recent-calls/',
          {
            headers: {
              'Authorization': `Token ${token}`
            }
          }
        );
        
        console.log("📡 API response:", response.data);
        
        // If there's a new lead
        if (response.data.lead_id && response.data.lead_id !== lastSeenLeadId) {
          console.log("🔔 NEW CALL DETECTED! Lead ID:", response.data.lead_id);
          setNewCallNotification({
            id: response.data.lead_id,
            number: response.data.source_number
          });
          
          // Play notification sound
        //   console.log("🔊 Playing notification sound");
        //   const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        //   audio.play().catch(err => console.log("Could not play sound:", err));
        } else {
          console.log("😴 No new calls detected");
        }
      } catch (error) {
        console.error('❌ Error checking for new calls:', error);
      }
    };
  
    console.log("⏰ Setting up call polling interval");
    // Check immediately on component mount
    checkForNewCalls();
    
    // Then check every 30 seconds
    const intervalId = setInterval(checkForNewCalls, 2000);
    
    // Cleanup on unmount
    return () => {
      console.log("🛑 Clearing call polling interval");
      clearInterval(intervalId);
    };
  }, [token]);

  
    
    // Add after state declarations:
  
  // Effect to save filters to localStorage whenever they change
  useEffect(() => {
      // Debounce or throttle this if performance becomes an issue with rapid changes
      localStorage.setItem('homePageFilters', JSON.stringify(filterFormData));
  }, [filterFormData]);

  // Add this useEffect after your existing interval effect 21 April
useEffect(() => {
    console.log("🔄 Setting up lead refresh interval");
    
    // Create a refresh interval with longer duration (e.g., 30 seconds)
    // to avoid overwhelming the server
    const refreshIntervalId = setInterval(() => {
      console.log("🔄 Auto-refreshing leads data...");
      
      // Only refresh if we're not already loading data and user isn't in the middle of pagination
      if (!isLoading && currentView === 'default') {
        // Use the existing fetchLeads function to refresh data
        fetchLeads();
      }
    }, 30000); // 30 seconds - adjust as needed
    
    // Cleanup on unmount
    return () => {
      console.log("🛑 Clearing lead refresh interval");
      clearInterval(refreshIntervalId);
    };
  }, [isLoading, currentView]); // Add dependencies to prevent unnecessary interval resets
  

  // Fetch user status when component mounts
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await axios.get('https://admin.onlybigcars.com/api/user-status/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        setUserStatus(response.data.status);
        setStatusTime(response.data.timestamp);
      } catch (error) {
        console.error('Error fetching status:', error);
      }
    };
    
    if (token) {
      fetchUserStatus();
      // Refresh status every minute
      const interval = setInterval(fetchUserStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);
  
  
     
    
// Add this function to export data to Excel 06-03
    const [isExporting, setIsExporting] = useState(false);
    
    
    const exportToExcel = async () => {
        try {
            setIsExporting(true);
            setAlertMessage('Preparing Excel export...');
            setShowSuccessAlert(true);
    
            let response;
            let url;
            let method = 'GET'; // Default to GET
            let data = null;    // Default to no data (for GET requests)
    
            
            if (currentView === 'filter') {
                
                   url= 'https://admin.onlybigcars.com/api/leads/export/filter/';
                   method = 'POST';
                   data = {
                    ...savedFilterParams,
                    // Ensure dateRange is properly formatted if it exists
                    dateRange: savedFilterParams.dateRange ? {
                        startDate: savedFilterParams.dateRange.startDate || null,
                        endDate: savedFilterParams.dateRange.endDate || null,
                        dateField: savedFilterParams.dateField || savedFilterParams.dateRange.dateField || 'created_at',
                    } : null,
                };
                   
                    
            } else if (currentView === 'search') {
                
                   url= `https://admin.onlybigcars.com/api/leads/export/search/?query=${encodeURIComponent(savedSearchQuery)}`;
                    
            } else {
                
                // url = 'https://admin.onlybigcars.com/api/leads/export/';
                url= 'https://admin.onlybigcars.com/api/leads/export/filter/';
                method = 'POST';
                
                    
            }
    
    
            response = await axios({
                method: method,
                url: url,
                data: data, // This will be null for GET, and savedFilterParams for POST
                headers: { 'Authorization': `Token ${token}` }
            });
    
            // Check if we got a valid response with leads
            if (!response.data || !response.data.leads) {
                throw new Error('Invalid response format from server');
            }
            // Add before the mapping to check what's coming from API
            console.log("Sample lead data:", response.data.leads[0]);
            // Format data for Excel
            // Modify within the exportToExcel function, around line 1208 (after logging the sample lead data)
// Format data for Excel
const excelData = response.data.leads.map(lead => ({
    'Lead ID': lead.id,
    'Type': lead.type,
    'Location': lead.city,
    'Customer Name': lead.name,
    'Vehicle': lead.vehicle,
    'Phone Number': lead.number,
    'WhatsApp Number': lead.whatsapp_number || 'NA',
    'Customer Email': lead.email || 'NA',
    'Address': lead.address || 'NA',
    'Map Link': lead.map_link || 'NA',
    'Source': lead.source,
    'Order ID': lead.orderId,
    'Registration Number': lead.regNumber,
    'Workshop Name': lead.workshop_details?.name || 'NA',
    
    // Status related fields - always include these
    'Status': lead.status || lead.lead_status || 'NA',
    'Arrival Mode': lead.arrival_mode || 'NA',
    'Disposition': lead.disposition || 'NA',
    'Arrival Date/Time': lead.arrival_time ? new Date(lead.arrival_time).toLocaleString('en-IN') : 'Not Set',
    
    // Conditional fields - include always but they'll be empty if not applicable
    'Battery Feature': lead.battery_feature || 'NA',
    'Fuel Status': lead.fuel_status || 'NA',
    'Fuel Type': lead.car?.fuel || 'NA',
    
    'Speedometer Reading': lead.speedometer_rd || 'NA',
    'Additional Work': lead.additional_work || 'NA',
    'Inventory': Array.isArray(lead.inventory) 
        ? lead.inventory.join(', ') 
        : (typeof lead.inventory === 'string' ? lead.inventory : 'NA'),
    
    // Payment/Commission fields
    'Estimated Price': typeof lead.estimated_price !== 'undefined' ? `${Number(lead.estimated_price).toLocaleString('en-IN')}` : 'NA',
    'Discount': typeof lead.overview?.discount !== 'undefined' ? `${Number(lead.overview?.discount).toLocaleString('en-IN')}` : 'NA',
    'Final Amount': typeof lead.overview?.finalAmount !== 'undefined' 
        ? `${Number(lead.overview.finalAmount).toLocaleString('en-IN')}` 
        : (typeof lead.final_amount !== 'undefined' ? `${Number(lead.final_amount).toLocaleString('en-IN')}` : 'NA'),
    'Commission Due': typeof lead.commission_due !== 'undefined' ? `${Number(lead.commission_due).toLocaleString('en-IN')}` : 'NA',
    'Commission Received': typeof lead.commission_received !== 'undefined' ? `${Number(lead.commission_received).toLocaleString('en-IN')}` : 'NA',
    'Commission Percent': typeof lead.commission_percent !== 'undefined' ? `${lead.commission_percent}%` : 'NA',
    
    
    // Other important fields
    'CCE': lead.cceName || 'NA',
    'Technician': lead.caName || 'NA',
    'CCE Comments': lead.cceComments || 'NA',
    'Technician Comments': lead.caComments || 'NA',
    'Created At': lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN') : 'NA',
    'Updated At': lead.updated_at ? new Date(lead.updated_at).toLocaleString('en-IN') : 'NA',
    'Work Summary': Array.isArray(lead.products) 
    ? lead.products.map(product => 
        `[PRODUCT: ${product.name}] ${product.workdone}, ${product.total})`
      ).join('; ') 
    : (typeof lead.products === 'string' ? lead.products : 'N/A'),
    'Total Amount': lead.overview?.finalAmount !== undefined && lead.overview?.finalAmount !== null 
        ? `${Number(lead.overview.finalAmount).toLocaleString('en-IN')}`
        : 'NA',
})); 
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    
            // Add metadata sheet if exporting filtered data
            if (currentView === 'filter') {
                // Get calculated values from current state rather than relying on dataFromFilter
                // Make sure these state variables are properly defined in your component
                const filterInfo = [
                    ['Filter Criteria:', ''],
                    ['User:', savedFilterParams.user || 'All'],
                    ['Source:', savedFilterParams.source || 'All'],
                    ['Status:', savedFilterParams.status || 'All'],
                    ['Location:', savedFilterParams.location || 'All'],
                    ['Date Range:', savedFilterParams.dateRange?.startDate && savedFilterParams.dateRange?.endDate ?
                        `${savedFilterParams.dateRange.startDate} to ${savedFilterParams.dateRange.endDate}` : 'All'],
                    [''],
                    ['Export Statistics:', ''],
                    ['Total Leads:', response.data.total_count],
                    ['Export Date:', new Date().toLocaleString('en-IN')],
                ];
    
                // Only add financial data if those state variables are available
                if (typeof totalFinalAmount !== 'undefined' && totalFinalAmount > 0) {
                    filterInfo.push(
                        ['GMV:', `₹${Math.round(Number(totalFinalAmount)).toLocaleString('en-IN')}`],
                        ['ATS:', `₹${Math.round(Number(finalAmountPerLead)).toLocaleString('en-IN')}`]
                    );
    
                    if (typeof totalCommissionDue !== 'undefined' && totalCommissionDue > 0) {
                        filterInfo.push(['Commission Due:', `₹${Math.round(Number(totalCommissionDue)).toLocaleString('en-IN')}`]);
                    }
    
                    if (typeof totalCommissionReceived !== 'undefined' && totalCommissionReceived > 0) {
                        filterInfo.push(['Commission Received:', `₹${Math.round(Number(totalCommissionReceived)).toLocaleString('en-IN')}`]);
                    }
                }
    
                const metadataSheet = XLSX.utils.aoa_to_sheet(filterInfo);
                XLSX.utils.book_append_sheet(workbook, metadataSheet, "Export Info");
            }
    
            // Generate file name and create/download the file
            const date = new Date().toISOString().slice(0, 10);
            const fileName = `leads_export_${date}.xlsx`;
            XLSX.writeFile(workbook, fileName);
    
            // setAlertMessage(`Excel export completed successfully (${response.data.total_count} leads)`);
            setAlertMessage(`Excel export completed successfully `);
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 3000);
    
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            setAlertMessage('Error exporting to Excel: ' + (error.response?.data?.message || error.message));
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Layout>

           
            {showSuccessAlert && alertMessage && (
                <Alert
                    variant="success"
                    onClose={() => setShowSuccessAlert(false)}
                    dismissible
                    className="edit-page-alert"
                    style={{ marginTop: '0.2em' }}
                >
                    <p>{alertMessage}</p>
                </Alert>
            )}

<div className="App">
      {/* Your existing app content */}
      
      {/* Updated StatusTimer with callback */}
      <StatusTimer 
        status={userStatus} 
        startTime={statusTime} 
        onStatusChange={handleStatusChange}
      />
    </div>
            {/* <h1 className="text-2xl font-bold mb-6">{welcomeData || 'Welcome to the Home Page!'}</h1> */}

            {/* New Form Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                {/* <p>All Lead</p> */}
                <form onSubmit={handleFilterSubmit} className="space-y-4">
                    <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1 lg:grid-cols-5'} gap-4`}>
                        {/* First Row */}
                        {/* <select
                            name="user"
                            value={filterFormData.user}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.username}>{user.username}</option>
                            ))}
                        </select> */}

{isAdmin ? (
  <select
    name="user"
    value={filterFormData.user}
    onChange={handleFilterChange}
    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
  >
    <option value="">Select User</option>
    {users.map(user => (
      <option key={user.id} value={user.username}>{user.username}</option>
    ))}
  </select>
) : (
  <input
    type="text"
    name="user"
    value={cUser || ''}
    disabled
    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
  />
)}

                        

                        <div className="flex items-center space-x-4">
                        <DateRangeSelector 
        ref={dateRangeSelectorRef} 
        onDateRangeChange={handleDateRangeChange} 
        dateField={filterFormData.dateField}
        onDateFieldChange={(value) => {
            setFilterFormData(prev => ({
                ...prev,
                dateField: value
            }));
        }}
        className="w-full" // Add this class to ensure it takes full width

    />
</div>

<select
                            name="source"
                            value={filterFormData.source}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Source</option>
                            <option value="inbound">inbound</option>
                            <option value="outbound">outbound</option>
                            <option value="Website">Website</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="Whatsapp">Whatsapp</option>
                            <option value="Web Order">Web Order</option>
                            <option value=" Bot Call">Bot Call</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Meta">Meta</option>
                            <option value="Meta Ads">Meta Ads</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Reference">Reference</option>
                            <option value="Repeat">Repeat</option>
                            <option value="B2B">B2B</option>
                            <option value="SMS">SMS</option>
                            <option value="Test">Test</option>

                        </select>
 <select
                            name="arrivalMode"
                            value={filterFormData.arrivalMode}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Arrival Mode</option>
                            <option value="Walkin">Walkin</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Doorstep">Doorstep</option>
                        </select>


                        {/* <select
                            name="dateTimeRange"
                            value={filterFormData.dateTimeRange}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Date Time Range</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select> */}
                        {/* <select
                            name="paymentStatus"
                            value={filterFormData.paymentStatus}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Payment Status</option>
                            <option value="option1">Payment Successful</option>
                            <option value="option2">Payment Pending</option>
                            <option value="option3">Payment Failed</option>
                        </select> */}

                       

                        <div className="flex-1 w-[100%]">
    <div className="bg-white rounded-md shadow-sm border border-gray-300 h-[42px] flex items-center">
        <div className="grid grid-cols-2 divide-x w-full">
            <div className="px-2 text-center">
                <div className="flex flex-col justify-center">
                    <div className="text-[10px] text-gray-600 leading-none">GMV</div>
                    <div className="text-[11px] font-semibold text-red-600 leading-tight">
                        ₹{Math.round(Number(userStats.gmv)).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
            <div className="px-2 text-center">
                <div className="flex flex-col justify-center">
                    <div className="text-[10px] text-gray-600 leading-none">ATS</div>
                    <div className="text-[11px] font-semibold text-red-600 leading-tight">
                        ₹{Math.round(Number(userStats.ats)).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
                        {/* Language Barrier Checkbox */}
                        {/* <div className="flex items-center">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="language_barrier"
                                    checked={filterFormData.language_barrier}
                                    onChange={handleFilterChange}
                                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-gray-700">Language Barrier</span>
                            </label>
                        </div> */}
                    {/* </div> */}

                    {/* <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1 lg:grid-cols-5'} gap-4`}> */}
                        {/* Second Row */}
                        {isAdmin ? (
                        <select
    name="status"
    value={filterFormData.status}
    onChange={handleFilterChange}
    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
  >
    <option value="">Status</option>
    {filterFormData.luxuryNormal === "Sell/Buy" ? (
      <>
        <option value="Purchase">Purchase</option>
        <option value="S/B At Workshop">S/B At Workshop</option>
        <option value="RFS">RFS</option>
        <option value="Sold">Sold</option>
        <option value="S/B Commision Due">S/B Commision Due</option>
        <option value="Purchase Due">Purchase Due</option>
        <option value="S/B Completed">S/B Completed</option>
      </>
    ) : (
      <>
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
        <option value="Converted">Converted</option>
        <option value="Payment Due">Payment Due</option>
        <option value="Commision Due">Commision Due</option>
        <option value="Completed">Completed</option>
        <option value="Analytics">Analytics</option>
      </>
    )}
  </select>
) : (
  <select
    name="status"
    value={filterFormData.status}
    onChange={handleFilterChange}
    className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
  >
    <option value="">Status</option>
    {filterFormData.luxuryNormal === "Sell/Buy" ? (
      <>
        <option value="Purchase">Purchase</option>
        <option value="S/B At Workshop">S/B At Workshop</option>
        <option value="RFS">RFS</option>
        <option value="Sold">Sold</option>
        <option value="S/B Commision Due">S/B Commision Due</option>
        <option value="Purchase Due">Purchase Due</option>
        <option value="S/B Completed">S/B Completed</option>
      </>
    ) : (
      <>
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
        <option value="Converted">Converted</option>
        <option value="Payment Due">Payment Due</option>
        <option value="Commision Due">Commision Due</option>
        <option value="Completed">Completed</option>
        {/* <option value="Analytics">Analytics</option> */}
      </>
    )}
  </select>
)}
                        {/* <select
                            name="location"
                            value={filterFormData.location}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Location</option>
                            <option value="Gurugram">Gurugram</option> <option value="Delhi">Delhi</option> <option value="Faridabad">Faridabad</option> <option value="Kanpur">Kanpur</option> <option value="Dehradun">Dehradun</option> <option value="Chandigarh">Chandigarh</option> <option value="Bangalore">Bangalore</option> <option value="Jaipur">Jaipur</option> <option value="Lucknow">Lucknow</option> <option value="Chennai">Chennai</option> <option value="Kolkata">Kolkata</option> <option value="Mumbai">Mumbai</option> <option value="Hyderabad">Hyderabad</option> <option value="Pune">Pune</option> <option value="Ahmedabad">Ahmedabad</option>
                        </select> */}
                        
                        {/* <input
                            type="date"
                            name="dateCreated"
                            value={filterFormData.dateCreated}
                            onChange={handleFilterChange}
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent date-created-input"
                        /> */}
                       {/* Replace the existing garage select element with this */}
{/* Replace the existing garage select element with this */}
<div className="relative w-full" ref={locationDropdownRef}>
                            <div 
                                className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer flex justify-between items-center h-[42px]"
                                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                            >
                                <span className="text-gray-700">
                                    {filterFormData.location.length ? `${filterFormData.location.length} cities selected` : 'Select Cities'}
                                </span>
                                <svg className="h-4 w-4 text-black-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isLocationDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                                </svg>
                            </div>

                            {isLocationDropdownOpen && (
        // NEW two-pane selector
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="grid grid-cols-2 divide-x min-h-0" style={{ height: '20rem' }}>
                {/* Left: States */}
                 <div className="flex flex-col h-full min-h-0">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                        <input
                            type="text"
                            value={stateSearchQuery}
                            onChange={(e) => setStateSearchQuery(e.target.value)}
                            placeholder="Search states..."
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                        <div className="mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleAllStates(); }}
                                className="w-full py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium"
                            >
                                {Object.keys(stateCityMap)
                                    .filter(s => s.toLowerCase().includes(stateSearchQuery.toLowerCase()))
                                    .every(s => selectedStates.includes(s))
                                    ? "Unselect All"
                                    : "Select All"
                                }
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                        {Object.keys(stateCityMap)
                            .filter(state => state.toLowerCase().includes(stateSearchQuery.toLowerCase()))
                            .sort((a, b) => a.localeCompare(b))
                            .map(state => (
                                <div
                                    key={state}
                                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); handleStateToggle(state); }}
                                >
                                    <input
                                        type="checkbox"
                                        id={`state-${state}`}
                                        checked={selectedStates.includes(state)}
                                        onChange={() => handleStateToggle(state)}
                                        className="mr-2"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <label htmlFor={`state-${state}`} className="w-full cursor-pointer">
                                        {state}
                                    </label>
                                </div>
                            ))
                        }
                        {Object.keys(stateCityMap)
                            .filter(state => state.toLowerCase().includes(stateSearchQuery.toLowerCase()))
                            .length === 0 && (
                                <div className="px-3 py-2 text-gray-500 text-center">
                                    No states match your search
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* Right: Cities of selected states */}
                 <div className="flex flex-col h-full min-h-0">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                        <input
                            type="text"
                            value={locationSearchQuery}
                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                            placeholder="Search cities..."
                            className="w-full p-2 text-sm border border-gray-300 rounded"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="mt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleAllLocations(); }}
                                className="w-full py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium"
                                disabled={getVisibleCities().length === 0}
                                title={getVisibleCities().length === 0 ? "No cities to select" : ""}
                            >
                                {getVisibleCities().every(c => filterFormData.location.includes(c)) && getVisibleCities().length
                                    ? "Unselect All"
                                    : "Select All"
                                }
                            </button>
                        </div>
                    </div>
                     <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
                        {getVisibleCities().map(city => (
                            <div
                                key={city}
                                className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); handleLocationChange(city); }}
                            >
                                <input
                                    type="checkbox"
                                    id={`city-${city}`}
                                    checked={filterFormData.location.includes(city)}
                                    onChange={() => handleLocationChange(city)}
                                    className="mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <label htmlFor={`city-${city}`} className="w-full cursor-pointer">
                                    {city}
                                </label>
                            </div>
                        ))}
                        
                        {getVisibleCities().length === 0 && (
         <div className="px-3 py-2 text-gray-500 text-center">
             No cities match your search
         </div>
     )}
                    </div>
                </div>
            </div>
        </div>
    )}
                        </div>

<div className="relative w-full" ref={garageDropdownRef}>
    <div 
        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer flex justify-between items-center"
        onClick={() => setIsGarageDropdownOpen(!isGarageDropdownOpen)}
    >
        <span className="text-gray-700">
            {filterFormData.garage.length ? `${filterFormData.garage.length} garages selected` : 'Select Garages'}
        </span>
        <svg className="h-4 w-4 text-black-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isGarageDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
    </div>

    {isGarageDropdownOpen && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto">
            <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                <input
                    type="text"
                    value={garageSearchQuery}
                    onChange={(e) => setGarageSearchQuery(e.target.value)}
                    placeholder="Search garages..."
                    className="w-full p-2 text-sm border border-gray-300 rounded"
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                />
            </div>
{/* Add Select All button here */}
<div className="px-3 py-2 border-b border-gray-200">
    <button
        onClick={(e) => {
            e.stopPropagation();
            toggleAllGarages();
        }}
        className="w-full py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium"
    >
        {garages.filter(garage =>
            garage.name.toLowerCase().includes(garageSearchQuery.toLowerCase()) ||
            (garage.mechanic && garage.mechanic.toLowerCase().includes(garageSearchQuery.toLowerCase())) ||
            (garage.locality && garage.locality.toLowerCase().includes(garageSearchQuery.toLowerCase()))
        ).every(garage => filterFormData.garage.includes(garage.name))
            ? "Unselect All"
            : "Select All"
        }
    </button>
</div>
                   

{garages
    .filter(garage => {
        const query = garageSearchQuery.toLowerCase();
        const cityVariations = getCityVariations(query);
        
        // Name match
        if (garage.name.toLowerCase().includes(query)) return true;
        
        // Mechanic match
        if (garage.mechanic && garage.mechanic.toLowerCase().includes(query)) return true;
        
        // Locality match with city variations
        if (garage.locality) {
            if (garage.locality.toLowerCase().includes(query)) return true;
            for (const cityVariation of cityVariations) {
                if (garage.locality.toLowerCase().includes(cityVariation)) return true;
            }
        }
        
        return false;
    })
    .map(garage => (
                <div
                    key={garage.id}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleGarageChange(garage.name);
                    }}
                >
                    <input
                        type="checkbox"
                        id={`garage-${garage.id}`}
                        checked={filterFormData.garage.includes(garage.name)}
                        onChange={() => handleGarageChange(garage.name)}
                        className="mr-2"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <label
                        htmlFor={`garage-${garage.id}`}
                        className="w-full cursor-pointer"
                    >
                        {garage.name} - {garage.mechanic}
                    </label>
                </div>
            ))}


            
            
            {garages.filter(garage =>
    garage.name.toLowerCase().includes(garageSearchQuery.toLowerCase()) ||
    (garage.mechanic && garage.mechanic.toLowerCase().includes(garageSearchQuery.toLowerCase())) ||
    (garage.locality && garage.locality.toLowerCase().includes(garageSearchQuery.toLowerCase()))
).length === 0 && (
    <div className="px-3 py-2 text-gray-500 text-center">
        No garages match your search
    </div>
)}
        </div>
    )}
</div>

<select
                            name="luxuryNormal"
                            value={filterFormData.luxuryNormal}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Luxury/Normal</option>
                            <option value="Luxury">Luxury</option>
                            <option value="Normal">Normal</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Sell/Buy">Sell/Buy</option> {/* <-- Add this */}
                            <option value="Spares">Spares</option>  
                        </select>
                        {/* // Add this before the reset/submit buttons div */}
{/* <div className="col-span-5 mb-4">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-3 divide-x">
            <div className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">Total Completed</div>
                <div className="text-xl font-semibold text-red-600">
                    {userStats.total_completed_leads}
                </div>
            </div>
            <div className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">GMV</div>
                <div className="text-xl font-semibold text-red-600">
                    ₹{Number(userStats.gmv).toLocaleString('en-IN')}
                </div>
            </div>
            <div className="p-4 text-center">
                <div className="text-sm text-gray-600 mb-1">ATS</div>
                <div className="text-xl font-semibold text-red-600">
                    ₹{Number(userStats.ats).toLocaleString('en-IN')}
                </div>
            </div>
        </div>
    </div>
</div> */}
{/* <div className="flex items-center gap-4"> */}
    
                        {/* Buttons in the last column */}
                        <div className="flex gap-2">
                            <button
                                type="reset"
                                onClick={handleReset}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 text-[13px]"
                            >
                                Submit
                            </button>
                             <button
                                                            onClick={exportToExcel}
                                                            disabled={isExporting}
                                                            className={`px-4 py-2 ${isExporting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md flex items-center justify-center`}
                                                        >
                                                            {isExporting ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                                    
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileDown size={18} className="mr-1" />
                                                                    
                                                                </>
                                                            )}
                                                        </button>
                                                        
                                                        
   
                        </div>
                    </div>
                </form>
            </div>


            {/*<p>{seqNum || 'No sequence number available'}</p>*/}

            {/* // Add this before or after your leads table */}
{/* Stats container - only show when data comes from filter view */}
{/* Debug output to verify state */}
{/* {process.env.NODE_ENV !== 'production' && (
  <div className="debug-info" style={{display: 'none'}}>
    <p>dataFromFilter: {dataFromFilter ? 'true' : 'false'}</p>
    <p>showStatsContainer: {showStatsContainer ? 'true' : 'false'}</p>
    <p>totalLeads: {totalLeads}</p>
    <p>totalEstimatedPrice: {totalEstimatedPrice}</p>
  </div>
)} */}

{/* Stats container - only show when data comes from filter view */}
{/* Stats container - only show when data comes from filter view */}



{/* <div className="flex items-center gap-4">*/}



{/* <div className="flex items-center gap-4">*/}
{newCallNotification && (
  <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 border border-red-500">
    <div className="flex flex-col">
      <p className="font-medium">Incoming call from {newCallNotification.number}</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => {
            localStorage.setItem('lastSeenLeadId', newCallNotification.id);
            setNewCallNotification(null); // Clear notification before navigation
            navigate(`/edit/${newCallNotification.id}`);
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Open Lead
        </button>
        <button
          onClick={() => {
            localStorage.setItem('lastSeenLeadId', newCallNotification.id);
            setNewCallNotification(null);
          }}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
)}


            {/* Modified Search Section */}
            <div className="flex justify-between items-center mb-1 mt-4 px-4">
                
                {/* <div className="w-24"></div> Spacer for centering */}
                {dataFromFilter && (


<div className="col-span-5 mb-1">
    <div className="bg-white rounded-md shadow-sm border border-gray-200">
    <div className={`grid ${(totalCommissionDue > 0 || totalCommissionReceived > 0) ? 'grid-cols-5' : 'grid-cols-3'} divide-x`}>
    {(totalCommissionDue <= 0 && totalCommissionReceived <= 0) && (
    <div className="p-1 text-center">
        <div className="text-[9px] text-gray-600 leading-none">Total</div>
        <div className="text-sm font-semibold text-red-600 leading-tight">
            {totalLeads}
        </div>
    </div>
)}
            <div className="p-1 text-center">
                <div className="text-[9px] text-gray-600 leading-none">GMV</div>
                <div className="text-sm font-semibold text-red-600 leading-tight">
                    {/* ₹{Math.round(Number(totalFinalAmount)).toLocaleString('en-IN')} */}
                    ₹{Math.round(Number(totalEstimatedPrice)).toLocaleString('en-IN')}
                </div>
            </div>
            <div className="p-1 text-center">
                <div className="text-[9px] text-gray-600 leading-none">ATS</div>
                <div className="text-sm font-semibold text-red-600 leading-tight">
                    {/* ₹{Math.round(Number(finalAmountPerLead)).toLocaleString('en-IN')} */}
                    ₹{Math.round(Number(estPricePerLead)).toLocaleString('en-IN')}
                </div>
            </div>
            {totalCommissionDue > 0 && (
                <div className="p-1 text-center">
                    <div className="text-[9px] text-gray-600 leading-none">Due</div>
                    <div className="text-sm font-semibold text-red-600 leading-tight">
                        -₹{Math.round(Number(totalCommissionDue)).toLocaleString('en-IN')}
                    </div>
                </div>
            )}
            {totalCommissionReceived > 0 && (
                <div className="p-1 text-center">
                    <div className="text-[9px] text-gray-600 leading-none">Received</div>
                    <div className="text-sm font-semibold text-green-600 leading-tight">
                        +₹{Math.round(Number(totalCommissionReceived)).toLocaleString('en-IN')}
                    </div>
                </div>
            )}
             {totalCommissionExceptOwn > 0 && (
        <div className="p-1 text-center">
            <div className="text-[9px] text-gray-600 leading-none">WXCR</div>
            <div className="text-sm font-semibold text-green-600 leading-tight">
                +₹{Math.round(Number(totalCommissionExceptOwn)).toLocaleString('en-IN')}
            </div>
        </div>
    )}
        </div>
    </div>
</div>
)}
{/* Import Modal */}
{showImportModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
    <div className="w-full max-w-2xl">
      <div className="relative bg-white rounded-lg shadow-xl">
        <div className="absolute top-0 right-0 p-4">
          <button 
            onClick={() => setShowImportModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <ExcelImport 
            onImportComplete={() => {
              setShowImportModal(false);
              fetchLeads();
            }} 
            onClose={() => setShowImportModal(false)}
          />
        </div>
      </div>
    </div>
  </div>
)}

{/* Conditionally render Import Excel button */}
{showImportButton && isAdmin && !isMobile && (
  <div className="mb-6">
    <button 
      onClick={() => setShowImportModal(true)}
      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center"
    >
      <FileUp size={18} className="mr-1" />
      Import from Excel
    </button>
  </div>
)}

                {/* Hide search field on mobile when status filter is active */}
                {!(isMobile && dataFromFilter && filterFormData.status) && (
                <div className="flex items-center justify-center flex-1">
                    <div className="relative w-96"> {/* Fixed width for search field */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="LeadId/Mobile/OrderId/Reg/Name"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Apply
                    </button>
                </div>
                )}

                <div className="flex gap-2">
                    {!isMobile && (
                        <Link to="/analytics" className="px-4 py-2 border-2 border-green-500 text-green-500 rounded-md hover:bg-green-500 hover:text-white transition-colors duration-300 flex items-center">
                            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 13V17M16 11V17M12 7V17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" 
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    )}
                    <button onClick={() => navigate('/edit', { state: { seqNum: seqNum } })} className="px-4 py-2 border-2  border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-300 font-bold">
                        <span className='font-bold'>Add Lead</span>
                    </button>
                </div>
            </div>
{isMobile && (
    <div className="flex justify-center items-center mb-2 px-4">
        <span className="text-gray-600 text-sm">
            Page {currentPage} of {totalPages} ({totalLeads} total leads)
        </span>
    </div>
)}
    
    {isAdmin && selectedLeads.length > 0 && (
                <div className="flex items-center justify-center gap-4 my-4 p-4 bg-gray-100 rounded-lg shadow">
                    <span className="font-medium text-gray-700">{selectedLeads.length} leads selected.</span>
                    <select
                        value={selectedCce}
                        onChange={(e) => setSelectedCce(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500"
                    >
                        <option value="">Assign to CCE...</option>
                        {users.map(user => (
                            <option key={user.id} value={user.username}>{user.username}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleBulkCceUpdate}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Update CCE
                    </button>
                    <button
                                type="button"
                                onClick={handleDeselectAll}
                                className="p-2 text-gray-600 bg-gray-200 rounded-full hover:bg-red-200 hover:text-red-700 transition-colors"
                                title="Deselect all"
                            >
                                <X size={16} />
                            </button>
                </div>
            )}

    
            <div className='flex justify-center'>
                <div className="mt-4" style={{ width: '96%', marginBottom: '0.5em' }}>
                    <div className="overflow-x-hidden"> {/* Prevent horizontal scrollbar */}
                        <div
    ref={scrollContainerRef}
    className="table-scroll-container"
    style={{ 
        maxHeight: isMobile ? 'calc(100vh)' : '400px', // Auto height for mobile
        minHeight: isMobile ? '500px' : 'auto', // Minimum height for mobile
        overflowY: 'scroll',
        scrollbarGutter: 'stable'
    }}
>
                            <table className="w-full border-collapse">
                                <thead className="bg-red-500 text-white sticky-header">
                                    <tr>
                                        <th className="p-3 text-left">Lead Id | Type | Location</th>
                                        <th className="p-3 text-left">Name | Vehicle</th>
                                        <th className="p-3 text-left">Number | Source</th>
                                        {!isMobile &&<th className="p-3 text-left">Order ID | Reg. Number</th>}
                                        <th className="p-3 text-left">Status</th>
                                         {!isMobile && <th className="p-3 text-left">CCE | CA</th>}
                                        <th className="p-3 text-left">Date/Time</th>
                                        {!isMobile &&<th className="p-3 text-left">Created | Modified At</th>}
                                        {/* <th className="p-3 text-left">Edit/Copy</th> */}
                                        <th className="p-3 text-left">{isMobile ? 'Action' : 'Edit/Copy'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead, index) => (
                                        // <tr 
                                        //     key={`${lead.id}-${index}`} 
                                        //     className={`
                                        //         border-b hover:bg-gray-50 group 
                                        //         ${(lead.status === "Assigned" || !lead.is_read) ? "bg-gray-100 border-l-2 border-l-red-500" : ""}
                                        //         transition-all duration-200 ease-in-out
                                        //     `}
                                        // >
                                         <tr 
    key={`${lead.id}-${index}`} 
    onClick={() => {
        if (isMobile) {
            setExpandedLeadId(prevId => (prevId === lead.id ? null : lead.id));
        }
    }}
    className={`
        border-b border-gray-900 hover:bg-gray-50 
        ${!isMobile ? 'group' : 'cursor-pointer'}
        ${lead.status === "Assigned" ? "bg-gray-100 border-l-2 border-l-red-500" : ""}
        transition-all duration-200 ease-in-out
    `}
>
{/* <tr 
    key={`${lead.id}-${index}`} 
    className={`
        border-b hover:bg-gray-50 group 
        ${(lead.status === "Assigned" || (isMobile && lead.status === "Referred To Ops")) ? "bg-gray-100 border-l-2 border-l-red-500" : ""}
        transition-all duration-200 ease-in-out
    `}
> */}
                                            {/* 14-2 */}
                                              <td className="p-2">
    <div className="relative">
        {/* Expanded View */}
        <div className={isMobile ? (expandedLeadId === lead.id ? 'block' : 'hidden') : 'hidden group-hover:block'}>
            {lead.id}<br />
            {lead.type}<br />
            {lead.city}
        </div>
        {/* Collapsed View */}
        <div className={isMobile ? (expandedLeadId === lead.id ? 'hidden' : 'block h-20') : `group-hover:hidden h-12`}>
            {isMobile ? (
                <>
                    {lead.city}<br />
                    {lead.type}<br />
                    {truncateLeadId(lead.id)}
                </>
            ) : (
                <>
                    {truncateLeadId(lead.id)}<br />
                    {lead.type}
                </>
            )}
        </div>
    </div>
</td>
                                            
                                          
                                           <td className="p-2">
    <div className="relative">
        {/* Expanded View */}
        <div className={isMobile ? (expandedLeadId === lead.id ? 'block' : 'hidden') : 'hidden group-hover:block'}>
            {lead.name}<br />
            {lead.vehicle}
        </div>
        {/* Collapsed View */}
        <div className={isMobile ? (expandedLeadId === lead.id ? 'hidden' : 'block h-20 overflow-hidden') : 'group-hover:hidden h-12 overflow-hidden'}>
            {isMobile && lead.name && lead.name.length > 8 ? `${lead.name.substring(0, 8)}...` : lead.name}<br />
            {lead.vehicle}
        </div>
    </div>
</td>
                                            <td className="p-2">
                                                <div className={`${isMobile ? 'h-20' : 'h-12'} overflow-hidden group-hover:h-auto transition-all duration-200`}>
                                                    {lead.number}<br />
                                                    {lead.source}
                                                </div>
                                            </td>
                                            {!isMobile &&<td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
    {lead.orderId}<br />
    
    <span className={lead.reg_llm ? "text-green-500 font-medium" : ""}>
        {lead.regNumber}
    </span>
</div>
                                            </td>}
                                            {/* <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                <span className={lead.status === "Assigned" ? "font-bold text-grey-600" : ""}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                            </td> */}
   {/* <td className="p-2 text-center">
    <div className="flex flex-col items-center gap-2">
        <span className={`${lead.status === "Assigned" ? "font-bold text-red-500" : "text-gray-600"}`}>
            {lead.status}
        </span> */}
        <td className="p-2 text-center">
    <div className="flex flex-col items-center gap-2">
        {/* <span className={`${(lead.status === "Assigned" || (isWx && lead.status === "Referred To Ops")) ? "font-bold text-red-500" : "text-gray-600"}`}>
            {lead.status}
        </span> */}
        <span className={`${(lead.status === "Assigned" || (isWx && lead.status === "Referred To Ops") || (lead.source === "Web Order" && lead.status === "Referred To Ops")) ? "font-bold text-red-500" : "text-gray-600"}`}>
    {lead.status}
</span>
        
        {/* Clean, professional Click2Call button */}
        {/* <button
            className="group/btn inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all duration-150 min-w-[60px]"
            onClick={() => handleClick2Call(lead.number)}
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
        </button> */}
    </div>
</td>
                                             {!isMobile && (
                                                <td className="p-2">
                                                    <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                        {lead.cceName}<br />
                                                        {lead.caName}
                                                    </div>
                                                </td>
                                            )}
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.arrival_time ? new Date(lead.arrival_time).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    }) : 'Not Set'}
                                                </div>
                                            </td>
                                            {!isMobile &&<td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    }) : 'NA'}
                                                    <br />
                                                    {lead.updated_at ? new Date(lead.updated_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false
                                                    }) : 'NA'}
                                                </div>
                                            </td>}
                                           <td className="p-2">
     <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
            {/* Edit Button */}
            <button
                className={`flex items-center justify-center gap-1 px-2 py-2 bg-black text-white rounded text-xs hover:bg-gray-800 transition-colors duration-200 min-h-[36px] ${isMobile ? 'w-full' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${lead.id}`, {
                        state: { 
                            previousStatus: lead.status
                        }
                    });
                }}
            >
                <Edit size={12} />
                <span>Edit</span>
            </button>

            {/* Copy Button */}
            <button
                            className={`flex items-center justify-center gap-1 px-2 py-2 bg-white text-black border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors duration-200 min-h-[36px] ${isMobile ? 'w-full' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopyClick(lead);
                            }}
                        >
                            <Copy size={12} />
                            <span>Copy</span>
                        </button>
     
            {/* Other Action Icons */}
            {!isMobile && !isAdmin && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cursor-pointer hover:text-green-500 transition-colors duration-200"
                    onClick={() => handleClick2Call(lead.number)}
                    title="Click to call"
                >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
            )}
            {!isMobile && isAdmin && (
                <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={() => handleSelectLead(lead.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="form-checkbox h-4 w-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                    title="Select for bulk update"
                />
            )}
        </div>
    </div>
</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {searchMessage && (
                            <div className="text-center py-2 text-gray-600">
                                {searchMessage}
                            </div>
                        )}
                    </div>
                    {!isMobile && (
                    <div className="flex justify-center items-center mb-2">
                        <span className="text-gray-600">
                            Page {currentPage} of {totalPages} ({totalLeads} total leads)
                        </span>
                    </div>
)}
                </div>
            </div>
            {/* <footer className="bg-gray-50">
                <p className="text-center py-4" style={{ marginTop: '2em', marginBottom: '0' }}>
                    © 2025 OnlyBigCars All Rights Reserved.
                </p>
            </footer> */}
        </Layout>
    );
};

export default HomePage;












