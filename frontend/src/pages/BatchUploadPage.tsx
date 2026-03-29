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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">CSV Batch Upload</h2>
        <p className="page-subtitle mt-1">CSV format: Cl. Ord.ID,Instrument,Side,Price,Quantity (or Quantity,Price with header)</p>
      </div>
      <div className="toolbar">
        <input className="input-field" type="file" accept=".csv" onChange={(e) => onFileChange(e.target.files?.[0])} />
      </div>
      <div className="status-ok">{summary}</div>

      {rowErrors.length > 0 ? (
        <div className="panel">
          <div className="panel-header">
            <h4>Row-level errors</h4>
          </div>
          <ul className="panel-body space-y-1 text-sm text-fintech-danger">
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
