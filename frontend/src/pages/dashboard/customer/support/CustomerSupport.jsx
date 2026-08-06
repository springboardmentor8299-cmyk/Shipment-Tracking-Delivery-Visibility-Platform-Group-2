import { useState } from "react";

import ShipmentRequestForm from "./ShipmentRequestForm";
import RaiseIssueForm from "./RaiseIssueForm";
import MyRequests from "./MyRequests";

import "../../../../styles/CustomerSupport.css";

function CustomerSupport() {
  const [tab, setTab] = useState("shipment");

  return (
    <div className="support-page">
      <div className="support-header">
        <h1>Support Center</h1>

        <p>Request shipment creation or raise delivery related issues.</p>
      </div>

      <div className="support-tabs">
        <button
          className={tab === "shipment" ? "active" : ""}
          onClick={() => setTab("shipment")}
        >
          Shipment Request
        </button>

        <button
          className={tab === "issue" ? "active" : ""}
          onClick={() => setTab("issue")}
        >
          Raise Issue
        </button>

        <button
          className={tab === "requests" ? "active" : ""}
          onClick={() => setTab("requests")}
        >
          My Requests
        </button>
      </div>

      {tab === "shipment" && <ShipmentRequestForm />}

      {tab === "issue" && <RaiseIssueForm />}

      {tab === "requests" && <MyRequests />}
    </div>
  );
}

export default CustomerSupport;
