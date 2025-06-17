import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import { PDFViewer, usePDF, Document, Page, View, Text, Image, StyleSheet,Font } from '@react-pdf/renderer';
import obcLogo from '../assets/images/OBC-logo.png'
import timeTableIcon from '../assets/images/timetable.png';
import qaIcon from '../assets/images/qa.png';
import garageIcon from '../assets/images/garage.png';
import OpenSansRegular from "../fonts/OpenSans-Regular.ttf";
import OpenSansBold from "../fonts/OpenSans-Bold.ttf";

Font.register({
  family: "OpenSans",
  fonts: [
    {
      src: OpenSansRegular,
      fontWeight: 400,
    },
    {
      src: OpenSansBold,
      fontWeight: 700,
    }
  ]
});



// Define styles using points for PDF compatibility
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 10,
    backgroundColor: '#ffffff',
    fontFamily: 'OpenSans', // Default font for the page
  },
  container: {
    border: '1pt solid #d1d5db',
    borderRadius: 5,
    boxShadow: '0 1pt 2pt rgba(0,0,0,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 7.5,
    borderBottom: '2pt solid #d1d5db',
  },
  logo: {
    width: 135,
    height: 15,
  },
  title: {
    fontSize: 16,
    fontFamily: 'OpenSans',
    fontWeight: 700,
    marginBottom: 8.25,
  },
  section: {
    padding: 15,
    borderBottom: '1pt solid #d1d5db',
  },
  customerDetailsSection: { // Style for the customer details section box
    padding: 15, // Padding inside the border
    borderBottom: '1pt solid #d1d5db', // Keep existing bottom border for separation
    border: '1pt solid #9ca3af', // Border like in billhh.js
    borderRadius: 4, // Border radius like in billhh.js
    marginBottom: 15, // Add some margin if it's directly within the main container or adjust as needed
  },
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7.5,
    gap: 3,
  },
  label: {
    width: '40%',
    backgroundColor: '#f3f4f6',
    padding: 7.5,
    borderRadius: 5,
    fontFamily: 'OpenSans',
    fontWeight: 700,
    textAlign: 'center',
  },
  value: {
    width: '60%',
    padding: 7.5,
    border: '1pt solid #e5e7eb',
    borderRadius: 5,
    fontFamily: 'OpenSans',
    fontWeight: 400,
  },
  redHeader: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    paddingVertical: 11.25,
    paddingHorizontal: 15,
    borderRadius: 5,
    textAlign: 'center',
    fontFamily: 'OpenSans', // Ensure OpenSans is used
    fontWeight: 700,
    marginBottom: 15,
  },
  grid3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inventoryItem: {
    flexDirection: 'row',
    marginBottom: 7.5,
    fontFamily: 'OpenSans',
    fontWeight: 400,
  },
  number: {
    width: 22.5,
    textAlign: 'right',
    fontFamily: 'OpenSans',
    fontWeight: 400, // Use registered weight
    marginRight: 7.5,
  },
  workSummarySectionWrapper: { // Wrapper for work summary to control breaks
    padding: 15,
    borderBottom: '1pt solid #d1d5db',
    // break: 'avoid', // Avoid breaking the entire section if possible
  },
  table: { // Updated table style for Work Summary
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #9ca3af', // Consistent with billhh.js
    borderRadius: 4, // Consistent with billhh.js
    orphans: 3, // Prevent single lines at start of new page
    widows: 3,  // Prevent single lines at end of page
    // break: 'avoid', // Try to keep table on one page if it fits
    // minPresenceAhead: 150, // Suggestion from billhh.js if break: 'avoid' is used
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #9ca3af', // Consistent with billhh.js
    fontFamily: 'OpenSans',
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.75pt solid #9ca3af', // Consistent with billhh.js
    fontFamily: 'OpenSans',
    fontWeight: 400,
    // wrap: false, // Consider for rows if content might overflow and break badly
    // break: 'avoid', // To keep individual rows from breaking
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: '0.75pt solid #9ca3af', // Consistent with billhh.js
    fontFamily: 'OpenSans',
    fontWeight: 400,
  },
  tableCellLast: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: 'none',
    fontFamily: 'OpenSans',
    fontWeight: 400,
  },
  tableTotal: { // Kept for potential future use, not directly in current JobCard work summary
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    fontFamily: 'OpenSans',
    fontWeight: 700,
    borderBottom: '1pt solid #9ca3af',
  },
  workshopItem: {
    alignItems: 'center',
    padding: 15,
  },
  workshopImage: {
    width: 45,
    height: 45,
  },
  workshopLabel: {
    fontFamily: 'OpenSans',
    fontWeight: 'medium', // Bolder
    color: '#1f2937', // Darker color
    marginTop: 7.5,
    textAlign: 'center',
  },
  workshopValue: { // Style for workshop data text
    fontFamily: 'OpenSans',
    fontWeight: 400,
    color: '#374151', // Darker text color
    marginTop: 4,
    textAlign: 'center',
  },
  termsHeader: {
    backgroundColor: '#f3f4f6',
    padding: 7.5,
    borderRadius: 5,
    textAlign: 'center',
    fontFamily: 'OpenSans',
    fontWeight: 700,
    marginBottom: 15,
  },
  term: {
    marginBottom: 7.5,
    paddingHorizontal: 15,
    color: '#374151',
    fontFamily: 'OpenSans',
    fontWeight: 400,
  },
  // Old additionalWorkItem style removed
  additionalWorkColumn: { // Style for each column in the additional work section
    width: '33%',
    paddingHorizontal: 2, // Minimal padding for the column itself
  },
  additionalWorkColumnItem: { // Style for each text item within an additional work column
    marginBottom: 5,
    fontSize: 10,
    fontFamily: 'OpenSans',
    fontWeight: 400,
    color: '#1f2937',
    // textAlign: 'left', // Default for Text
  },
  noAdditionalWorkText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingHorizontal: 15,
    // fontStyle: 'italic', // Removed to prevent font error
    fontFamily: 'OpenSans',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  vehicleImage: {
    width: '30%',
    height: 150,
    objectFit: 'cover',
    marginBottom: 10,
    borderRadius: 3,
  },
  noImagesText: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 15,
    // fontStyle: 'italic', // Removed to prevent font error
    fontFamily: 'OpenSans',
  },
});

// PDF Document Component
const PDFDocument = ({ data }) => {
  const defaultData = {
    inventory: '',
    additionalWork: [], // Expecting an array of strings
    customerName: '',
    carBrand: '',
    carModel: '',
    regNumber: '',
    fuelStatus: '',
    arrival_time: '',
    customerMobile: '',
    speedometerRd: '',
    orderId: '',
    carYearFuel: '',
    workshop: '',
    battery: '',
    workSummary: [{ type: '', name: '', workdone: '', total: 0 }],
    invoiceSummary: { total: 0, discount: 0, totalPayable: 0 },
    images:[],
  };
  const mergedData = { ...defaultData, ...data };

  // Ensure additionalWork is an array of strings
  let additionalWorkItems = [];
  if (Array.isArray(mergedData.additionalWork)) {
    additionalWorkItems = mergedData.additionalWork.map(item => String(item).trim()).filter(item => item);
  } else if (typeof mergedData.additionalWork === 'string') {
    additionalWorkItems = mergedData.additionalWork.split(',').map(item => item.trim()).filter(item => item);
  }


  const terms = [
    "1. Pickup & Drop Service - OnlyBigCars offers FREE pickup and drop service, subject to driver availability (hereafter referred to as \"Valet\").",
    "2. Payment Terms - Full payment for services must be made at the time of vehicle delivery. If the full amount is not confirmed at delivery, a tentative charge will be levied.",
    "3. Inventory Confirmation - Once the car owner verifies and confirms the inventory at delivery, any discrepancies will not be entertained.",
    "4. Delivery Delays - OnlyBigCars is not liable for delays caused by unforeseen circumstances beyond its control.",
    "5. Fuel Charges - Fuel consumed during vehicle transport will be borne by the customer.",
    "6. Personal Belongings - Customers must remove all personal belongings before handing over the vehicle. OnlyBigCars is not responsible for any loss of personal items.",
    "7. Payment to Valet - Full payment is to be made to the designated driver (Valet) upon successful vehicle delivery. No payment hold is allowed due to job discrepancies.",
    "8. Bodywork/Denting/Painting Services - Vehicles undergoing bodywork, denting, or painting will only be delivered after: Full payment is received and Final inspection & approval by the customer.",
    "9. Vehicle Handling & Liability - OnlyBigCars is not responsible for damages occurring during road tests, transport, garaging, or unexpected weather conditions.",
    "10. Repair Estimates - Estimates are based on customer repair requests and are subject to revision. A supplementary estimate may be required for additional repairs, spare parts, or accessories deemed essential by OnlyBigCars.",
    "11. Warranty Terms - Warranty coverage applies only if the vehicle has been serviced & maintained with OnlyBigCars as per the recommended schedule. Damages caused by neglect, rash driving, or missed periodic maintenance are not covered under warranty.",
    "12. Warranty Coverage - Services are warranted against defects in material & workmanship for 1 month or 500 km, whichever is earlier. Special cases may have a different warranty period, which will be specified separately.",
    "13. Compensation Under Warranty - Warranty compensation is limited to repair or replacement at the sole discretion of OnlyBigCars.",
    "14. Third-Party Components - Warranty claims for tyres, batteries, or other third-party consumables must be directed to the respective manufacturer or supplier.",
    "15. Final Inspection - Customers are advised to inspect their vehicle thoroughly at the time of delivery. Post-delivery claims will not be entertained. By availing of OnlyBigCars services, the customer agrees to these terms and conditions.",
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image src={obcLogo} style={styles.logo} />
            <Text style={styles.title}>JOB CARD</Text>
          </View>

          {/* Customer Details - Updated UI */}
          <View style={{...styles.section, border: '1pt solid #9ca3af', borderRadius: 4, borderBottomWidth: 0 }}> 
            {/* Removed bottom border from here as section below will have its top border */}
            <View style={styles.grid2}>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Name</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.customerName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Mobile</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.customerMobile}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Order ID</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.orderId || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Reg No</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.regNumber || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Battery</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.batteryFeature || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Brand</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.carBrand}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Model</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.carModel}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Fuel Type</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.carYearFuel}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Fuel Status</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.fuelStatus}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={{
                                  ...styles.label,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>Odometer</Text>
                  <Text style={{
                                  ...styles.value,
                                  border: '2pt solid #9ca3af' // Made border bold by increasing from 1pt to 2pt
                                  }}>{mergedData.speedometerRd}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Inventory Section */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>INVENTORY LIST</Text>
            <View style={styles.grid3}>
              {mergedData.inventory.split('\n').filter(item => item.trim()).reduce((columns, item, index) => {
                const colIndex = index % 3;
                if (!columns[colIndex]) columns[colIndex] = [];
                columns[colIndex].push({ text: item, number: index + 1 });
                return columns;
              }, []).map((column, colIndex) => (
                <View key={colIndex} style={{ width: '33%' }}>
                  {column.map(item => (
                    <View key={item.number} style={styles.inventoryItem}>
                      <Text style={styles.number}>{item.number}.</Text>
                      <Text>{item.text}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Work Summary - Updated UI */}
          <View style={styles.workSummarySectionWrapper}>
            <Text style={styles.redHeader}>WORK SUMMARY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{...styles.tableCell, flex: 2, fontWeight: 700}}>Work Detail</Text>
                <Text style={{...styles.tableCellLast, flex: 3, fontWeight: 700}}>Work to be done</Text>
              </View>
              {mergedData.workSummary && mergedData.workSummary.length > 0 ? (
                mergedData.workSummary.map((work, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={{...styles.tableCell, flex: 2}}>{work.name || ''}</Text>
                    <Text style={{...styles.tableCellLast, flex: 3}}>{work.workdone || ''}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.tableRow}>
                  <Text style={{...styles.tableCell, flex: 5, textAlign: 'center' /* fontStyle: 'italic' removed */}}>No work summary available.</Text>
                </View>
              )}
            </View>
          </View>

          {/* Additional Work - Updated UI */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>Additional Work</Text>
            {additionalWorkItems && additionalWorkItems.length > 0 ? (
              <View style={styles.grid3}>
                {additionalWorkItems.reduce((columns, item, index) => {
                  const colIndex = index % 3;
                  if (!columns[colIndex]) columns[colIndex] = [];
                  columns[colIndex].push(item); // Store the raw item string
                  return columns;
                }, []).map((columnItems, colIndex) => (
                  <View key={colIndex} style={styles.additionalWorkColumn}>
                    {columnItems.map((workItem, itemIndex) => (
                      <Text key={itemIndex} style={styles.additionalWorkColumnItem}>
                        - {workItem}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noAdditionalWorkText}>
                No additional work requirements specified.
              </Text>
            )}
          </View>

          {/* Workshop Details - Updated UI */}
          <View style={styles.section}>
                      <Text style={styles.redHeader}>WORKSHOP DETAILS</Text>
                      <View style={styles.grid3}>
                        <View style={styles.workshopItem}>
                          <Image src={garageIcon} style={styles.workshopImage} />
                          <Text style={styles.workshopLabel}>WORKSHOP</Text>
                          <Text>{mergedData.workshop}</Text>
                        </View>
                        <View style={styles.workshopItem}>
                          <Image src={timeTableIcon} style={styles.workshopImage} />
                          <Text style={styles.workshopLabel}>DATE & TIME</Text>
                          <Text>{mergedData.arrival_time}</Text>
                        </View>
                        <View style={styles.workshopItem}>
                          <Image src={qaIcon} style={styles.workshopImage} />
                          <Text style={styles.workshopLabel}>QA BY</Text>
                          <Text>ONLYBIGCARS ENGINEER</Text>
                        </View>
                      </View>
                    </View>

          {/* Vehicle Images */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>VEHICLE IMAGES</Text>
            {mergedData.images && mergedData.images.length > 0 ? (
              <View style={styles.imageGrid}>
                {mergedData.images.map((imageUrl, index) => (
                  <Image 
                    key={index}
                    src={imageUrl} 
                    style={styles.vehicleImage}
                    cache={false} // Consider implications of disabling cache
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.noImagesText}>No vehicle images available</Text>
            )}
          </View>

          {/* Declaration */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>Declaration</Text>
            <Text style={{ paddingHorizontal: 15, fontFamily: 'OpenSans', fontWeight: 400 }}>
              I authorize to execute the jobs described herein using the necessary material cost. I understand that the vehicle is stored, repaired and tested at my own risk.
            </Text>
          </View>

          {/* Terms & Conditions */}
          <View style={{ padding: 15, borderBottom: 'none' }}> {/* Removed borderBottom from the last section wrapper */}
            <Text style={styles.termsHeader}>Terms & Conditions</Text>
            {terms.map((term, index) => (
              <Text key={index} style={styles.term}>{term}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// JobCard Component
const JobCard = forwardRef(({ data }, ref) => {
  const defaultData = {
    inventory: '',
    additionalWork: [],
    customerName: '',
    carBrand: '',
    carModel: '',
    regNumber: '',
    fuelStatus: '',
    arrival_time: '',
    customerMobile: '',
    speedometerRd: '',
    orderId: '',
    carYearFuel: '',
    workshop: '',
    batteryFeature: '',
    workSummary: [{ type: '', name: '', workdone: '', total: 0 }],
    invoiceSummary: { total: 0, discount: 0, totalPayable: 0 },
    images:[],
  };

  const mergedData = useMemo(() => ({ ...defaultData, ...data }), [data]);
  const [isLoading, setIsLoading] = useState(true);
  // Pass mergedData directly to usePDF, it will re-render when mergedData changes.
  const [instance, updateInstance] = usePDF({ document: <PDFDocument data={mergedData} /> });


  useEffect(() => {
    if (data) { // Or check mergedData if it's more appropriate
      setIsLoading(false);
      // updateInstance is called by usePDF hook when its props change (document which depends on mergedData)
      // Explicitly calling updateInstance might be redundant if usePDF handles document prop changes.
      // However, if direct control is needed or if the document instance needs to be forced:
      updateInstance(<PDFDocument data={mergedData} />);
    }
  }, [mergedData, updateInstance]); // Depend on mergedData and updateInstance

  const generatePDF = async (retry = 0) => {
    try {
      if (instance.loading) {
        if (retry > 50) throw new Error('PDF generation timeout after multiple retries.'); // Added retry limit
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait a bit
        return generatePDF(retry + 1); // Retry
      }
      if (!instance.blob) { // Check if blob is available
        if (retry > 50) throw new Error('PDF blob not available after multiple retries.');
        await new Promise(resolve => setTimeout(resolve, 100));
        return generatePDF(retry + 1); // Retry
      }
      const blob = instance.blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const sanitizeForFilename = (text) => text ? String(text).replace(/[^a-zA-Z0-9-_]/g, '_') : '';
      const brandPart = sanitizeForFilename(mergedData.carBrand);
      const modelPart = sanitizeForFilename(mergedData.carModel);
      const orderPart = mergedData.orderId ? `-${sanitizeForFilename(mergedData.orderId)}` : '';

      link.download = `JobCard-${brandPart}-${modelPart}${orderPart}.pdf`;
      document.body.appendChild(link); // Append link to body for Firefox compatibility
      link.click();
      document.body.removeChild(link); // Clean up
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      // Consider user-facing error handling here
      throw error; // Re-throw if calling code needs to handle it
    }
  };
const generatePDFBlob = async () => {
  try {
    if (instance.loading) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return generatePDFBlob();
    }
    
    const blob = instance.blob;
    if (!blob) {
      throw new Error('PDF blob not available');
    }
    
    return blob;
  } catch (error) {
    console.error('PDF blob generation error:', error);
    throw error;
  }
};

 useImperativeHandle(ref, () => ({
  generatePDF,
  generatePDFBlob, // Add this line
}));

  if (isLoading || instance.loading) { // Also check instance.loading
    return <div>Loading PDF...</div>;
  }
  if (instance.error) { // Handle PDF generation errors
    console.error("Error generating PDF:", instance.error);
    return <div>Error generating PDF. Please try again.</div>;
  }

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <PDFDocument data={mergedData} />
    </PDFViewer>
  );
});

export default JobCard;