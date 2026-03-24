import React, { useState } from "react";
import { apiClient } from "../services/apiClient";

export function BatchUploadPage() {
  const [summary, setSummary] = useState("");

  const onFileChange = async (file?: File) => {
    if (!file) return;
    const result = await apiClient.submitBatch(file);
    setSummary(`${result.message}: total ${result.total}, accepted ${result.accepted}, rejected ${result.rejected}`);
  };

  return (
    <div>
      <h2>CSV Batch Upload</h2>
      <input type="file" accept=".csv" onChange={(e) => onFileChange(e.target.files?.[0])} />
      <div>{summary}</div>
    </div>
  );
}
