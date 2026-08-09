import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveTab,
  BusinessProfile,
  Customer,
  Employee,
  GroceryItem,
  Transaction,
  UserRole,
} from './types';
import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_CUSTOMERS,
  INITIAL_EMPLOYEES,
  INITIAL_GROCERY_ITEMS,
  INITIAL_TRANSACTIONS,
} from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { PosBillingScreen } from './components/PosBillingScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { CustomersScreen } from './components/CustomersScreen';
import { VatReportScreen } from './components/VatReportScreen';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { LedgerScreen } from './components/LedgerScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { TaxInvoiceModal } from './components/TaxInvoiceModal';
import { EmployeesScreen } from './components/EmployeesScreen';
import { RegisterShiftScreen } from './components/RegisterShiftScreen';

export default function App() {
  // User Role State
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('growthshop_role');
      return (saved as UserRole) || 'admin';
    } catch {
      return 'admin';
    }
  });

  // Employees State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem('growthshop_employees');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved employees:', e);
    }
    return INITIAL_EMPLOYEES;
  });

  // Active Logged-in Employee ID
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('growthshop_active_emp');
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to get active employee:', e);
    }
    return INITIAL_EMPLOYEES[0]?.id || 'emp-1';
  });

  // Business Profile state
  const [profile, setProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('growthshop_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved profile:', e);
      }
    }
    return INITIAL_BUSINESS_PROFILE;
  });

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('growthshop_customers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved customers:', e);
      }
    }
    return INITIAL_CUSTOMERS;
  });

  // Grocery catalog items state
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('growthshop_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved items:', e);
      }
    }
    return INITIAL_GROCERY_ITEMS;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('growthshop_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions:', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('admin-dashboard');
  const [selectedPosCustomer, setSelectedPosCustomer] = useState<Customer | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Active Employee object
  const activeEmployee =
    employees.find((e) => e.id === activeEmployeeId) || employees[0] || INITIAL_EMPLOYEES[0];

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem('growthshop_role', activeRole);
    } catch (e) {
      console.warn('Failed to save growthshop_role to localStorage:', e);
    }
  }, [activeRole]);

  useEffect(() => {
    try {
      localStorage.setItem('growthshop_employees', JSON.stringify(employees));
    } catch (e) {
      console.warn('Failed to save growthshop_employees to localStorage:', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('growthshop_active_emp', activeEmployeeId);
    } catch (e) {
      console.warn('Failed to save growthshop_active_emp to localStorage:', e);
    }
  }, [activeEmployeeId]);

  useEffect(() => {
    try {
      localStorage.setItem('growthshop_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save growthshop_profile to localStorage:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('growthshop_customers', JSON.stringify(customers));
    } catch (e) {
      console.warn('Failed to save growthshop_customers to localStorage:', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('growthshop_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save growthshop_items to localStorage:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('growthshop_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save growthshop_transactions to localStorage:', e);
    }
  }, [transactions]);

  // Ensure activeEmployeeId always points to a valid existing employee
  useEffect(() => {
    if (employees.length > 0 && !employees.some((e) => e.id === activeEmployeeId)) {
      setActiveEmployeeId(employees[0].id);
    }
  }, [employees, activeEmployeeId]);

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  // Add customer
  const handleAddCustomer = (newCustomer: Omit<Customer, 'id' | 'totalSpent'>) => {
    const created: Customer = {
      ...newCustomer,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
    };
    setCustomers((prev) => [created, ...prev]);
    showToast(`Added customer "${created.name}"`);
  };

  // Update customer credit/Khata balance
  const handleUpdateCustomerBalance = (customerId: string, newBalance: number) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, creditBalance: newBalance } : c))
    );
    showToast('Customer Khata updated');
  };

  // Add grocery item
  const handleAddGroceryItem = (newItem: Omit<GroceryItem, 'id'>) => {
    const created: GroceryItem = {
      ...newItem,
      id: `item-${Date.now()}`,
    };
    setItems((prev) => [created, ...prev]);
    showToast(`Added item "${created.name}"`);
  };

  // Update grocery item
  const handleUpdateGroceryItem = (id: string, updated: Partial<GroceryItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    showToast('Item updated');
  };

  // Add Employee
  const handleAddEmployee = (
    newEmp: Omit<Employee, 'id' | 'salesCountToday' | 'totalSalesToday'>
  ) => {
    const created: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`,
      salesCountToday: 0,
      totalSalesToday: 0,
    };
    setEmployees((prev) => [...prev, created]);
    showToast(`Added staff member "${created.name}"`);
  };

  // Toggle Shift Status
  const handleToggleShift = (empId: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, activeShift: !e.activeShift } : e))
    );
    showToast('Employee shift updated');
  };

  // Delete Employee
  const handleDeleteEmployee = (empId: string) => {
    const updatedEmployees = employees.filter((e) => e.id !== empId);
    setEmployees(updatedEmployees);
    if (activeEmployeeId === empId) {
      const fallback = updatedEmployees[0]?.id || 'emp-1';
      setActiveEmployeeId(fallback);
    }
    showToast('Staff member removed');
  };

  // Save Transaction (Sale or Expense)
  const handleSaveTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const fullTx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}`,
      cashierName: activeEmployee?.name || 'Cashier',
    };

    setTransactions((prev) => [fullTx, ...prev]);

    // Update active employee sales metrics if it's a sale
    if (fullTx.type === 'sale' && activeEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === activeEmployee.id
            ? {
                ...e,
                salesCountToday: e.salesCountToday + 1,
                totalSalesToday: e.totalSalesToday + fullTx.amount,
              }
            : e
        )
      );
    }

    // If customer selected and payment is Credit / Khata
    if (fullTx.customerId && fullTx.type === 'sale') {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === fullTx.customerId) {
            const isKhata = fullTx.paymentMethod === 'Credit / Khata';
            return {
              ...c,
              totalSpent: c.totalSpent + fullTx.amount,
              creditBalance: isKhata ? c.creditBalance + fullTx.amount : c.creditBalance,
              lastPurchaseDate: 'Today',
            };
          }
          return c;
        })
      );
    }

    // Update profile rolling turnover / monthly sales & expenses
    if (fullTx.type === 'sale') {
      setProfile((prev) => ({
        ...prev,
        salesThisMonth: prev.salesThisMonth + fullTx.amount,
        rollingTurnover: prev.rollingTurnover + fullTx.amount,
      }));
      showToast(`Sale recorded +AED ${fullTx.amount.toFixed(2)}`);
      // Open Tax Invoice Modal instantly
      setViewingInvoice(fullTx);
    } else {
      setProfile((prev) => ({
        ...prev,
        expensesThisMonth: prev.expensesThisMonth + fullTx.amount,
      }));
      showToast(`Expense recorded -AED ${fullTx.amount.toFixed(2)}`);
    }

    return fullTx;
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Entry deleted');
  };

  const handleUpdateProfile = (updated: Partial<BusinessProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    showToast('Settings saved');
  };

  // Header title resolver
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'admin-dashboard':
      case 'home':
        return activeRole === 'admin' ? 'Admin ERP Executive Board' : 'POS Cashier Terminal';
      case 'pos':
        return 'POS Tax Invoice Billing';
      case 'inventory':
        return 'Grocery Catalog & Prices';
      case 'customers':
        return 'Customer Udhar & Khata';
      case 'ledger':
        return 'Sales & Expense Ledger';
      case 'employees':
        return 'Employee & Staff Roster';
      case 'register-shift':
        return 'Cashier Register Shift';
      case 'settings':
        return 'Store Tax & App Profile';
      case 'vat-report':
        return 'UAE VAT Threshold & Filing';
      case 'camera-scan':
        return 'Receipt Scanner OCR';
      default:
        return 'GrowthShop ERP';
    }
  };

  return (
    <div className="bg-[#f8faf9] text-slate-900 min-h-screen flex flex-col font-sans selection:bg-emerald-500/20">
      {/* Top Header with Role Indicator */}
      {activeTab !== 'camera-scan' && (
        <Header
          title={getHeaderTitle()}
          activeRole={activeRole}
          activeEmployeeName={activeEmployee?.name}
          showBack={activeTab === 'vat-report' || activeTab === 'camera-scan'}
          onBack={() => setActiveTab(activeRole === 'admin' ? 'admin-dashboard' : 'pos')}
          onRoleSwitchClick={() => setShowRoleModal(true)}
          onProfileClick={() => setActiveTab('settings')}
        />
      )}

      {/* Main Screen Content */}
      <main className={`flex-1 ${activeTab !== 'camera-scan' ? 'pt-16' : ''}`}>
        {(activeTab === 'admin-dashboard' || activeTab === 'home') && (
          <AdminDashboardScreen
            profile={profile}
            transactions={transactions}
            customers={customers}
            employees={employees}
            onNavigate={handleNavigate}
            onSelectTransaction={(tx) => setViewingInvoice(tx)}
          />
        )}

        {activeTab === 'pos' && (
          <PosBillingScreen
            items={items}
            customers={customers}
            profile={profile}
            initialSelectedCustomer={selectedPosCustomer}
            onSaveTransaction={handleSaveTransaction}
            onOpenScanner={() => setActiveTab('camera-scan')}
            onOpenAddCustomerModal={() => setActiveTab('customers')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryScreen
            items={items}
            onAddItem={handleAddGroceryItem}
            onUpdateItem={handleUpdateGroceryItem}
            onAddToCart={(item) => {
              setActiveTab('pos');
              showToast(`Added ${item.name} to POS Bill`);
            }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersScreen
            customers={customers}
            transactions={transactions}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomerBalance={handleUpdateCustomerBalance}
            onSelectCustomerForPOS={(cust) => {
              setSelectedPosCustomer(cust);
              setActiveTab('pos');
            }}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerScreen
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenInvoiceModal={(tx) => setViewingInvoice(tx)}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesScreen
            employees={employees}
            activeEmployeeId={activeEmployeeId}
            onAddEmployee={handleAddEmployee}
            onSelectEmployeeForCashier={(emp) => {
              setActiveEmployeeId(emp.id);
              setActiveRole('employee');
              setActiveTab('pos');
              showToast(`Logged in as Cashier: ${emp.name}`);
            }}
            onToggleShift={handleToggleShift}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activeTab === 'register-shift' && (
          <RegisterShiftScreen
            activeEmployee={activeEmployee}
            transactions={transactions}
            onToggleShift={handleToggleShift}
            onOpenPos={() => setActiveTab('pos')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onSignOut={() => {
              setProfile(INITIAL_BUSINESS_PROFILE);
              setCustomers(INITIAL_CUSTOMERS);
              setItems(INITIAL_GROCERY_ITEMS);
              setTransactions(INITIAL_TRANSACTIONS);
              setEmployees(INITIAL_EMPLOYEES);
              localStorage.clear();
              setActiveRole('admin');
              setActiveTab('admin-dashboard');
              showToast('Demo data restored');
            }}
          />
        )}

        {activeTab === 'vat-report' && (
          <VatReportScreen
            profile={profile}
            onBack={() => setActiveTab(activeRole === 'admin' ? 'admin-dashboard' : 'pos')}
          />
        )}

        {activeTab === 'camera-scan' && (
          <ReceiptScannerModal
            onBack={() => setActiveTab('pos')}
            onReceiptScanned={(scanned) => {
              handleSaveTransaction({
                type: 'expense',
                title: scanned.merchant || 'Scanned Expense Receipt',
                subtotal: scanned.amount - scanned.vatAmount,
                discountAmount: 0,
                vatAmount: scanned.vatAmount,
                amount: scanned.amount,
                category: scanned.category || 'Stock',
                paymentMethod: 'Cash',
                date: 'Today',
                rawDate: new Date().toISOString(),
                merchant: scanned.merchant,
                notes: scanned.notes,
              });
              setActiveTab('ledger');
            }}
          />
        )}
      </main>

      {/* Tax Invoice Modal */}
      {viewingInvoice && (
        <TaxInvoiceModal
          transaction={viewingInvoice}
          profile={profile}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {/* Role Switcher Modal (Admin vs. Employee Cashier) */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-slideUp space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800 text-[24px]">
                    swap_horiz
                  </span>
                  Switch User Interface Role
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose access level to tailor visibility and controls
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Role Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin Mode Card */}
              <button
                onClick={() => {
                  setActiveRole('admin');
                  setActiveTab('admin-dashboard');
                  setShowRoleModal(false);
                  showToast('Switched to Executive Admin Mode 🛡️');
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  activeRole === 'admin'
                    ? 'border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center mb-3 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">
                    admin_panel_settings
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-sm">🛡️ Admin Dashboard</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Full control: Net Profit (Green), Expenses (Red), FTA VAT thresholds, Stock Prices & Staff Roster.
                </p>
              </button>

              {/* Employee Mode Card */}
              <button
                onClick={() => {
                  setActiveRole('employee');
                  setActiveTab('pos');
                  setShowRoleModal(false);
                  showToast('Switched to Cashier POS Mode 🛒');
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  activeRole === 'employee'
                    ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">🛒 Cashier / Employee View</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  High-speed POS billing, customer Udhar lookup, price catalog & cash drawer shift without owner metrics.
                </p>
              </button>
            </div>

            {/* Select Active Cashier Staff */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Select Active Cashier Profile:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {employees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => {
                      setActiveEmployeeId(emp.id);
                      showToast(`Selected Cashier: ${emp.name}`);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 ${
                      activeEmployeeId === emp.id
                        ? 'border-emerald-700 bg-emerald-100/70 font-bold text-emerald-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center shrink-0"
                      style={{ backgroundColor: emp.avatarColor || '#007a3d' }}
                    >
                      {emp.name.charAt(0)}
                    </div>
                    <span className="truncate">{emp.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        activeRole={activeRole}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-xl font-medium text-xs sm:text-sm animate-slideUp border border-slate-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
