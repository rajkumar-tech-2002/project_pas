/**
 * Time Range Utilities
 * Handles time parsing, validation, and calculations for the appointment system
 */

/**
 * Convert time string (HH:MM) to minutes since midnight
 * @param {string} time - Time in format "HH:MM" (e.g., "10:30")
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 * @param {number} minutes - Minutes since midnight
 * @returns {string} Time in format "HH:MM"
 */
export const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Calculate duration in minutes between two times
 * @param {string} startTime - Start time "HH:MM"
 * @param {string} endTime - End time "HH:MM"
 * @returns {number} Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
    return timeToMinutes(endTime) - timeToMinutes(startTime);
};

/**
 * Format duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m", "45m")
 */
export const formatDuration = (minutes) => {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Check if a time range is within another time range
 * @param {Object} range - Range to check { start_time, end_time }
 * @param {Object} container - Container range { start_time, end_time }
 * @returns {boolean} True if range is completely within container
 */
export const isWithinRange = (range, container) => {
    const rangeStart = timeToMinutes(range.start_time);
    const rangeEnd = timeToMinutes(range.end_time);
    const containerStart = timeToMinutes(container.start_time);
    const containerEnd = timeToMinutes(container.end_time);

    return rangeStart >= containerStart && rangeEnd <= containerEnd;
};

/**
 * Check if two time ranges overlap
 * @param {Object} range1 - First range { start_time, end_time }
 * @param {Object} range2 - Second range { start_time, end_time }
 * @returns {boolean} True if ranges overlap
 */
export const rangesOverlap = (range1, range2) => {
    const start1 = timeToMinutes(range1.start_time);
    const end1 = timeToMinutes(range1.end_time);
    const start2 = timeToMinutes(range2.start_time);
    const end2 = timeToMinutes(range2.end_time);

    // Two ranges overlap if: start1 < end2 AND end1 > start2
    return start1 < end2 && end1 > start2;
};

/**
 * Generate time options in specified increments within a range
 * @param {string} startTime - Start time "HH:MM"
 * @param {string} endTime - End time "HH:MM"
 * @param {number} increment - Increment in minutes (default: 15)
 * @returns {Array<string>} Array of time strings
 */
export const generateTimeOptions = (startTime, endTime, increment = 15) => {
    const options = [];
    let current = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    while (current <= end) {
        options.push(minutesToTime(current));
        current += increment;
    }

    return options;
};

/**
 * Validate time range
 * @param {string} startTime - Start time "HH:MM"
 * @param {string} endTime - End time "HH:MM"
 * @param {number} minDuration - Minimum duration in minutes (default: 15)
 * @param {number} maxDuration - Maximum duration in minutes (default: 120)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateTimeRange = (startTime, endTime, minDuration = 15, maxDuration = 120) => {
    if (!startTime || !endTime) {
        return { valid: false, error: 'Start time and end time are required' };
    }

    const duration = calculateDuration(startTime, endTime);

    if (duration <= 0) {
        return { valid: false, error: 'End time must be after start time' };
    }

    // Removed detailed duration checks as per requirement

    return { valid: true, error: null };
};

/**
 * Subtract a booked range from available ranges
 * @param {Array<Object>} availableRanges - Array of available ranges
 * @param {Object} bookedRange - Booked range to subtract
 * @returns {Array<Object>} Updated available ranges
 */
export const subtractBookedRange = (availableRanges, bookedRange) => {
    const result = [];

    for (const available of availableRanges) {
        // If no overlap, keep the available range as is
        if (!rangesOverlap(available, bookedRange)) {
            result.push(available);
            continue;
        }

        const availStart = timeToMinutes(available.start_time);
        const availEnd = timeToMinutes(available.end_time);
        const bookedStart = timeToMinutes(bookedRange.start_time);
        const bookedEnd = timeToMinutes(bookedRange.end_time);

        // If booked range is in the middle, split into two ranges
        if (bookedStart > availStart && bookedEnd < availEnd) {
            result.push({
                start_time: available.start_time,
                end_time: minutesToTime(bookedStart)
            });
            result.push({
                start_time: minutesToTime(bookedEnd),
                end_time: available.end_time
            });
        }
        // If booked range starts after available start
        else if (bookedStart > availStart) {
            result.push({
                start_time: available.start_time,
                end_time: minutesToTime(bookedStart)
            });
        }
        // If booked range ends before available end
        else if (bookedEnd < availEnd) {
            result.push({
                start_time: minutesToTime(bookedEnd),
                end_time: available.end_time
            });
        }
        // Otherwise, the entire range is booked, don't add anything
    }

    return result;
};

/**
 * Calculate available time ranges after subtracting busy windows and booked appointments
 * @param {Array<Object>} availabilityWindows - Admin-defined availability windows (available or busy)
 * @param {Array<Object>} bookedAppointments - Existing booked appointments
 * @returns {Array<Object>} Available time ranges
 */
export const calculateAvailableRanges = (availabilityWindows, bookedAppointments) => {
    // 1. Separate available windows and busy windows
    const availableWindows = availabilityWindows.filter(w => w.status === 'available');
    const busyWindows = availabilityWindows.filter(w => w.status === 'busy');

    // 2. Start with available windows
    let available = [...availableWindows];

    // 3. Subtract each busy window from available ranges
    for (const busy of busyWindows) {
        available = available.flatMap(range =>
            subtractBookedRange([range], busy)
        );
    }

    // 4. Subtract each booked appointment from available ranges
    for (const booking of bookedAppointments) {
        available = available.flatMap(range =>
            subtractBookedRange([range], booking)
        );
    }

    // Filter out very small ranges (less than minimum duration of 1 minute)
    return available.filter(range =>
        calculateDuration(range.start_time, range.end_time) >= 1
    );
};

/**
 * Format time to 12-hour format with AM/PM
 * @param {string} time - Time in 24-hour format "HH:MM"
 * @returns {string} Time in 12-hour format (e.g., "10:30 AM")
 */
export const formatTime12Hour = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Parse date string to Date object
 * @param {string} dateStr - Date string in format "YYYY-MM-DD"
 * @returns {Date} Date object
 */
export const parseDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00');
};

/**
 * Format Date object to string "YYYY-MM-DD"
 * @param {Date} date - Date object
 * @returns {string} Date string
 */
export const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
