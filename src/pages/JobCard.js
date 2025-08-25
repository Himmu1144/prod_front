import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
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
    // fontWeight: 'bold'
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
    fontWeight: 700, // Use exact weight value that matches the registered font
    textAlign: 'center',
  },
  value: {
    width: '60%',
    padding: 7.5,
    border: '1pt solid #e5e7eb',
    borderRadius: 5,
  },
  redHeader: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    paddingVertical: 11.25,
    paddingHorizontal: 15,
    borderRadius: 5,
    textAlign: 'center',
    // fontFamily: 'OpenSans',
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
  },
  number: {
    width: 22.5,
    textAlign: 'right',
    fontWeight: 'medium',
    marginRight: 7.5,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #e5e7eb',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6', // bg-gray-100
    borderBottom: '1pt solid #e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e5e7eb',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: '1pt solid #e5e7eb',
  },
  tableCellLast: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: 'none',
  },
  tableTotal: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb', // bg-gray-50
    fontWeight: 'bold',
    borderBottom: '1pt solid #e5e7eb',
  },
  // workshopItem: {
  //   alignItems: 'center',
  //   padding: 15,
  // },
  // workshopImage: {
  //   width: 45,
  //   height: 45,
  // },
  // workshopLabel: {
  //   fontWeight: 'medium',
  //   color: '#4b5563',
  //   marginTop: 7.5,
  // },
  workshopCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: '32%',
    minHeight: 55,
  },
  workshopIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  workshopIcon: {
    width: 18,
    height: 18,
  },
  workshopTextBlock: {
    flexDirection: 'column',
    flex: 1,
  },
  workshopLabel: {
    fontSize: 7,
    fontFamily: 'OpenSans',
    fontWeight: 700,
    letterSpacing: 0.5,
    color: '#b91c1c',
    marginBottom: 2,
  },
  workshopValue: {
    fontSize: 9,
    fontFamily: 'OpenSans',
    fontWeight: 400,
    color: '#111827',
  },
  workshopCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    break: 'avoid',
  },
  termsHeader: {
    backgroundColor: '#f3f4f6',
    padding: 7.5,
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  term: {
    marginBottom: 7.5,
    paddingHorizontal: 15,
    color: '#374151',
  },

  // Add these to your existing StyleSheet
imageGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  gap: 10,
},
vehicleImage: {
  width: '30%',  // Makes images take ~30% width (3 per row)
  height: 150,    // Fixed height for consistent look
  objectFit: 'cover',
  marginBottom: 10,
  borderRadius: 3,
},
noImagesText: {
  textAlign: 'center',
  color: '#6b7280',
  padding: 15,
  fontStyle: 'italic',
},
});

// PDF Document Component
const PDFDocument = ({ data }) => {
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
  const mergedData = { ...defaultData, ...data };

  const rawInventory = mergedData.inventory;
  const normalizedInventoryArray = Array.isArray(rawInventory)
    ? rawInventory
    : (rawInventory || '').split('\n');
  const cleanedInventoryItems = normalizedInventoryArray
    .map(item => (item ?? '').toString().trim())
    .filter(item => item && item.toLowerCase() !== 'na' && item.toLowerCase() !== 'n/a');



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

          {/* Customer Details */}
          <View style={styles.section}>
            <View style={styles.grid2}>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Name</Text>
                  <Text style={styles.value}>{mergedData.customerName}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Mobile</Text>
                  <Text style={styles.value}>{mergedData.customerMobile}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Order ID</Text>
                  <Text style={styles.value}>{mergedData.orderId || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Reg No</Text>
                  <Text style={styles.value}>{mergedData.regNumber || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Battery Features</Text>
                  <Text style={styles.value}>{mergedData.batteryFeature || 'N/A'}</Text>
                </View>
              </View>
              <View style={styles.column}>
                <View style={styles.row}>
                  <Text style={styles.label}>Brand</Text>
                  <Text style={styles.value}>{mergedData.carBrand}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Model</Text>
                  <Text style={styles.value}>{mergedData.carModel}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Fuel Type</Text>
                  <Text style={styles.value}>{mergedData.carYearFuel}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Fuel Status</Text>
                  <Text style={styles.value}>{mergedData.fuelStatus}%</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Odometer</Text>
                  <Text style={styles.value}>{mergedData.speedometerRd}</Text>
                </View>
              </View>
            </View>
          </View>
  {/* Inventory Section */}
         {cleanedInventoryItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.redHeader}>INVENTORY LIST</Text>
              <View style={styles.grid3}>
                {cleanedInventoryItems.reduce((columns, item, index) => {
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
          )}
          {/* Work Summary */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>WORK SUMMARY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{...styles.tableCell, flex: 2}}>Work Detail</Text>
                <Text style={{...styles.tableCellLast, flex: 3}}>Work to be done</Text>
              </View>
              {mergedData.workSummary.map((work, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={{...styles.tableCell, flex: 2}}>{work.name || ''}</Text>
                  <Text style={{...styles.tableCellLast, flex: 3}}>{work.workdone || ''}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Additional Work */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>Additional Work</Text>
            <Text style={{ textAlign: 'center', paddingHorizontal: 15 }}>
              {mergedData.additionalWork}
            </Text>
          </View>

         
          {/* Workshop Details */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>WORKSHOP DETAILS</Text>
            <View style={styles.workshopCardsRow}>
              <View style={styles.workshopCard}>
                <View style={styles.workshopIconWrapper}>
                  <Image src={garageIcon} style={styles.workshopIcon} />
                </View>
                <View style={styles.workshopTextBlock}>
                  <Text style={styles.workshopLabel}>WORKSHOP</Text>
                  <Text style={styles.workshopValue}>{mergedData.workshop || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.workshopCard}>
                <View style={styles.workshopIconWrapper}>
                  <Image src={timeTableIcon} style={styles.workshopIcon} />
                </View>
                <View style={styles.workshopTextBlock}>
                  <Text style={styles.workshopLabel}>DATE & TIME</Text>
                  <Text style={styles.workshopValue}>{mergedData.arrival_time || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.workshopCard}>
                <View style={styles.workshopIconWrapper}>
                  <Image src={qaIcon} style={styles.workshopIcon} />
                </View>
                <View style={styles.workshopTextBlock}>
                  <Text style={styles.workshopLabel}>QA BY</Text>
                  <Text style={styles.workshopValue}>ONLYBIGCARS ENGINEER</Text>
                </View>
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
          cache={false}
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
            <Text style={{ paddingHorizontal: 15 }}>
              I authorize to execute the jobs described herein using the necessary material cost. I understand that the vehicle is stored, repaired and tested at my own risk.
            </Text>
          </View>

          {/* Terms & Conditions */}
          <View style={{ padding: 15 }}>
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

  

  const mergedData = { ...defaultData, ...data };
  const [isLoading, setIsLoading] = useState(true);
  const [instance, updateInstance] = usePDF({ document: <PDFDocument data={mergedData} /> });

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      updateInstance(<PDFDocument data={mergedData} />);
    }
  }, [data]);

  const generatePDF = async () => {
    try {
      if (instance.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return generatePDF();
      }
      const blob = instance.blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // With this code that builds a dynamic filename
      const sanitizeForFilename = (text) => text ? text.replace(/[^a-zA-Z0-9-_]/g, '_') : '';
      const brandPart = sanitizeForFilename(mergedData.carBrand);
      const modelPart = sanitizeForFilename(mergedData.carModel);
      const orderPart = mergedData.orderId ? `-${sanitizeForFilename(mergedData.orderId)}` : '';

      link.download = `JobCard-${brandPart}-${modelPart}${orderPart}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <PDFDocument data={mergedData} />
    </PDFViewer>
  );
});

export default JobCard;