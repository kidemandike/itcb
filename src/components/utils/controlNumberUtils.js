// utils/controlNumberUtils.js
export const generateControlNumber = (type = 'registration') => {
    const prefixes = {
        registration: 'DRV',
        certificate: 'CERT'
    };
    
    const lengths = {
        registration: 12, // DRV + 9 digits
        certificate: 12   // CERT + 8 digits
    };
    
    const prefix = prefixes[type];
    const totalLength = lengths[type];
    const randomDigitsLength = totalLength - prefix.length;
    
    // Generate random digits
    const randomDigits = Math.random()
        .toString()
        .slice(2, 2 + randomDigitsLength)
        .padEnd(randomDigitsLength, '0');
    
    return `${prefix}${randomDigits}`;
};

export const validateControlNumber = (controlNumber, type = 'registration') => {
    if (!controlNumber) return false;
    
    const prefixes = {
        registration: 'DRV',
        certificate: 'CERT'
    };
    
    const lengths = {
        registration: 12,
        certificate: 12
    };
    
    const prefix = prefixes[type];
    const expectedLength = lengths[type];
    
    // Check length
    if (controlNumber.length !== expectedLength) return false;
    
    // Check prefix
    if (!controlNumber.startsWith(prefix)) return false;
    
    // Check that the rest are digits
    const numberPart = controlNumber.slice(prefix.length);
    return /^\d+$/.test(numberPart);
};