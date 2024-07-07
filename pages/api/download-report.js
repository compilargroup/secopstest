// pages/api/download-report.js

import fs from 'fs';
import path from 'path';

export default (req, res) => {
  const outputFile = path.join(process.cwd(), 'output.xlsx');

  res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
  const fileStream = fs.createReadStream(outputFile);
  fileStream.pipe(res);
};
