import { create } from "zustand";

interface SalesOverviewStoreActivity {
    name: string;
    data: string;
    unit: string;
}
interface LowQuantityStocks {
    name: string;
    quantity: number;
}
interface LeastSellingProduct {
    name: string;
    soldQuantity: number;
    price: number;
}

interface GlobalStore {

    isOnline: boolean;
    setIsOnline: (value: boolean) => void;

    /* Global States */
    globalCompanyState: string;
    setGlobalCompanyState: (value: string) => void;

    globalBranchState: string;
    setGlobalBranchState: (value: string) => void;

    globalBranchName: string;
    setGlobalBranchName: (value: string) => void;

    /*Global Date States */
    // Global Report Date States {#8af,4}
    fromReportDate: Date;
    setFromReportDate: (value: Date) => void;
    toReportDate: Date;
    setToReportDate: (value: Date) => void;

    /* Dashboard Interface */

    lowQuantityStocks: LowQuantityStocks[];
    setLowQuantityStocks: (value: LowQuantityStocks[]) => void;

    leastSellingProduct: LeastSellingProduct[];
    setLeastSellingProduct: (value: LeastSellingProduct[]) => void;

    topSellingProduct: TopSellingProduct[];
    setTopSellingProduct: (value: TopSellingProduct[]) => void;

    /* Inventory Interface */
    purchasePerfTableData: PurchaseHistory[];
    setPurchasePerfTableData: (value: PurchaseHistory[]) => void;


    userActivityTableData: UserActivity[];
    setUserActivityTableData: (value: UserActivity[]) => void;

}

export const useGlobalStore = create<GlobalStore>()((set) => ({

    isOnline: false,
    setIsOnline: (value) => set((state) => ({ ...state, isOnline: value })),

    /* Global States */
    globalCompanyState: "all",
    setGlobalCompanyState: (value) =>
        set((state) => ({ ...state, globalCompanyState: value })),

    globalBranchState: "all",
    setGlobalBranchState: (value) =>
        set((state) => ({ ...state, globalBranchState: value })),

    globalBranchName: "",
    setGlobalBranchName: (value) =>
        set((state) => ({ ...state, globalBranchName: value })),

    fromReportDate: new Date(),
    setFromReportDate: (value) =>
        set((state) => ({ ...state, fromReportDate: value })),
    toReportDate: new Date(),
    setToReportDate: (value) =>
        set((state) => ({ ...state, toReportDate: value })),

    /* Dashboard States */
    dashboardSalesOverview: [
        { name: "Sales", data: "41", unit: "¥" },
        { name: "Revenue", data: "342", unit: "¥" },
        { name: "Profit", data: "1234", unit: "¥" },
        { name: "Cost", data: "1234", unit: "¥" },
    ],


    lowQuantityStocks: [
        { name: "Tata Salt", quantity: 10 },
        { name: "Lays", quantity: 20 },
        { name: "Maggi", quantity: 30 },
        { name: "Maggi", quantity: 30 },
        { name: "Maggi", quantity: 30 },
    ],
    setLowQuantityStocks: (value) =>
        set((state) => ({
            ...state,
            lowQuantityStocks: value,
        })),

    leastSellingProduct: [
        { name: "Hansel", soldQuantity: 10, price: 10 },
        { name: "Clover", soldQuantity: 20, price: 3 },
        { name: "Quake", soldQuantity: 30, price: 15 },
        { name: "Quake", soldQuantity: 30, price: 15 },
        { name: "Quake", soldQuantity: 30, price: 15 },
    ],
    setLeastSellingProduct: (value) =>
        set((state) => ({ ...state, leastSellingProduct: value })),
    topSellingProduct: [
        {
            name: "Surf",
            sold: 10,
            stocks: 34,
            price: "¥ 21",
        },
        {
            name: "Cheezy",
            sold: 13,
            stocks: 34,
            price: "¥ 15",
        },
        {
            name: "Rin",
            sold: 15,
            stocks: 50,
            price: "¥ 25",
        },
        {
            name: "Parle G",
            sold: 20,
            stocks: 50,
            price: "¥ 23",
        },
        {
            name: "Parle G",
            sold: 20,
            stocks: 50,
            price: "¥ 23",
        },
        {
            name: "Parle G",
            sold: 20,
            stocks: 50,
            price: "¥ 23",
        },
    ],
    setTopSellingProduct: (value) =>
        set((state) => ({ ...state, topSellingProduct: value })),
    purchasePerfTableData: [
        {
            branchName: "Bing Cebu",
            purchaseDate: "2023-12-06",
            quantitySold: 12,
            totalCost: 6000,
        },
        {
            branchName: "Bing Davao",
            purchaseDate: "2023-12-05",
            quantitySold: 10,
            totalCost: 5000,
        },
        {
            branchName: "Bing Baguio",
            purchaseDate: "2023-12-04",
            quantitySold: 8,
            totalCost: 4000,
        },
        {
            branchName: "Bing Iloilo",
            purchaseDate: "2023-12-03",
            quantitySold: 6,
            totalCost: 3000,
        },
        {
            branchName: "Bing Zamboanga",
            purchaseDate: "2023-12-02",
            quantitySold: 4,
            totalCost: 2000,
        },
        {
            branchName: "Bing Bacolod",
            purchaseDate: "2023-12-01",
            quantitySold: 2,
            totalCost: 1000,
        },
        {
            branchName: "Bing Angeles",
            purchaseDate: "2023-11-30",
            quantitySold: 14,
            totalCost: 7000,
        },
        {
            branchName: "Bing Legazpi",
            purchaseDate: "2023-11-29",
            quantitySold: 16,
            totalCost: 8000,
        },
        {
            branchName: "Bing Tacloban",
            purchaseDate: "2023-11-28",
            quantitySold: 18,
            totalCost: 9000,
        },
        {
            branchName: "Bing Puerto Princesa",
            purchaseDate: "2023-11-27",
            quantitySold: 20,
            totalCost: 10000,
        },
        {
            branchName: "Bing Butuan",
            purchaseDate: "2023-11-26",
            quantitySold: 22,
            totalCost: 11000,
        },
        {
            branchName: "Bing General Santos",
            purchaseDate: "2023-11-25",
            quantitySold: 24,
            totalCost: 12000,
        },
        {
            branchName: "Bing Naga",
            purchaseDate: "2023-11-24",
            quantitySold: 26,
            totalCost: 13000,
        },
        {
            branchName: "Bing Dagupan",
            purchaseDate: "2023-11-23",
            quantitySold: 28,
            totalCost: 14000,
        },
        {
            branchName: "Bing Laoag",
            purchaseDate: "2023-11-22",
            quantitySold: 30,
            totalCost: 15000,
        },
        {
            branchName: "Bing Vigan",
            purchaseDate: "2023-11-21",
            quantitySold: 32,
            totalCost: 16000,
        },
        {
            branchName: "Bing Tuguegarao",
            purchaseDate: "2023-11-20",
            quantitySold: 34,
            totalCost: 17000,
        },
        {
            branchName: "Bing San Fernando",
            purchaseDate: "2023-11-19",
            quantitySold: 36,
            totalCost: 18000,
        },
        {
            branchName: "Bing Olongapo",
            purchaseDate: "2023-11-18",
            quantitySold: 38,
            totalCost: 19000,
        },
        {
            branchName: "Bing Calamba",
            purchaseDate: "2023-11-17",
            quantitySold: 40,
            totalCost: 20000,
        },
    ],
    setPurchasePerfTableData: (value) =>
        set((state) => ({ ...state, purchasePerfTableData: value })),
    /* Reports */

    userActivityTableData: [],
    setUserActivityTableData: (value) =>
        set((state) => ({ ...state, userActivityTableData: value })),
}));
