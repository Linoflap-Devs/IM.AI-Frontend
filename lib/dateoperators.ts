import { getWeekOfMonth } from "date-fns";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getMonthName(month: number) {
    return months[month - 1];
}

export function getMonthIndex(month: string) {
    return months.indexOf(month);
}

export function getMonthDifferenceArray(startDate: Date, endDate: Date) {
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();

    if (startMonth <= endMonth) {
        return months.slice(startMonth, endMonth + 1);
      }
 
    return [...months.slice(startMonth), ...months.slice(0, endMonth + 1)];
}

export function monthlyTotal(data: any[], monthRange: string[]) {
    const totalPerMonth: {[key: string]: number} = {};

    monthRange.forEach((month) => {
        totalPerMonth[month] = 0;
    });

    data.forEach((item: any) => {
        const date = new Date(item.UpdatedAt);
        const monthName = months[date.getMonth()];

        if(monthRange.includes(monthName)){
            const total = item.Quantity * item.Price
            totalPerMonth[monthName] += total;
        }
    })

    return monthRange.map((month) => totalPerMonth[month]);
}

export function getWeekDifferenceArray(startDate: Date, endDate: Date) {
    const startWeek = getWeekOfMonth(startDate);
    const endWeek = getWeekOfMonth(endDate);

    if (startWeek <= endWeek) {
        return Array.from({ length: endWeek - startWeek + 1 }, (_, index) => startWeek + index);
    }

    return [...Array.from({ length: 52 - startWeek + 1 }, (_, index) => index + 1), ...Array.from({ length: endWeek }, (_, index) => index + 1)];
}

export function weeklyTotal(data: any[], weekRange: number[]){
    const totalPerWeek: {[key: number]: number} = {};

    weekRange.forEach((week) => {
        totalPerWeek[week] = 0;
    });

    data.forEach((item: any) => {
        const date = new Date(item.UpdatedAt);
        const week = getWeekOfMonth(date);

        if(weekRange.includes(week)){
            const total = item.Quantity * item.Price
            totalPerWeek[week] += total;
        }
    })

    return weekRange.map((week) => totalPerWeek[week])
}

export function getDayDifferenceArray(startDate: Date, endDate: Date) {
    const startDay = startDate.getDay();
    const endDay = endDate.getDay();

    if (startDay <= endDay) {
        return days.slice(startDay, endDay + 1);
    }

    return [...days.slice(startDay), ...days.slice(0, endDay + 1)];
}

export function dailyTotal(data: any[], dayRange: string[]) {
    const totalPerDay: {[key: string]: number} = {};

    dayRange.forEach((day) => {
        totalPerDay[day] = 0;
    });

    data.forEach((item: any) => {
        const date = new Date(item.UpdatedAt);
        const day = days[date.getDay()];

        if(dayRange.includes(day)){
            const total = item.Quantity * item.Price
            totalPerDay[day] += total;
        }
    })

    return dayRange.map((day) => totalPerDay[day]);
}








