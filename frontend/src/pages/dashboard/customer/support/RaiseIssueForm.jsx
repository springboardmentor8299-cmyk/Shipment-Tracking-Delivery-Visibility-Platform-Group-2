import { useState } from "react";
import { raiseIssue } from "../../../../services/supportService";

function RaiseIssueForm() {
  const [form, setForm] = useState({
    trackingId: "",
    issueType: "",
    subject: "",
    description: "",
    attachment: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const request = {
        trackingId: form.trackingId,
        issueType: form.issueType,
        subject: form.subject,
        description: form.description,
      };

      await raiseIssue(request, form.attachment);

      alert("Issue Submitted Successfully");

      setForm({
        trackingId: "",
        issueType: "",
        subject: "",
        description: "",
        attachment: null,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to submit issue.");
    }
  };
  return (
    <form className="support-form" onSubmit={handleSubmit}>
      <h2>Raise Issue</h2>

      <input
        name="trackingId"
        value={form.trackingId}
        onChange={handleChange}
        placeholder="Tracking ID"
      />

      <select name="issueType" value={form.issueType} onChange={handleChange}>
        <option value="">Select Issue</option>
        <option value="DAMAGE">Damage</option>
        <option value="DELAY">Delay</option>
        <option value="LOST">Lost</option>
        <option value="WRONG_DELIVERY">Wrong Delivery</option>
        <option value="OTHER">Other</option>
      </select>

      <input
        name="subject"
        value={form.subject}
        onChange={handleChange}
        placeholder="Subject"
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Describe your issue..."
      />

      <input type="file" name="attachment" onChange={handleChange} />

      <button type="submit">Submit Issue</button>
    </form>
  );
}

export default RaiseIssueForm;
