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
    fontWeight: 700,
    marginBottom: 15,
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1pt solid #e5e7eb',
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
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

  };
  const mergedData = { ...defaultData, ...data };

  const terms = [
    "All prices are inclusive of taxes.",
    "Workshop will provide the tax invoice directly.",
    "The colour of engine oil may appear black after servicing in diesel vehicles.",
    "Payment to be made at the time of delivery.",
    "Please inspect your vehicle thoroughly at the time of delivery. Post-delivery claims will not be entertained.",
  ];

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
                  <Text style={styles.value}>{mergedData.fuelStatus}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Odometer</Text>
                  <Text style={styles.value}>{mergedData.speedometerRd}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Address & Workshop */}
     [⚠️ Suspicious Content] {/* Address & Workshop */}
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
        fontWeight: 700,
        color: '#dc2626',
        marginBottom: 7.5,
      }}>
        OnlyBigCars
      </Text>
      <View style={{ marginBottom: 7.5 }}>
        <Text style={{ fontSize: 9, color: '#374151', marginBottom: 1 }}>SAS Tower 9th Floor</Text>
        <Text style={{ fontSize: 9, color: '#374151', marginBottom: 1 }}>CH Baktawar Singh Rd,</Text>
        <Text style={{ fontSize: 9, color: '#374151', marginBottom: 1 }}>Sec-38, Gurugram, Haryana</Text>
      </View>
      <Text style={{
        fontSize: 9,
        color: '#dc2626',
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
          fontWeight: 700,
          color: '#111827',
          marginBottom: 3,
        }}>
          Workshop Details:
        </Text>
        <Text style={{ fontSize: 9, fontWeight: 700, color: '#374151' }}>
          {mergedData.workshop || 'Workshop Name'}
        </Text>
        <Text style={{ fontSize: 8, color: '#6b7280' }}>
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
        fontWeight: 700,
        color: '#dc2626',
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
        <Text style={{ fontSize: 10, fontWeight: 700, color: '#374151' }}>
          {mergedData.customerName || 'Customer Name'}
        </Text>
        <Text style={{ fontSize: 8, color: '#6b7280' }}>
          {mergedData.customerAdd || 'Customer Address'}
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
        <Text style={{ flex: 1, fontSize: 9, fontWeight: 700, color: '#374151' }}>
          GSTIN/UIN:
        </Text>
        <Text style={{ flex: 2, fontSize: 9, color: '#dc2626', fontWeight: 700 }}>
          {mergedData.gstin || 'N/A'}
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
                <Text style={styles.tableCell}>Net Amount</Text>
                {/* <Text style={styles.tableCell}>GST</Text> NEW */}
                <Text style={styles.tableCell}>Discount</Text>
                <Text style={styles.tableCellLast}>Total Payable</Text>
              </View>
              {mergedData.invoiceSum.map((sum, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{sum.netAmt}</Text>
                  {/* <Text style={styles.tableCell}>{sum.gst ? sum.gst.toFixed(2) : (sum.netAmt * 0.18).toFixed(2)}</Text> */}
                  <Text style={styles.tableCell}>{sum.dis}</Text>
                  <Text style={styles.tableCellLast}>{sum.totalPay}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Work Summary */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>WORK SUMMARY</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.tableCell, flex: 1.2 }}>Description</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>Work Done</Text> {/* Wider column */}
                <Text style={{ ...styles.tableCell, flex: 0.7 }}>Qty</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>Unit Price</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>GST</Text>
                <Text style={{ ...styles.tableCellLast, flex: 1 }}>Net Amount</Text>
              </View>
              {(mergedData.workDetail || []).map((work, idx) => (
  <View key={idx} style={styles.tableRow}>
    <Text style={{ ...styles.tableCell, flex: 1.2 }}>{work.descriptions || ''}</Text>
    <Text style={{ ...styles.tableCell, flex: 2 }}>{work.workDn || ''}</Text>
    <Text style={{ ...styles.tableCell, flex: 0.7 }}>{work.quant ?? 0}</Text>
    <Text style={{ ...styles.tableCell, flex: 1 }}>{work.unitPr ?? 0}</Text>
    <Text style={{ ...styles.tableCell, flex: 1 }}>
      {((parseFloat(work.unitPr) || 0) * (parseFloat(work.quant) || 0) * (parseFloat(work.gst) || 0) / 100).toFixed(2)}
      {"\n"}
      <Text style={{ fontSize: 8, color: '#6b7280' }}>{work.gst ?? 0}%</Text>
    </Text>
    <Text style={{ ...styles.tableCellLast, flex: 1 }}>{work.netAmt ?? 0}</Text>
  </View>
))}

              {/* Table Footer: Total and Discount */}
             {/* // ...inside the Work Summary table, after mapping workDetail... */}

{/* Table Footer: Discount and Totals */}
{mergedData.totalDiscountedPriceBill > 0 && (
  <View style={styles.tableTotal}>
    <Text style={{ ...styles.tableCell, flex: 1.2 }}>Discount</Text>
    <Text style={{ ...styles.tableCell, flex: 2 }}></Text>
    <Text style={{ ...styles.tableCell, flex: 0.7 }}></Text>
    <Text style={{ ...styles.tableCell, flex: 1 }}></Text>
    <Text style={{ ...styles.tableCell, flex: 1 }}></Text>
    <Text style={{ ...styles.tableCellLast, flex: 1 }}>-{mergedData.totalDiscountedPriceBill}</Text>
  </View>
)}
<View style={styles.tableTotal}>
  <Text style={{ ...styles.tableCell, flex: 1.2 }}>Total</Text>
  <Text style={{ ...styles.tableCell, flex: 2 }}></Text>
  <Text style={{ ...styles.tableCell, flex: 0.7 }}>
    {/* Qty total */}
    {mergedData.workDetail.reduce((sum, w) => sum + (parseFloat(w.quant) || 0), 0)}
  </Text>
  <Text style={{ ...styles.tableCell, flex: 1 }}>
    {/* Unit Price total (unit price * qty) */}
    {mergedData.workDetail.reduce((sum, w) => sum + ((parseFloat(w.unitPr) || 0) * (parseFloat(w.quant) || 0)), 0).toFixed(2)}
  </Text>
  <Text style={{ ...styles.tableCell, flex: 1 }}>
    {/* GST total (unit price * qty * gst%) */}
    {mergedData.workDetail.reduce((sum, w) => sum + ((parseFloat(w.unitPr) || 0) * (parseFloat(w.quant) || 0) * (parseFloat(w.gst) || 0) / 100), 0).toFixed(2)}
  </Text>
  <Text style={{ ...styles.tableCellLast, flex: 1 }}>
    {/* Net Amount total after discount */}
    {(mergedData.workDetail.reduce((sum, w) => sum + (parseFloat(w.netAmt) || 0), 0) - (mergedData.totalDiscountedPriceBill || 0)).toFixed(2)}
  </Text>
</View>
            </View>
          </View>

          {/* Additional Work Requirements */}
          <View style={styles.section}>
            <Text style={styles.redHeader}>ADDITIONAL WORK REQUIREMENTS</Text>
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>
              Review the extra care services required for your vehicle.
            </Text>
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
            <Text style={{ fontSize: 14, fontWeight: 700, marginBottom: 5 }}>OnlyBigCars</Text>
            <Text>SAS Tower, Medcity, Sector - 38, Gurugram - 122001</Text>
            <Text>Contact: 9999967591</Text>
            <Text>Website: https://onlybigcars.com/</Text>
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

export default Bill;