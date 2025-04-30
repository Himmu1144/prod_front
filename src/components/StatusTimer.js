// import React, { useState, useEffect } from 'react';
// import { Modal } from 'react-bootstrap';

// const StatusTimer = ({ status, startTime }) => {
//     const [elapsedTime, setElapsedTime] = useState('0:00:00');
//     const [show, setShow] = useState(true);
    
//     useEffect(() => {
//         // Only show for non-Active statuses
//         if (status === 'Active') {
//             setShow(false);
//             return;
//         }
        
//         setShow(true);
        
//         // Update timer every second
//         const timer = setInterval(() => {
//             const now = new Date();
//             const start = startTime ? new Date(startTime) : now;
//             const diff = now - start;
            
//             // Format time as HH:MM:SS
//             const hours = Math.floor(diff / 3600000);
//             const minutes = Math.floor((diff % 3600000) / 60000);
//             const seconds = Math.floor((diff % 60000) / 1000);
            
//             setElapsedTime(
//                 `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
//             );
//         }, 1000);
        
//         return () => clearInterval(timer);
//     }, [status, startTime]);
    
//     // Don't render anything for Active status
//     if (status === 'Active') return null;
    
//     return (
//         <Modal
//             show={show}
//             backdrop="static"
//             keyboard={false}
//             centered
//             dialogClassName="status-timer-modal"
//         >
//             <Modal.Header className="bg-warning text-dark">
//                 <Modal.Title>Current Status: {status}</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 <div className="text-center">
//                     <h3>Time Elapsed</h3>
//                     <div className="timer-display">
//                         <span className="display-4">{elapsedTime}</span>
//                     </div>
//                     <p className="mt-3">
//                         You've been on {status} status since {startTime ? new Date(startTime).toLocaleTimeString() : 'unknown time'}.
//                     </p>
//                     <p className="text-muted">
//                         To close this notification, change your status back to Active.
//                     </p>
//                 </div>
//             </Modal.Body>
//         </Modal>
//     );
// };

// export default StatusTimer;


import React, { useState, useEffect, useContext } from 'react';
import { Modal, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const StatusTimer = ({ status, startTime, onStatusChange }) => {
    const [elapsedTime, setElapsedTime] = useState('0:00:00');
    const [show, setShow] = useState(true);
    const { token } = useContext(AuthContext);
    
    useEffect(() => {
        // Only show for non-Active statuses
        if (status === 'Active') {
            setShow(false);
            return;
        }
        
        setShow(true);
        
        // Update timer every second
        const timer = setInterval(() => {
            const now = new Date();
            const start = startTime ? new Date(startTime) : now;
            const diff = now - start;
            
            // Format time as HH:MM:SS
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            setElapsedTime(
                `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);
        
        return () => clearInterval(timer);
    }, [status, startTime]);
    
    // // Handle status change from popup
    // const handleStatusChange = async (newStatus) => {
    //     try {
    //         const response = await axios.post(
    //             'https://admin.onlybigcars.com/api/update-status/',
    //             { status: newStatus },
    //             { headers: { 'Authorization': `Token ${token}` }}
    //         );
            
    //         // If parent provided a callback, call it
    //         if (onStatusChange) {
    //             onStatusChange(newStatus, new Date(response.data.timestamp));
    //         }
            
    //         // Show success message if provided
    //         if (response.data.message) {
    //             alert(response.data.message);
    //         }
    //     } catch (error) {
    //         console.error('Error updating status:', error);
            
    //         // Handle the case where status change is not allowed
    //         if (error.response && error.response.data) {
    //             if (error.response.data.message) {
    //                 alert(error.response.data.message);
    //             } else {
    //                 alert('Failed to update status');
    //             }
    //         }
    //     }
    // };

    const handleStatusChange = async (newStatus) => {
        try {
            const response = await axios.post(
                'https://admin.onlybigcars.com/api/update-status/',
                { status: newStatus },
                { headers: { 'Authorization': `Token ${token}` }}
            );
            
            // Check if response message is 'invalid_count'
            if (response.data.message === 'invalid_count') {
                alert(response.data.message);
            } else {
                // Refresh the page instead of calling callback and showing alert
                window.location.reload();
                
                // The following code won't execute after page reload
                // but it's left here in case you need it in the future
                /*
                if (onStatusChange) {
                    onStatusChange(newStatus, new Date(response.data.timestamp));
                }
                */
            }
        } catch (error) {
            console.error('Error updating status:', error);
            
            // Handle errors
            if (error.response && error.response.data) {
                if (error.response.data.message) {
                    alert(error.response.data.message);
                } else {
                    alert('Failed to update status');
                }
            }
        }
    };
    
    // Don't render anything for Active status
    if (status === 'Active') return null;
    
    return (
        <Modal
            show={show}
            backdrop={true}
            keyboard={false}
            centered={true}
            dialogClassName="status-timer-modal"
        >
            <Modal.Header className="bg-warning text-dark d-flex justify-content-between align-items-center">
                <Modal.Title>Current Status: {status}</Modal.Title>
                
                {/* Add the status dropdown here */}
                <Dropdown>
                    <Dropdown.Toggle 
                        variant={status === 'Active' ? 'danger' : 'warning'} 
                        id="dropdown-basic" 
                        size="sm"
                        className="ml-2"
                    >
                        Change Status
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
    <Dropdown.Item 
        onClick={() => handleStatusChange('Active')}
        active={status === 'Active'}
        disabled={status === 'Active'}  // Add this line
    >
        Active
    </Dropdown.Item>
    <Dropdown.Item 
        onClick={() => handleStatusChange('Break')}
        active={status === 'Break'}
        disabled={status === 'Break'}  // Add this line
    >
        Break
    </Dropdown.Item>
    <Dropdown.Item 
        onClick={() => handleStatusChange('Lunch')}
        active={status === 'Lunch'}
        disabled={status === 'Lunch'}  // Add this line
    >
        Lunch
    </Dropdown.Item>
    <Dropdown.Item 
        onClick={() => handleStatusChange('Training')}
        active={status === 'Training'}
        disabled={status === 'Training'}  // Add this line
    >
        Training
    </Dropdown.Item>
    <Dropdown.Item 
        onClick={() => handleStatusChange('Meeting')}
        active={status === 'Meeting'}
        disabled={status === 'Meeting'}  // Add this line
    >
        Meeting
    </Dropdown.Item>
</Dropdown.Menu>
                </Dropdown>
            </Modal.Header>
            <Modal.Body>
                <div className="text-center">
                    <h3>Time Elapsed</h3>
                    <div className="timer-display">
                        <span className="display-4">{elapsedTime}</span>
                    </div>
                    <p className="mt-3">
                        You've been on {status} status since {startTime ? new Date(startTime).toLocaleTimeString() : 'unknown time'}.
                    </p>
                    <p className="text-muted">
                        To close this notification, change your status back to Active.
                    </p>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default StatusTimer;