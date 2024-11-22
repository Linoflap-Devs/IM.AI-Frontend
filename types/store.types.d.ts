type CartInformation = {
    FirstName: string;
    LastName: string;
    Expr5: number;
    Expr6: number;
    PushCartId: number;
    BranchId: number;
    Status: number;
    Battery: number;
    UserClientId: number;
    CompanyId: number;
};
type locale = "en" | "ja";

type TopSellingProduct = {
    name: string;
    sold: number;
    stocks: number;
    price: string;
};
type CartStatus = { 1: string; 2: string; 3: string };

type InventoryDataTable = {
    id: number;
    products: String;
    price: number;
    quantity: number;
    thresholdValue: number;
    expiryDate: Date | String;
};
type ProductPerformance = {
    productName: string;
    productId: string;
    sales: number;
    category: string;
    revenue: number;
};
type PurchaseHistory = {
    branchName: string;
    purchaseDate: string;
    quantitySold: number;
    totalCost: number;
};
type PromoDataList = {
    Name: string;
    Category: string;
    Percentage: number;
    PromoCode: string;
    Expiry: Date;
};
type PromoProductDataList = {
    name: string;
    id: number;
};
type StoreBranches = {
    CompanyId: number;
    BranchId: number;
    Name: string;
    Address: string;
    Contact: number;
    ContactPerson: string;
    ImgLink: string;
    TIN: string;
};

type TransactionTableData = {
    TransactionId: number;
    BranchId: number;
    CreatedAt: Date;
    TransactionStatus: string;
    ReferenceNumber: number;
    Costumer: "Test Subject";
    PushCartId: number;
};
type UserActivity = {
    UserLogID: number;
    UserClientId: number;
    Activity: string;
    CreatedAt: Date;
    Costumer: string;
    Email: string;
};

type ClientList = {
    FirstName: string;
    LastName: string;
    Status: number;
    UserClientId: number;
    CompanyId: number;
};

type ComboBox = {
    value: string;
    label: string;
};

type DropDownOptions = {
    label: string;
    value: string;
}

type InventoryDataOverview = {
    "Available Products": number,
    "Out of Stocks": number;
    "Critical Stocks": number;
    "Restocks Needed": number;
    "Near-Expiry Products": number;
    "Expired Products": number;
};