import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

export const getMonthDays = (date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }
    return days;
};

export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
    return format(date, formatStr);
};

export { format, addMonths, subMonths, isSameMonth, isSameDay };
