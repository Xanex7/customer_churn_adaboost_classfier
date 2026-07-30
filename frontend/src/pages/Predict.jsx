import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { FiCpu, FiUser, FiDownload, FiZap, FiShield, FiAlertTriangle, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const DEFAULT_FORM = {
  Age: 32,
  Gender: "Female",
  Tenure: 18,
  "Usage Frequency": 12,
  "Support Calls": 1,
  "Payment Delay": 2,
  "Subscription Type": "Standard",
  "Contract Length": "Annual",
  "Total Spend": 850,
  "Last Interaction": 4
};

export default function Predict() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const loadPreset = (preset) => {
    let data = { ...DEFAULT_FORM };
    if (preset === 'high_risk') {
      data = { Age: 45, Gender: "Male", Tenure: 3, "Usage Frequency": 2, "Support Calls": 7, "Payment Delay": 18, "Subscription Type": "Basic", "Contract Length": "Monthly", "Total Spend": 150, "Last Interaction": 22 };
    } else if (preset === 'loyal') {
      data = { Age: 29, Gender: "Female", Tenure: 36, "Usage Frequency": 28, "Support Calls": 0, "Payment Delay": 0, "Subscription Type": "Premium", "Contract Length": "Annual", "Total Spend": 2400, "Last Interaction": 1 };
    }
    setFormData(data);
    toast.success(`Loaded preset: ${preset.replace('_', ' ').toUpperCase()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData);
      setResult(response.data);
      toast.success("Telemetry evaluated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Inference server error");
    } finally {
      setLoading(false);
    }
  };

  // Step 2.1: Batch CSV Upload & Download Handler
  const handleBatchUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const batchFormData = new FormData();
    batchFormData.append('file', file);

    const toastId = toast.loading("Processing batch telemetry...");

    try {
      const response = await axios.post(`${API_URL}/predict-batch`, batchFormData, {
        responseType: 'blob', // Crucial for receiving binary file streams!
      });

      // Create a temporary link element to trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'batch_churn_predictions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Batch CSV evaluated & downloaded!", { id: toastId });
    } catch (err) {
      toast.error("Batch processing failed. Ensure backend has /predict-batch endpoint.", { id: toastId });
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setTextColor(56, 189, 248);
    doc.setFontSize(22);
    doc.text("ApexChurn AI - Executive Telemetry Audit", 14, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`Classification: ${result.prediction_label}`, 14, 42);
    doc.text(`Model Confidence Score: ${result.confidence}%`, 14, 52);
    doc.text(`Risk Assessment: ${result.insights.risk_level}`, 14, 62);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(56, 189, 248);
    doc.line(14, 70, 196, 70);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(12);
    doc.text("Recommended Action Plan:", 14, 82);
    doc.text(result.insights.recommended_action, 14, 92);
    
    doc.save(`ApexChurn_Report_${Date.now()}.pdf`);
    toast.success("PDF Audit exported!");
  };

  const isChurn = result?.prediction === 1;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <FiZap className="text-sky-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">AdaBoost Ensemble Pipeline</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            APEXCHURN <span className="text-sky-400">AI</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step 2.2: Batch CSV Upload Button */}
          <label className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 cursor-pointer transition-all flex items-center gap-1.5">
            <FiUploadCloud /> Batch CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleBatchUpload} 
              className="hidden" 
            />
          </label>

          <button onClick={() => loadPreset('high_risk')} className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all">High Risk Profile</button>
          <button onClick={() => loadPreset('loyal')} className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all">Loyal Profile</button>
          <button onClick={() => setFormData(DEFAULT_FORM)} className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Controls */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
          <h2 className="text-lg font-bold text-sky-400 flex items-center gap-2 mb-6">
            <FiUser /> Customer Telemetry Attributes
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Age</span>
                  <span className="text-sky-400 font-bold">{formData.Age} yrs</span>
                </div>
                <input type="range" min="18" max="80" value={formData.Age} onChange={e => handleChange('Age', parseInt(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">Gender</label>
                <select value={formData.Gender} onChange={e => handleChange('Gender', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-sky-500">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Tenure</span>
                  <span className="text-sky-400 font-bold">{formData.Tenure} mos</span>
                </div>
                <input type="range" min="1" max="60" value={formData.Tenure} onChange={e => handleChange('Tenure', parseInt(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">Support Calls</label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleChange('Support Calls', Math.max(0, formData['Support Calls'] - 1))} className="w-9 h-9 bg-slate-950 rounded-lg border border-slate-800 font-bold hover:bg-slate-800">-</button>
                  <span className="font-mono text-lg font-bold text-sky-400">{formData['Support Calls']}</span>
                  <button type="button" onClick={() => handleChange('Support Calls', formData['Support Calls'] + 1)} className="w-9 h-9 bg-slate-950 rounded-lg border border-slate-800 font-bold hover:bg-slate-800">+</button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400">Payment Delay</span>
                  <span className={`font-bold ${formData['Payment Delay'] > 10 ? 'text-rose-400' : 'text-sky-400'}`}>{formData['Payment Delay']} days</span>
                </div>
                <input type="range" min="0" max="30" value={formData['Payment Delay']} onChange={e => handleChange('Payment Delay', parseInt(e.target.value))} className="w-full accent-sky-400" />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">Total Spend ($)</label>
                <input type="number" value={formData['Total Spend']} onChange={e => handleChange('Total Spend', parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-sky-500" />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">Subscription Tier</label>
                <select value={formData['Subscription Type']} onChange={e => handleChange('Subscription Type', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-sky-500">
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">Contract Structure</label>
                <select value={formData['Contract Length']} onChange={e => handleChange('Contract Length', e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-sky-500">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
              <FiCpu className={loading ? "animate-spin" : ""} />
              <span>{loading ? "TRAVERSING DECISION TREES..." : "RUN INFERENCE PIPELINE"}</span>
            </button>
          </form>
        </motion.div>

        {/* Results Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`bg-slate-900/60 border rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md relative ${isChurn ? 'border-rose-500/40 shadow-rose-500/10' : 'border-emerald-500/40 shadow-emerald-500/10'}`}>
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase">Prediction Output</span>
                    <h3 className={`text-3xl font-black mt-1 flex items-center gap-2 ${isChurn ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]'}`}>
                      {isChurn ? <FiAlertTriangle /> : <FiCheckCircle />}
                      {result.prediction_label}
                    </h3>
                  </div>
                  <button onClick={exportPDF} className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono hover:border-sky-500/50 transition-all">
                    <FiDownload /> Export PDF
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Confidence Score</span>
                    <div className="text-2xl font-black text-sky-400 mt-1">{result.confidence}%</div>
                  </div>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-mono">Risk Hazard Level</span>
                    <div className={`text-2xl font-black mt-1 ${isChurn ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.insights.risk_level}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">Key Risk Drivers</span>
                  <div className="space-y-1.5">
                    {result.insights.key_drivers.map((driver, idx) => (
                      <div key={idx} className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2">
                        <span className={isChurn ? "text-rose-400" : "text-emerald-400"}>•</span> {driver}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl">
                  <span className="text-xs font-mono text-sky-400 uppercase font-bold">Prescribed Retention Action</span>
                  <p className="text-xs font-medium text-white mt-1 leading-relaxed">{result.insights.recommended_action}</p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <FiShield className="text-5xl mx-auto opacity-30 animate-pulse text-sky-400" />
                <p className="text-xs font-mono">Awaiting telemetry payload... Run inference model or upload batch CSV.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
