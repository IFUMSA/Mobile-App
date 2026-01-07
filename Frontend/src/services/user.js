import api from './api';

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
    const response = await api.get('/api/user/profile');
    return response.data;
};

/**
 * Update current user profile
 * @param {Object} profileData - Profile data to update
 * @param {string} [profileData.firstName] - User's first name
 * @param {string} [profileData.lastName] - User's last name
 * @param {string} [profileData.userName] - User's username
 * @param {string} [profileData.bio] - User's bio
 * @param {string} [profileData.profilePic] - User's profile picture URL or base64
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (profileData) => {
    const response = await api.put('/api/user/profile', profileData);
    return response.data;
};

/**
 * Get user by ID (public profile)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserById = async (userId) => {
    const response = await api.get(`/api/user/${userId}`);
    return response.data;
};
