import {reactive} from "vue";

export interface DailyData {
    date: string;
    bank: number;
    payment: Payment[];
    salary: Salary[];
    market: number;
    bank_cash: number;
    cash: number;
    operator: number;
}

export interface SummaryItem {
    id: string;
    insert_time: string;
    insert_date: string;
    bank: number;
    payment: Payment[];
    salary: Salary[];
    market: number;
    bank_cash: number;
    cash: number;
    is_confirmed: number;
    is_deleted: number;
  }

export interface Payment {
    name: string
    price: number
}

export interface Salary {
    employee: string
    salary: number
}

export function useDailyData(operator: number) {
    const dailyData = reactive<DailyData>({
        date: '',
        bank: 0,
        payment: [],
        salary: [],
        market: 0,
        bank_cash: 0,
        cash: 0,
        operator: operator,
    });

    return dailyData;
}
