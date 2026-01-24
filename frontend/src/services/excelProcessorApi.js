/**
 * Excel Processor API Service
 * Handles communication with the Excel AI Processor backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/**
 * Start Financial Analysis CGS Generation (legacy)
 */
export const startFinancialAnalysis = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/excel/process/financial-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to start processing');
  }

  return await response.json();
};

/**
 * Process with template - generic template-based processing
 */
export const processWithTemplate = async (templateKey, templateName, uploadedFiles = []) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/excel/process/template`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_key: templateKey,
      template_name: templateName,
      uploaded_files: uploadedFiles,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to process' }));
    throw new Error(error.detail || 'Failed to start processing');
  }

  return await response.json();
};

/**
 * Get processing status
 */
export const getProcessingStatus = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/excel/status/${jobId}`);

  if (!response.ok) {
    throw new Error('Failed to get status');
  }

  return await response.json();
};

/**
 * Poll for processing completion
 */
export const pollProcessingStatus = async (jobId, onProgress, maxAttempts = 60, intervalMs = 2000) => {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const result = await getProcessingStatus(jobId);

        // Call progress callback
        if (onProgress) {
          onProgress(result);
        }

        // Check if completed
        if (result.status === 'completed') {
          resolve(result);
          return;
        }

        // Check if error
        if (result.status === 'error') {
          reject(new Error(result.message || 'Processing failed'));
          return;
        }

        // Check if max attempts reached
        attempts++;
        if (attempts >= maxAttempts) {
          reject(new Error('Processing timeout'));
          return;
        }

        // Continue polling
        setTimeout(checkStatus, intervalMs);
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
};

/**
 * Download processed file
 */
export const downloadFile = (downloadUrl, filename) => {
  const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${API_BASE_URL}${downloadUrl}`;

  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = fullUrl;
  link.download = filename || 'processed_output.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * List all processing jobs
 */
export const listJobs = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/excel/jobs`);

  if (!response.ok) {
    throw new Error('Failed to list jobs');
  }

  return await response.json();
};

/**
 * Delete a job
 */
export const deleteJob = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/api/v1/excel/job/${jobId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete job');
  }

  return await response.json();
};

/**
 * List available templates
 */
export const listTemplates = async () => {
  const response = await fetch(`${API_BASE_URL}/api/v1/excel/templates`);

  if (!response.ok) {
    throw new Error('Failed to list templates');
  }

  return await response.json();
};

export default {
  startFinancialAnalysis,
  processWithTemplate,
  getProcessingStatus,
  pollProcessingStatus,
  downloadFile,
  listJobs,
  deleteJob,
  listTemplates,
};
