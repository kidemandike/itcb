// src/api/index.js - Centralized API Module

// 1. Import all exports from core utility
import { 
    fetchApi, 
    API_BASE_URL, 
    generateSampleControlNumber, 
    testDrivingEndpoints 
} from './core';

// 2. Import default exports from other modules
import authApi from './auth';
import coursesApi from './courses';
import teacherApi from './teacher';
import controlNumbersApi from './controlNumbers';
import conferenceRoomsApi from './conferenceRooms';
import languageCertificatesApi from './languageCertificates';
import iceApi from './ice';
import engineeringDrivingApi from './engineeringDriving';

// 3. Combine all API objects into a single default export
const api = {
    // Core Utility Exports
    fetchApi,
    API_BASE_URL,
    generateSampleControlNumber,
    testDrivingEndpoints,
    
    // Spread all endpoint groups into the main 'api' object
    ...authApi, 
    ...coursesApi,
    ...teacherApi,
    ...controlNumbersApi,
    ...conferenceRoomsApi,
    ...languageCertificatesApi,
    ...iceApi,
    ...engineeringDrivingApi,
};

// Export the combined 'api' object as default
export default api;

// Also export core functions for explicit import/use elsewhere if needed
export { 
    fetchApi, 
    API_BASE_URL, 
    generateSampleControlNumber 
};