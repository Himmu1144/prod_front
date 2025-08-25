// src/components/ExcelImport.js
import React, { useEffect, useState, useContext } from 'react';
import * as XLSX from 'xlsx';
import { AuthContext } from '../context/AuthContext';

// Define your column schema here. Adjust according to your "Leads" data.
// 'header' should match the exact header name in your Excel file.
const columnSchema = [
  { header: 'Customer Name', type: 'string', required: true, minLength: 2 },
  { header: 'Phone Number', type: 'string', required: true },
  { header: 'WhatsApp Number', type: 'string', required: false },
  { header: 'Car Brand', type: 'string', required: true },
  { header: 'Car Model', type: 'string', required: true },
  { header: 'Car Year', type: 'string', required: false },
  { header: 'Car Fuel', type: 'string', required: false },
  { header: 'Registration Number', type: 'string', required: false },
  { header: 'Address', type: 'string', required: true},
  { header: 'City', type: 'string', required: true }, 
  { header: 'State', type: 'string', required: false },
  { header: 'Building', type: 'string', required: false },
  { header: 'Landmark', type: 'string', required: false },
  { header: 'map_link', type: 'string', required: false },
  { header: 'Customer Email', type: 'email', required: false },
  { header: 'Source', type: 'string', required: true, allowedValues: ['inbound', 'outbound', 'Website', 'Google Ads', 'Whatsapp', 'Instagram', 'Facebook', 'Reference', 'Repeat', 'B2B', 'SMS', 'Test'] },
  { header: 'Status', type: 'string', required: true, allowedValues: ['test', 'Assigned', 'Follow Up', 'Dead', 'Duplicate', 'Communicate To Ops', 'Referred To Ops', 'Walkin', 'Pickup', 'Doorstep', 'At Workshop', 'Job Card', 'Estimate','Commision Due', 'Payment Due','Completed'] },
  { header: 'Lead Type', type: 'string', required: true, allowedValues: ['Luxury','Normal','Insurance'] },
  { header: 'Created Date', type: 'date', required: false },

  // Add NEW FIELD validations
  { header: 'Arrival Mode', type: 'string', required: true, allowedValues: ['Pickup', 'Doorstep', 'Walkin', ''] },
  { header: 'Select Disposition', type: 'string', required: false, allowedValues: ['Settled By Local Workshop', 'Client Will Visit workshop', 'Pickup Needed', 'Doorstep Needed', 'Not Interested', 'Wrong Number', 'Out of Service Area', 'Invalid Lead', 'Marketing Leads', 'Workshop Tie-ups', 'Price Issue', 'Not Answering', 'Workshop Not Responding', 'Workshop Not Available', 'Language Barrier', 'Test Leads', 'Others', ''] },
  { header: 'Date and Time', type: 'date', required: true },

  // Financial validation
  { header: 'Subtotal', type: 'number', required: false, minValue: 0 },
  { header: 'Discount', type: 'number', required: false, minValue: 0 },
  { header: 'Total Amount', type: 'number', required: false, minValue: 0 },
  { header: 'Final Amount', type: 'number', required: false, minValue: 0 },
  { header: 'Commission Due', type: 'number', required: false, minValue: 0 },
  { header: 'Commission Received', type: 'number', required: false, minValue: 0 },
  { header: 'Commission Percent', type: 'number', required: false, minValue: 0, maxValue: 100 },
  { header: 'Pending Amount', type: 'number', required: false, minValue: 0 },
 
  
  // Service validation - JSON format
  { header: 'Services JSON', type: 'json', required: false },
  // Add more column definitions as needed

  // workshop details
  {header: 'Workshop Name', type:'string', required:true},
  // {header: 'Mechanic Name', type:'string', required:true},
  {header: 'Workshop Locality', type:'string', required:false},
  {header: 'Workshop Mobile', type:'string', required:false},
  {header: 'Workshop Link', type: 'string', required:false},
  { header: 'CCE Comments', type: 'string', required: false },
  { header: 'Technician Name', type: 'string', required: true },
  { header: 'CCE Name', type: 'string', required: true, allowedValues: ['Loknath', 'Anjali', 'workshop','obcamarjeet']  },
  // { header: 'CCE Name', type: 'string', required: true},

  { header: 'Battery Feature', type: 'string', required: false },
  { header: 'Fuel Status', type: 'string', required: false },
  { header: 'Inventory', type: 'string', required: false }, // Kept as string, can be JSON if needed
  { header: 'Odometer', type: 'string', required: false }, // Kept as string, can be number
  { header: 'Additional Work', type: 'string', required: false },

];

const isValidJSON = (value) => {
  if (typeof value !== 'string') return false;
  try {
    const parsed = JSON.parse(value);
    // Validate that it's an array of service objects
    if (Array.isArray(parsed)) {
      return parsed.every(service => 
        typeof service === 'object' && 
        service.hasOwnProperty('name') && 
        service.hasOwnProperty('type')
      );
    }
    return false;
  } catch {
    return false;
  }
};

const ExcelImport = ({ onImportComplete, onClose }) => {
  const { token } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('success');
  const [previewData, setPreviewData] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [showFailedRecords, setShowFailedRecords] = useState(true);
  const [clientValidationErrors, setClientValidationErrors] = useState([]); // For client-side validation errors
  const [isAssignedOnly, setIsAssignedOnly]= useState(false);
  const [parsedData, setParsedData]= useState(null);


  // --- Validation Helper Functions ---
  const isValidDate = (value) => {
    // If already a Date object
    if (value instanceof Date && !isNaN(value.getTime())) {
      return true;
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Try to parse the date string using different formats
      const date = new Date(value);
      if (!isNaN(date.getTime())) return true;
      
      // Try specific format YYYY/MM/DD HH:MM
      const dateRegex = /^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}$/;
      if (dateRegex.test(value)) return true;
    }
    
    return false;
  };

  const isValidEmail = (value) => {
    if (typeof value !== 'string') return false;
    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const isValidNumber = (value) => typeof value === 'number' && !isNaN(value);


  // const validateRow = (rowData, headers, rowIndex) => {
  //   const errors = [];
  //   columnSchema.forEach(schemaItem => {
  //     const columnIndex = headers.indexOf(schemaItem.header);
  //     if (columnIndex === -1 && schemaItem.required) {
  //       // This case (missing required header) should ideally be caught earlier
  //       errors.push({
  //           rowIndex: rowIndex + 1, // User-friendly row number (1-based)
  //           columnName: schemaItem.header,
  //           value: 'N/A - Header Missing',
  //           message: `Required header "${schemaItem.header}" is missing in the Excel file.`,
  //       });
  //       return; // Skip further checks for this schema item if header is missing
  //     }
  //     // If header is not found for a non-required column, skip validation for it
  //     if (columnIndex === -1 && !schemaItem.required) {
  //       return;
  //     }

  //     const cellValue = rowData[columnIndex];

  //     // Required check
  //     if (schemaItem.required) {
  //       if (cellValue === null || cellValue === undefined || String(cellValue).trim() === '') {
  //         errors.push({
  //           rowIndex: rowIndex + 1,
  //           columnName: schemaItem.header,
  //           value: cellValue,
  //           message: `Column "${schemaItem.header}" is required.`,
  //         });
  //         return; // Stop validation for this cell if required check fails
  //       }
  //     }

  //     // If not required and cell is empty, skip further type checks
  //     if (!schemaItem.required && (cellValue === null || cellValue === undefined || String(cellValue).trim() === '')) {
  //       return;
  //     }

  //     // Type checks
  //     switch (schemaItem.type) {
  //       case 'string':
  //         if (typeof cellValue !== 'string') {
  //           // XLSX might parse numbers as numbers, allow them if they are to be strings
  //           if (typeof cellValue !== 'number') {
  //               errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Expected a string for "${schemaItem.header}".`});
  //           }
  //         } else if (schemaItem.minLength && cellValue.trim().length < schemaItem.minLength) {
  //           errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `"${schemaItem.header}" must be at least ${schemaItem.minLength} characters.`});
  //         }
  //         break;
  //       case 'email':
  //         if (!isValidEmail(cellValue)) {
  //           errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Invalid email format for "${schemaItem.header}".`});
  //         }
  //         break;
  //       case 'date':
  //         if (!isValidDate(cellValue)) {
  //           errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Invalid date for "${schemaItem.header}". Expected format parseable by Excel (e.g., YYYY-MM-DD). Value received: ${cellValue}`});
  //         }
  //         break;
  //       case 'number':
  //         let numericValue = cellValue;
  //         // Handle string numbers (remove currency symbols, commas)
  //         if (typeof cellValue === 'string') {
  //           numericValue = parseFloat(cellValue.replace(/[₹,$,\s]/g, ''));
  //         }
          
  //         if (!isValidNumber(numericValue)) {
  //           errors.push({
  //             rowIndex: rowIndex + 1,
  //             columnName: schemaItem.header,
  //             value: cellValue,
  //             message: `Column "${schemaItem.header}" must be a valid number.`,
  //           });
  //         } else {
  //           // Check min/max values
  //           if (schemaItem.minValue !== undefined && numericValue < schemaItem.minValue) {
  //             errors.push({
  //               rowIndex: rowIndex + 1,
  //               columnName: schemaItem.header,
  //               value: cellValue,
  //               message: `Column "${schemaItem.header}" must be at least ${schemaItem.minValue}.`,
  //             });
  //           }
  //           if (schemaItem.maxValue !== undefined && numericValue > schemaItem.maxValue) {
  //             errors.push({
  //               rowIndex: rowIndex + 1,
  //               columnName: schemaItem.header,
  //               value: cellValue,
  //               message: `Column "${schemaItem.header}" must be at most ${schemaItem.maxValue}.`,
  //             });
  //           }
  //         }
  //         break;
  //       case 'json':
  //         if (!isValidJSON(cellValue)) {
  //           errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Invalid JSON format for "${schemaItem.header}". Expected array of service objects.`});
  //         }
  //         break;
  //       case 'boolean':
  //         if (typeof cellValue !== 'boolean' && cellValue !== 'true' && cellValue !== 'false' && cellValue !== true && cellValue !== false) {
  //           errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Expected boolean (true/false) for "${schemaItem.header}".`});
  //         }
  //         break;
  //       default:
  //         break;
  //     }

  //     // Allowed values check
  //     if (schemaItem.allowedValues && !schemaItem.allowedValues.includes(cellValue)) {
  //       errors.push({
  //           rowIndex: rowIndex + 1,
  //           columnName: schemaItem.header,
  //           value: cellValue,
  //           message: `Value for "${schemaItem.header}" must be one of: ${schemaItem.allowedValues.join(', ')}.`,
  //       });
  //     }
      
  //     // Pattern check (e.g. for phone numbers)
  //     if (schemaItem.pattern && typeof cellValue === 'string' && !schemaItem.pattern.test(cellValue)) {
  //       errors.push({
  //           rowIndex: rowIndex + 1,
  //           columnName: schemaItem.header,
  //           value: cellValue,
  //           message: schemaItem.patternMessage || `Invalid format for "${schemaItem.header}".`
  //       });
  //     }
  //   });
  //   return errors;
  // };

  const validateRow = (rowData, headers, rowIndex, isAssignedOnly) => {
    const errors = [];
    
    // Get the status of the current row to check against 'Assigned only' mode
    const statusHeaderIndex = headers.indexOf('Status');
    const statusValue = statusHeaderIndex !== -1 ? (rowData[statusHeaderIndex] ? String(rowData[statusHeaderIndex]).trim() : null) : null;

    if (isAssignedOnly && statusValue !== 'Assigned') {
      // If in "Assigned only" mode and the status is not 'Assigned', we can stop validation for this row.
      // Or we can just flag the status error and continue. Here we'll flag it.
      errors.push({
          rowIndex: rowIndex + 1,
          columnName: 'Status',
          value: statusValue,
          message: `Only leads with status 'Assigned' are allowed in this import mode.`,
      });
      // Optionally, you could `return errors;` here to not report other errors for this row.
    }


    columnSchema.forEach(originalSchemaItem => {
      // Create a mutable copy of the schema item for this row's validation
      let schemaItem = { ...originalSchemaItem };

      // --- START: Conditional Validation Logic ---
      if (isAssignedOnly && statusValue === 'Assigned') {
        // If in 'Assigned only' mode for a valid row, relax 'required' constraints
        const requiredInAssignedMode = ['Customer Name', 'Phone Number', 'Source'];
        if (!requiredInAssignedMode.includes(schemaItem.header)) {
          schemaItem.required = false; // Temporarily make all other fields optional
        }
      }
      // --- END: Conditional Validation Logic ---

      const columnIndex = headers.indexOf(schemaItem.header);
      if (columnIndex === -1 && schemaItem.required) {
        errors.push({
            rowIndex: rowIndex + 1, // User-friendly row number (1-based)
            columnName: schemaItem.header,
            value: 'N/A - Header Missing',
            message: `Required header "${schemaItem.header}" is missing in the Excel file.`,
        });
        return; 
      }
      
      if (columnIndex === -1 && !schemaItem.required) {
        return;
      }

      const cellValue = rowData[columnIndex];

      // Required check
      if (schemaItem.required) {
        if (cellValue === null || cellValue === undefined || String(cellValue).trim() === '') {
          errors.push({
            rowIndex: rowIndex + 1,
            columnName: schemaItem.header,
            value: cellValue,
            message: `Column "${schemaItem.header}" is required.`,
          });
          return; 
        }
      }

      // If not required and cell is empty, skip further type checks
      if (!schemaItem.required && (cellValue === null || cellValue === undefined || String(cellValue).trim() === '')) {
        return;
      }

      // Type checks
      switch (schemaItem.type) {
        case 'string':
          if (typeof cellValue !== 'string') {
            if (typeof cellValue !== 'number') {
                errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Expected a string for "${schemaItem.header}".`});
            }
          } else if (schemaItem.minLength && cellValue.trim().length < schemaItem.minLength) {
            errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `"${schemaItem.header}" must be at least ${schemaItem.minLength} characters.`});
          }
          break;
        case 'email':
          if (!isValidEmail(cellValue)) {
            errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Invalid email format for "${schemaItem.header}".`});
          }
          break;
        case 'date':
          if (!isValidDate(cellValue)) {
            errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Invalid date for "${schemaItem.header}". Expected format parseable by Excel (e.g., YYYY-MM-DD). Value received: ${cellValue}`});
          }
          break;
        case 'number':
          let numericValue = cellValue;
          if (typeof cellValue === 'string') {
            numericValue = parseFloat(cellValue.replace(/[₹,$,\s]/g, ''));
          }
          
          if (!isValidNumber(numericValue)) {
            errors.push({
              rowIndex: rowIndex + 1,
              columnName: schemaItem.header,
              value: cellValue,
              message: `Column "${schemaItem.header}" must be a valid number.`,
            });
          } else {
            if (schemaItem.minValue !== undefined && numericValue < schemaItem.minValue) {
              errors.push({
                rowIndex: rowIndex + 1,
                columnName: schemaItem.header,
                value: cellValue,
                message: `Column "${schemaItem.header}" must be at least ${schemaItem.minValue}.`,
              });
            }
            if (schemaItem.maxValue !== undefined && numericValue > schemaItem.maxValue) {
              errors.push({
                rowIndex: rowIndex + 1,
                columnName: schemaItem.header,
                value: cellValue,
                message: `Column "${schemaItem.header}" must be at most ${schemaItem.maxValue}.`,
              });
            }
          }
          break;
        case 'json':
          if (!isValidJSON(cellValue)) {
            errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Invalid JSON format for "${schemaItem.header}". Expected array of service objects.`});
          }
          break;
        case 'boolean':
          if (typeof cellValue !== 'boolean' && cellValue !== 'true' && cellValue !== 'false' && cellValue !== true && cellValue !== false) {
            errors.push({rowIndex: rowIndex + 1, columnName: schemaItem.header, value: cellValue, message: `Expected boolean (true/false) for "${schemaItem.header}".`});
          }
          break;
        default:
          break;
      }

      // Allowed values check
      if (schemaItem.allowedValues && !schemaItem.allowedValues.includes(cellValue)) {
        errors.push({
            rowIndex: rowIndex + 1,
            columnName: schemaItem.header,
            value: cellValue,
            message: `Value for "${schemaItem.header}" must be one of: ${schemaItem.allowedValues.join(', ')}.`,
        });
      }
      
      // Pattern check
      if (schemaItem.pattern && typeof cellValue === 'string' && !schemaItem.pattern.test(cellValue)) {
        errors.push({
            rowIndex: rowIndex + 1,
            columnName: schemaItem.header,
            value: cellValue,
            message: schemaItem.patternMessage || `Invalid format for "${schemaItem.header}".`
        });
      }
    });
    return errors;
  };


  // const handleFileChange = (e) => {
  //   const selectedFile = e.target.files[0];
  //   setFile(selectedFile);
  //   setImportResults(null);
  //   setMessage('');
  //   setShowAlert(false);
  //   setPreviewData(null);
  //   setClientValidationErrors([]); // Clear previous client-side errors
    
  //   if (selectedFile) {
  //     const reader = new FileReader();
  //     reader.onload = (evt) => {
  //       try {
  //         const data = evt.target.result;
  //         const workbook = XLSX.read(data, { 
  //           type: 'array',
  //           cellDates: true, // Important for parsing dates
  //           dateNF: 'yyyy-mm-dd hh:mm:ss' // Helps interpret dates
  //         });
          
  //         const firstSheetName = workbook.SheetNames[0];
  //         const worksheet = workbook.Sheets[firstSheetName];
          
  //         const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
  //           header: 1, // Creates an array of arrays
  //           raw: false, // Use formatted strings, not raw values (e.g. for dates)
  //           dateNF: 'yyyy-mm-dd hh:mm:ss',
  //           cellDates: true,
  //           blankrows: false,
  //           defval: null // Treat empty cells as null''
  //         });
          
  //         if (jsonData.length === 0) {
  //           setAlertType('danger');
  //           setMessage('The Excel file is empty or has no data.');
  //           setShowAlert(true);
  //           return;
  //         }

  //         const headers = jsonData[0].map(h => String(h).trim());
  //         const dataRows = jsonData.slice(1);
          
  //         // Preview first 5 data rows + header
  //         setPreviewData([headers, ...dataRows.slice(0, 5)]);

  //         // Client-side validation
  //         let currentClientErrors = [];
  //         // Check for missing required headers first
  //         columnSchema.forEach(schemaItem => {
  //           if (schemaItem.required && !headers.includes(schemaItem.header)) {
  //               currentClientErrors.push({
  //                   rowIndex: 'N/A',
  //                   columnName: schemaItem.header,
  //                   value: 'N/A',
  //                   message: `Critical Error: Required header "${schemaItem.header}" is missing in the Excel file. Please correct the file.`,
  //               });
  //           }
  //         });
          
  //         if (currentClientErrors.length > 0) {
  //            // If critical headers are missing, show only these errors and stop further row validation.
  //           setClientValidationErrors(currentClientErrors);
  //           setAlertType('danger');
  //           setMessage('The Excel file has header issues. Please check the reported errors below.');
  //           setShowAlert(true);
  //           return;
  //         }


  //         dataRows.forEach((row, index) => {
  //           // Ensure row has the same number of cells as headers, pad with null if not
  //           const normalizedRow = headers.map((_, colIndex) => row[colIndex] !== undefined ? row[colIndex] : null);
  //           const rowErrors = validateRow(normalizedRow, headers, index + 1); // index + 1 for 1-based data row index
  //           currentClientErrors = [...currentClientErrors, ...rowErrors];
  //         });

  //         if (currentClientErrors.length > 0) {
  //           setClientValidationErrors(currentClientErrors);
  //           setAlertType('danger');
  //           setMessage(`Found ${currentClientErrors.length} validation issue(s) in the file. Please review the errors below and correct your Excel file.`);
  //           setShowAlert(true);
  //         } else {
  //           setAlertType('success');
  //           setMessage('File read and seems valid. Ready for import.');
  //           setShowAlert(true);
  //         }

  //       } catch (error) {
  //         console.error('Error reading or validating Excel file:', error);
  //         setAlertType('danger');
  //         setMessage('Error reading Excel file. Ensure it is a valid Excel file and not corrupted.');
  //         setShowAlert(true);
  //         setClientValidationErrors([]);
  //       }
  //     };
  //     reader.readAsArrayBuffer(selectedFile);
  //   }
  // };


  // 3a. New useEffect to trigger re-validation
  useEffect(() => {
    if (parsedData) {
      validateData(parsedData);
    }
  }, [isAssignedOnly, parsedData]);


  // 3b. New dedicated validation function
  const validateData = (jsonData) => {
    try {
        if (jsonData.length === 0) {
            setAlertType('danger');
            setMessage('The Excel file is empty or has no data.');
            setShowAlert(true);
            return;
        }

        const headers = jsonData[0].map(h => String(h).trim());
        const dataRows = jsonData.slice(1);
        
        setPreviewData([headers, ...dataRows.slice(0, 5)]);

        let currentClientErrors = [];
        columnSchema.forEach(schemaItem => {
            const isRequired = isAssignedOnly 
                ? ['Customer Name', 'Phone Number', 'Source', 'Status'].includes(schemaItem.header) 
                : schemaItem.required;

            if (isRequired && !headers.includes(schemaItem.header)) {
                currentClientErrors.push({
                    rowIndex: 'N/A',
                    columnName: schemaItem.header,
                    value: 'N/A',
                    message: `Critical Error: Required header "${schemaItem.header}" is missing.`,
                });
            }
        });
        
        if (currentClientErrors.length > 0) {
            setClientValidationErrors(currentClientErrors);
            setAlertType('danger');
            setMessage('The Excel file has header issues. Please check errors below.');
            setShowAlert(true);
            return;
        }

        dataRows.forEach((row, index) => {
            const normalizedRow = headers.map((_, colIndex) => row[colIndex] !== undefined ? row[colIndex] : null);
            // Pass the isAssignedOnly flag to validateRow
            const rowErrors = validateRow(normalizedRow, headers, index + 1, isAssignedOnly);
            currentClientErrors = [...currentClientErrors, ...rowErrors];
        });

        if (currentClientErrors.length > 0) {
            setClientValidationErrors(currentClientErrors);
            setAlertType('danger');
            setMessage(`Found ${currentClientErrors.length} validation issue(s). Please review and correct your file.`);
            setShowAlert(true);
        } else {
            setClientValidationErrors([]); // Clear errors if valid
            setAlertType('success');
            setMessage('File is valid and ready for import.');
            setShowAlert(true);
        }

    } catch (error) {
        console.error('Error validating Excel file:', error);
        setAlertType('danger');
        setMessage('Error processing Excel file. It might be corrupted.');
        setShowAlert(true);
        setClientValidationErrors([]);
    }
  };


  // 3c. Simplified handleFileChange function
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImportResults(null);
    setMessage('');
    setShowAlert(false);
    setPreviewData(null);
    setClientValidationErrors([]); 
    setParsedData(null); // Reset parsed data on new file selection
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (evt) => {
          const data = evt.target.result;
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true, 
            dateNF: 'yyyy-mm-dd hh:mm:ss'
          });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1, 
            raw: false,
            dateNF: 'yyyy-mm-dd hh:mm:ss',
            cellDates: true,
            blankrows: false,
            defval: null
          });
          
          // Instead of validating here, just set the parsed data
          setParsedData(jsonData);
      };
      reader.onerror = (error) => {
          console.error('FileReader error:', error);
          setAlertType('danger');
          setMessage('Error reading the selected file.');
          setShowAlert(true);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  const handleTemplateDownload = () => {
    setMessage('');
    setShowAlert(false);
    
    if (!token) {
      setAlertType('danger');
      setMessage('You must be logged in to download templates');
      setShowAlert(true);
      return;
    }
    
    fetch(`https://0pcdlz8k-8000.inc1.devtunnels.ms/api/import/template/?type=leads`, {
      headers: { 'Authorization': `Token ${token}` }
    })
    .then(response => {
      if (!response.ok) throw new Error('Failed to download template');
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_import_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAlertType('success');
      setMessage(`Downloaded leads template successfully`);
      setShowAlert(true);
    })
    .catch(error => {
      console.error('Error downloading template:', error);
      setAlertType('danger');
      setMessage('Error downloading template: ' + error.message);
      setShowAlert(true);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setAlertType('danger');
      setMessage('Please select a file first.');
      setShowAlert(true);
      return;
    }
    if (clientValidationErrors.length > 0) {
      setAlertType('danger');
      setMessage('Please fix the validation errors in your file before importing.');
      setShowAlert(true);
      return;
    }

    setIsUploading(true);
    setImportResults(null);
    setMessage('');
    setShowAlert(false);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('import_type', 'leads'); 
    formData.append('assigned_only_mode', isAssignedOnly);

    try {
      const response = await fetch('https://0pcdlz8k-8000.inc1.devtunnels.ms/api/import/excel/', {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.detail || `Import failed with status: ${response.status}`);
      }

      // Console log the imported data
    console.log('=== EXCEL IMPORT RESULTS ===');
    console.log('Full response data:', data);
    console.log('Created count:', data.created || 0);
    console.log('Updated count:', data.updated || 0);
    console.log('Failed count:', data.failed?.length || 0);
    
    if (data.created_leads && data.created_leads.length > 0) {
      console.log('=== CREATED LEADS DATA ===');
      data.created_leads.forEach((lead, index) => {
        console.log(`Created Lead ${index + 1}:`, lead);
      });
    }
    
    if (data.updated_leads && data.updated_leads.length > 0) {
      console.log('=== UPDATED LEADS DATA ===');
      data.updated_leads.forEach((lead, index) => {
        console.log(`Updated Lead ${index + 1}:`, lead);
      });
    }
    
    if (data.failed && data.failed.length > 0) {
      console.log('=== FAILED RECORDS ===');
      data.failed.forEach((failedRecord, index) => {
        console.log(`Failed Record ${index + 1}:`, failedRecord);
      });
    }
    
    console.log('=== END IMPORT RESULTS ===');      


      setImportResults(data);
      
      if (data.failed && data.failed.length > 0) {
        setAlertType('warning');
        setMessage(`Import completed with issues: ${data.created || 0} created, ${data.updated || 0} updated, ${data.failed.length} failed.`);
        // If there are failures, we DON'T call onImportComplete, so the modal stays open.
        // You might still want to refresh the underlying data if some records succeeded.
        // We can call onImportComplete but without the part that closes the modal,
        // but a simpler solution is to just keep it open and let the user close it manually after reviewing.
        if (onImportComplete) {
          // We still call this to allow the parent component to refresh the leads list,
          // but we pass a flag to tell it not to close the modal.
          onImportComplete(true); // Pass true to indicate there were failures
        }
      } else if (data.created || data.updated) {
        setAlertType('success');
        setMessage(`Successfully imported data: ${data.created || 0} created, ${data.updated || 0} updated.`);
        if (onImportComplete) onImportComplete(false); // Pass false for complete success
      } else {
        setAlertType('info');
        setMessage('No data was imported. The file might be empty, all records might have failed, or no changes were detected.');
      }
      // if (onImportComplete) onImportComplete(); // This line is removed
    } catch (error) {
      console.error('Error importing data:', error);
      setAlertType('danger');
      const errorMessage = error.message || (error.response?.data?.message) || 'An unexpected error occurred during import.';
      setMessage(`Error importing data: ${errorMessage}`);
      setImportResults(null);
    } finally {
      setShowAlert(true);
      setIsUploading(false);
    }
  };

  const exportFailedRecords = () => {
    if (!importResults?.failed || importResults.failed.length === 0) return;
    const headers = ['Row Number (in Original File)', 'Error Message', 'All Data (JSON)']; 
    const csvRows = [
      headers.join(','),
      ...importResults.failed.map(record => [
        record.row || 'N/A',
        `"${(record.error || 'Unknown error').replace(/"/g, '""')}"`,
        `"${JSON.stringify(record.data || {}).replace(/"/g, '""')}"`
      ].join(','))
    ];
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backend_failed_leads_import_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setAlertType('success');
    setMessage('Backend failed records exported successfully.');
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const CustomAlert = ({ variant, children, onClose, dismissible }) => {
    // ... (CustomAlert component remains the same as in your previous combined version)
    const baseClasses = "border-l-4 p-4 mb-4";
    const variantClasses = {
      success: 'bg-green-100 border-green-500 text-green-700',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      danger: 'bg-red-100 border-red-500 text-red-700',
      info: 'bg-blue-100 border-blue-500 text-blue-700',
    };
    const bgColor = variantClasses[variant] || variantClasses.info;
  
    return (
      <div className={`${baseClasses} ${bgColor} rounded-md shadow-sm`}>
        <div className="flex justify-between items-start">
          <div className="flex-grow">{children}</div>
          {/* {dismissible && onClose && (
            <button onClick={onClose} className="ml-3 -mt-1 -mr-1 p-1 rounded-md hover:bg-opacity-20 hover:bg-current focus:outline-none flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )} */}
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh] max-w-5xl mx-auto my-4"> 
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">Import Leads from Excel</h2>
      
      {showAlert && (
        <CustomAlert
          variant={alertType} 
          onClose={() => setShowAlert(false)} 
          dismissible
        >
          {message}
        </CustomAlert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Upload Excel File</label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          />
          <p className="text-sm text-gray-500 mt-2">
            Ensure your Excel file follows the template structure. Dates should be in a recognizable format (e.g., YYYY-MM-DD).
          </p>
        </div>

         <div className="mt-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAssignedOnly}
              onChange={(e) => {
                  setIsAssignedOnly(e.target.checked);
              }}
              className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <div className="flex flex-col">
                <span className="text-gray-800 font-medium">Import for 'Assigned' status only</span>
                <span className="text-sm text-gray-500">Requires only 'Customer Name', 'Phone Number', and 'Source' for leads with 'Assigned' status.</span>
            </div>
          </label>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Download Template</h3>
          <button
            type="button"
            onClick={handleTemplateDownload}
            className="text-sm px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Download Leads Template
          </button>
        </div>

        {importResults && (
          <div className="import-results">
            <h4>Import Summary</h4>
            <p>Successfully Created: {importResults.created}</p>
            <p>Successfully Updated: {importResults.updated}</p>
            <p className="text-danger">Failed Records: {importResults.failed ? importResults.failed.length : 0}</p>
          </div>
        )}

        {importResults && importResults.failed && importResults.failed.length > 0 && showFailedRecords && (
          <div className="failed-records-container mt-3">
            <h5 className="text-danger">Failed Records Details</h5>
            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="table table-bordered table-sm">
                <thead className="thead-light">
                  <tr>
                    <th>Excel Row</th>
                    <th>Error Message</th>
                  </tr>
                </thead>
                <tbody>
                  {importResults.failed.map((record, index) => (
                    <tr key={index}>
                      <td>{record.row}</td>
                      <td>
                        {record.error}
                        <details>
                           <summary style={{ cursor: 'pointer', fontSize: '0.8em' }}>View Data</summary>
                           <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.7em' }}>
                             {JSON.stringify(record.data, null, 2)}
                           </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Client-Side Validation Errors Display */}
        {clientValidationErrors.length > 0 && (
          <div className="mt-6 border border-orange-300 bg-orange-50 p-4">
            <h3 className="text-lg font-semibold text-orange-700 mb-3">
              ⚠️ File Validation Issues ({clientValidationErrors.length})
            </h3>
            <p className="text-sm text-orange-600 mb-3">
                Please correct these issues in your Excel file before attempting to import.
            </p>
            <div className="overflow-x-auto max-h-72 border border-orange-200 rounded">
              <table className="min-w-full divide-y divide-orange-200">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Row #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Column</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Value</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">Error</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-orange-100">
                  {clientValidationErrors.slice(0, 20).map((err, index) => ( // Show first 20 errors
                    <tr key={index} className="hover:bg-orange-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{err.rowIndex}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 font-medium">{err.columnName}</td>
                      <td className="px-3 py-2 whitespace-pre-wrap text-xs text-gray-600 max-w-xs truncate" title={String(err.value)}>
                        {String(err.value).length > 50 ? String(err.value).substring(0,47) + "..." : String(err.value)}
                      </td>
                      <td className="px-3 py-2 text-sm text-orange-700">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {clientValidationErrors.length > 20 && (
                <p className="text-xs text-orange-600 mt-2">Showing first 20 errors. There are more issues in the file.</p>
            )}
          </div>
        )}


        {previewData && clientValidationErrors.length === 0 && ( // Only show preview if no client errors
          <div>
            <h3 className="text-lg font-medium mb-3 text-gray-700">File Preview (First {Math.min(previewData.length, 6)} rows)</h3>
            <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody>
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? "bg-gray-100 font-semibold text-gray-600" : "hover:bg-gray-50"}>
                      {row.map((cell, cellIndex) => (
                        <td 
                          key={cellIndex} 
                          className="px-4 py-2.5 border-r border-gray-200 text-sm whitespace-nowrap"
                        >
                          {cell === null || cell === undefined || cell === '' ? null : (cell instanceof Date ? cell.toLocaleDateString() : String(cell))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              First row should contain column headers. Review data before importing.
            </p>
          </div>
        )}


        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            disabled={isUploading || !file || clientValidationErrors.length > 0}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              'Import Leads Data'
            )}
          </button>
          
          {/* {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
            >
              Cancel
            </button>
          )} */}
        </div>
      </form>

      {/* Import Results Summary - Backend */}
      {importResults && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Import Results (from Server)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-center md:text-left">
            <div className="bg-green-100 p-4 rounded-md shadow-sm">
              <div className="text-3xl font-bold text-green-600">{importResults.created || 0}</div>
              <div className="text-green-700 mt-1 text-sm">Records Created</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-md shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{importResults.updated || 0}</div>
              <div className="text-blue-700 mt-1 text-sm">Records Updated</div>
            </div>
            <div className="bg-red-100 p-4 rounded-md shadow-sm">
              <div className="text-3xl font-bold text-red-600">{importResults.failed?.length || 0}</div>
              <div className="text-red-700 mt-1 text-sm">Records Failed (Server-Side)</div>
            </div>
          </div>
        </div>
      )}

      {/* Backend Failed Records Section */}
      {importResults?.failed && importResults.failed.length > 0 && (
        <div className="mt-6 border border-red-200 bg-red-50 rounded-lg">
          <div className="px-6 py-4 border-b border-red-200">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <h3 className="text-lg font-semibold text-red-800">
                Server-Side Failed Records ({importResults.failed.length})
              </h3>
              <div className="flex space-x-2 flex-shrink-0">
                <button
                  onClick={exportFailedRecords}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Export Failed
                </button>
                <button
                  onClick={() => setShowFailedRecords(!showFailedRecords)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  {showFailedRecords ? 'Hide' : 'Show'} Details
                </button>
              </div>
            </div>
            <p className="text-red-700 text-sm mt-1">
              These records failed server-side validation or processing.
            </p>
          </div>
          
          {showFailedRecords && (
            <div className="p-4 md:p-6">
              <div className="overflow-x-auto max-h-96 border border-red-100 rounded">
                <table className="min-w-full divide-y divide-red-200">
                    <thead className="bg-red-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">File Row #</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Error</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Data Snippet</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-100">
                        {importResults.failed.map((record, index) => (
                            <tr key={index} className="hover:bg-red-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{record.row || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm text-red-600 max-w-xs truncate" title={record.error || 'Unknown error'}>{record.error || 'Unknown error'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                    <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded max-w-md overflow-x-auto">
                                        {JSON.stringify(record.data, null, 2)}
                                    </pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExcelImport;