import React, { useState } from "react";
import { X, Camera, Upload, Check, Image as ImageIcon } from "lucide-react";

export function PhotoUploadModal({ isOpen, onClose, onUpload, shipmentTrackingNumber }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [preview, setPreview] = useState(null);

  const samplePhotos = [
    { label: "Doorstep Package", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop" },
    { label: "Handover Receipt", url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&auto=format&fit=crop" },
    { label: "Warehouse Cargo Bay", url: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop" }
  ];

  const handleSelectPreset = (url) => {
    setPhotoUrl(url);
    setPreview(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!photoUrl) {
      alert("Please upload a photo or select a delivery proof preset.");
      return;
    }
    onUpload(photoUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Delivery Proof Photo</h3>
              <p className="text-xs text-slate-500 font-medium">Shipment #{shipmentTrackingNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">Upload Photo File</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-xl p-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-2">Or Select Quick Demo Photo</label>
          <div className="grid grid-cols-3 gap-2">
            {samplePhotos.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectPreset(item.url)}
                className={`cursor-pointer rounded-xl border-2 overflow-hidden p-1 transition-all ${
                  photoUrl === item.url ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <img src={item.url} alt={item.label} className="w-full h-16 object-cover rounded-lg mb-1" />
                <p className="text-[10px] font-semibold text-center text-slate-700 truncate">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {preview && (
          <div className="mb-4 p-2 border border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-[11px] font-bold text-slate-500 mb-1">Photo Preview:</p>
            <img src={preview} alt="Delivery proof preview" className="w-full h-40 object-cover rounded-xl shadow-inner" />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
          >
            <Check className="w-4 h-4" />
            Attach Photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoUploadModal;
