import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { PDFViewer, usePDF, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import obcLogo from '../assets/images/OBC-logo.png';

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
    totalLabourCost: 0,
    totalUnitPrice: 0,
    totalDiscountedPrice: 0,
    finalPriceBill: 0,
    totalPayablePrice: 0,
    totalPayable: 0,
  };

  const mergedData = { ...defaultData, ...data };
  const [details, setDetails] = useState(mergedData);
  const [instance, updateInstance] = usePDF({ document: <PDFDocument data={mergedData} /> });

  useEffect(() => {
    if (data) {
      setDetails({ ...defaultData, ...data });
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
      link.download = 'estimate.pdf';
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    generatePDF,
  }));

  if (!details) return <div>Loading...</div>;

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <PDFDocument data={mergedData} />
    </PDFViewer>
  );
});

export default Estimate;