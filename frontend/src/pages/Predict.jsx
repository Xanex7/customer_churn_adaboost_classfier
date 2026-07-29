import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiCpu, FiUser, FiRefreshCw } from 'react-icons/fi';

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
    toast.success(`Loaded Preset: ${preset.replace('_', ' ').toUpperCase()}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData);
      setResult(response.data);
      toast.success("Inference Complete");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reach inference engine");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative z-10 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono tracking-widest text-sky-400 uppercase">AdaBoost Ensemble Pipeline</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Churn Inference</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => loadPreset('high_risk')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20">High Risk</button>
          <button type="button" onClick={() => loadPreset('loyal')} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20">Loyal Profile</button>
          <button type="button" onClick={() => setFormData(DEFAULT_FORM)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700">Reset</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 glass-card rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-sky-400 flex items-center gap-2"><FiUser /> Customer Telemetry Attributes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-400 flex justify-between">Age <span>{formData.Age} yrs</span></label>
                <input type="range" min="18" max="80" value={formData.Age} onChange={e => handleChange('Age', parseInt(e.target.value))} className="w-full accent-sky-400 mt-2" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Gender</label>
                <select value={formData.Gender} onChange={e => handleChange('Gender', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white mt-2">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 flex justify-between">Tenure <span>{formData.Tenure} months</span></label>
                <input type="range" min="1" max="60" value={formData.Tenure} onChange={e => handleChange('Tenure', parseInt(e.target.value))} className="w-full accent-sky-400 mt-2" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Support Calls</label>
                <div className="flex items-center gap-3 mt-2">
                  <button type="button" onClick={() => handleChange('Support Calls', Math.max(0, formData['Support Calls'] - 1))} className="w-10 h-10 bg-slate-800 rounded-lg font-bold text-lg">-</button>
                  <span className="font-mono text-lg font-bold text-sky-400">{formData['Support Calls']}</span>
                  <button type="button" onClick={() => handleChange('Support Calls', formData['Support Calls'] + 1)} className="w-10 h-10 bg-slate-800 rounded-lg font-bold text-lg">+</button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 flex justify-between">Payment Delay <span>{formData['Payment Delay']} days</span></label>
                <input type="range" min="0" max="30" value={formData['Payment Delay']} onChange={e => handleChange('Payment Delay', parseInt(e.target.value))} className="w-full accent-sky-400 mt-2" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Total Spend ($)</label>
                <input type="number" value={formData['Total Spend']} onChange={e => handleChange('Total Spend', parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white mt-2" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Subscription Tier</label>
                <select value={formData['Subscription Type']} onChange={e => handleChange('Subscription Type', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white mt-2">
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400">Contract Structure</label>
                <select value={formData['Contract Length']} onChange={e => handleChange('Contract Length', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white mt-2">
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-sky-500/20 hover:brightness-110 flex items-center justify-center gap-2">
              {loading ? <FiRefreshCw className="animate-spin text-lg" /> : <FiCpu className="text-lg" />}
              <span>{loading ? "Traversing Decision Trees..." : "RUN INFERENCE PIPELINE"}</span>
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="glass-card rounded-2xl p-6 space-y-6 border-l-4 border-l-sky-400">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-mono">Prediction Output</span>
                  <h3 className={`text-2xl font-black ${result.prediction === 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.prediction_label}
                  </h3>
                </div>
                <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-full text-slate-300">{result.processing_time}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Confidence Score</span>
                  <div className="text-2xl font-bold text-sky-400 mt-1">{result.confidence}%</div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Risk Hazard Level</span>
                  <div className={`text-2xl font-bold mt-1 ${result.insights.risk_level === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.insights.risk_level}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Risk Drivers</span>
                <ul className="space-y-1.5">
                  {result.insights.key_drivers.map((driver, idx) => (
                    <li key={idx} className="text-xs text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-800/80 flex items-start gap-2">
                      <span className="text-sky-400 font-bold">•</span> {driver}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-xl">
                <span className="text-xs font-bold text-sky-400 uppercase">Prescribed Retention Action</span>
                <p className="text-sm font-semibold text-white mt-1">{result.insights.recommended_action}</p>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-500 space-y-4">
              <FiCpu className="text-5xl mx-auto text-slate-700 animate-pulse" />
              <p className="text-sm font-mono">Awaiting telemetry payload... Run inference model to view analytics.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
