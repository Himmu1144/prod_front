import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { Edit, Copy, Search, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DateRangeSelector from '../components/daterangeselector';
import './homepage.css';

const HomePage = () => {
    const dateRangeSelectorRef = useRef();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const location = useLocation();
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);

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
        dateRange: {
            startDate: '',
            endDate: ''
        },
    });

    // Add pagination state
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalLeads, setTotalLeads] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // Add ref for the table body
    const tableRef = useRef(null);
    const [seqNum, setSeqNum] = useState(null);

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

    // const fetchLeads = async () => {
    //     try {
    //         setIsLoading(true);
    //         const response = await axios.get(`https://obc.work.gd/?page=1`, {
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
    //                 'https://obc.work.gd/api/leads/filter/',
    //                 { ...savedFilterParams, page: nextPage },
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         } else if (currentView === 'search') {
    //             console.log('Fetching search results with query:', savedSearchQuery);
    //             response = await axios.get(
    //                 `https://obc.work.gd/api/leads/search/?query=${savedSearchQuery}&page=${nextPage}`,
    //                 { headers: { 'Authorization': `Token ${token}` } }
    //             );
    //         } else {
    //             console.log('Fetching default leads');
    //             response = await axios.get(
    //                 `https://obc.work.gd/?page=${nextPage}`,
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
            const response = await axios.get(`https://obc.work.gd/?page=1`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setLeads(response.data.leads);
            setTotalPages(response.data.total_pages);
            setCurrentPage(1);
            // Use total_leads if provided; fallback to leads length
            setTotalLeads(response.data.total_leads || response.data.leads.length);
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
                    'https://obc.work.gd/api/leads/filter/',
                    { ...savedFilterParams, page: nextPage },
                    { headers: { 'Authorization': `Token ${token}` } }
                );
            } else if (currentView === 'search') {
                response = await axios.get(
                    `https://obc.work.gd/api/leads/search/?query=${savedSearchQuery}&page=${nextPage}`,
                    { headers: { 'Authorization': `Token ${token}` } }
                );
            } else {
                response = await axios.get(
                    `https://obc.work.gd/?page=${nextPage}`,
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
            `https://obc.work.gd/api/leads/search/?query=${searchQuery}&page=1`,
            { headers: { 'Authorization': `Token ${token}` } }
          );
          
          // Update state
            setLeads(response.data.leads);
            setTotalPages(response.data.total_pages);
            setCurrentPage(1);
            setSavedSearchQuery(searchQuery); // Save the query
            setCurrentView('search'); // Set current view
            setSearchQuery('');
                
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
        setTotalLeads(0);
        setCurrentPage(1);
        setTotalPages(1);
        try {
            const response = await axios.post(
                'https://obc.work.gd/api/leads/filter/',
                { ...filterFormData, page: 1 },
                { headers: { 'Authorization': `Token ${token}` } }
            );
            // Update state with filter results
            setLeads(response.data.leads);
            setTotalPages(response.data.total_pages);
            setCurrentPage(1);
            setSavedFilterParams(filterFormData);
            setCurrentView('filter');
            // Use API total_leads if available; otherwise, fallback to the number of leads returned.
            setTotalLeads(response.data.total_leads || response.data.leads.length);
            setHasMore(response.data.current_page < response.data.total_pages);
    
            if (response.data.leads.length === 0) {
                setSearchMessage('No leads found for the selected filters');
            }
        } catch (error) {
            console.error('Error filtering leads:', error);
            setSearchMessage('Error occurred while filtering');
        }
    };
    

    // 18 feb start 

    const formatLeadDataForClipboard = (lead) => {
        const formatColumns = (label, value, bold = false) => {
          const leftCol = label.padEnd(15);  
          const rightCol = (value || 'N/A').padStart(25);  
          return bold ? `*${leftCol}${rightCol}*` : `${leftCol}${rightCol}`;
        };
      
        const formatMultiLine = (label, value, bold = false) => {
          const lines = [
            label,
            value || 'N/A'
          ];
          return bold ? lines.map(line => `*${line}*`).join('\n') : lines.join('\n');
        };
      
        const formattedData = [
          formatColumns('Name:', lead.name, true),
          formatColumns('Number:', lead.number, true),
          '',
          formatMultiLine('Car:', lead.vehicle, true),
          formatMultiLine('Variant:', `${lead.type || 'N/A'}`, true),
          '',
          formatColumns('Vin No.:', lead.vinNumber),
          formatColumns('Reg No.:', lead.regNumber),
          formatColumns('Arrival:', lead.arrival_mode),
          formatColumns('Date:', lead.arrival_time ? new Date(lead.arrival_time).toLocaleString('en-IN') : 'N/A', true),
          '',
          formatMultiLine('Add:', lead.address || 'N/A'),
          '',
          formatMultiLine('Map Link:', lead.map_link || 'N/A', true),
          '',
          formatMultiLine('Work Summary:', lead.products?.map(product => product.name).join(', ') || 'N/A', true),
          '',
          formatColumns('Total Amount:', `₹${lead.estimated_price || 'N/A'}`, true),
          '',
          formatMultiLine('Workshop Name:', lead.workshop_details?.name || 'N/A', true),
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
            user: '',
            source: '',
            status: '',
            location: '',
            dateRange: {
                startDate: '',
                endDate: ''
            }

        });
        // setDateRange([null, null]); // Reset the date range
        dateRangeSelectorRef.current.reset();
    };
    // http://34.131.86.189

    useEffect(() => {
        // Fetch welcome message and users
        axios.get('https://obc.work.gd/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
            .then(response => {
                setWelcomeData(response.data.message);
                setUsers(response.data.users); // Set users data
            })
            .catch(error => console.error('Error fetching home data:', error));
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

                        
                        <DateRangeSelector ref={dateRangeSelectorRef} onDateRangeChange={handleDateRangeChange} />



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
                        <select
                            name="status"
                            value={filterFormData.status}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                            <option value="">Status</option>
                            {/* <option value="">Lead Status</option> */}
                            {/* <option value="Assigned">Assigned</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Dead">Dead</option>
                            <option value="Communicate To Ops">Communicate To Ops</option>
                            <option value="Referred To Ops">Referred To Ops</option>
                            <option value="Converted">Converted</option>
                            <option value="At Workshop">At Workshop</option>
                            <option value="Completed">Completed</option>
                            <option value="Walkin">Walkin</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Doorstep">Doorstep</option> */}
                            <option value="Assigned">Assigned</option>
  <option value="Follow Up">Follow Up</option>
  <option value="Dead">Dead</option>
  <option value="Communicate To Ops">Communicate To Ops</option>
  <option value="Referred To Ops">Referred To Ops</option>
  <option value="Converted">Converted</option>
  <option value="At Workshop">At Workshop</option>
  <option value="Completed">Completed</option>
  <option value="Walkin">Walkin</option>
  <option value="Pickup">Pickup</option>
  <option value="Doorstep">Doorstep</option>
                        </select>
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
                        </select>
                        <input
                            type="date"
                            name="dateCreated"
                            value={filterFormData.dateCreated}
                            onChange={handleFilterChange}
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent date-created-input"
                        />
                        {/* Buttons in the last column */}
                        <div className="flex gap-2">
                            <button
                                type="reset"
                                onClick={handleReset}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/*<p>{seqNum || 'No sequence number available'}</p>*/}

            {/* Modified Search Section */}
            <div className="flex justify-between items-center mb-1 mt-4 px-4">
                <div className="w-24"></div> {/* Spacer for centering */}
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












