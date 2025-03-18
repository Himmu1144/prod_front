import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { Edit, Copy, Search, Plus, FileDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DateRangeSelector from '../components/daterangeselector';
import './homepage.css';
import * as XLSX from 'xlsx';

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
    const [newCallNotification, setNewCallNotification] = useState(null);

    // Add new state
    const [welcomeData, setWelcomeData] = useState('');
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]); // Add state for users
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMessage, setSearchMessage] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    // Add these state variables at the top of your component
const [currentView, setCurrentView] = useState('default'); // 'default', 'filter', 'search'
const [savedSearchQuery, setSavedSearchQuery] = useState('');
const [savedFilterParams, setSavedFilterParams] = useState({});
    const [filterFormData, setFilterFormData] = useState({
        source: '',
        status: '',
        location: '',
        arrivalMode: '',
        language_barrier: false,
        dateField: 'created_at',
        dateRange: {
            startDate: '',
            endDate: ''
        },
        garage:[],
    });

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
    const [showStatsContainer, setShowStatsContainer] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // const fetchLeads = async () => {
    //     try {
    //         setIsLoading(true);
    //         const response = await axios.get(`http://localhost:8000/?page=1`, {
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
    //                 'http://localhost:8000/api/leads/filter/',
    //                 { ...savedFilterParams, page: nextPage },
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         } else if (currentView === 'search') {
    //             console.log('Fetching search results with query:', savedSearchQuery);
    //             response = await axios.get(
    //                 `http://localhost:8000/api/leads/search/?query=${savedSearchQuery}&page=${nextPage}`,
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         } else {
    //             console.log('Fetching default leads');
    //             response = await axios.get(
    //                 `http://localhost:8000/?page=${nextPage}`,
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
    

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`http://localhost:8000/?page=1`, {
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
            let response;
    
            if (currentView === 'filter') {
                response = await axios.post(
                    'http://localhost:8000/api/leads/filter/',
                    { ...savedFilterParams, page: nextPage },
                    { headers: { 'Authorization': `Token ${token}` } }
                );
            } else if (currentView === 'search') {
                response = await axios.get(
                    `http://localhost:8000/api/leads/search/?query=${savedSearchQuery}&page=${nextPage}`,
                    { headers: { 'Authorization': `Token ${token}` } }
                );
            } else {
                response = await axios.get(
                    `http://localhost:8000/?page=${nextPage}`,
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
            const response = await axios.get(
                `http://localhost:8000/api/leads/search/?query=${searchQuery}&page=1`,
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
    

    const handleDateRangeChange = (range) => {
        setDateRange([range.startDate, range.endDate]);
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
        try {
            const response = await axios.post(
                'http://localhost:8000/api/leads/filter/',
                { ...filterFormData, page: 1 },
                { headers: { 'Authorization': `Token ${token}` } }
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
          formatColumns('Total Amount:', `₹${lead.estimated_price || 'N/A'}`, true),
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
        e.target.form.reset();
        setFilterFormData({
            ...(isAdmin ? { user: '' } : { user: cUser || '' }),
            // user: '',
            source: '',
            status: '',
            location: '',
            dateRange: {
                startDate: '',
                endDate: ''
            },
            garage: [],
        });
        setDataFromFilter(false);
        setShowStatsContainer(false);
        // setDateRange([null, null]); // Reset the date range
        dateRangeSelectorRef.current.reset();
    };
    // http://34.131.86.189

    useEffect(() => {
        console.log('Here we are - ')
        // Fetch welcome message and users
        axios.get('http://localhost:8000/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
            .then(response => {
                setWelcomeData(response.data.message);
                setUsers(response.data.users); // Set users data
                // Add this line to set user stats
                setUserStats(response.data.user_stats || {});
                setGarages(response.data.garages); // Store garages data
                setIsAdmin(response.data.is_admin || false); // Add this line
                // If not admin, set the user field in filterFormData
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
          'http://localhost:8000/api/recent-calls/',
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
        
                // if (currentView === 'filter') {
                //     // url = 'http://localhost:8000/api/leads/export/filtered/';
                //     url = 'http://localhost:8000/api/leads/filter/';
                //     method = 'POST';
                //     // Ensure we're sending a properly formatted object with all required filter parameters
                    // data = {
                    //     ...savedFilterParams,
                    //     // Ensure dateRange is properly formatted if it exists
                    //     dateRange: savedFilterParams.dateRange ? {
                    //         startDate: savedFilterParams.dateRange.startDate || null,
                    //         endDate: savedFilterParams.dateRange.endDate || null
                    //     } : null
                    // };
                // } 
                // else if (currentView === 'search') {
                    
                //     url = `http://localhost:8000/api/leads/search/?query=${encodeURIComponent(savedSearchQuery)}`;
                //     // method remains GET, no data needed
                // } 
                // else {
                //     url = 'http://localhost:8000/api/leads/export/';
                //     // method remains GET, no data needed
                // }
    
                if (currentView === 'filter') {
                    
                       url= 'http://localhost:8000/api/leads/export/filter/';
                       method = 'POST';
                       data = {
                        ...savedFilterParams,
                        // Ensure dateRange is properly formatted if it exists
                        dateRange: savedFilterParams.dateRange ? {
                            startDate: savedFilterParams.dateRange.startDate || null,
                            endDate: savedFilterParams.dateRange.endDate || null
                        } : null
                    };
                       
                        
                } else if (currentView === 'search') {
                    
                       url= `http://localhost:8000/api/leads/export/search/?query=${encodeURIComponent(savedSearchQuery)}`;
                        
                } else {
                    
                    // url = 'http://localhost:8000/api/leads/export/';
                    url= 'http://localhost:8000/api/leads/export/filter/';
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
        
                // Format data for Excel
                const excelData = response.data.leads.map(lead => ({
                    'Lead ID': lead.id,
                    'Type': lead.type,
                    'Location': lead.city,
                    'Customer Name': lead.name,
                    'Vehicle': lead.vehicle,
                    'Phone Number': lead.number,
                    'Source': lead.source,
                    'Order ID': lead.orderId,
                    'Registration Number': lead.regNumber,
                    'Status': lead.status,
                    'CCE': lead.cceName,
                    'CA': lead.caName,
                    'Arrival Date/Time': lead.arrival_time ? new Date(lead.arrival_time).toLocaleString('en-IN') : 'Not Set',
                    'Created At': lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN') : 'NA',
                    'Updated At': lead.updated_at ? new Date(lead.updated_at).toLocaleString('en-IN') : 'NA'
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
            {/* <h1 className="text-2xl font-bold mb-6">{welcomeData || 'Welcome to the Home Page!'}</h1> */}

            {/* New Form Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                {/* <p>All Lead</p> */}
                <form onSubmit={handleFilterSubmit} className="space-y-4">
                    <div className="grid grid-cols-5 gap-4">
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
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Reference">Reference</option>
                            <option value="Repeat">Repeat</option>
                            <option value="B2B">B2B</option>
                            <option value="SMS">SMS</option>

                        </select>

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
    />
</div>


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

                        <div className="flex-1 w-[85%]">
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
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {/* Second Row */}
                        {isAdmin ? (
                        <select
                            name="status"
                            value={filterFormData.status}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Status</option>
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
                        </select>
                        ) : ( 
<select
                            name="status"
                            value={filterFormData.status}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Status</option>
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

                        </select> )}


                        <select
                            name="location"
                            value={filterFormData.location}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Location</option>
                            <option value="Gurugram">Gurugram</option> <option value="Delhi">Delhi</option> <option value="Faridabad">Faridabad</option> <option value="Kanpur">Kanpur</option> <option value="Dehradun">Dehradun</option> <option value="Chandigarh">Chandigarh</option> <option value="Bangalore">Bangalore</option> <option value="Jaipur">Jaipur</option> <option value="Lucknow">Lucknow</option> <option value="Chennai">Chennai</option> <option value="Kolkata">Kolkata</option> <option value="Mumbai">Mumbai</option> <option value="Hyderabad">Hyderabad</option> <option value="Pune">Pune</option> <option value="Ahmedabad">Ahmedabad</option>
                        </select>
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
                        </select>
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
<div className="relative w-full">
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
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
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

            {garages
                .filter(garage =>
                    garage.name.toLowerCase().includes(garageSearchQuery.toLowerCase()) ||
                    (garage.mechanic && garage.mechanic.toLowerCase().includes(garageSearchQuery.toLowerCase()))
                ).map(garage => (
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
                (garage.mechanic && garage.mechanic.toLowerCase().includes(garageSearchQuery.toLowerCase()))
            ).length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-center">
                    No garages match your search
                </div>
            )}
        </div>
    )}
</div>
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
                                                            className={`px-2 py-2 ${isExporting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md flex items-center justify-center`}
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
            <div className="p-1 text-center">
                <div className="text-[9px] text-gray-600 leading-none">Total</div>
                <div className="text-sm font-semibold text-red-600 leading-tight">
                    {totalLeads}
                </div>
            </div>
            <div className="p-1 text-center">
                <div className="text-[9px] text-gray-600 leading-none">GMV</div>
                <div className="text-sm font-semibold text-red-600 leading-tight">
                    ₹{Math.round(Number(totalFinalAmount)).toLocaleString('en-IN')}
                </div>
            </div>
            <div className="p-1 text-center">
                <div className="text-[9px] text-gray-600 leading-none">ATS</div>
                <div className="text-sm font-semibold text-red-600 leading-tight">
                    ₹{Math.round(Number(finalAmountPerLead)).toLocaleString('en-IN')}
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
        </div>
    </div>
</div>
)}
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
                <button onClick={() => navigate('/edit', { state: { seqNum: seqNum } })}  className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-300">
                    Add Lead
                </button>
            </div>

            <div className='flex justify-center'>
                <div className="mt-4" style={{ width: '96%', marginBottom: '0.5em' }}>
                    <div className="overflow-x-hidden"> {/* Prevent horizontal scrollbar */}
                        <div
                            ref={scrollContainerRef}
                            className="table-scroll-container"
                            style={{ 
                                maxHeight: '400px',
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
                                        <th className="p-3 text-left">Order ID | Reg. Number</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-left">CCE | CA</th>
                                        <th className="p-3 text-left">Date/Time</th>
                                        <th className="p-3 text-left">Created | Modified At</th>
                                        <th className="p-3 text-left">Edit/Copy</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead, index) => (
                                        <tr 
                                            key={`${lead.id}-${index}`} 
                                            className={`
                                                border-b hover:bg-gray-50 group 
                                                ${(lead.status === "Assigned" || !lead.is_read) ? "bg-gray-100 border-l-2 border-l-red-500" : ""}
                                                transition-all duration-200 ease-in-out
                                            `}
                                        >
                                            {/* 14-2 */}
                                            <td className="p-2">
                                                <div className="relative">
                                                    <div className="h-12 group-hover:hidden">
                                                        {truncateLeadId(lead.id)}<br />
                                                        {lead.type}
                                                        
                                                        
                                                    </div>
                                                    <div className="hidden group-hover:block">
                                                        {/* <span className="font-medium">Full Details:</span><br /> */}
                                                        {lead.id}<br />
                                                        {lead.type}<br />
                                                        {lead.city}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.name}<br />
                                                    {lead.vehicle}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.number}<br />
                                                    {lead.source}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.orderId}<br />
                                                    {lead.regNumber}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                <span className={lead.status === "Assigned" ? "font-bold text-grey-600" : ""}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.cceName}<br />
                                                    {lead.caName}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.arrival_time ? new Date(lead.arrival_time).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : 'Not Set'}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="h-12 overflow-hidden group-hover:h-auto transition-all duration-200">
                                                    {lead.created_at ? new Date(lead.created_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : 'NA'}
                                                    <br />
                                                    {lead.updated_at ? new Date(lead.updated_at).toLocaleString('en-IN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }) : 'NA'}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        {/* <Edit
                                                            size={16}
                                                            className="cursor-pointer hover:text-red-500 transition-colors duration-200"
                                                            onClick={() => navigate(`/edit/${lead.id}`)}
                                                        /> */}
                                                        <Edit
  size={16}
  className="cursor-pointer hover:text-red-500 transition-colors duration-200"
  onClick={() => navigate(`/edit/${lead.id}`, {
    state: { 
      previousStatus: lead.status // Pass the current status to EditPage
    }
  })}
/>
{/* 18 feb start */}
<Copy 
  size={16} 
  className="cursor-pointer hover:text-red-500 transition-colors" 
  onClick={() => handleCopyClick(lead)}
/>
{/* 18 feb end */}
                                                        <Plus
                                                            size={16}
                                                            className="cursor-pointer hover:text-red-500 transition-colors duration-200"
                                                            onClick={() => navigate('/edit', {
                                                                state: {
                                                                    customerInfo: {
                                                                        customerName: lead.name,
                                                                        mobileNumber: lead.number,
                                                                        source: lead.source
                                                                    }
                                                                }
                                                            })}
                                                        />
                                                        
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
                    <div className="flex justify-center items-center mb-2">
                        <span className="text-gray-600">
                            Page {currentPage} of {totalPages} ({totalLeads} total leads)
                        </span>
                    </div>
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












