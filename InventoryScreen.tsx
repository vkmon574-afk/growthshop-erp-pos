import { useEffect, useState } from 'react';
import React, { useState } from 'react';
import { GroceryItem, SaleCategory } from '../types';

interface InventoryScreenProps {
  items: GroceryItem[];
  onAddItem: (item: Omit<GroceryItem, 'id'>) => void;
  onUpdateItem: (id: string, updated: Partial<GroceryItem>) => void;
  onAddToCart?: (item: GroceryItem) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
const [products, setProducts] = useState<any[]>([]);

useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(err => console.error('Failed to load products', err));
}, []);
  // Form state
  const [name, setName] = useState('');
  const [nameArabic, setNameArabic] = useState('');
  const [category, setCategory] = useState<SaleCategory>('Grocery');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<GroceryItem['unit']>('pcs');
  const [stockQty, setStockQty] = useState('');
  const [barcode, setBarcode] = useState('');

  const categories = ['All', 'Grocery', 'Dairy & Fresh', 'Beverages', 'Snacks & Sweets', 'Household', 'Personal Care'];

const filteredItems = products.filter((item: any) => {
  const matchesCat =
    selectedCategory === 'All' || item.category === selectedCategory;

  const matchesSearch =
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.barcode && item.barcode.includes(searchQuery));

  return matchesCat && matchesSearch;
});   

  const handleSaveNewItem = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim() || !price) return;

  const payload = {
    name,
    sku: barcode || name.replace(/\s+/g, '-').toUpperCase(),
    category,
    cost_price: parseFloat(price) || 0,
    selling_price: parseFloat(price) || 0,
    stock_qty: parseInt(stockQty) || 0,
  };

  try {
    if (editingItem) {
      const res = await fetch(`/api/products/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();

      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const created = await res.json();

      setProducts((prev) => [created, ...prev]);
    }

    // Reset
    setName('');
    setNameArabic('');
    setCategory('Grocery');
    setPrice('');
    setStockQty('');
    setBarcode('');
    setShowAddModal(false);
    setEditingItem(null);
  } catch (err) {
    console.error('Failed to save product', err);
  }
};
      onAddItem({
        name,
        nameArabic: nameArabic || undefined,
        category,
        price: parseFloat(price) || 0,
        unit,
        stockQty: parseInt(stockQty) || 0,
        barcode: barcode || undefined,
        icon: 'storefront',
      });
    }

    // Reset
    setName('');
    setNameArabic('');
    setCategory('Grocery');
    setPrice('');
    setStockQty('');
    setBarcode('');
    setShowAddModal(false);

  cconst openEdit = (item: any) => {
  setEditingItem(item);
  setName(item.name);
  setNameArabic(item.nameArabic || '');
  setCategory(item.category as SaleCategory);
  setPrice(String(item.selling_price ?? 0));
  setUnit(item.unit || 'pcs');
  setStockQty(String(item.stock_qty ?? 0));
  setBarcode(item.barcode || '');
  setShowAddModal(true);
};
  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-container-margin pt-stack-md pb-28 animate-fadeIn gap-section-gap">
      {/* Header Banner */}
      <div className="bg-surface-container-lowest rounded-2xl p-card-padding shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-outline-variant/30 flex items-center justify-between">
        <div>
          <span className="font-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Store Items & Prices
          </span>
          <div className="font-display-sm text-on-surface font-bold mt-0.5">
            {filteredItems.length} Products
          </div>
          <span className="font-label-sm text-on-surface-variant text-xs">
            Standard 5% UAE VAT applicable
          </span>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setName('');
            setNameArabic('');
            setCategory('Grocery');
            setPrice('');
            setStockQty('');
            setBarcode('');
            setShowAddModal(true);
          }}
          className="bg-primary text-on-primary p-3 rounded-xl shadow-md flex items-center gap-1.5 font-label-md font-semibold active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product, Arabic name, or scan barcode..."
          className="w-full pl-11 pr-4 py-2.5 bg-surface-container rounded-xl text-sm outline-none border border-outline-variant/30 focus:border-primary focus:bg-surface-container-lowest transition-all"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between gap-3 hover:border-emerald-600/50 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                  <span className="material-symbols-outlined text-[22px]">
                    {item.icon || 'shopping_bag'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug">
                    {item.name}
                  </h4>
                  {item.nameArabic && (
                    <span className="text-xs text-slate-500 block font-medium">
                      {item.nameArabic}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">
                    {item.category} • {item.unit}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openEdit(item)}
                className="text-slate-400 hover:text-emerald-700 p-1 transition-colors"
                title="Edit Price/Stock"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Unit Price
                </span>
                <span className="font-bold text-emerald-700 text-base">
                  AED {Number(item.selling_price).toFixed(2)}
                </span>
              </div>

              {onAddToCart ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  + Add to Bill
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                  Stock: {item.stock_qty ?? 0} {item.unit || 'pcs'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <form
            onSubmit={handleSaveNewItem}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl relative z-10 p-6 flex flex-col gap-4 animate-slideUp max-h-[90vh] overflow-y-auto border border-slate-200"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700">inventory</span>
                {editingItem ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al Rawabi Fresh Milk 2L"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Arabic Name (For Tax Invoice)
                </label>
                <input
                  type="text"
                  value={nameArabic}
                  onChange={(e) => setNameArabic(e.target.value)}
                  placeholder="حليب الروابي 2 لتر"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Price (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="11.00"
                    className="p-3 bg-slate-50 rounded-xl text-sm font-bold text-emerald-700 outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as GroceryItem['unit'])}
                    className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                  >
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="kg">kg (Kilograms)</option>
                    <option value="liter">liter</option>
                    <option value="pack">pack</option>
                    <option value="box">box</option>
                    <option value="bag">bag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SaleCategory)}
                    className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Dairy & Fresh">Dairy & Fresh</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks & Sweets">Snacks & Sweets</option>
                    <option value="Household">Household</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="20"
                    className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Barcode (Optional)
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. 629100100201"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white font-mono text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-sm shadow-md transition-colors"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
