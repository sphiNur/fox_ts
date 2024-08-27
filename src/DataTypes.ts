import {reactive} from "vue";

export interface DailyData {
    date: string;
    bank: number;
    payment: Payment[];
    salary: Salary[];
    market: number;
    bank_cash: number;
    cash: number;
}

export interface Payment {
    name: string
    price: number
}

export interface Salary {
    employee: string
    salary: number
}

export function useDailyData() {
    const dailyData = reactive<DailyData>({
        date: '',
        bank: 0,
        payment: [],
        salary: [],
        market: 0,
        bank_cash: 0,
        cash: 0,
    });

    // 你可以在这里添加对 dailyData 的各种操作逻辑

    return dailyData;
}
