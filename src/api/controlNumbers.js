// src/api/controlNumbers.js - Enhanced Control Number Functions for All Departments

import { fetchApi } from './core';

const controlNumbersApi = {
    // --- Enhanced Control Number Functions for All Departments ---
    generateControlNumber: (token, type = "registration") => fetchApi(`/control-numbers/generate?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
    }),

    validateControlNumber: (token, controlNumber, type = "registration") => fetchApi(`/control-numbers/validate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            control_number: controlNumber,
            type: type 
        }),
    }),

    getControlNumberStats: (token) => fetchApi("/control-numbers/statistics", {
        headers: { Authorization: `Bearer ${token}` },
    }),
};

export default controlNumbersApi;