import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AnalyticsData {
  highest_sales_volume_day: { date: string; total_volume: number };
  highest_sales_value_day: { date: string; total_value: number };
  most_sold_product: { product_id: string; total_quantity: number };
  highest_sales_staff_per_month: {
    [month: string]: { staff_id: number; total_sales: number };
  };
  highest_hour_by_avg_volume: { hour: number; average_volume: number };
}

const App: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/analytics')
      .then(response => {
        console.log('Response:', response.data);
        setAnalytics(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!analytics) return <div>No data available</div>;

  return (
    <div>
      <h1>Moniepoint Analytics</h1>
      <h2>Highest Sales Volume Day</h2>
      <p>Date: {analytics.highest_sales_volume_day.date}</p>
      <p>Total Volume: {analytics.highest_sales_volume_day.total_volume}</p>

      <h2>Highest Sales Value Day</h2>
      <p>Date: {analytics.highest_sales_value_day.date}</p>
      <p>Total Value: {analytics.highest_sales_value_day.total_value}</p>

      <h2>Most Sold Product</h2>
      <p>Product ID: {analytics.most_sold_product.product_id}</p>
      <p>Total Quantity: {analytics.most_sold_product.total_quantity}</p>

      <h2>Highest Sales Staff Per Month</h2>
      {Object.entries(analytics.highest_sales_staff_per_month).map(([month, staff]) => (
        <div key={month}>
          <p>Month: {month}</p>
          <p>Staff ID: {staff.staff_id}</p>
          <p>Total Sales: {staff.total_sales}</p>
        </div>
      ))}

      <h2>Highest Hour by Average Volume</h2>
      <p>Hour: {analytics.highest_hour_by_avg_volume.hour}</p>
      <p>Average Volume: {analytics.highest_hour_by_avg_volume.average_volume.toFixed(2)}</p>
    </div>
  );
};

export default App;