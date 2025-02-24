import React, { useEffect, useState, useContext } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { Edit, Copy, Search } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
    const { token } = useContext(AuthContext);

    // Add new state
    const [welcomeData, setWelcomeData] = useState('');
    const [leads, setLeads] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Add search handler
    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchQuery);
    };

    // Add form handling
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
    };

    const handleReset = (e) => {
        e.target.form.reset();
    };

    useEffect(() => {
        // Fetch welcome message
        axios.get('https://obc.work.gd7.0.0.1:8000/', {
            headers: {
                Authorization: `Token ${token}`
            }
        })
            .then(response => setWelcomeData(response.data.message))
            .catch(error => console.error('Error fetching home data:', error));

        // You'll need to create this endpoint in your backend
        // Temporarily using static data
        setLeads([
            {
                id: 'L-7017023787-BUVJDQ',
                type: 'General',
                location: 'Patna',
                name: 'Customer',
                vehicle: 'Maruti Suzuki WagonR Petrol',
                number: '7017023787',
                source: 'U-Organic',
                orderId: 'NA',
                regNumber:'NA',
                status: 'Assigned',
                cce: 'CCE: Ggn Hq-Anan',
                ca: 'CA:NA',
                recallDate: 'Jun 06,2023,08:26 AM',
                arrivalDate: 'Jun 06, 2023,08:26 AM',
                createdAt: 'Jun 06,2023,08:26 AM',
                modifiedAt: 'Jun 06,2023,08:26 AM'
            },
            {
                id: 'L-963412834-7-IUFIWR',
                type: 'General',
                location: 'Patna',
                name: 'Customer',
                vehicle: 'Maruti Suzuki WagonR Petrol',
                number: '7017023787',
                source: 'U-Organic',
                orderId: 'NA',
                regNumber:'NA',
                status: 'Assigned',
                cce: 'CCE: Ggn Hq-Anan',
                ca: 'CA:NA',
                recallDate: 'Jun 06,2023,08:26 AM',
                arrivalDate: 'Jun 06, 2023,08:26 AM',
                createdAt: 'Jun 06,2023,08:26 AM',
                modifiedAt: 'Jun 06,2023,08:26 AM'
            },
            {
                id: 'L-963412834-7-IUFIWR',
                type: 'General',
                location: 'Patna',
                name: 'Customer',
                vehicle: 'Maruti Suzuki WagonR Petrol',
                number: '7017023787',
                source: 'U-Organic',
                orderId: 'NA',
                regNumber:'NA',
                status: 'Assigned',
                cce: 'CCE: Ggn Hq-Anan',
                ca: 'CA:NA',
                recallDate: 'Jun 06,2023,08:26 AM',
                arrivalDate: 'Jun 06, 2023,08:26 AM',
                createdAt: 'Jun 06,2023,08:26 AM',
                modifiedAt: 'Jun 06,2023,08:26 AM'
            },
            
        ]);
    }, [token]);

    return (
        <Layout>
            {/* <h1 className="text-2xl font-bold mb-6">{welcomeData || 'Welcome to the Home Page!'}</h1> */}
            
            {/* New Form Section */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8" style={{ marginTop: '4.2em' }}>
                <p>All Lead</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-5 gap-4">
                        {/* First Row */}
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Select User</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Source</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Date Time Range</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Payment Status</option>
                            <option value="option1">Payment Successful</option>
                            <option value="option2">Payment Pending</option>
                            <option value="option3">Payment Failed</option>
                        </select>
                        {/* Language Barrier Checkbox */}
                        <div className="flex items-center">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="text-gray-700">Language Barrier</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4">
                        {/* Second Row */}
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Status</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Location</option>
                            <option value="Gurugram">Gurugram</option> <option value="Delhi">Delhi</option> <option value="Faridabad">Faridabad</option> <option value="Kanpur">Kanpur</option> <option value="Dehradun">Dehradun</option> <option value="Chandigarh">Chandigarh</option> <option value="Bangalore">Bangalore</option> <option value="Jaipur">Jaipur</option> <option value="Lucknow">Lucknow</option> <option value="Chennai">Chennai</option> <option value="Kolkata">Kolkata</option> <option value="Mumbai">Mumbai</option> <option value="Hyderabad">Hyderabad</option> <option value="Pune">Pune</option> <option value="Ahmedabad">Ahmedabad</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Luxury/Normal </option>
                            <option value="option1">Luxury</option>
                            <option value="option2">Normal</option>
                        </select>
                        <select className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent">
                            <option value="">Date Created</option>
                            <option value="option1">Option 1</option>
                            <option value="option2">Option 2</option>
                            <option value="option3">Option 3</option>
                        </select>
                        {/* <input 
                        type="date" 
                        className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Date Created"
                    /> */}
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

            {/* Modified Search Section */}
            <div className="flex justify-between items-center mb-4 mt-8 px-4">
                <div className="w-24"></div> {/* Spacer for centering */}
                <div className="flex items-center justify-center flex-1">
                    <div className="relative w-96"> {/* Fixed width for search field */}
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="LeadId/Mobile/OrderId/RegNumber"
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
                <button className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors duration-300">
                    Add Lead
                </button>
            </div>

            <div className="container mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse table-container" >
                        <thead className="bg-red-500 text-white">
                            <tr>
                                <th className="p-3 text-left">Lead Id | Type | Location</th>
                                <th className="p-3 text-left">Name | Vehicle</th>
                                <th className="p-3 text-left">Number | Source</th>
                                <th className="p-3 text-left">Order ID | Reg. Number</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">CCE | CA</th>
                                <th className="p-3 text-left">Date/Time</th>
                                <th className="p-3 text-left">Created/Modified At</th>
                                <th className="p-3 text-left">Edit/Copy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead, index) => (
                                <tr key={`${lead.id}-${index}`} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        {lead.id}<br />
                                        {lead.type}<br />
                                        {lead.location}
                                    </td>
                                    <td className="p-3">
                                        {lead.name}<br />
                                        {lead.vehicle}
                                    </td>
                                    <td className="p-3">
                                        {lead.number}<br />
                                        {lead.source}
                                    </td>
                                    <td className="p-3">
                                        {lead.orderId}<br />
                                        {lead.regNumber}
                                    </td>
                                    <td className="p-3">{lead.status}</td>
                                    <td className="p-3">
                                        {lead.cce}<br />
                                        {lead.ca}
                                    </td>
                                    <td className="p-3">
                                        Recall Date: {lead.recallDate}<br />
                                        Arrival Date: {lead.arrivalDate}
                                    </td>
                                    <td className="p-3">
                                        {lead.createdAt}<br />
                                        {lead.modifiedAt}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <Edit size={16} className="cursor-pointer" />
                                            <Copy size={16} className="cursor-pointer" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;