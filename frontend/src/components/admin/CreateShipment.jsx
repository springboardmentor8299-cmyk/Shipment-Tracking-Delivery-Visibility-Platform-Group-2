import { useState, useEffect } from "react";
import { createShipment, getCustomerAccounts, getLogisticsOperators } from "../../services/shipmentService";
import { Package, User, MapPin, PlusCircle, CheckCircle2, AlertCircle, Shield, Truck, Sparkles, RefreshCw } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function CreateShipment({ onCreated }) {
  const [customers, setCustomers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [formData, setFormData] = useState({
    trackingNumber: "",
    senderName: "",
    receiverName: "",
    deliveryAddress: "",
    customerId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { addNotification } = useNotifications();

  const generateTrackingId = () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `SH${randomNum}`;
  };

  const handleAutoGenerateId = () => {
    const newId = generateTrackingId();
    setFormData(prev => ({ ...prev, trackingNumber: newId }));
  };

  useEffect(() => {
    const loadAccountsAndOperators = async () => {
      try {
        const [custList, opList] = await Promise.all([
          getCustomerAccounts(),
          getLogisticsOperators()
        ]);
        setCustomers(custList);
        setOperators(opList);
        
        const autoId = generateTrackingId();
        const defaultOp = opList.length > 0 ? `${opList[0].username} (${opList[0].email})` : "Driver Sanjai";

        if (custList.length > 0) {
          setFormData(prev => ({
            ...prev,
            trackingNumber: autoId,
            senderName: prev.senderName || defaultOp,
            customerId: custList[0].id ? custList[0].id.toString() : "",
            receiverName: prev.receiverName || custList[0].username
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            trackingNumber: autoId,
            senderName: prev.senderName || defaultOp
          }));
        }
      } catch (err) {
        console.error("Failed to load customer list / operators:", err);
      }
    };
    loadAccountsAndOperators();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "customerId") {
      const selectedCust = customers.find(c => c.id.toString() === value);
      setFormData({
        ...formData,
        customerId: value,
        receiverName: selectedCust ? selectedCust.username : formData.receiverName
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError("");
    setSuccess("");
  };

  const handleOperatorSelect = (e) => {
    const val = e.target.value;
    if (val) {
      setFormData(prev => ({ ...prev, senderName: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { trackingNumber, senderName, receiverName, deliveryAddress, customerId } = formData;

    if (!trackingNumber || !senderName || !receiverName || !deliveryAddress) {
      setError("All fields are required to create a shipment.");
      return;
    }

    setLoading(true);
    try {
      const currentUser = getStoredUser();
      const selectedCustomer = customers.find(c => c.id ? c.id.toString() === customerId : false);
      const selectedOperator = operators.find(op => senderName.includes(op.email) || senderName.includes(op.username));

      await createShipment({
        trackingNumber,
        senderName,
        receiverName,
        deliveryAddress,
        status: "PENDING",
        customerId: customerId ? parseInt(customerId) : null,
        customerEmail: selectedCustomer?.email || null,
        createdByUserId: currentUser?.id || null,
        createdByEmail: currentUser?.email || null,
        assignedOperatorId: selectedOperator?.id || null,
        operatorEmail: selectedOperator?.email || null
      });

      addNotification({
        title: "New Shipment Created",
        message: `Admin created shipment #${trackingNumber} assigned to ${receiverName}.`,
        category: "SHIPMENT_REQUEST",
        trackingNumber
      });

      setSuccess("Shipment created & assigned to customer account successfully!");
      const nextId = generateTrackingId();
      setFormData({
        trackingNumber: nextId,
        senderName: operators.length > 0 ? `${operators[0].username} (${operators[0].email})` : "Driver Sanjai",
        receiverName: customers.length > 0 ? customers[0].username : "",
        deliveryAddress: "",
        customerId: customers.length > 0 ? customers[0].id.toString() : "",
      });
      onCreated?.();
    } catch (createError) {
      console.error("Create shipment error:", createError);
      setError("Unable to create shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        marginBottom: 32,
        padding: 32,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <div style={{ textAlignment: "center", textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Create New Shipment</h2>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Select a customer account & enter freight details</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18, maxWidth: 600, margin: "0 auto" }}>
        {/* Customer Account Selector */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={15} color="#2563eb" /> Assign Customer Account (Foreign Key)
          </label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              outline: "none",
              cursor: "pointer"
            }}
          >
            {customers.length > 0 ? (
              customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.username} ({c.email}) [ID: {c.id}]
                </option>
              ))
            ) : (
              <option value="">No registered customers found (Unassigned)</option>
            )}
          </select>
        </div>

        {/* Field 1: Tracking ID with Auto-generate button */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#334155", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Package size={15} color="#2563eb" /> Shipment Tracking ID
            </span>
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={13} /> Auto-Generated
            </span>
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              placeholder="Enter shipment tracking ID (e.g. SH1005)"
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1.5px solid #e2e8f0",
                background: "#ffffff",
                color: "#0f172a",
                fontSize: 14,
                fontWeight: 600,
                outline: "none"
              }}
            />
            <button
              type="button"
              onClick={handleAutoGenerateId}
              title="Generate new tracking ID"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "1.5px solid #2563eb",
                background: "#eff6ff",
                color: "#2563eb",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <RefreshCw size={14} /> Auto Generate
            </button>
          </div>
        </div>

        {/* Field 2: Driver (Logistics Operator) Name with suggestion dropdown */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
            <Truck size={15} color="#2563eb" /> Driver (Logistics Operator)
          </label>

          {/* Operator suggestion selector */}
          <select
            onChange={handleOperatorSelect}
            value={operators.some(op => `${op.username} (${op.email})` === formData.senderName || op.username === formData.senderName || op.email === formData.senderName) ? formData.senderName : ""}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid #cbd5e1",
              background: "#f8fafc",
              color: "#334155",
              fontSize: 13,
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="">-- Select from Existing Registered Logistics Operators --</option>
            {operators.map(op => (
              <option key={op.id} value={`${op.username} (${op.email})`}>
                {op.username} ({op.email}) - {op.role}
              </option>
            ))}
          </select>

          <input
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            placeholder="Or enter driver / operator name manually (e.g. Driver Sanjai)"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              outline: "none"
            }}
          />
        </div>

        {/* Field 3: Receiver Name */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
            <User size={15} color="#2563eb" /> Receiver Name (Display)
          </label>
          <input
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            placeholder="Enter receiver display name"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              outline: "none"
            }}
          />
        </div>

        {/* Field 4: Location */}
        <div style={{ display: "grid", gap: 6 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={15} color="#2563eb" /> Destination Location
          </label>
          <input
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            placeholder="Enter delivery address"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1.5px solid #e2e8f0",
              background: "#ffffff",
              color: "#0f172a",
              fontSize: 14,
              outline: "none"
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: 14,
            borderRadius: 12,
            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)",
            color: "#ffffff",
            border: "none",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)"
          }}
        >
          <PlusCircle size={18} />
          {loading ? "Creating Shipment..." : "Create Shipment"}
        </button>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626", background: "#fef2f2", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", background: "#f0fdf4", padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateShipment;
