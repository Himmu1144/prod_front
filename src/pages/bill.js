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
    fontFamily: 'OpenSans', // Ensure OpenSans is used for bold weight
    fontWeight: 700,
    marginBottom: 15,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #9ca3af',
    borderRadius: 4,
    orphans: 2,
    widows: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1pt solid #9ca3af',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.75pt solid #9ca3af',
  },
  tableRowNoWrap: {
    flexDirection: 'row',
    borderBottom: '0.75pt solid #9ca3af',
    wrap: false,
  },
  tableRowUnbreakable: {
    flexDirection: 'row',
    borderBottom: '0.75pt solid #9ca3af',
    wrap: false,
    minPresenceAhead: 20,
    orphans: 1,
    widows: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: '0.75pt solid #9ca3af',
  },
  tableCellLast: {
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: 'none',
  },
  invoiceSummaryTableCell: { // New style for Invoice Summary table cells
    flex: 1,
    textAlign: 'left',
    padding: 7.5,
    borderRight: '0.75pt solid #9ca3af',
    fontFamily: 'OpenSans',
    fontWeight: 700,
  },
  invoiceSummaryTableCellLast: { // New style for the last cell in Invoice Summary table rows
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
    borderBottom: '1pt solid #9ca3af',
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
  // New style for work summary section to prevent breaking
  workSummarySection: {
    padding: 15,
    borderBottom: '1pt solid #d1d5db',
    break: 'avoid',
    wrap: false,
    minPresenceAhead: 200, // Increased to ensure entire section fits
    orphans: 1,
    widows: 1,
  },
  // New style for the complete work summary table
  workSummaryTable: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #9ca3af',
    borderRadius: 4,
    break: 'avoid',
    wrap: false,
    minPresenceAhead: 150, // Reserve space for the entire table
    orphans: 1,
    widows: 1,
  },
  footerText: { // New style for footer text
    fontSize: 10, // Adjusted to match general page font size
    fontFamily: 'OpenSans',
    fontWeight: 700,
    marginBottom: 3,
    color: '#1f2937', // Darker color for footer text
  },
  footerLink: { // New style for footer link/contact
    fontSize: 10,
    fontFamily: 'OpenSans',
    fontWeight: 400, // Regular weight for links/contact
    color: '#374151',
    marginBottom: 1,
  },
  additionalWorkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  additionalWorkItem: {
    width: '33.33%',
    paddingRight: 15,
    marginBottom: 5,
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'left',
  },
  additionalWorkFallback: {
    textAlign: 'center',
    color: '#6b7280',
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
    customerDetailName: '',
    customerDetailAddress: '',
    customerDetailGSTIN: '',
    customerDetailState: '',
    additionalWorkItems: [], // Default to an empty array
  };
  const mergedData = { ...defaultData, ...data };

  const terms = [
    "All prices are inclusive of taxes.",
    "Workshop will provide the tax invoice directly.",
    "The colour of engine oil may appear black after servicing in diesel vehicles.",
    "Payment to be made at the time of delivery.",
    "Please inspect your vehicle thoroughly at the time of delivery. Post-delivery claims will not be entertained.",
    "The company is not responsible for any damage caused by natural disasters, accidents, or theft occurring at the workshop premises, unless due to gross negligence of the workshop.",
  ];

  // Process additionalWorkItems to ensure it's an array of strings
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
          <View style={{ ...styles.section, border: '1pt solid #9ca3af', borderRadius: 4 }}>
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

          {/* Address & Workshop */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>BUSINESS & CUSTOMER DETAILS</Text>
            <View style={{ 
              flexDirection: 'row',
              border: '1pt solid #e5e7eb',
              borderRadius: 5,
              overflow: 'hidden'
            }}>
              {/* Left: Workshop */}
              <View style={{
                flex: 1,
                padding: 15,
                borderRight: '1pt solid #e5e7eb',
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
                <View style={{ 
                  backgroundColor: '#ffffff',
                  padding: 7.5,
                  borderRadius: 5,
                  border: '1pt solid #e5e7eb',
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
                </View>
              </View>
              
              {/* Right: Customer */}
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
                  Customer Details
                </Text>
                <View style={{
                  backgroundColor: '#f9fafb',
                  padding: 7.5,
                  borderRadius: 5,
                  border: '1pt solid #e5e7eb',
                  marginBottom: 7.5
                }}>
                  <Text style={{ fontSize: 10, fontFamily: 'OpenSans', fontWeight: 700, color: '#1f2937' }}>
                    {mergedData.customerDetailName || 'Customer Name'}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#1f2937', fontFamily: 'OpenSans' }}>
                    {mergedData.customerDetailAddress || 'Customer Address'}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#1f2937', fontFamily: 'OpenSans' }}>
                    {mergedData.customerDetailState ? `State: ${mergedData.customerDetailState}` : ''}
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: '#f9fafb',
                  padding: 7.5,
                  borderRadius: 5,
                  border: '1pt solid #e5e7eb',
                  alignItems: 'center'
                }}>
                  <Text style={{ flex: 1, fontSize: 9, fontFamily: 'OpenSans', fontWeight: 700, color: '#1f2937' }}>
                    GSTIN/UIN:
                  </Text>
                  <Text style={{ flex: 2, fontSize: 9, color: '#dc2626', fontFamily: 'OpenSans', fontWeight: 700 }}>
                    {mergedData.customerDetailGSTIN || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Invoice Summary */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>INVOICE SUMMARY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.invoiceSummaryTableCell}>Net Amount</Text>
                <Text style={styles.invoiceSummaryTableCell}>Discount</Text>
                <Text style={styles.invoiceSummaryTableCellLast}>Total Payable</Text>
              </View>
              {mergedData.invoiceSum.map((sum, idx) => (
                <View key={idx} style={styles.tableRowUnbreakable}>
                  <Text style={styles.invoiceSummaryTableCell}>{sum.netAmt}</Text>
                  <Text style={styles.invoiceSummaryTableCell}>{sum.dis}</Text>
                  <Text style={styles.invoiceSummaryTableCellLast}>{sum.totalPay}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Work Summary - Fixed to prevent breaking */}
          <View style={styles.workSummarySection}>
            <Text style={styles.redHeader}>WORK SUMMARY</Text>
            <View style={styles.workSummaryTable}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCell, flex: 1.2 }}>Description</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>Work Done</Text>
                <Text style={{ ...styles.tableCell, flex: 0.7 }}>Qty</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>Unit Price</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>GST</Text>
                <Text style={{ ...styles.tableCellLast, flex: 1 }}>Net Amount</Text>
              </View>
              
              {(mergedData.workDetail || []).map((work, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    borderBottom: '0.75pt solid #9ca3af',
                    wrap: false,
                    break: 'avoid',
                    minPresenceAhead: 25,
                    orphans: 1,
                    widows: 1,
                  }}
                >
                  <Text style={{ 
                    ...styles.tableCell, 
                    flex: 1.2,
                    wrap: false,
                    break: 'avoid'
                  }}>
                    {work.descriptions || ''}
                  </Text>
                  <Text style={{ 
                    ...styles.tableCell, 
                    flex: 2,
                    wrap: false,
                    break: 'avoid'
                  }}>
                    {work.workDn || ''}
                  </Text>
                  <Text style={{ 
                    ...styles.tableCell, 
                    flex: 0.7,
                    wrap: false,
                    break: 'avoid'
                  }}>
                    {work.quant ?? 0}
                  </Text>
                  <Text style={{ 
                    ...styles.tableCell, 
                    flex: 1,
                    wrap: false,
                    break: 'avoid'
                  }}>
                    {work.unitPr ?? 0}
                  </Text>
                  <Text style={{ 
                    ...styles.tableCell, 
                    flex: 1,
                    wrap: false,
                    break: 'avoid'
                  }}>
                    {work.gst ?? 0}%
                  </Text>
                  <Text style={{ 
                    ...styles.tableCellLast, 
                    flex: 1,
                    wrap: false,
                    break: 'avoid'
                  }}>
                    {work.netAmt ?? 0}
                  </Text>
                </View>
              ))}

              {/* Table Footer */}
              {mergedData.totalDiscountedPriceBill > 0 && (
                <View style={{ 
                  ...styles.tableTotal, 
                  wrap: false, 
                  break: 'avoid',
                  minPresenceAhead: 25,
                  orphans: 1,
                  widows: 1,
                }}>
                  <Text style={{ ...styles.tableCell, flex: 1.2 }}>Discount</Text>
                  <Text style={{ ...styles.tableCell, flex: 2 }}></Text>
                  <Text style={{ ...styles.tableCell, flex: 0.7 }}></Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}></Text>
                  <Text style={{ ...styles.tableCell, flex: 1 }}></Text>
                  <Text style={{ ...styles.tableCellLast, flex: 1 }}>-{mergedData.totalDiscountedPriceBill}</Text>
                </View>
              )}
              <View style={{ 
                ...styles.tableTotal, 
                wrap: false, 
                break: 'avoid',
                minPresenceAhead: 25,
                orphans: 1,
                widows: 1,
              }}>
                <Text style={{ ...styles.tableCell, flex: 1.2 }}>Total</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}></Text>
                <Text style={{ ...styles.tableCell, flex: 0.7 }}>
                  {mergedData.workDetail.reduce((sum, w) => sum + (parseFloat(w.quant) || 0), 0)}
                </Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>
                  {mergedData.workDetail.reduce((sum, w) => sum + ((parseFloat(w.unitPr) || 0) * (parseFloat(w.quant) || 0)), 0).toFixed(2)}
                </Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>
                  {mergedData.workDetail.length > 0 
                    ? (mergedData.workDetail.reduce((sum, w) => sum + (parseFloat(w.gst) || 0), 0) / mergedData.workDetail.length).toFixed(1)
                    : '0.0'}%
                </Text>
                <Text style={{ ...styles.tableCellLast, flex: 1 }}>
                  {(mergedData.workDetail.reduce((sum, w) => sum + (parseFloat(w.netAmt) || 0), 0) - (mergedData.totalDiscountedPriceBill || 0)).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Work Requirements */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>ADDITIONAL WORK REQUIREMENTS</Text>
            {workItemsArray && workItemsArray.length > 0 ? (
              <View style={styles.additionalWorkContainer}>
                {workItemsArray.map((item, idx) => (
                  <Text key={idx} style={styles.additionalWorkItem}>
                    {'\u003E'} {item}
                  </Text>
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

          {/* Footer */}
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

const Bill = forwardRef(({ data }, ref) => {
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
    customerDetailName: '',
    customerDetailAddress: '',
    customerDetailGSTIN: '',
    customerDetailState: '',
    additionalWorkItems: [], // Ensure this matches the PDFDocument default
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

export default Bill;