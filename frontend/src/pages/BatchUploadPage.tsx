import React, { useState } from "react";
import { apiClient } from "../services/apiClient";

export function BatchUploadPage() {
  const [summary, setSummary] = useState("");
  const [rowErrors, setRowErrors] = useState<Array<{ lineNumber: number; reason: string; row: string }>>([]);

  const onFileChange = async (file?: File) => {
    if (!file) return;
    const result = await apiClient.submitBatch(file);
    setSummary(
      `${result.message}: batch ${result.summary.batchId}, total ${result.summary.total}, accepted ${result.summary.accepted}, rejected ${result.summary.rejected}`
    );
    setRowErrors(result.rowErrors);
  };

  return (
    <div>
      <h2>CSV Batch Upload</h2>
      <p>CSV format: Cl. Ord.ID,Instrument,Side,Price,Quantity (or Quantity,Price with header)</p>
      <input type="file" accept=".csv" onChange={(e) => onFileChange(e.target.files?.[0])} />
      <div style={{ marginTop: 8 }}>{summary}</div>

      {rowErrors.length > 0 ? (
        <div style={{ marginTop: 10 }}>
          <h4>Row-level errors</h4>
          <ul>
            {rowErrors.map((error) => (
              <li key={`${error.lineNumber}-${error.row}`}>
                Line {error.lineNumber}: {error.reason} ({error.row})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
