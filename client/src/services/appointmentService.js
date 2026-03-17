/**
 * Appointment Service
 * Manages appointments with flexible time ranges using MySQL backend
 */

import api from './api';
import {
    rangesOverlap,
    calculateAvailableRanges,
    isWithinRange,
    validateTimeRange,
    calculateDuration
} from './utils/timeRangeUtils.js';
import { getAvailabilityByDate } from './availabilityService.js';

/**
 * Get all appointments
 * @returns {Promise<Array<Object>>} Array of appointments
 */
export const getAppointments = async () => {
    try {
        const response = await api.get('/appointments');
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return [];
    }
};

/**
 * Get appointments for a specific date
 * @param {string} date - Date string "YYYY-MM-DD"
 * @returns {Promise<Array<Object>>} Appointments for the date
 */
export const getAppointmentsByDate = async (date) => {
    try {
        const response = await api.get(`/appointments/date/${date}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching appointments by date:', error);
        return [];
    }
};

/**
 * Get appointment by ID
 * @param {string} id - Appointment ID
 * @returns {Promise<Object|null>} Appointment object
 */
export const getAppointmentById = async (id) => {
    try {
        const response = await api.get(`/appointments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        return null;
    }
};

/**
 * Check if a time range overlaps with existing appointments
 * @param {string} date - Date string
 * @param {string} startTime - Start time "HH:MM"
 * @param {string} endTime - End time "HH:MM"
 * @param {string} excludeId - Appointment ID to exclude (for updates)
 * @returns {Promise<Object>} { hasOverlap: boolean, conflictingAppointment: Object|null }
 */
export const checkAppointmentOverlap = async (date, startTime, endTime, excludeId = null) => {
    const existingAppointments = await getAppointmentsByDate(date);

    const newRange = { start_time: startTime, end_time: endTime };

    for (const appointment of existingAppointments) {
        if (excludeId && appointment.id === excludeId) continue;

        const existingRange = {
            start_time: appointment.start_time,
            end_time: appointment.end_time
        };

        if (rangesOverlap(newRange, existingRange)) {
            return {
                hasOverlap: true,
                conflictingAppointment: appointment
            };
        }
    }

    return { hasOverlap: false, conflictingAppointment: null };
};

/**
 * Get available time ranges for a specific date
 * @param {string} date - Date string "YYYY-MM-DD"
 * @returns {Promise<Object>} { availabilityWindows, bookedAppointments, availableRanges }
 */
export const getAvailableTimeRanges = async (date) => {
    const availabilityWindows = await getAvailabilityByDate(date);
    const bookedAppointments = await getAppointmentsByDate(date);

    // Calculate available ranges by subtracting booked from availability
    const availableRanges = calculateAvailableRanges(availabilityWindows, bookedAppointments);

    return {
        availabilityWindows,
        bookedAppointments,
        availableRanges
    };
};

/**
 * Validate appointment booking
 * @param {Object} appointmentData - { date, start_time, end_time }
 * @returns {Promise<Object>} { valid: boolean, error: string|null }
 */
export const validateAppointment = async (appointmentData) => {
    const { date, start_time, end_time } = appointmentData;

    // Validate time range format and duration
    const timeValidation = validateTimeRange(start_time, end_time);
    if (!timeValidation.valid) {
        return timeValidation;
    }

    // Check if within availability windows
    const availabilityWindows = await getAvailabilityByDate(date);

    if (availabilityWindows.length === 0) {
        return {
            valid: false,
            error: 'No availability defined for this date'
        };
    }

    const requestedRange = { start_time, end_time };
    const isWithinAvailability = availabilityWindows.some(window =>
        isWithinRange(requestedRange, window)
    );

    if (!isWithinAvailability) {
        return {
            valid: false,
            error: 'Selected time range is outside available hours'
        };
    }

    // Check for overlaps with existing appointments
    const overlapCheck = await checkAppointmentOverlap(date, start_time, end_time);
    if (overlapCheck.hasOverlap) {
        return {
            valid: false,
            error: `Time slot conflicts with existing appointment at ${overlapCheck.conflictingAppointment.start_time}`
        };
    }

    return { valid: true, error: null };
};

/**
 * Save a new appointment
 * @param {Object} appointmentData - Appointment details
 * @returns {Promise<Object>} { success: boolean, appointment: Object|null, error: string|null }
 */
export const saveAppointment = async (appointmentData) => {
    // Validate appointment
    const validation = await validateAppointment(appointmentData);
    if (!validation.valid) {
        return {
            success: false,
            appointment: null,
            error: validation.error
        };
    }

    const payload = {
        user_id: appointmentData.user_id || appointmentData.username,
        username: appointmentData.username,
        role: appointmentData.role,
        date: appointmentData.date,
        start_time: appointmentData.start_time,
        end_time: appointmentData.end_time,
        duration_minutes: calculateDuration(appointmentData.start_time, appointmentData.end_time),
        purpose: appointmentData.purpose
    };

    try {
        const response = await api.post('/appointments', payload);
        return {
            success: true,
            appointment: response.data,
            error: null
        };
    } catch (error) {
        console.error('Error saving appointment:', error);
        return {
            success: false,
            appointment: null,
            error: error.message
        };
    }
};

/**
 * Update appointment status
 * @param {string} id - Appointment ID
 * @param {string} status - New status ('Active', 'Completed', 'Cancelled')
 * @returns {Promise<boolean>} Success status
 */
export const updateAppointmentStatus = async (id, status) => {
    try {
        await api.patch(`/appointments/${id}/status`, { status });
        return true;
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return false;
    }
};

/**
 * Reschedule an appointment
 * @param {string} id - Appointment ID
 * @param {Object} data - { date, start_time, end_time, duration_minutes }
 * @returns {Promise<boolean>} Success status
 */
export const rescheduleAppointment = async (id, data) => {
    try {
        await api.patch(`/appointments/${id}/reschedule`, data);
        return true;
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        return false;
    }
};

/**
 * Delete an appointment
 * @param {string} id - Appointment ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteAppointment = async (id) => {
    try {
        await api.delete(`/appointments/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return false;
    }
};

/**
 * Get appointment statistics
 * @returns {Promise<Object>} Statistics object
 */
export const getAppointmentStats = async () => {
    try {
        const response = await api.get('/appointments/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching appointment stats:', error);
        return {
            total: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
            totalMinutesBooked: 0
        };
    }
};

/**
 * Get strategic insights for admin dashboard
 * @returns {Promise<Object>} Insights object
 */
export const getStrategicInsights = async () => {
    try {
        const response = await api.get('/appointments/insights');
        return response.data;
    } catch (error) {
        console.error('Error fetching strategic insights:', error);
        return {
            staffParticipation: 0,
            portalTraffic: 0,
            trafficLevel: 'Low Demand',
            systemTip: 'System data temporarily unavailable.'
        };
    }
};

/**
 * Start a meeting
 * @param {string} id - Appointment ID
 * @returns {Promise<boolean>} Success status
 */
export const startMeeting = async (id) => {
    try {
        await api.patch(`/appointments/${id}/start`);
        return { success: true };
    } catch (error) {
        console.error('Error starting meeting:', error);
        return { success: false };
    }
};

/**
 * Complete a meeting
 * @param {string} id - Appointment ID
 * @returns {Promise<Object|null>} { success: boolean, durationSeconds: number }
 */
export const completeMeeting = async (id) => {
    try {
        const response = await api.patch(`/appointments/${id}/complete`);
        return { success: true, durationSeconds: response.data.durationSeconds };
    } catch (error) {
        console.error('Error completing meeting:', error);
        return { success: false, durationSeconds: 0 };
    }
};/**
 * Get report data based on filters
 * @param {Object} filters - { startDate, endDate, status }
 * @returns {Promise<Array<Object>>} Filtered report data
 */
export const getReportData = async (filters) => {
    try {
        const response = await api.get('/appointments/report', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching report data:', error);
        return [];
    }
};
