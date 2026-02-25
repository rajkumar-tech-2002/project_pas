export const formatTime = (time) => {
    return time; // Expecting "HH:mm"
};

export const isFutureTime = (date, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate > new Date();
};

export const isMoreThan15MinsAway = (date, time) => {
    if (!time || !date) return false;
    const [hours, minutes] = time.split(':').map(Number);
    const appointmentDate = new Date(date);
    appointmentDate.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const diffInMins = (appointmentDate - now) / (1000 * 60);
    return diffInMins > 15;
};
