import React, { forwardRef, useImperativeHandle, useState, useEffect, useMemo } from 'react';
import { PDFViewer, usePDF, Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import obcLogo from '../assets/images/OBC-logo.png';
import OpenSansRegular from "../fonts/OpenSans-Regular.ttf";
import OpenSansBold from "../fonts/OpenSans-Bold.ttf";

Font.register({
  family: "OpenSans",
  fonts: [
    { src: OpenSansRegular, fontWeight: 400 },
    { src: OpenSansBold, fontWeight: 700 }
  ]
});

// (Optional) Register fonts if you want custom fonts like JobCard
// Font.register({ ... });

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  container: {
    border: '1pt solid #d1d5db', // Matches billhh.js, though billhh.js uses #9ca3af for some table borders
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
  customerDetailsSection: { // New style for the customer details section
    padding: 15, // Keep original padding
    border: '1pt solid #9ca3af', // Border like styles.table
    borderRadius: 4,             // Border radius like styles.table
    marginBottom: 15,
    // Add some space below if needed, or rely on next section's padding
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
  },
  redHeader: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    paddingVertical: 11.25,
    paddingHorizontal: 15,
    borderRadius: 5,
    textAlign: 'center',
    fontFamily: 'OpenSans', // Added from billhh.js
    fontWeight: 700,
    marginBottom: 15,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #9ca3af', // Changed from #e5e7eb to #9ca3af
    borderRadius: 4,
    orphans: 2, // Added from billhh.js
    widows: 2, // Added from billhh.js
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #9ca3af', // Changed from #e5e7eb to #9ca3af
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.75pt solid #9ca3af', // Changed from 1pt #e5e7eb to 0.75pt #9ca3af
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: '0.75pt solid #9ca3af', // Changed from 1pt #e5e7eb to 0.75pt #9ca3af
  },
  tableCellLast: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: 'none',
  },
  invoiceSummaryTableCell: { // New style from billhh.js
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: '0.75pt solid #9ca3af',
    fontFamily: 'OpenSans',
    fontWeight: 700,
  },
  invoiceSummaryTableCellLast: { // New style from billhh.js
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: 'none',
    fontFamily: 'OpenSans',
    fontWeight: 700,
  },
  tableTotal: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
    borderBottom: '1pt solid #e5e7eb',
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
  // New style for work summary section to prevent breaking (from billhh.js)
  workSummarySection: {
    padding: 15,
    borderBottom: '1pt solid #d1d5db', // Matches billhh.js section border
    // break: 'avoid', // Optional: consider if page breaking is an issue
    // wrap: false,
    // minPresenceAhead: 200,
    // orphans: 1,
    // widows: 1,
  },
  // New style for the complete work summary table (from billhh.js)
  workSummaryTable: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #9ca3af', // Matches billhh.js table border
    borderRadius: 4,
    // break: 'avoid', // Optional
    // wrap: false,
    // minPresenceAhead: 150,
    // orphans: 1,
    // widows: 1,
  },
  footerText: { // New style for footer text (from billhh.js)
    fontSize: 10,
    fontFamily: 'OpenSans',
    fontWeight: 700,
    marginBottom: 3,
    color: '#1f2937',
  },
  footerLink: { // New style for footer link/contact (from billhh.js)
    fontSize: 10,
    fontFamily: 'OpenSans',
    fontWeight: 400,
    color: '#374151',
    marginBottom: 1,
  },
  additionalWorkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 7.5,
    paddingTop: 10,
  },
  additionalWorkItem: {
    width: '33.33%',
    paddingHorizontal: 7.5,
    marginBottom: 5,
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'left',
  },
  additionalWorkFallback: {
    textAlign: 'center',
    color: '#6b7280',
    padding: 15,
    fontSize: 10,
  },
});

const PDFDocument = ({ data }) => {
  const defaultData = {
    customerName: '',
    carBrand: '',
    carModel: '',
    carYearFuel: '',
    regNumber: '',
    handoverDate: '',
    orderId: '',
    speedRd: '',
    carColor: '',
    customerAdd: '',
    vinNo: '',
    workshop: '',
    invoiceSum: [],
    workDetail: [],
    totalUnitPriceBill: 0,
    totalDiscountedPriceBill: 0,
    finalPriceBill: 0,
    totalPayablePriceBill: 0,
    workshopAddress: '',
    gstin: '',
    commissionReceived: 0,
    commissionDue: 0,
    wxgst: 0, // Added from billhh.js
    workshopDetailName: '',
    workshopDetailAddress: '',
    workshopDetailGSTIN: '',
    workshopDetailState: '',
    additionalWorkItems: [], // Added from billhh.js
  };
  const mergedData = { ...defaultData, ...data };

  const terms = [
    "Workshop will provide the tax invoice directly.",
    "The colour of engine oil may appear black after servicing in diesel vehicles.",
    "Payment to be made at the time of delivery.",
    "Please inspect your vehicle thoroughly at the time of delivery. Post-delivery claims will not be entertained.",
    // Added from billhh.js
    "The company is not responsible for any damage caused by natural disasters, accidents, or theft occurring at the workshop premises, unless due to gross negligence of the workshop.",
  ];

  // Process additionalWorkItems (from billhh.js)
  let workItemsArray = [];
  if (typeof mergedData.additionalWorkItems === 'string' && mergedData.additionalWorkItems.length > 0) {
    workItemsArray = mergedData.additionalWorkItems.split(',').map(item => item.trim()).filter(item => item);
  } else if (Array.isArray(mergedData.additionalWorkItems)) {
    workItemsArray = mergedData.additionalWorkItems.filter(item => typeof item === 'string' && item.trim());
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Image src={obcLogo} style={styles.logo} />
            <Text style={styles.title}>INVOICE</Text>
          </View>

          {/* Customer Details */}

          <View style={styles.customerDetailsSection}>
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
                <View style={styles.row}>
                  <Text style={{
                    ...styles.label,
                    border: '2pt solid #9ca3af'
                  }}>Date</Text>
                  <Text style={{
                    ...styles.value,
                    border: '2pt solid #9ca3af'
                  }}>{new Date().toLocaleDateString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</Text>
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
                <View style={styles.row}>
                  <Text style={{
                    ...styles.label,
                    border: '2pt solid #9ca3af'
                  }}>Time</Text>
                  <Text style={{
                    ...styles.value,
                    border: '2pt solid #9ca3af'
                  }}>{new Date().toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Address & Workshop */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>BUSINESS & CUSTOMER DETAILS</Text>
            <View style={{
              flexDirection: 'row',
              border: '1pt solid #e5e7eb', // billhh.js uses #e5e7eb here
              borderRadius: 5,
              overflow: 'hidden'
            }}>
              {/* Left: OnlyBigCars (was Workshop in billhh.js) */}
              <View style={{
                flex: 1,
                padding: 15,
                borderRight: '1pt solid #e5e7eb', // billhh.js uses #e5e7eb
                backgroundColor: '#f9fafb'
              }}>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'OpenSans',
                  fontWeight: 700,
                  color: '#dc2626', // Retained red for brand emphasis
                  marginBottom: 7.5,
                }}>
                  OnlyBigCars
                </Text>
                <View style={{ marginBottom: 7.5 }}>
                  <Text style={{ fontSize: 9, color: '#1f2937', marginBottom: 1, fontFamily: 'OpenSans' }}>SAS Tower 9th Floor</Text>
                  <Text style={{ fontSize: 9, color: '#1f2937', marginBottom: 1, fontFamily: 'OpenSans' }}>CH Baktawar Singh Rd,</Text>
                  <Text style={{ fontSize: 9, color: '#1f2937', marginBottom: 1, fontFamily: 'OpenSans' }}>Sec-38, Gurugram, Haryana</Text>
                  <Text style={{ fontSize: 9, color: '#1f2937', marginBottom: 1, fontFamily: 'OpenSans' }}>State : Haryana</Text>
                </View>
                <Text style={{
                  fontSize: 9,
                  color: '#dc2626', // Retained red for GSTIN emphasis
                  fontFamily: 'OpenSans',
                  fontWeight: 700,
                  marginBottom: 7.5,
                }}>
                  GSTIN: 06AJTPV6764A1ZP
                </Text>
                {/* Workshop Details section from billhh.js - adapted for wxbillhh.js data */}
                {/* <View style={{ 
                  backgroundColor: '#ffffff',
                  padding: 7.5,
                  borderRadius: 5,
                  border: '1pt solid #e5e7eb', // billhh.js uses #e5e7eb
                }}>
                  <Text style={{
                    fontSize: 10,
                    fontFamily: 'OpenSans',
                    fontWeight: 700,
                    color: '#111827', // Dark color for heading
                    marginBottom: 3,
                  }}>
                    Workshop Details: 
                  </Text>
                  <Text style={{ fontSize: 9, fontFamily: 'OpenSans', fontWeight: 700, color: '#1f2937' }}>
                    {mergedData.workshop || 'Workshop Name'} 
                  </Text>
                  <Text style={{ fontSize: 8, color: '#1f2937', fontFamily: 'OpenSans' }}>
                    {mergedData.workshopAddress || 'Workshop Address'}
                  </Text>
                </View> */}
              </View>

              {/* Right: Billing To (was Customer in billhh.js) */}
              <View style={{
                flex: 1,
                padding: 15,
                backgroundColor: '#ffffff'
              }}>
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'OpenSans',
                  fontWeight: 700,
                  color: '#dc2626', // Retained red for heading emphasis
                  marginBottom: 7.5,
                }}>
                  Billing To
                </Text>
                <View style={{
                  backgroundColor: '#f9fafb',
                  padding: 7.5,
                  borderRadius: 5,
                  border: '1pt solid #e5e7eb', // billhh.js uses #e5e7eb
                  marginBottom: 7.5
                }}>
                  <Text style={{ fontSize: 10, fontFamily: 'OpenSans', fontWeight: 700, color: '#1f2937' }}>
                    {mergedData.workshopDetailName || 'Workshop Billing Name'}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#1f2937', fontFamily: 'OpenSans' }}>
                    {mergedData.workshopDetailAddress || 'Workshop Billing Address'}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#1f2937', fontFamily: 'OpenSans' }}>
                    {mergedData.workshopDetailState ? `State: ${mergedData.workshopDetailState}` : 'Workshop Billing State'}
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#f9fafb',
                  padding: 7.5,
                  borderRadius: 5,
                  border: '1pt solid #e5e7eb', // billhh.js uses #e5e7eb
                  alignItems: 'center'
                }}>
                  <Text style={{ flex: 1, fontSize: 9, fontFamily: 'OpenSans', fontWeight: 700, color: '#1f2937' }}>
                    GSTIN/UIN:
                  </Text>
                  <Text style={{ flex: 2, fontSize: 9, color: '#dc2626', fontFamily: 'OpenSans', fontWeight: 700 }}>
                    {mergedData.workshopDetailGSTIN || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Invoice Summary */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>INVOICE SUMMARY</Text>
            {/* Using new styles for invoice summary table cells for bold font */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.invoiceSummaryTableCell}>Commission Amount</Text>
                <Text style={styles.invoiceSummaryTableCell}>GST</Text>
                <Text style={styles.invoiceSummaryTableCellLast}>Final Amount</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>
                  {/* Before GST Amt = commissionReceived + commissionDue */}
                  {(() => {
                    const beforeGST =
                      (parseFloat(mergedData.commissionReceived) || 0) +
                      (parseFloat(mergedData.commissionDue) || 0);
                    return Math.round(beforeGST);
                  })()}
                </Text>
               <Text style={styles.tableCell}>
  {/* GST: use wxgst directly */}
  {(() => {
    const gst = mergedData.wxgst || 0;
    return gst > 0 ? `${Math.round(gst)}%` : '';
  })()}
</Text>
<Text style={styles.tableCellLast}>
  {/* Final Amount = Before GST Amt + (Before GST Amt * wxgst %) */}
  {(() => {
    const beforeGST =
      (parseFloat(mergedData.commissionReceived) || 0) +
      (parseFloat(mergedData.commissionDue) || 0);
    const gst = mergedData.wxgst || 0;
    const finalAmount = beforeGST + (beforeGST * gst / 100);
    return beforeGST > 0 ? Math.round(finalAmount) : '';
  })()}
</Text>
              </View>
            </View>
          </View>
          {/* Work Summary - Apply styles from billhh.js */}
          <View style={styles.workSummarySection}> {/* Use workSummarySection style */}
            <Text style={styles.redHeader}>WORK SUMMARY</Text>
            <View style={styles.workSummaryTable}> {/* Use workSummaryTable style */}
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCell, flex: 1.2 }}>Description</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>Work Done</Text> {/* Wider column */}
                <Text style={{ ...styles.tableCell, flex: 0.7 }}>Qty</Text>
                {/* <Text style={{ ...styles.tableCell, flex: 1 }}>Unit Price</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>GST</Text>
                <Text style={{ ...styles.tableCellLast, flex: 1 }}>Net Amount</Text> */}
              </View>
              {(mergedData.workDetail || []).map((work, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={{ ...styles.tableCell, flex: 1.2 }}>{work.descriptions || ''}</Text>
                  <Text style={{ ...styles.tableCell, flex: 2 }}>{work.workDn || ''}</Text>
                  <Text style={{ ...styles.tableCell, flex: 0.7 }}>{work.quant ?? 0}</Text>
                  {/* <Text style={{ ...styles.tableCell, flex: 1 }}>{work.unitPr ?? 0}</Text>
    <Text style={{ ...styles.tableCell, flex: 1 }}>
      {((parseFloat(work.unitPr) || 0) * (parseFloat(work.quant) || 0) * (parseFloat(work.gst) || 0) / 100).toFixed(2)}
      {"\n"}
      <Text style={{ fontSize: 8, color: '#6b7280' }}>{work.gst ?? 0}%</Text>
    </Text>
    <Text style={{ ...styles.tableCellLast, flex: 1 }}>{work.netAmt ?? 0}</Text> */}
                </View>
              ))}

              {/* Table Footer: Total and Discount */}
              {/* // ...inside the Work Summary table, after mapping workDetail... */}

              {/* Table Footer: Discount and Totals */}

            </View>
          </View>

          {/* Additional Work Requirements - UI changes to match billhh.js */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>ADDITIONAL WORK REQUIREMENTS</Text>
            {workItemsArray && workItemsArray.length > 0 ? (
              <View style={styles.additionalWorkContainer}>
                {workItemsArray.map((item, idx) => (
                  <Text key={idx} style={styles.additionalWorkItem}>- {item}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.additionalWorkFallback}>
                No additional work requirements specified.
              </Text>
            )}
          </View>

          {/* Terms & Conditions */}
          <View style={{ padding: 15 }}>
            <Text style={styles.termsHeader}>Disclaimer</Text>
            {terms.map((term, idx) => (
              <Text key={idx} style={styles.term}>{term}</Text>
            ))}
          </View>

          {/* Footer - Apply styles from billhh.js */}
          <View style={{ padding: 15, textAlign: 'center', borderTop: '1pt solid #d1d5db' }}>
            <Text style={{ ...styles.footerText, fontSize: 14, marginBottom: 5 }}>OnlyBigCars</Text>
            <Text style={styles.footerLink}>SAS Tower, Medcity, Sector - 38, Gurugram - 122001</Text>
            <Text style={styles.footerLink}>Contact: 9999967591</Text>
            <Text style={styles.footerLink}>Website: https://onlybigcars.com/</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const WxBill = forwardRef(({ data }, ref) => {
  const defaultData = {
    customerName: '',
    carBrand: '',
    carModel: '',
    carYearFuel: '',
    regNumber: '',
    handoverDate: '',
    orderId: '',
    speedRd: '',
    carColor: '',
    customerAdd: '',
    vinNo: '',
    workshop: '',
    invoiceSum: [],
    workDetail: [],
    totalUnitPriceBill: 0,
    totalDiscountedPriceBill: 0,
    finalPriceBill: 0,
    totalPayablePriceBill: 0,
    workshopAddress: '',
    gstin: '',
    commissionReceived: 0,
    commissionDue: 0,
    wxgst: 0, // Added from billhh.js 
    workshopDetailName: '',
    workshopDetailAddress: '',
    workshopDetailGSTIN: '',
    workshopDetailState: '',
    additionalWorkItems: [], // Added from billhh.js
  };
  const mergedData = useMemo(() => ({ ...defaultData, ...data }), [data]);
  const [isLoading, setIsLoading] = useState(true);
  const [instance, updateInstance] = usePDF({ document: <PDFDocument data={mergedData} /> });


  useEffect(() => {
    console.log("Bill useEffect: data", data, "mergedData", mergedData);
    if (data) {
      setIsLoading(false);
      updateInstance(<PDFDocument data={mergedData} />);
    }
  }, [data, updateInstance]);

  const generatePDF = async (retry = 0) => {
    try {
      if (instance.loading) {
        if (retry > 50) throw new Error('PDF generation timeout');
        await new Promise(resolve => setTimeout(resolve, 100));
        return generatePDF(retry + 1);
      }
      const blob = instance.blob;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Dynamic filename
      const sanitizeForFilename = (text) => text ? text.replace(/[^a-zA-Z0-9-_]/g, '_') : '';
      const brandPart = sanitizeForFilename(mergedData.carBrand);
      const modelPart = sanitizeForFilename(mergedData.carModel);
      const orderPart = mergedData.orderId ? `-${sanitizeForFilename(mergedData.orderId)}` : '';
      link.download = `Bill-${brandPart}-${modelPart}${orderPart}.pdf`;
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <PDFViewer style={{ width: '100%', height: '100vh' }}>
      <PDFDocument data={mergedData} />
    </PDFViewer>
  );
});

export default WxBill;