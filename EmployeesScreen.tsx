import React, { useState } from 'react';
import { Employee } from '../types';

interface EmployeesScreenProps {
  employees: Employee[];
  activeEmployeeId: string;
  onAddEmployee: (emp: Omit<Employee, 'id' | 'salesCountToday' | 'totalSalesToday'>) => void;
  onSelectEmployeeForCashier: (emp: Employee) => void;
  onToggleShift: (empId: string) => void;
  onDeleteEmployee?: (empId: string) => void;
}

export const EmployeesScreen: React.FC<EmployeesScreenProps> = ({
  employees,
  activeEmployeeId,
  onAddEmployee,
  onSelectEmployeeForCashier,
  onToggleShift,
  onDeleteEmployee,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Store Admin' | 'Senior Cashier' | 'Junior Cashier' | 'Stock Clerk'>('Senior Cashier');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('0000');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colors = ['#007a3d', '#0284c7', '#d97706', '#7c3aed', '#db2777'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddEmployee({
      name,
      role,
      phone: phone || '+971 50 000 0000',
      pin: pin || '0000',
      activeShift: true,
      avatarColor: randomColor,
    });

    setName('');
    setPhone('');
    setPin('0000');
    setShowAddModal(false);
  };

  return (
    <div className="px-4 py-5 max-w-5xl mx-auto space-y-6 pb-24 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-[24px]">badge</span>
            Employee & Cashier Staff Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage staff PINs, active cashier shifts, and sales performance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add New Employee
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => {
          const isActiveCashier = emp.id === activeEmployeeId;
          return (
            <div
              key={emp.id}
              className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                isActiveCashier
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0"
                    style={{ backgroundColor: emp.avatarColor || '#007a3d' }}
                  >
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      {emp.name}
                      {isActiveCashier && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          ACTIVE LOGGED IN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{emp.role} • {emp.phone}</div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      Security PIN: <span className="text-slate-700 font-bold">****</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onToggleShift(emp.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      emp.activeShift
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {emp.activeShift ? '🟢 Shift Active' : '⚪ Clocked Out'}
                  </button>

                  {onDeleteEmployee && employees.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove staff member "${emp.name}"?`)) {
                          onDeleteEmployee(emp.id);
                        }
                      }}
                      className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors"
                      title="Delete staff member"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Today's Bills</span>
                  <span className="font-bold text-slate-900 text-sm">{emp.salesCountToday} Transactions</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Sales Volume</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    AED {emp.totalSalesToday.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Switch active cashier button */}
              <button
                onClick={() => onSelectEmployeeForCashier(emp)}
                className="w-full py-2 bg-slate-100 hover:bg-emerald-800 hover:text-white text-slate-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                Switch to Cashier Terminal as {emp.name.split(' ')[0]}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-slideUp space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Staff Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Ahmed"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Designation</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
                >
                  <option value="Senior Cashier">Senior Cashier</option>
                  <option value="Junior Cashier">Junior Cashier</option>
                  <option value="Store Admin">Store Admin / Manager</option>
                  <option value="Stock Clerk">Stock Clerk</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">4-Digit Login PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-mono tracking-widest text-center"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 text-xs shadow-xs"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
