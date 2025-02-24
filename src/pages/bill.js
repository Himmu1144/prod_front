import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import obcLogo from '../assets/images/OBC-logo.webp';

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
    customerAdd: '',
    workshop: '',
    invoiceSum: [],     // [{ netAmt: '', dis: '', totalPay: '' }, …]
    workDetail: [],     // [{ descriptions: '', workDn: '', quant: '', unitPr: '', dis: '', netAmt: '' }, …]
    totalUnitPriceBill: 0,
    totalDiscountedPriceBill: 0,
    finalPriceBill: 0,
    totalPayablePriceBill: 0
  };

  // Merge passed data with default values
  const mergedData = { ...defaultData, ...data };
  const [details, setDetails] = useState(mergedData);

  useEffect(() => {
    if (data) {
      setDetails({ ...defaultData, ...data });
    }
  }, [data]);

  const generatePDF = async () => {
    try {
      const input = document.getElementById('pdf-content');
      const downloadButton = document.querySelector('.download-pdf');
      if (downloadButton) downloadButton.style.display = 'none';

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageCount = Math.ceil(imgHeight / pageHeight);

      for (let i = 0; i < pageCount; i++) {
        if (i > 0) pdf.addPage();
        const sourceY = i * pageHeight * (canvas.width / imgWidth);
        const destY = 0;
        
        pdf.addImage(
          imgData,
          'JPEG',
          0,
          destY - (i * pageHeight),
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      pdf.save('bill.pdf');
      if (downloadButton) downloadButton.style.display = 'block';
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    generatePDF
  }));

  if (!details) return <div>Loading...</div>;

  return (
    <div id="pdf-content" className="bg-white p-4 w-[210mm] mx-auto text-sm">
      <div className="border border-gray-300 rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center p-2 px-4 border-b border-gray-300" style={{border: '2px solid red!important'}}>
  <div className="flex items-center"> 
    <img
      src={obcLogo}
      alt="ONLY BIG CARS" 
      className="h-12 w-auto object-contain"
      style={{ maxWidth: '180px', maxHeight: '20px' }}
    />
  </div>
  <div className="font-bold text-xl flex items-center mb-3">INVOICE</div>
</div>


        {/* Customer Details in 2 columns with 6 rows each */}
        <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-300">
          {/* Left Column */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Name</div>
              <div className="p-2 border border-gray-200 rounded">{details.customerName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Car Brand</div>
              <div className="p-2 border border-gray-200 rounded">{details.carBrand}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Car Model</div>
              <div className="p-2 border border-gray-200 rounded">{details.carModel}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Fuel Type</div>
              <div className="p-2 border border-gray-200 rounded">{details.carYearFuel}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Reg No</div>
              <div className="p-2 border border-gray-200 rounded">{details.regNumber}</div>
            </div>
            {/* Address (2 lines tall) */}
            {/* <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Address</div>
              <div className="p-2 border border-gray-200 rounded">{details.customerAdd || 'N/A'}</div>

            </div> */}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Handover Date</div>
              <div className="p-2 border border-gray-200 rounded">{details.handoverDate}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Order ID</div>
              <div className="p-2 border border-gray-200 rounded">{details.orderId}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Speedometer</div>
              <div className="p-2 border border-gray-200 rounded">{details.speedRd}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Color</div>
              <div className="p-2 border border-gray-200 rounded">{details.carColor}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">VIN</div>
              <div className="p-2 border border-gray-200 rounded">{details.vinNo}</div>
            </div>
            {/* Workshop (2 lines tall) */}
            {/* <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-100 p-2 rounded font-semibold text-center">Workshop</div>
              <div className="p-2 border border-gray-200 rounded">{details.workshop || 'N/A'}</div>
              <div className="p-2 border border-gray-200 rounded min-h-[4.5rem]">{details.workshop || 'N/A'}</div>
            </div> */}
          </div>
        </div>

        <div className="p-4 border-b border-gray-300">
          {/* <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            ADDITIONAL WORK REQUIREMENTS
          </div> */}
          
          <div className="text-gray-600 text-left p-2 border border-gray-200 rounded">
          <div className="p-2"><strong>Address : </strong>{details.customerAdd || 'N/A'}</div>
          <div className="p-2"><strong>Workshop : </strong>{details.workshop || 'N/A'}</div>
          </div>
        </div>

        {/* Invoice Summary Section */}
        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            INVOICE SUMMARY
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Net Amount</th>
                  <th className="border p-2 text-left">Discount</th>
                  <th className="border p-2 text-left">Total Payable</th>
                </tr>
              </thead>
              <tbody>
                {details.invoiceSum.map((sum, index) => (
                  <tr key={index}>
                    <td className="border p-2">₹{sum.netAmt}</td>
                    <td className="border p-2">₹{sum.dis}</td>
                    <td className="border p-2">₹{sum.totalPay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="text-center mt-4 text-gray-600 italic">
            Precision in every detail, because your car deserves the best.
          </div>
        </div>

        {/* Work Summary Section */}
        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            WORK SUMMARY
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Description</th>
                  <th className="border p-2 text-left">Work Done</th>
                  <th className="border p-2 text-left">Qty</th>
                  <th className="border p-2 text-left">Unit Price</th>
                  <th className="border p-2 text-left">Discount</th>
                  <th className="border p-2 text-left">Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {details.workDetail.map((work, index) => (
                  <tr key={index}>
                    <td className="border p-2">{work.descriptions}</td>
                    <td className="border p-2">{work.workDn}</td>
                    <td className="border p-2">{work.quant}</td>
                    <td className="border p-2">₹{work.unitPr}</td>
                    <td className="border p-2">₹{work.dis}</td>
                    <td className="border p-2">₹{work.netAmt}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td className="border p-2" colSpan="3">Total</td>
                  <td className="border p-2">₹{details.totalUnitPriceBill}</td>
                  <td className="border p-2">₹{details.totalDiscountedPriceBill}</td>
                  <td className="border p-2">₹{details.finalPriceBill}</td>
                </tr>
              </tfoot>
            </table>

            {/* Final Amount Section */}
        {/* <div className="p-2 border-b border-gray-300">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Payable Amount:</span>
              <span>₹{details.totalPayablePriceBill}</span>
            </div>
          </div>
        </div> */}


          </div>
        </div>

        {/* Additional Work Requirements */}
        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            ADDITIONAL WORK REQUIREMENTS
          </div>
          <p className="text-gray-600 text-center">
            Review the extra care services required for your vehicle.
          </p>
        </div>

        

        {/* Terms & Conditions */}
        <div className="p-4">
          <div className="font-bold mb-4 text-center bg-gray-100 p-2 rounded">Disclaimer</div>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
            <li>All prices are inclusive of taxes</li>
            <li>Workshop will provide the tax invoice directly</li>
            {/* <li>Payment to be made at the time of delivery</li> */}
            <li>The colour of engine oil may appear black after servicing in diesel vehicles</li>
          </ul>
        </div>

        {/* Company Footer */}
        <div className="p-4 text-center border-t border-gray-300">
          <h3 className="text-xl font-bold mb-2">OnlyBigCars</h3>
          <address className="text-gray-600 mb-2">
            SAS Tower, Medcity, Sector - 38, Gurugram - 122001
          </address>
          <div className="space-y-1 text-gray-600">
            <div>Contact: 9999967591</div>
            <div>Website: https://onlybigcars.com/</div>
          </div>
        </div>

      </div>
      
      {/* <button
        onClick={generatePDF}
        className="download-pdf mt-8 mx-auto block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Download PDF
      </button> */}
    </div>
  );
});

export default Bill;