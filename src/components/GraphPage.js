import React, { useState, useEffect, useContext, useRef } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/layout';
import DateRangeSelector from '../components/daterangeselector';
import { Alert } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const GraphPage = () => {
  const { token } = useContext(AuthContext);
  const dateRangeSelectorRef = useRef();
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [groupBy, setGroupBy] = useState('day'); // 'day', 'week', 'month'
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [secondChartData, setSecondChartData] = useState(null);
  const [secondChartIsLoading, setSecondChartIsLoading] = useState(false);
  const [secondChartError, setSecondChartError] = useState(null);
  const [secondChartType, setSecondChartType] = useState('type'); // Changed default to 'type'
  const [selectedMetric, setSelectedMetric] = useState('gmv'); // Add this new state
  const [sourceChartData, setSourceChartData] = useState(null);
  const [sourceChartIsLoading, setSourceChartIsLoading] = useState(false);
  const [sourceChartError, setSourceChartError] = useState(null);
  const [selectedSourceMetric, setSelectedSourceMetric] = useState('gmv');
  const [cceChartData, setCceChartData] = useState(null);
  const [cceChartIsLoading, setCceChartIsLoading] = useState(false);
  const [cceChartError, setCceChartError] = useState(null);
  const [selectedCceMetric, setSelectedCceMetric] = useState('gmv');

  const [cityChartData, setCityChartData] = useState(null);
  const [cityChartIsLoading, setCityChartIsLoading] = useState(false);
  const [cityChartError, setCityChartError] = useState(null);
  const [selectedCityMetric, setSelectedCityMetric] = useState('gmv');
  const [statusChartData, setStatusChartData] = useState(null);
  const [statusChartIsLoading, setStatusChartIsLoading] = useState(false);
  const [statusChartError, setStatusChartError] = useState(null);
  const [dateField, setDateField] = useState('created_at'); // Add this state


  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange({
      startDate: range.startDate,
      endDate: range.endDate
    });
  };

  // Add a new useEffect hook to fetch lead status data
  useEffect(() => {
    const fetchStatusChartData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      setStatusChartIsLoading(true);
      setStatusChartError(null);

      try {
        const response = await axios.post(
          'https://admin.onlybigcars.com/api/analytics/lead-status-graph/',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            dateField: dateField,
            excludeTestLeads: true 
          },
          { headers: { 'Authorization': `Token ${token}` } }
        );

        setStatusChartData(response.data);
      } catch (error) {
        console.error('Error fetching lead status data:', error);
        setStatusChartError('Failed to fetch lead status data. Please try again.');
      } finally {
        setStatusChartIsLoading(false);
      }
    };

    fetchStatusChartData();
  }, [dateRange.startDate, dateRange.endDate, token, dateField]);

  // Fetch the graph data based on date range
  useEffect(() => {
    const fetchGraphData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      setIsLoading(true);
      setError(null);
      const filterJobCardOnly = true;
      try {
        const response = await axios.post(
          'https://admin.onlybigcars.com/api/analytics/graph/',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            groupBy: groupBy,
            filterJobCardOnly: filterJobCardOnly,
            dateField: dateField, 
            excludeTestLeads: true 
          },
          { headers: { 'Authorization': `Token ${token}` } }
        );

        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        setError('Failed to fetch graph data. Please try again.');
        setAlertMessage('Error fetching graph data: ' + (error.response?.data?.message || error.message));
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, [dateRange.startDate, dateRange.endDate, groupBy, token]);

  // Fetch initial graph data
  useEffect(() => {
    const fetchInitialGraphData = async () => {
      try {
              setIsLoading(true);
      
              // First make a request to get the earliest_lead_date
              const response = await axios.post(
                'https://admin.onlybigcars.com/api/analytics/graph/',
                {
                  // Use a minimal date range initially - the API will return earliest_lead_date
                  startDate: new Date().toISOString().split('T')[0], // today
                  endDate: new Date().toISOString().split('T')[0],   // today
                  groupBy: groupBy,
                  filterJobCardOnly: true,
                  dateField: dateField,
                  excludeTestLeads: true
                },
                { headers: { 'Authorization': `Token ${token}` } }
              );
      
              // Get today's date
              const today = new Date().toISOString().split('T')[0];
              
              // Use earliest_lead_date from response if available, otherwise use 30 days ago as fallback
              const earliestDate = response.data.earliest_lead_date || 
                                  new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
              
              const fullRangeDateRange = {
                startDate: earliestDate,
                endDate: today
              };
      
              // Set the date range to show all historical data
              setDateRange(fullRangeDateRange);
              
              // Update the date range selector reference with the full range
              if (dateRangeSelectorRef.current) {
                dateRangeSelectorRef.current.setDates(fullRangeDateRange.startDate, fullRangeDateRange.endDate);
              }
      
              // Now fetch the data with the full date range
              const fullDataResponse = await axios.post(
                'https://admin.onlybigcars.com/api/analytics/graph/',
                {
                  startDate: fullRangeDateRange.startDate,
                  endDate: fullRangeDateRange.endDate,
                  groupBy: groupBy,
                  filterJobCardOnly: true,
                  dateField: dateField,
                  excludeTestLeads: true
                },
                { headers: { 'Authorization': `Token ${token}` } }
              );
      
              setChartData(fullDataResponse.data);
      
            } catch (error) {
              console.error('Error fetching initial graph data:', error);
              setError('Failed to fetch graph data');
            } finally {
              setIsLoading(false);
            }
          };
      
          fetchInitialGraphData();
        }, [token, dateField]);
      
  // Fetch second chart data
  useEffect(() => {
    const fetchSecondChartData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;
      // const filterJobCardOnly = selectedMetric === 'cars';
      const filterJobCardOnly =  true;
      setSecondChartIsLoading(true);
      setSecondChartError(null);

      try {
        const response = await axios.post(
          'https://admin.onlybigcars.com/api/analytics/workshop-status-graph/',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            groupBy: secondChartType,
            filterJobCardOnly: filterJobCardOnly,
            dateField: dateField,
            excludeTestLeads: true 
          },
          { headers: { 'Authorization': `Token ${token}` } }
        );

        setSecondChartData(response.data);
        console.log('Second Chart Data:', response.data); // Debugging log  
      } catch (error) {
        console.error('Error fetching workshop/type data:', error);
        setSecondChartError('Failed to fetch data. Please try again.');
      } finally {
        setSecondChartIsLoading(false);
      }
    };

    fetchSecondChartData();
  }, [dateRange.startDate, dateRange.endDate, secondChartType, token, selectedMetric, dateField]); // Added selectedMetric dependency

  // Fetch source chart data
  useEffect(() => {
    const fetchSourceChartData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      setSourceChartIsLoading(true);
      setSourceChartError(null);

      try {
        const filterJobCardOnly = selectedSourceMetric === 'cars';

        const response = await axios.post(
          'https://admin.onlybigcars.com/api/analytics/source-graph/',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            metric: selectedSourceMetric,
            filterJobCardOnly: filterJobCardOnly,
            dateField: dateField,
            excludeTestLeads: true 
          },
          { headers: { 'Authorization': `Token ${token}` } }
        );

        setSourceChartData(response.data);
      } catch (error) {
        console.error('Error fetching source data:', error);
        setSourceChartError('Failed to fetch source data. Please try again.');
      } finally {
        setSourceChartIsLoading(false);
      }
    };

    fetchSourceChartData();
  }, [dateRange.startDate, dateRange.endDate, selectedSourceMetric, token, dateField]);

  useEffect(() => {
    const fetchCceChartData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      setCceChartIsLoading(true);
      setCceChartError(null);

      try {
        // Add filterJobCardOnly parameter when appropriate
      const filterJobCardOnly = selectedCceMetric === 'cars';

        const response = await axios.post(
          'https://admin.onlybigcars.com/api/analytics/cce-graph/',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            metric: selectedCceMetric,
            filterJobCardOnly: filterJobCardOnly,
            dateField: dateField,
            excludeTestLeads: true 
          },
          { headers: { 'Authorization': `Token ${token}` } }
        );

        setCceChartData(response.data);
      } catch (error) {
        console.error('Error fetching CCE data:', error);
        setCceChartError('Failed to fetch CCE data. Please try again.');
      } finally {
        setCceChartIsLoading(false);
      }
    };

    fetchCceChartData();
  }, [dateRange.startDate, dateRange.endDate, selectedCceMetric, token, dateField]);

  // Fetch city chart data
  useEffect(() => {
    const fetchCityChartData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      setCityChartIsLoading(true);
      setCityChartError(null);

      try {
        // Add filterJobCardOnly parameter when appropriate
        const filterJobCardOnly = selectedCityMetric === 'cars';

        const response = await axios.post(
          'https://admin.onlybigcars.com/api/analytics/city-graph/',
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            metric: selectedCityMetric,
            filterJobCardOnly: filterJobCardOnly,
            dateField: dateField, 
            excludeTestLeads: true 
          },
          { headers: { 'Authorization': `Token ${token}` } }
        );

        setCityChartData(response.data);
      } catch (error) {
        console.error('Error fetching city data:', error);
        setCityChartError('Failed to fetch city data. Please try again.');
      } finally {
        setCityChartIsLoading(false);
      }
    };

    fetchCityChartData();
  }, [dateRange.startDate, dateRange.endDate, selectedCityMetric, token ,dateField]);

  // Prepare chart options and datasets
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels && data.datasets) {
              const { labels: { pointStyle } } = chart.legend.options;
              // Calculate total for each dataset (sum across all labels)
              const datasetTotals = data.datasets.map(ds =>
                ds.data.reduce((sum, val) => sum + (val || 0), 0)
              );
              // One legend item per dataset, showing only total (no percentage)
              return data.datasets.map((ds, dsIdx) => {
                const value = datasetTotals[dsIdx];
                let text = `${ds.label}: `;
                if (
                  ds.label.toLowerCase().includes('gmv') ||
                  ds.label.toLowerCase().includes('ats') ||
                  ds.label.toLowerCase().includes('commission') ||
                  ds.label.toLowerCase().includes('payment') ||
                  ds.label.toLowerCase().includes('workshop')
                ) {
                  text += `₹${value.toLocaleString('en-IN')}`;
                } else {
                  text += `${value}`;
                }
                return {
                  text,
                  fillStyle: ds.backgroundColor instanceof Array ? ds.backgroundColor[0] : ds.backgroundColor,
                  strokeStyle: ds.borderColor instanceof Array ? ds.borderColor[0] : ds.borderColor,
                  lineWidth: ds.borderWidth || 1,
                  pointStyle: pointStyle,
                  hidden: ds.hidden,
                  datasetIndex: dsIdx,
                  index: 0,
                };
              });
            }
            return [];
          }
        },
        onClick: (/* e is unused */ _, legendItem, legend) => {
          if (chartType === 'bar') {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
  
            // If we're clicking the already selected dataset, show all datasets
            if (selectedDataset === index) {
              setSelectedDataset(null);
              ci.data.datasets.forEach((__, i) => {
                ci.setDatasetVisibility(i, true);
              });
            } else {
              // Otherwise, hide all datasets except the clicked one
              setSelectedDataset(index);
              ci.data.datasets.forEach((__, i) => {
                ci.setDatasetVisibility(i, i === index);
              });
            }
            ci.update();
          } else {
            // Default behavior for line chart
            const ci = legend.chart;
            const index = legendItem.datasetIndex;
            const meta = ci.getDatasetMeta(index);
            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
            ci.update();
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              if (
                label.toLowerCase().includes('gmv') ||
                label.toLowerCase().includes('ats') ||
                label.toLowerCase().includes('commission') ||
                label.toLowerCase().includes('payment') ||
                label.toLowerCase().includes('workshop')
              ) {
                label += '₹' + context.parsed.y.toLocaleString('en-IN');
              } else {
                label += context.parsed.y;
              }
              // Percentage removed from tooltip
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '₹ Value'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Number of Cars'
        }
      },
    },
  };

  // Reset selected dataset when changing chart type
  useEffect(() => {
    setSelectedDataset(null);
  }, [chartType]);

  // Render loading or chart based on state
  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-96 text-red-500">
          {error}
        </div>
      );
    }

    if (!chartData || !chartData.labels || !chartData.datasets) {
      return (
        <div className="flex justify-center items-center h-96 text-gray-500">
          Select a date range to view analytics
        </div>
      );
    }

    const data = {
      labels: chartData.labels,
      datasets: [
        {
          label: 'GMV',
          data: chartData.datasets.gmv,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'ATS',
          data: chartData.datasets.ats,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Number of Cars',
          data: chartData.datasets.cars,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          yAxisID: 'y1',
        },
        {
          label: 'Commission Due',
          data: chartData.datasets.commissionDue,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Commission Received',
          data: chartData.datasets.commissionReceived,
          borderColor: 'rgb(50, 205, 50)',
          backgroundColor: 'rgba(50, 205, 50, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Own Workshops Commission',
          data: chartData.datasets.ownWorkshopCommission,
          borderColor: 'rgb(138, 43, 226)', // Purple color
          backgroundColor: 'rgba(138, 43, 226, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Payment Received',
          data: chartData.datasets.paymentReceived,
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          yAxisID: 'y',
        }
      ],
    };

    // Apply initial visibility based on selected dataset (for histogram only)
    if (chartType === 'bar' && selectedDataset !== null) {
      data.datasets.forEach((dataset, index) => {
        dataset.hidden = index !== selectedDataset;
      });
    }

    return (
      <div className="h-96">
        {chartType === 'line' ? (
          <Line options={chartOptions} data={data} />
        ) : (
          <Bar options={chartOptions} data={data} />
        )}
      </div>
    );
  };

  // Render second chart
  const renderSecondChart = () => {
    if (!secondChartData || !secondChartData.labels) {
      return (
        <div className="flex justify-center items-center h-96 text-gray-500">
          Select a date range to view analytics
        </div>
      );
    }

    if (secondChartType === 'type') {
      // Add console log to debug the data structure
      console.log('Chart Data for Type:', secondChartData);
      console.log('Selected Metric:', selectedMetric);

      // Check if datasets and required properties exist
      if (!secondChartData.datasets ||
        !secondChartData.datasets.luxury ||
        !secondChartData.datasets.normal ||
        !secondChartData.datasets.luxury[selectedMetric] ||
        !secondChartData.datasets.normal[selectedMetric]) {
        console.error('Missing required data for type chart');
        return (
          <div className="flex justify-center items-center h-96 text-gray-500">
            Incomplete data for Lead Type chart
          </div>
        );
      }

      const data = {
        labels: secondChartData.labels,
        datasets: [
          {
            label: 'Luxury',
            data: secondChartData.datasets.luxury[selectedMetric],
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            yAxisID: selectedMetric === 'cars' ? 'y1' : 'y',
          },
          {
            label: 'Normal',
            data: secondChartData.datasets.normal[selectedMetric],
            backgroundColor: 'rgba(53, 162, 235, 0.7)',
            yAxisID: selectedMetric === 'cars' ? 'y1' : 'y',
          }
        ],
      };

      // Determine y-axis title based on selected metric
      const yAxisTitle = selectedMetric === 'cars'
        ? 'Number of Cars'
        : '₹ Value';

      const options = {
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          title: {
            display: true,
            text: `${getMetricDisplayName(selectedMetric)} by Lead Type (Luxury vs Normal)`,
            font: { size: 16 }
          }
        },
        scales: {
          ...chartOptions.scales,
          y: {
            ...chartOptions.scales.y,
            title: {
              display: true,
              text: yAxisTitle
            }
          },
          // Make sure we have a y1 axis for cars if needed
          y1: selectedMetric === 'cars' ? {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Number of Cars'
            },
            grid: {
              drawOnChartArea: false
            }
          } : undefined
        }
      };

      return (
        <div className="h-96">
          <Bar options={options} data={data} />
        </div>
      );
    } else {
      // Existing logic for workshop/status chart
      if (secondChartIsLoading) {
        return (
          <div className="flex justify-center items-center h-96">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      }

      if (secondChartError) {
        return (
          <div className="flex justify-center items-center h-96 text-red-500">
            {secondChartError}
          </div>
        );
      }

      if (!secondChartData || !secondChartData.labels || !secondChartData.datasets) {
        return (
          <div className="flex justify-center items-center h-96 text-gray-500">
            Select a date range to view analytics
          </div>
        );
      }

      // Workshop or Status chart
      const data = {
        labels: secondChartData.labels,
        datasets: [
          {
            label: 'GMV',
            data: secondChartData.datasets.gmv,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            yAxisID: 'y',
          },
          {
            label: 'ATS',
            data: secondChartData.datasets.ats,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            yAxisID: 'y',
          },
          {
            label: 'Number of Cars',
            data: secondChartData.datasets.cars,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            yAxisID: 'y1',
          },
          {
            label: 'Commission Due',
            data: secondChartData.datasets.commissionDue,
            backgroundColor: 'rgba(255, 159, 64, 0.5)',
            yAxisID: 'y',
          },
          {
            label: 'Commission Received',
            data: secondChartData.datasets.commissionReceived,
            backgroundColor: 'rgba(50, 205, 50, 0.5)',
            yAxisID: 'y',
          },
          {
            label: 'Own Workshops Commission',
            data: secondChartData.datasets.ownWorkshopCommission,
            backgroundColor: 'rgba(138, 43, 226, 0.5)',
            yAxisID: 'y',
          },
          {
            label: 'Payment Received',
            data: secondChartData.datasets.paymentReceived,
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            yAxisID: 'y',
          }
        ],
      };

      // Horizontal bar chart for better readability with multiple categories
      const options = {
        ...chartOptions,
        indexAxis: 'x', // Use horizontal bar if many categories
        plugins: {
          ...chartOptions.plugins,
          title: {
            display: true,
            text: `Data by ${secondChartType === 'workshop' ? 'Workshop' : 'Type'}`,
            font: {
              size: 16
            }
          }
        }
      };

      return (
        <div className="h-96 overflow-y-auto">
          <Bar options={options} data={data} />
        </div>
      );
    }
  };

  // Render source chart
  const renderSourceChart = () => {
    if (sourceChartIsLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (sourceChartError) {
      return (
        <div className="flex justify-center items-center h-96 text-red-500">
          {sourceChartError}
        </div>
      );
    }

    if (!sourceChartData || !sourceChartData.labels || !sourceChartData.values) {
      return (
        <div className="flex justify-center items-center h-96 text-gray-500">
          Select a date range and metric to view source distribution
        </div>
      );
    }

    const data = {
      labels: sourceChartData.labels,
      datasets: [
        {
          data: sourceChartData.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(40, 159, 194, 0.7)',
            'rgba(205, 109, 114, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const { labels: { pointStyle } } = chart.legend.options;
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  let text = `${label}: `;

                  if (selectedSourceMetric === 'cars' || selectedSourceMetric === 'total_leads') {
                    text += `${value} (${percentage}%)`;
                  } else {
                    text += `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                  }

                  return {
                    text: text,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    pointStyle: pointStyle,
                    hidden: !chart.getDataVisibility(i),
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        title: {
          display: true,
          text: `${getMetricDisplayName(selectedSourceMetric)} by Source`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

              if (selectedSourceMetric === 'cars' || selectedSourceMetric === 'total_leads') {
                return `${label}: ${value} (${percentage}%)`;
              } else {
                return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
              }
            }
          }
        }
      },
    };

    return (
      <div className="h-96">
        <Pie options={options} data={data} />
      </div>
    );
  };

  const renderCceChart = () => {
    if (cceChartIsLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (cceChartError) {
      return (
        <div className="flex justify-center items-center h-96 text-red-500">
          {cceChartError}
        </div>
      );
    }

    if (!cceChartData || !cceChartData.labels || !cceChartData.values) {
      return (
        <div className="flex justify-center items-center h-96 text-gray-500">
          Select a date range and metric to view CCE distribution
        </div>
      );
    }

    const data = {
      labels: cceChartData.labels,
      datasets: [
        {
          data: cceChartData.values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(40, 159, 194, 0.7)',
            'rgba(205, 109, 114, 0.7)',
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const { labels: { pointStyle } } = chart.legend.options;
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);

                return data.labels.map((label, i) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = data.datasets[0].data[i];
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  let text = `${label}: `;

                  if (selectedCceMetric === 'cars') {
                    text += `${value} (${percentage}%)`;
                  } else {
                    text += `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                  }

                  return {
                    text: text,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    pointStyle: pointStyle,
                    hidden: !chart.getDataVisibility(i),
                    index: i
                  };
                });
              }
              return [];
            }
          }
        },
        title: {
          display: true,
          text: `${getMetricDisplayName(selectedCceMetric)} by CCE`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;

              if (selectedCceMetric === 'cars') {
                return `${label}: ${value} (${percentage}%)`;
              } else {
                return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
              }
            }
          }
        }
      },
    };

    return (
      <div className="h-96">
        <Pie options={options} data={data} />
      </div>
    );
  };

  // Render city chart
  const renderCityChart = () => {
    if (cityChartIsLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (cityChartError) {
      return (
        <div className="flex justify-center items-center h-96 text-red-500">
          {cityChartError}
        </div>
      );
    }

    if (!cityChartData || !cityChartData.labels || !cityChartData.values) {
      return (
        <div className="flex justify-center items-center h-96 text-gray-500">
          Select a date range and metric to view city distribution
        </div>
      );
    }

    const data = {
      labels: cityChartData.labels,
      datasets: [
        {
          label: getMetricDisplayName(selectedCityMetric),
          data: cityChartData.values,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y', // Horizontal bar chart for better readability
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `${getMetricDisplayName(selectedCityMetric)} by City`,
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.dataset.label || '';
              const value = context.raw;

              if (selectedCityMetric === 'cars') {
                return `${label}: ${value}`;
              } else {
                return `${label}: ₹${value.toLocaleString('en-IN')}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: selectedCityMetric === 'cars' ? 'Number of Leads' : '₹ Value'
          }
        }
      }
    };

    return (
      <div className="h-96">
        <Bar options={options} data={data} />
      </div>
    );
  };

  // Helper function to get display name for metrics
  const getMetricDisplayName = (metric) => {
    const displayNames = {
      gmv: 'GMV',
      ats: 'ATS',
      cars: 'Number of Cars (Job Card Filtered)', // Clarify filtering
      total_leads: 'Total Leads', // Add display name for the new metric
      commissionDue: 'Commission Due',
      commissionReceived: 'Commission Received',
      paymentReceived: 'Payment Received',
      ownWorkshopCommission: 'Own Workshops Commission'
    };
    return displayNames[metric] || metric;
  };

  // Add this new render function for the doughnut chart
  const renderStatusChart = () => {
    if (statusChartIsLoading) {
      return (
        <div className="flex justify-center items-center h-96">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (statusChartError) {
      return (
        <div className="flex justify-center items-center h-96 text-red-500">
          {statusChartError}
        </div>
      );
    }

    // Check if data exists and has labels/values
    if (!statusChartData || !statusChartData.labels || !statusChartData.values || statusChartData.labels.length === 0) {
      return (
        <div className="flex justify-center items-center h-96 text-gray-500">
          Select a date range to view lead status distribution
        </div>
      );
    }

    // Original data from the API
    const originalLabels = statusChartData.labels;
    const originalValues = statusChartData.values;
    const originalTotal = originalValues.reduce((a, b) => a + b, 0);

    // Statuses to aggregate visually and group in legend
    const statusesToAggregate = ['Job Card', 'Payment Due', 'Commision Due', 'Completed'];
    const convertedColor = 'rgba(50, 205, 50, 0.8)'; // Green for converted segment/items

    // --- Data for Chart Visualisation (Aggregated) ---
    let aggregatedConvertedValue = 0;
    const chartLabels = [];
    const chartValues = [];
    const chartBackgroundColors = [];
    const otherColors = [ // Colors for non-aggregated segments
      'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(40, 159, 194, 0.7)',
      'rgba(205, 109, 114, 0.7)',
    ];
    let otherColorIndex = 0;
    const labelToColorMap = {}; // To store colors for non-aggregated items

    originalLabels.forEach((label, index) => {
      const value = originalValues[index];
      if (statusesToAggregate.includes(label)) {
        aggregatedConvertedValue += value;
      } else if (label !== 'Converted' && value > 0) { // Exclude original 'Converted' and zero values
        chartLabels.push(label);
        chartValues.push(value);
        const color = otherColors[otherColorIndex % otherColors.length];
        chartBackgroundColors.push(color);
        labelToColorMap[label] = color; // Store color for legend
        otherColorIndex++;
      }
    });

    // Add the aggregated 'Converted' segment for the chart visual
    if (aggregatedConvertedValue > 0) {
      chartLabels.unshift('Converted'); // Add to beginning
      chartValues.unshift(aggregatedConvertedValue);
      chartBackgroundColors.unshift(convertedColor);
    }

    // Data object for the Doughnut chart visual
    const chartDisplayData = {
      labels: chartLabels,
      datasets: [ { data: chartValues, backgroundColor: chartBackgroundColors, borderWidth: 1 } ],
    };

    // --- Options including Custom Legend Generation ---
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 20, // Adjust box width if needed
            padding: 15, // Add padding between items
            generateLabels: function (chart) {
              const { labels: { pointStyle } } = chart.legend.options;
              const legendItems = [];
              let aggregatedValueForLegend = 0;
              const subItemsData = [];

              // First pass: Collect data for legend items
              originalLabels.forEach((label, i) => {
                const value = originalValues[i];
                if (value <= 0) return; // Skip zero-value items

                const percentage = originalTotal > 0 ? ((value / originalTotal) * 100).toFixed(1) : 0;

                if (statusesToAggregate.includes(label)) {
                  aggregatedValueForLegend += value;
                  subItemsData.push({ label, value, percentage });
                } else if (label !== 'Converted') { // Handle non-aggregated items
                  legendItems.push({
                    text: `${label}: ${value} (${percentage}%)`,
                    fillStyle: labelToColorMap[label] || otherColors[i % otherColors.length], // Use mapped color
                    strokeStyle: 'rgba(0,0,0,0.1)',
                    lineWidth: 1,
                    pointStyle: pointStyle,
                    hidden: false,
                    index: i // Keep original index if needed, though less relevant now
                  });
                }
              });

              // Create the main 'Converted' legend item if applicable
              if (aggregatedValueForLegend > 0) {
                const aggregatedPercentage = originalTotal > 0 ? ((aggregatedValueForLegend / originalTotal) * 100).toFixed(1) : 0;
                const convertedMainItem = {
                  text: `Converted: ${aggregatedValueForLegend} (${aggregatedPercentage}%)`,
                  fillStyle: convertedColor, // Only this gets the main color swatch
                  strokeStyle: 'rgba(0,0,0,0.1)',
                  lineWidth: 1,
                  pointStyle: pointStyle,
                  hidden: false,
                  index: -1 // Special index for the group header
                };

                // Create sub-items for the 'Converted' group
                const convertedSubItems = subItemsData.map((item, subIndex) => ({
                  text: `  - ${item.label}: ${item.value} (${item.percentage}%)`, // Indented text
                  fillStyle: 'transparent', // No color swatch for sub-items
                  strokeStyle: 'transparent',
                  lineWidth: 0,
                  pointStyle: 'line', // Use a dash or line for sub-items
                  hidden: false,
                  index: -2 - subIndex // Special negative index for sub-items
                }));

                // Add the main 'Converted' item first, then its sub-items
                legendItems.unshift(...convertedSubItems); // Add sub-items
                legendItems.unshift(convertedMainItem); // Add main item at the very beginning
              }

              return legendItems;
            }
          },
        },
        title: {
          display: true,
          text: 'Leads by Status',
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            // Tooltip still reflects the VISUAL segments (aggregated data)
            label: function (context) {
              const visualLabel = context.label || '';
              const visualValue = context.raw;
              const visualTotal = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = visualTotal > 0 ? ((visualValue / visualTotal) * 100).toFixed(1) : 0;
              return `${visualLabel}: ${visualValue} (${percentage}%)`;
            }
          }
        }
      },
      // Disable default legend click behavior as it won't map correctly
      onClick: null,
    };

    return (
      <div className="h-96">
        <Doughnut options={options} data={chartDisplayData} />
      </div>
    );
  };

  // Define the JobCardFilterNotice component once
const JobCardFilterNotice = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded-md mb-3">
      <strong>Note:</strong> Only showing leads with current or previous "Job Card" status
    </div>
  );
};

  return (
    <Layout>
      {showAlert && alertMessage && (
        <Alert
          variant="danger"
          onClose={() => setShowAlert(false)}
          dismissible
          className="edit-page-alert"
          style={{ marginTop: '0.2em' }}
        >
          <p>{alertMessage}</p>
        </Alert>
      )}

      {/* Sticky date range container */}
      <div className="sticky top-12 z-30 bg-white border-b border-gray-200 py-3 px-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-grow">
          <DateRangeSelector
    ref={dateRangeSelectorRef}
    onDateRangeChange={handleDateRangeChange}
    showDateFieldOptions={true}
    dateField={dateField}
    onDateFieldChange={setDateField}
  />
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Group By:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-gray-700">Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Histogram</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
      <h2 className="text-2xl font-semibold mb-4 text-center py-3 bg-red-50 rounded-md text-red-600">Overall Analysis</h2>
        {/* Remove the controls that are now in the sticky header */}

        <div className="bg-gray-50 p-4 rounded-lg">
          <JobCardFilterNotice isActive={selectedMetric === 'cars' && chartData?.filterApplied} />
          {renderChart()}
        </div>

        <div className="flex justify-between items-center mt-4 py-3 bg-red-50 rounded-md px-4">
  <h2 className="text-2xl font-semibold text-red-600">Workshop & Leadtype performance</h2>
  <div className="flex items-center gap-4">
    <div className="flex items-center space-x-2">
      <label className="text-gray-700">Group By:</label>
      <select
        value={secondChartType}
        onChange={(e) => setSecondChartType(e.target.value)}
        className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        <option value="type">Lead Type</option>
        <option value="workshop">Workshop</option>
      </select>
    </div>

    {secondChartType === 'type' && (
      <div className="flex items-center space-x-2">
        <label className="text-gray-700">Metric:</label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="gmv">GMV</option>
          <option value="ats">ATS</option>
          <option value="cars">Number of Cars</option>
          <option value="commissionDue">Commission Due</option>
          <option value="commissionReceived">Commission Received</option>
          <option value="paymentReceived">Payment Received</option>
          <option value="ownWorkshopCommission">Own Workshops Commission</option>
        </select>
      </div>
    )}
  </div>
</div>
        <div className="bg-gray-50 p-4 rounded-lg">
        <JobCardFilterNotice
    isActive={secondChartType === 'workshop' && selectedMetric === 'cars' && secondChartData?.filterApplied}
  />
          {renderSecondChart()}
        </div>

        <div className="flex justify-between items-center mt-4 py-3 bg-red-50 rounded-md px-4">
  <h2 className="text-2xl font-semibold text-red-600">Source wise performance</h2>
  <div className="flex items-center space-x-2">
    <label className="text-gray-700">Metric:</label>
    <select
      value={selectedSourceMetric}
      onChange={(e) => setSelectedSourceMetric(e.target.value)}
      className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
    >
      <option value="gmv">GMV</option>
      <option value="ats">ATS</option>
      <option value="cars">Number of Cars (Job Card Filtered)</option>
      <option value="total_leads">Total Leads</option>
      <option value="commissionDue">Commission Due</option>
      <option value="commissionReceived">Commission Received</option>
      <option value="paymentReceived">Payment Received</option>
    </select>
  </div>
</div>
        <div className="bg-gray-50 p-4 rounded-lg">
        <JobCardFilterNotice isActive={selectedSourceMetric === 'cars' && sourceChartData?.filterApplied} />
          {renderSourceChart()}
        </div>



<div className="flex justify-between items-center mt-4 py-3 bg-red-50 rounded-md px-4">
  <h2 className="text-2xl font-semibold text-red-600">CCE Performance</h2>
  <div className="flex items-center space-x-2">
    <label className="text-gray-700">Metric:</label>
    <select
      value={selectedCceMetric}
      onChange={(e) => setSelectedCceMetric(e.target.value)}
      className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
    >
      <option value="gmv">GMV</option>
      <option value="ats">ATS</option>
      <option value="cars">Number of Cars</option>
      <option value="commissionDue">Commission Due</option>
      <option value="commissionReceived">Commission Received</option>
      <option value="paymentReceived">Payment Received</option>
    </select>
  </div>
</div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <JobCardFilterNotice isActive={selectedCceMetric === 'cars' && cceChartData?.filterApplied} />
          {renderCceChart()}
        </div>


<div className="flex justify-between items-center mt-4 py-3 bg-red-50 rounded-md px-4">
  <h2 className="text-2xl font-semibold text-red-600">City wise performance</h2>
  <div className="flex items-center space-x-2">
    <label className="text-gray-700">Metric:</label>
    <select
      value={selectedCityMetric}
      onChange={(e) => setSelectedCityMetric(e.target.value)}
      className="p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
    >
      <option value="gmv">GMV</option>
      <option value="ats">ATS</option>
      <option value="cars">Number of Cars</option>
      <option value="commissionDue">Commission Due</option>
      <option value="commissionReceived">Commission Received</option>
      <option value="paymentReceived">Payment Received</option>
    </select>
  </div>
</div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <JobCardFilterNotice isActive={selectedCityMetric === 'cars' && cityChartData?.filterApplied} />
          {renderCityChart()}
        </div>


<div className="flex justify-between items-center mt-4 py-3 bg-red-50 rounded-md px-4">
  <h2 className="text-2xl font-semibold text-red-600">Lead's status wise performance</h2>
  {/* No controls for this section, but keeping the same layout */}
</div>
        <div className="bg-gray-50 p-4 rounded-lg">
          {renderStatusChart()}
        </div>
      </div>
    </Layout>
  );
};

export default GraphPage;