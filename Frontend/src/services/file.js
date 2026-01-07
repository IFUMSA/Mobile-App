import api from './api';

/**
 * File Service - handles file upload and parsing
 */

// Parse uploaded file (PDF, doc, txt)
export const parseFile = async (fileUri, fileName, mimeType) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  });

  const response = await api.post('/api/file/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export default {
  parseFile,
};
