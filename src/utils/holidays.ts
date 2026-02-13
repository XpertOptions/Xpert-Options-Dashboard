
export const NSE_HOLIDAYS: Record<string, string> = {
    // 2024
    "2024-01-26": "Republic Day",
    "2024-03-08": "Mahashivratri",
    "2024-03-25": "Holi",
    "2024-03-29": "Good Friday",
    "2024-04-11": "Id-Ul-Fitr (Ramadan Eid)",
    "2024-04-17": "Shri Ram Navami",
    "2024-05-01": "Maharashtra Day",
    "2024-05-20": "Election Day",
    "2024-06-17": "Bakri Id",
    "2024-07-17": "Moharram",
    "2024-08-15": "Independence Day",
    "2024-10-02": "Mahatma Gandhi Jayanti",
    "2024-11-01": "Diwali Laxmi Pujan",
    "2024-11-15": "Gurunanak Jayanti",
    "2024-12-25": "Christmas",

    // 2025
    "2025-02-19": "Chhatrapati Shivaji Maharaj Jayanti",
    "2025-02-26": "Mahashivratri",
    "2025-03-14": "Holi",
    "2025-03-31": "Eid-Ul-Fitr (Ramadan Eid)",
    "2025-04-10": "Shri Mahavir Jayanti",
    "2025-04-14": "Dr. Baba Saheb Ambedkar Jayanti",
    "2025-04-18": "Good Friday",
    "2025-05-01": "Maharashtra Day",
    "2025-05-12": "Buddha Pournima",
    "2025-08-15": "Independence Day",
    "2025-08-27": "Ganesh Chaturthi",
    "2025-09-05": "Id-E-Milad",
    "2025-10-02": "Mahatma Gandhi Jayanti",
    "2025-10-21": "Diwali Laxmi Pujan",
    "2025-10-22": "Diwali-Balipratipada",
    "2025-11-05": "Guru Nanak Jayanti",
    "2025-12-25": "Christmas",

    // 2026
    "2026-03-03": "Holi",
    "2026-03-26": "Shri Ram Navami",
    "2026-03-31": "Mahavir Jayanti",
    "2026-04-03": "Good Friday",
    "2026-04-14": "Dr. Baba Saheb Ambedkar Jayanti",
    "2026-05-01": "Maharashtra Day",
    "2026-08-15": "Independence Day",
    "2026-10-02": "Mahatma Gandhi Jayanti",
    "2026-11-05": "Guru Nanak Jayanti",
    "2026-12-25": "Christmas",
};

export const isHoliday = (date: Date): boolean => {
    const dateStr = date.toISOString().split("T")[0];
    return !!NSE_HOLIDAYS[dateStr];
};

export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export const isTradingDay = (date: Date): boolean => {
    return !isWeekend(date) && !isHoliday(date);
};
