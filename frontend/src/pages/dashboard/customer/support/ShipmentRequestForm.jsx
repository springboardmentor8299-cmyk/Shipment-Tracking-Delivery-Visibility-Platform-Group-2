import { useState } from "react";

import { submitShipmentRequest } from "../../../../services/supportService";

function ShipmentRequestForm() {
  const [form, setForm] = useState({
    senderName: "",

    receiverName: "",

    pickupAddress: "",

    deliveryAddress: "",

    packageType: "",

    weight: "",

    pickupDate: "",

    instructions: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submitShipmentRequest(form);

      alert("Shipment Request Submitted Successfully.");

      setForm({
        senderName: "",

        receiverName: "",

        pickupAddress: "",

        deliveryAddress: "",

        packageType: "",

        weight: "",

        pickupDate: "",

        instructions: "",
      });
    } catch (error) {
      console.error(error);

      alert("Unable to submit request.");
    }
  };

  return (
    <form className="support-form" onSubmit={handleSubmit}>
      <h2>Raise Shipment Request</h2>

      <input
        name="senderName"
        value={form.senderName}
        onChange={handleChange}
        placeholder="Sender Name"
      />

      <input
        name="receiverName"
        placeholder="Receiver Name"
        onChange={handleChange}
      />

      <textarea
        name="pickupAddress"
        placeholder="Pickup Address"
        onChange={handleChange}
      />

      <textarea
        name="deliveryAddress"
        placeholder="Delivery Address"
        onChange={handleChange}
      />

      <select
        name="packageType"
        value={form.packageType}
        onChange={handleChange}
      >
        <option>Documents</option>

        <option>Electronics</option>

        <option>Furniture</option>

        <option>Fragile</option>

        <option>Others</option>
      </select>

      <input
        type="number"
        name="weight"
        placeholder="Weight (Kg)"
        onChange={handleChange}
      />

      <input type="date" name="pickupDate" onChange={handleChange} />

      <textarea
        name="instructions"
        placeholder="Special Instructions"
        onChange={handleChange}
      />

      <button type="submit">Submit Request</button>
    </form>
  );
}

export default ShipmentRequestForm;
