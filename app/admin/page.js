// pages/admin.js
"use client"
import React, { useState } from 'react';
import axios from 'axios';

const Admin = () => {
  const [apiKey, setApiKey] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const generateReport = async () => {
    if (!apiKey || !file) {
      setMessage('Please provide both API key and input file.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('apiKey', apiKey);
    formData.append('file', file);

    try {
      const response = await axios.post('/api/generate-report', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
      window.location.href = `/api/download-report`;
    } catch (error) {
      console.error('Error generating report:', error);
      setMessage('Error generating report');
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <label>
          API Key:
          <input type="text" value={apiKey} onChange={handleApiKeyChange} />
        </label>
      </div>
      <div>
        <label>
          Input File:
          <input type="file" onChange={handleFileChange} />
        </label>
      </div>
      <button onClick={generateReport} disabled={loading}>
        {loading ? 'Generating Report...' : 'Generate Report'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Admin;
