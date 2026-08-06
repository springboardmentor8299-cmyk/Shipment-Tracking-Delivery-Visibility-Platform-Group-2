import AnalyticsSection from "../../components/AnalyticsSection";
import DeliveryPerformanceReport from "../../components/DeliveryPerformanceReport";
import "../../styles/AnalyticsSection.css";

function Analytics() {
  return (
    <div>
      <h1>Analytics</h1>
      <p>Review shipment performance trends and status breakdowns.</p>
      <AnalyticsSection />
      <DeliveryPerformanceReport />
    </div>
  );
}

export default Analytics;
