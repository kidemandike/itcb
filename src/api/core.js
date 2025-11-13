// src/api/core.js - Shared API Utility and Configuration

// Connect with .env file
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * A centralized function to handle fetch calls, JSON parsing, and error reporting.
 */
const fetchApi = async (url, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
        });

        // Handle CORS and network errors
        if (response.type === 'opaque' || response.status === 0) {
            throw new Error('CORS error: Cannot connect to server. Check if server is running and CORS is configured.');
        }

        // Handle 204 No Content responses
        if (response.status === 204) {
            return null;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            let errorDetail = data.detail;

            if (Array.isArray(errorDetail)) {
                errorDetail = errorDetail.map(err => {
                    const field = err.loc[err.loc.length - 1];
                    return `${field}: ${err.msg}`;
                }).join('; ');
            } else {
                errorDetail = data.detail || JSON.stringify(data) || response.statusText || 'Unknown server error';
            }

            const error = new Error(`API Error (${response.status} ${response.statusText}): ${errorDetail}`);
            error.status = response.status;
            error.data = data;
            console.error(`Error details for ${url}:`, error.message, data);
            throw error;
        }

        return data;

    } catch (error) {
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            console.error(`CORS/Network Error for ${url}:`, error);
            throw new Error(`Cannot connect to server. Please ensure the backend is running on ${API_BASE_URL} and CORS is configured.`);
        }

        if (error.status) {
            throw error;
        }

        console.error(`Network or Unhandled Error for ${url}:`, error);
        throw new Error("Network error or server unavailable.");
    }
};

// Client-side sample generation (fallback) - Moved from the old api object
const generateSampleControlNumber = (type = "registration") => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString().slice(2, 6);
    return type === "certificate" 
        ? `CERT${timestamp}${random}`.slice(0, 12)
        : `DRV${timestamp}${random}`.slice(0, 12);
};

// Debug function is kept here as it's a general testing utility
const testDrivingEndpoints = () => fetchApi("/engineering/driving/debug/endpoints");


export { fetchApi, API_BASE_URL, generateSampleControlNumber, testDrivingEndpoints };