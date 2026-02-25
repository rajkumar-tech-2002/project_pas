/**
 * Availability Service
 * Manages admin-defined availability windows using MySQL backend
 */

import api from './api';

/**
 * Get all availability windows
 * @returns {Promise<Array<Object>>} Array of availability windows
 */
export const getAllAvailability = async () => {
    try {
        const response = await api.get('/availability');
        return response.data;
    } catch (error) {
        console.error('Error fetching availability:', error);
        return [];
    }
};

/**
 * Get availability windows for a specific date
 * @param {string} date - Date string "YYYY-MM-DD"
 * @returns {Promise<Array<Object>>} Array of availability windows for the date
 */
export const getAvailabilityByDate = async (date) => {
    try {
        const response = await api.get(`/availability/${date}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching availability by date:', error);
        return [];
    }
};

/**
 * Create a new availability window
 * @param {Object} availabilityData - { date, start_time, end_time }
 * @returns {Promise<Object>} Created availability window
 */
export const createAvailability = async (availabilityData) => {
    try {
        const response = await api.post('/availability', availabilityData);
        return response.data;
    } catch (error) {
        console.error('Error creating availability:', error);
        throw error;
    }
};

/**
 * Update an existing availability window
 * @param {string} id - Availability window ID
 * @param {Object} updates - Fields to update (Not fully implemented in simple API yet)
 * @returns {Promise<Object|null>} Updated window
 */
export const updateAvailability = async (id, updates) => {
    try {
        const response = await api.put(`/availability/${id}`, updates);
        return response.data;
    } catch (error) {
        console.error('Error updating availability:', error);
        throw error;
    }
};

/**
 * Delete an availability window
 * @param {string} id - Availability window ID
 * @returns {Promise<boolean>} True if deleted
 */
export const deleteAvailability = async (id) => {
    try {
        await api.delete(`/availability/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting availability:', error);
        return false;
    }
};

/**
 * Check if a new availability window overlaps with existing ones
 * @param {Object} newWindow - { date, start_time, end_time }
 * @param {string} excludeId - ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if overlaps
 */
export const checkAvailabilityOverlap = async (newWindow, excludeId = null) => {
    const existing = await getAvailabilityByDate(newWindow.date);

    for (const window of existing) {
        if (excludeId && window.id === excludeId) continue;

        const newStart = timeToMinutes(newWindow.start_time);
        const newEnd = timeToMinutes(newWindow.end_time);
        const existingStart = timeToMinutes(window.start_time);
        const existingEnd = timeToMinutes(window.end_time);

        // Check overlap
        if (newStart < existingEnd && newEnd > existingStart) {
            return true;
        }
    }

    return false;
};

// Helper function
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Get availability summary for a date range
 * @param {string} startDate - Start date "YYYY-MM-DD"
 * @param {string} endDate - End date "YYYY-MM-DD"
 * @returns {Promise<Object>} Summary statistics
 */
export const getAvailabilitySummary = async (startDate, endDate) => {
    const availability = await getAllAvailability();
    const filtered = availability.filter(w => w.date >= startDate && w.date <= endDate);

    let totalMinutes = 0;
    const datesWithAvailability = new Set();

    for (const window of filtered) {
        const duration = timeToMinutes(window.end_time) - timeToMinutes(window.start_time);
        totalMinutes += duration;
        datesWithAvailability.add(window.date);
    }

    return {
        totalWindows: filtered.length,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: totalMinutes % 60,
        daysWithAvailability: datesWithAvailability.size
    };
};
