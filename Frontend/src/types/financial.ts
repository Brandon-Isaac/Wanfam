export interface Revenue {
    _id: string;
    farmId: string;
    source: 'livestock_sale' | 'milk_sale' | 'egg_sale' | 'wool_sale' | 'meat_sale' | 'breeding_fee' | 'service_income' | 'grant' | 'subsidy' | 'other';
    category: 'product_sale' | 'service' | 'investment_return' | 'grant' | 'other';
    amount: number;
    currency: string;
    date: Date | string;
    description?: string;
    
    // Related entities
    animalId?: {
        _id: string;
        tagId: string;
        name: string;
        species: string;
    };
    productType?: string;
    quantity?: number;
    unit?: string;
    pricePerUnit?: number;
    
    // Customer/buyer info
    buyer?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'credit' | 'other';
    paymentStatus?: 'pending' | 'partial' | 'completed' | 'overdue';
    
    invoiceNumber?: string;
    receiptNumber?: string;
    notes?: string;
    
    recordedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface Expense {
    _id: string;
    farmId: string;
    category: 'feed' | 'healthcare' | 'labor' | 'equipment' | 'infrastructure' | 'utilities' | 'maintenance' | 'insurance' | 'transportation' | 'marketing' | 'administrative' | 'loan_repayment' | 'taxes' | 'other';
    subcategory?: string;
    amount: number;
    currency: string;
    date: Date | string;
    description?: string;
    
    // Related entities
    animalId?: {
        _id: string;
        tagId: string;
        name: string;
        species: string;
    };
    workerId?: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    inventoryId?: string;
    
    // Vendor/supplier info
    vendor?: string;
    paymentMethod?: 'cash' | 'bank_transfer' | 'mobile_money' | 'check' | 'credit' | 'other';
    paymentStatus?: 'pending' | 'partial' | 'completed' | 'overdue';
    
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    
    invoiceNumber?: string;
    receiptNumber?: string;
    notes?: string;
    
    recordedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
        username: string;
    };
    
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface FinancialOverview {
    summary: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        profitMargin: number;
    };
    revenue: {
        total: number;
        bySource: Array<{ _id: string; total: number; count: number }>;
        byCategory: Array<{ _id: string; total: number; count: number }>;
        pending: Array<{ _id: string; total: number; count: number }>;
    };
    expenses: {
        total: number;
        byCategory: Array<{ _id: string; total: number; count: number }>;
        pending: Array<{ _id: string; total: number; count: number }>;
    };
    monthlyTrends: Array<{
        year: number;
        month: number;
        revenue: number;
        expenses: number;
        profit: number;
    }>;
    recentTransactions: {
        revenue: Revenue[];
        expenses: Expense[];
    };
}

export interface ProfitLossStatement {
    period: {
        startDate: string;
        endDate: string;
    };
    revenue: {
        breakdown: Array<{ _id: string; total: number }>;
        total: number;
    };
    expenses: {
        breakdown: Array<{ _id: string; total: number }>;
        total: number;
    };
    profit: {
        gross: number;
        net: number;
        margin: string;
    };
}

export interface CashFlow {
    period: {
        startDate: string;
        endDate: string;
    };
    summary: {
        totalInflow: number;
        totalOutflow: number;
        netCashFlow: number;
    };
    monthlyBreakdown: Array<{
        month: string;
        inflow: number;
        outflow: number;
        netCashFlow: number;
    }>;
}
