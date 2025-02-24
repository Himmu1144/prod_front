import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import obcLogo from '../assets/images/OBC-logo.webp';
import timeTableIcon from '../assets/images/timetable.png';
import qaIcon from '../assets/images/qa.png';
import garageIcon from '../assets/images/garage.png';
// import './JobCard.css';

const JobCard = forwardRef(({ data }, ref) => {
  const defaultData = {
    inventory: [],
    // carDocuments: [],
    // otherChecklist: [],
    additionalWork: [],
    customerName: '',
    carBrand: '',
    carModel: '',
    regNumber: '',
    fuelStatus: '',
    arrival_time: '',
    inventory: '',
    carDocumentDetails: '',
    otherCheckList: '',
    customerMobile: '',
    speedRd: '',
    orderId: '',
    carYearFuel: '',
    workshop: '',
    estimatedTime: '',
    estimatedDate: '',
    batteryFeature: '',
    speedometerRd: '',
    workSummary: [{
      type: '',
      name: '',
      workdone: '',
      total: 0,
    }],
    invoiceSummary: {
      total: 0,
      discount: 0,
      totalPayable: 0,
    },
  };

  const mergedData = { ...defaultData, ...data };
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
    }
  }, [data]);

  const generatePDF = async () => {
    try {
      const input = document.getElementById('pdf-contents');
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

      pdf.save('job_card.pdf');
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  };

  useImperativeHandle(ref, () => ({
    generatePDF: async () => {
      try {
        return await generatePDF();
      } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
      }
    }
  }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div id="pdf-contents" className="bg-white p-4 w-[210mm] mx-auto text-sm">
      <div className="border border-gray-300 rounded-lg shadow-sm">
        {/* Header */}
        {/* <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
          <div className="flex items-center">
            <img src={obcLogo} alt="ONLY BIG CARS" className="h-8 w-auto object-contain" />
          </div>
          <div className="font-bold text-xl text-gray-800">JOB CARD</div>
          <div className="w-20"></div>
        </div> */}

<div className="flex justify-between items-center p-2 border-b border-gray-300" style={{border: '2px solid red!important'}}>
  <div className="flex items-center"> 
    <img
      src={obcLogo}
      alt="ONLY BIG CARS" 
      className="h-12 w-auto object-contain"
      style={{ maxWidth: '180px', maxHeight: '20px' }}
    />
  </div>
  <div className="font-bold text-xl flex items-center mb-3">JOB CARD</div>
</div>
        

        {/* Customer Details */}
        {/* // Replace the grid section with this new layout */}

{/* Customer Details */}
<div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-300">
  {/* Column 1 */}
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold flex justify-center items-center">Name</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.customerName}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Mobile</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.customerMobile}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Order ID</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.orderId || 'N/A'}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Reg No</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.regNumber}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Battery Features</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.batteryFeature || 'N/A'}</div>
    </div>

    
    
    
    
    
  </div>

  {/* Column 2 */}
  <div className="space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Brand</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.carBrand}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Model</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.carModel}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Fuel Type</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.carYearFuel}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Fuel Status</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.fuelStatus}</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-gray-100 p-2 rounded font-semibold text-center">Speedometer</div>
      <div className="p-2 border border-gray-200 rounded">{mergedData.speedometerRd}</div>
    </div>

  </div>
</div>
        {/* Inventory Section */}
        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            INVENTORY LIST
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {mergedData.inventory?.split('\n' || []).filter(item => item.trim()).reduce((columns, item, index) => {
              const columnIndex = index % 3;
              if (!columns[columnIndex]) columns[columnIndex] = [];
              columns[columnIndex].push({ text: item, number: index + 1 });
              return columns;
            }, []).map((column, colIndex) => (
              <div key={colIndex} className="space-y-2">
                {column.map((item) => (
                  <div key={item.number} className="flex items-start gap-2">
                    <span className="font-medium w-6 text-right">{item.number}.</span>
                    <span className="flex-1">{item.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Documents and Checklist */}
          {/* <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="border rounded-lg p-4">
              <div className="font-bold mb-2 text-center bg-gray-100 p-2 rounded">Car Documents</div>
              <div className="space-y-2">
                {mergedData.carDocumentDetails?.split('\n'|| [])
                  .filter(doc => doc.trim())
                  .map((doc, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span>{doc}</span>
                    </div>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="font-bold mb-2 text-center bg-gray-100 p-2 rounded">Other Check List</div>
              <div className="space-y-2">
                {mergedData.otherCheckList?.split('\n' || [])
                  .filter(item => item.trim())
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span>{item}</span>
                    </div>
                ))}
              </div>
            </div>
          </div> */}
        </div>

        {/* Work Summary */}
        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            WORK SUMMARY
          </div>
          
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <div className="grid grid-cols-4 gap-4 bg-gray-100 p-3 font-semibold">
              <div className="text-center">Type</div>
              <div className="text-center">Name</div>
              <div className="text-center">Work to be done</div>
              <div className="text-center">Total (₹)</div>
            </div>
            
            {mergedData.workSummary.map((work, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-3 border-t border-gray-200">
                <div className="text-center">{work.type}</div>
                <div className="text-center">{work.name}</div>
                <div className="text-center">{work.workdone}</div>
                <div className="text-right">{work.total}</div>
              </div>
            ))}
            
            <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 font-bold border-t border-gray-200">
              <div className="col-span-3 text-right">Grand Total:</div>
              <div className="text-right">₹ {mergedData.invoiceSummary.totalPayable}</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            Declaration
          </div>
            <div className='flex justify-center px-4 '>{mergedData.additionalWork}</div>
        </div>

        {/* Workshop Details */}
        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            WORKSHOP DETAILS
          </div>
          
          <div className="grid grid-cols-3 gap-8">
            <div className="flex flex-col items-center space-y-2 p-4">
              <img src={garageIcon} alt="Workshop" className="h-12 w-12 object-contain" />
              <div className="font-semibold text-gray-600">WORKSHOP</div>
              <div>{mergedData.workshop}</div>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 border-x border-gray-200">
              <img src={timeTableIcon} alt="Time" className="h-12 w-12 object-contain" />
              <div className="font-semibold text-gray-600">DATE & TIME</div>
              <div>{mergedData.arrival_time}</div>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4">
              <img src={qaIcon} alt="QA" className="h-12 w-12 object-contain" />
              <div className="font-semibold text-gray-600">QA BY</div>
              <div>ONLYBIGCARS ENGINEER</div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-300">
          <div className="bg-red-600 text-white py-3 px-4 rounded-lg mb-4 text-center font-semibold">
            Declaration
          </div>
            <div className='flex justify-left px-4'>I authorize to execute the jobs described herein using the necessary material cost. I understand that the vehicle is stored,
            repaired and tested at my own risk.</div>
        </div>

        {/* Terms & Conditions */}
        <div className="p-4">
          <div className="font-bold mb-4 text-center bg-gray-100 p-2 rounded">Terms & Conditions</div>
          <div className="space-y-2 text-sm leading-relaxed">
            {[
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
              "15. Final Inspection - Customers are advised to inspect their vehicle thoroughly at the time of delivery. Post-delivery claims will not be entertained. By availing of OnlyBigCars services, the customer agrees to these terms and conditions."
            ].map((term, index) => (
              <p key={index} className="px-4 text-gray-700">
                {term}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default JobCard;
