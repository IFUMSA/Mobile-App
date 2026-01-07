import api from './api';

/**
 * Get user's payment history
 * @param {string} [status] - Filter by status (pending, submitted, confirmed, completed, rejected)
 * @returns {Promise<Object>} Payment history
 */
export const getPaymentHistory = async (status) => {
    const params = status && status !== 'all' ? { status } : {};
    const response = await api.get('/api/payment/history', { params });
    return response.data;
};

/**
 * Get single payment by ID
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentById = async (paymentId) => {
    const response = await api.get(`/api/payment/${paymentId}`);
    return response.data;
};

/**
 * Create a new payment (initiate checkout)
 * @param {string} method - Payment method ('card' or 'bank')
 * @returns {Promise<Object>} New payment record
 */
export const createPayment = async (method = 'card') => {
    const response = await api.post('/api/payment/create', { method });
    return response.data;
};

/**
 * Create annual dues payment
 * @param {string} method - Payment method ('card' or 'bank')
 * @returns {Promise<Object>} New payment record for annual dues
 */
export const createAnnualDuesPayment = async (method = 'bank') => {
    const response = await api.post('/api/payment/annual-dues', { method });
    return response.data;
};

/**
 * Submit bank transfer proof
 * @param {string} paymentId - Payment ID
 * @param {string} proofImage - Base64 encoded proof image
 * @returns {Promise<Object>} Updated payment
 */
export const submitPaymentProof = async (paymentId, proofImage) => {
    const response = await api.post(`/api/payment/${paymentId}/proof`, { proofImage });
    return response.data;
};

/**
 * Get bank account details for transfer
 * @returns {Promise<Object>} Bank account details
 */
export const getBankDetails = async () => {
    const response = await api.get('/api/payment/bank-details');
    return response.data;
};
