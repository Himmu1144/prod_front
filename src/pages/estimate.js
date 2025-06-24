import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { PDFViewer, usePDF, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import obcLogo from '../assets/images/OBC-logo.png';
import orangecheck from '../assets/images/orange_check.png';

// Define styles for PDF rendering
const styles = StyleSheet.create({
  boldText: {
    fontWeight: 900,
  },
  page: {
    padding: 15,
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  container: {
    border: '1pt solid #d1d5db', // border-gray-300
    borderRadius: 5,
    boxShadow: '0 1pt 2pt rgba(0,0,0,0.05)', // shadow-sm
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7.5, // p-2
    paddingHorizontal: 15, // px-4
    borderBottom: '1pt solid #d1d5db',
  },
  logo: {
    width: 135, // 180px * 0.75pt
    height: 15, // 20px * 0.75pt
  },
  check: {
    width: 10, // 21px * 0.75pt
    height: 10, // 21px * 0.75pt
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 9.25, // mb-3
    marginTop:5,
  },
  section: {
    padding: 15,
    borderBottom: '1pt solid #d1d5db',
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
    marginBottom: 7.5, // space-y-2
    gap: 3,
  },
  label: {
    width: '40%',
    backgroundColor: '#f3f4f6', // bg-gray-100
    padding: 7.5, // p-2
    borderRadius: 5,
    fontWeight: 'medium',
    textAlign: 'center',

  },
  value: {
    width: '60%',
    padding: 7.5, // p-2
    border: '1pt solid #e5e7eb', // border-gray-200
    borderRadius: 5,
  },
  addressBox: {
    padding: 7.5,
    border: '1pt solid #e5e7eb',
    borderRadius: 5,
    color: '#4b5563', // text-gray-600
  },
  redHeader: {
    backgroundColor: '#dc2626', // bg-red-600
    color: '#ffffff',
    paddingVertical: 11.25, // py-3
    paddingHorizontal: 15, // px-4
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: 'medium',
    marginBottom: 15, // mb-4
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
    borderBottom: '1pt solid #e5e7eb', // border
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #e5e7eb',
  },
  tableFooter: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb', // bg-gray-50
    fontWeight: 'bold',
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
  italicText: {
    textAlign: 'center',
    color: '#4b5563', // text-gray-600
    fontStyle: 'italic',
    marginTop: 15, // mt-4
  },
  termsHeader: {
    backgroundColor: '#f3f4f6', // bg-gray-100
    padding: 7.5, // p-2
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15, // mb-4
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 7.5, // space-y-2
    paddingLeft: 15, // pl-5
    color: '#4b5563', // text-gray-600
  },
  bullet: {
    marginRight: 7.5,
  },
  footer: {
    padding: 15,
    textAlign: 'center',
    borderTop: '1pt solid #d1d5db',
  },
  footerTitle: {
    fontSize: 15, // text-xl
    fontWeight: 'bold',
    marginBottom: 7.5, // mb-2
  },
  footerText: {
    color: '#4b5563', // text-gray-600
    marginBottom: 3.75, // space-y-1 approximation
  },

  simpleWarrantyContainer: {
  backgroundColor: '#ffffff',
  borderRadius: 8,
  padding: 15,
  marginTop: 15,
},
  // Enhanced Warranty Section Styles
  // Main warranty section container
warrantySection: {
  padding: 20,
  backgroundColor: '#f8fafc',
  borderBottom: '1pt solid #e2e8f0',
  marginBottom: 0,
},
  
  // Premium header with gradient-like effect
  warrantyMainHeader: {
    backgroundColor: '#1e40af', // Professional blue
    color: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Trust badge container
  trustBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    border: '1pt solid #e2e8f0',
  },
  
  // Individual trust badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  
trustBadgeIcon: {
  width: 12,
  height: 12,
  backgroundColor: '#10b981', // Green background instead of white
  borderRadius: 6,
  marginRight: 6,
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
},

// Add this new style for the tick mark
trustBadgeTick: {
  width: 8,
  height: 6,
  borderLeft: '2px solid #ffffff',
  borderBottom: '2px solid #ffffff',
  transform: 'rotate(-45deg)',
  marginTop: -1,
},
  
  trustBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  // Warranty cards grid
  warrantyCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  // Individual warranty card - Premium styling
  premiumWarrantyCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    border: '2pt solid #e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    position: 'relative',
  },
  
  // Card header with icon and title
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1pt solid #f1f5f9',
  },
  
  // Premium icon styling
  warrantyIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    marginRight: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  warrantyIconInner: {
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
  },
  
  // Card title styling
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  
  // Card content
  cardContent: {
    marginBottom: 10,
  },
  
  cardDescription: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  
  // Feature list within cards
  featureList: {
    marginTop: 8,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  featureBullet: {
    width: 6,
    height: 6,
    backgroundColor: '#10b981',
    borderRadius: 3,
    marginRight: 8,
  },
  
  featureText: {
    fontSize: 9,
    color: '#475569',
    flex: 1,
  },
  
  // Premium badge for cards
  cardBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#dc2626',
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  // Warranty terms section
  warrantyTermsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    border: '1pt solid #e2e8f0',
  },
  
  warrantyTermsHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  warrantyTermsText: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
    textAlign: 'center',
  },
  
  // Contact section for warranty
  warrantyContactSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  contactIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginRight: 8,
  },
  
  contactText: {
    fontSize: 9,
    color: '#1e293b',
    fontWeight: 'medium',
  },
  // New warranty section styles
  warrantyHeader: {
    backgroundColor: '#2563eb', // blue background
    color: '#ffffff',
    paddingVertical: 11.25,
    paddingHorizontal: 15,
    borderRadius: 5,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 14,
  },
  warrantyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  warrantyCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    border: '1pt solid #e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  warrantyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warrantyIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#000000', // Changed to black
    borderRadius: 8,
    marginRight: 8,
    // This represents the checkmark icon
  },
  warrantyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000', // Changed to black
  },
  warrantyDescription: {
    fontSize: 10,
    color: '#000000', // Changed to black
    lineHeight: 1.4,
  },
  warrantyBadge: {
    backgroundColor: '#000000', // Changed to black
    color: '#ffffff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 6,
  },
});

// PDF Document Component
const PDFDocument = ({ data }) => {
  const defaultData = {
    customerName: '',
    date: '',
    regNumber: '',
    invoiceNumber: '',
    orderId: '',
    customerMobile: '',
    serviceType: '',
    estimatedTime: '',
    carBrand: '',
    carYearFuel: '',
    fuelStatus: '',
    carModel: '',
    speedRd: '',
    batteryFeature: '',
    billType: '',
    estimatedDate: '',
    customerAdd: '',
    workshop: '',
    invoiceSummary: [],
    workDetails: [],
    warrantyDetails: [],
    totalLabourCost: 0,
    totalUnitPrice: 0,
    totalDiscountedPrice: 0,
    finalPrice: 0,
    totalPayablePrice: 0,
    totalPayable: 0,
  };
  const mergedData = { ...defaultData, ...data };

  const disclaimers = [
    "All prices are inclusive of taxes",
    "Workshop will provide the tax invoice directly",
    "The colour of engine oil may appear black after servicing in diesel vehicles",
  ];

  // Enhanced warranty data structure


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image src={obcLogo} style={styles.logo} />
            <Text style={styles.title}>ORDER ESTIMATE</Text>
          </View>

          {/* Customer & Estimate Details */}
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
                  <Text style={styles.label}>Reg. No.</Text>
                  <Text style={styles.value}>{mergedData.regNumber || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Battery Features</Text>
                  <Text style={styles.value}>{mergedData.batteryFeature || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{mergedData.estimatedDate || 'N/A'}</Text>
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
                  <Text style={styles.value}>{mergedData.fuelStatus}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Odometer</Text>
                  <Text style={styles.value}>{mergedData.speedRd}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Time</Text>
                  <Text style={styles.value}>{mergedData.estimatedTime || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Address & Workshop Section */}
          <View style={styles.section}>
            <View style={styles.addressBox}>
            <Text>
  <Text style={styles.boldText}>Address: </Text>
  {mergedData.customerAdd || 'N/A'}
</Text>
              <Text style={{ marginTop: 7.5 }}>
                <Text style={{ fontWeight: 'bold' }}>Workshop: </Text>
                {mergedData.workshop || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Invoice Summary Section */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>INVOICE SUMMARY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Net Amount</Text>
                <Text style={styles.tableCell}>Discount</Text>
                <Text style={styles.tableCell}>Total Payable</Text>
              </View>
              {mergedData.invoiceSummary.map((sum, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>Rs. {sum.netAmount || 0}</Text>
                  <Text style={styles.tableCell}>Rs. {sum.discount || 0}</Text>
                  <Text style={styles.tableCell}>Rs. {sum.totalPayable || 0}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.italicText}>
              Precision in every detail, because your car deserves the best.
            </Text>
          </View>

          {/* Work Summary Section */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>WORK SUMMARY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{...styles.tableCell, flex: 2}}>Description</Text>
                <Text style={{...styles.tableCell, flex: 2}}>Work Done</Text>
                <Text style={styles.tableCell}>Qty</Text>
                <Text style={styles.tableCellLast}>Net Amount</Text>
              </View>
              {mergedData.workDetails.map((work, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={{...styles.tableCell, flex: 2}}>{work.description || ''}</Text>
                  <Text style={{...styles.tableCell, flex: 2}}>{work.workDone || ''}</Text>
                  <Text style={styles.tableCell}>{work.quantity || 0}</Text>
                  <Text style={styles.tableCellLast}>Rs. {work.netAmount || 0}</Text>
                </View>
              ))}
              <View style={styles.tableFooter}>
                <Text style={{ ...styles.tableCell, flex: 5 }}>Total</Text>
                <Text style={styles.tableCellLast}>Rs. {mergedData.finalPriceBill || 0}</Text>
              </View>
              <View style={styles.tableFooter}>
                <Text style={{ ...styles.tableCell, flex: 5 }}>After Discount</Text>
                <Text style={styles.tableCellLast}>Rs. {mergedData.totalPayable || 0}</Text>
              </View>
            </View>
          </View>

{/* Simplified Warranty Section */}
<View style={styles.warrantySection}>
  {/* Red Header */}
  <Text style={styles.redHeader}>
    WARRANTY DETAILS
  </Text>
  
{/* Trust Badges */}
<View style={styles.trustBadgeContainer}>
  <View style={styles.trustBadge}>
    <View style={styles.trustBadgeIcon}>
      <View style={styles.trustBadgeTick} />
    </View>
    <Text style={styles.trustBadgeText}>Certified</Text>
  </View>
  <View style={styles.trustBadge}>
    <View style={styles.trustBadgeIcon}>
      <View style={styles.trustBadgeTick} />
    </View>
    <Text style={styles.trustBadgeText}>Guaranteed</Text>
  </View>
  <View style={styles.trustBadge}>
    <View style={styles.trustBadgeIcon}>
      <View style={styles.trustBadgeTick} />
    </View>
    <Text style={styles.trustBadgeText}>Protected</Text>
  </View>
</View>

            {/* Custom warranty details from data */}
             {mergedData.warrantyDetails && mergedData.warrantyDetails.length > 0 && (
              <View style={styles.warrantyTermsContainer}>
                <Text style={styles.warrantyTermsHeader}>
                  {/* ADDITIONAL WARRANTY DETAILS */}
                </Text>
                 {mergedData.warranty && (
                    <View>
                      {typeof mergedData.warranty === 'string' && mergedData.warranty.includes('\n')
                        ? mergedData.warranty.split('\n').filter(point => point.trim()).map((point, index) => (
                            <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 }}>
                              <Image src={orangecheck} style={{ ...styles.check, marginRight: 5, marginTop: 1.5 }} />
                              <Text style={{ ...styles.warrantyDescription, flex: 1 }}>
                                {point.trim()}
                              </Text>
                            </View>
                          ))
                        : (
                          <Text style={styles.warrantyDescription}>
                            {mergedData.warranty}
                          </Text>
                        )
                      }
                    </View>
  )}
</View>

            )}
            
      
            {/* Standard warranty terms */}
            <View style={styles.warrantyTermsContainer}>
              <Text style={styles.warrantyTermsHeader}>
                WARRANTY TERMS & CONDITIONS
              </Text>
              <Text style={styles.warrantyTermsText}>
                All warranty services are subject to terms and conditions. Warranty coverage begins from the date of service completion. 
                Original invoice required for all warranty claims. Coverage excludes wear-and-tear items and damage due to misuse.
              </Text>
            </View>
      
            {/* Contact Section
            <View style={styles.warrantyContactSection}>
              <View style={styles.contactIcon} />
              <Text style={styles.contactText}>
                For warranty claims, contact us at 9999967591 or visit onlybigcars.com/warranty
              </Text>
            </View> */}
          </View>

          {/* Terms & Conditions */}
          <View style={styles.section}>
            <Text style={styles.termsHeader}>Disclaimer</Text>
            {disclaimers.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text>{item}</Text>
              </View>
            ))}
          </View>

          {/* Company Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>OnlyBigCars</Text>
            <Text style={styles.footerText}>
              SAS Tower, Medcity, Sector - 38, Gurugram - 122001
            </Text>
            <Text style={styles.footerText}>Contact: 9999967591</Text>
            <Text style={styles.footerText}>Website: https://onlybigcars.com/</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Estimate Component
const Estimate = forwardRef(({ data }, ref) => {
  const defaultData = {
    customerName: 'John Doe',
    date: '2025-06-23',
    regNumber: 'DL12AB1234',
    invoiceNumber: 'INV-007',
    orderId: 'ORD-101',
    customerMobile: '9876543210',
    serviceType: 'Periodic Maintenance',
    estimatedTime: '3 Hours',
    carBrand: 'Toyota',
    carYearFuel: '2022 / Petrol',
    fuelStatus: 'Half Tank',
    carModel: 'Camry',
    speedRd: '45,000 KM',
    batteryFeature: 'Amaron 65Ah',
    billType: 'Estimate',
    estimatedDate: '2025-06-23',
    customerAdd: '123 Sunshine Apartments, New Delhi - 110001',
    workshop: 'OBC Main Workshop, Gurugram',
    invoiceSummary: [
        { netAmount: 8500, discount: 500, totalPayable: 8000 }
    ],
    workDetails: [
        { description: 'Full Service Package', workDone: 'Engine oil, oil filter, air filter replaced.', quantity: 1, netAmount: 6000 },
        { description: 'Brake Pad Replacement', workDone: 'Front brake pads replaced.', quantity: 2, netAmount: 2500 },
    ],
    warrantyDetails: [
        { description: '1-year or 10,000 KM warranty on all parts replaced.' },
        
    ],
    totalLabourCost: 2000,
    totalUnitPrice: 6500,
    totalDiscountedPrice: 500,
    finalPriceBill: 8500,
    totalPayablePrice: 8000,
    totalPayable: 8000,
  };

  const mergedData = { ...defaultData, ...data };
  const [details, setDetails] = useState(mergedData);
  const [instance, updateInstance] = usePDF({ document: <PDFDocument data={mergedData} /> });

  useEffect(() => {
    if (data) {
      const updatedData = { ...defaultData, ...data };
      setDetails(updatedData);
      updateInstance(<PDFDocument data={updatedData} />);
    }
  }, [data]);

  const generatePDF = async (retry = 0) => {
    try {
      if (instance.loading) {
        if (retry > 50) throw new Error('PDF generation timeout after multiple retries.');
        await new Promise(resolve => setTimeout(resolve, 100));
        return generatePDF(retry + 1);
      }
      if (!instance.blob) {
        if (retry > 50) throw new Error('PDF blob not available after multiple retries.');
        await new Promise(resolve => setTimeout(resolve, 100));
        return generatePDF(retry + 1);
      }
      
      const blob = instance.blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Dynamic filename generation similar to JobCard
      const sanitizeForFilename = (text) => text ? String(text).replace(/[^a-zA-Z0-9-_]/g, '_') : '';
      const brandPart = sanitizeForFilename(mergedData.carBrand);
      const modelPart = sanitizeForFilename(mergedData.carModel);
      const orderPart = mergedData.orderId ? `-${sanitizeForFilename(mergedData.orderId)}` : '';

      link.download = `Estimate-${brandPart}-${modelPart}${orderPart}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  // Add generatePDFBlob method (same as JobCard)
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

  if (!details) return <div>Loading...</div>;

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <PDFDocument data={mergedData} />
    </PDFViewer>
  );
});

export default Estimate;