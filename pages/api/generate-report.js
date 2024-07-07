// pages/api/generate-report.js

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import * as XLSX from 'xlsx';

export const config = {
  api: {
    bodyParser: false
  }
};

const parseForm = (req) =>
  new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });

export default async (req, res) => {
  try {
    const { fields, files } = await parseForm(req);
    console.log('Fields:', fields);
    console.log('Files:', files);
    
    const apiKey = fields.apiKey[0];
    if (!files.file || !files.file[0]) {
      throw new Error('File upload failed');
    }
    const inputFile = files.file[0].filepath;
    const outputFile = path.join(process.cwd(), 'output.xlsx');

    const workbook = XLSX.utils.book_new();
    const sheetData = [['SHA256 Hash', 'MD5 Hash', 'SHA1 Hash', 'Detection Result']];

    const hashes = fs.readFileSync(inputFile, 'utf8').split('\n').map(line => line.trim());

    for (const sha256 of hashes) {
      if (!sha256) continue;

      const url = `https://www.virustotal.com/api/v3/files/${sha256}`;
      const headers = {
        'x-apikey': apiKey
      };

      try {
        const response = await axios.get(url, { headers });
        const data = response.data;

        const md5 = data.data.attributes.md5;
        const sha1 = data.data.attributes.sha1;
        const detectionStats = data.data.attributes.last_analysis_stats;

        let detectResult = 'Clean';
        if (detectionStats.malicious > 0) {
          detectResult = 'Malicious';
        } else if (detectionStats.suspicious > 0) {
          detectResult = 'Suspicious';
        }

        sheetData.push([sha256, md5, sha1, detectResult]);
      } catch (error) {
        console.error(`Error processing hash ${sha256}:`, error.message);
        sheetData.push([sha256, 'Unknown', 'Unknown', 'Unknown']);
      }
    }

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, outputFile);

    res.status(200).json({ message: 'Report generated successfully', file: 'output.xlsx' });
  } catch (error) {
    console.error('Error generating report:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
