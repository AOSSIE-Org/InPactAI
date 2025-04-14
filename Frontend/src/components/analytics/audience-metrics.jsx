// src/components/analytics/Analytics.jsx
import React from "react";
import { AudienceMetrics } from "./audience-metrics"; // Correct import for named export

const Analytics = () => {
  return (
    <div>
      <h1>Analytics Page</h1>
      <AudienceMetrics />  {/* Using the AudienceMetrics component */}
    </div>
  );
};

export default Analytics;
