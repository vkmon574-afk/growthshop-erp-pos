import React, { useEffect, useState } from 'react';
import { GroceryItem, SaleCategory } from '../types';

interface InventoryScreenProps {
  items?: GroceryItem[];
  onAddItem?: (item: Omit<GroceryItem, 'id'>) => void;
  onUpdateItem?: (id: string, updated: Partial<GroceryItem>) => void;
  onAddToCart?: (item: GroceryItem) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // Form state
  const [name, setName] = useState('');
  const [nameArabic, setNameArabic] = useState('');
  const [category, setCategory] = useState<SaleCategory>('Grocery');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<GroceryItem['unit']>('pcs');
  const [stockQty, setStockQty] = useState('');
  const [barcode, setBarcode] = useState('');

  const categories = [
    'All',
    'Grocery',
    'Dairy & Fresh',
    'Beverages',
    'Snacks & Sweets',
    'Household',
    'Personal Care',
  ];

  const filteredItems = products.filter((item: any) => {
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.nameArabic && item.nameArabic.toLowerCase().includes(query)) ||
      (item.barcode && item.barcode.includes(query));

    return matchesCat && matchesSearch;
  });

  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price) return;

    const payload = {
      name,
      nameArabic,
      unit,
      category,
      cost_price: parseFloat(price) || 0,
      selling_price: parseFloat(price) || 0,
      stock_qty: parseInt(stockQty) || 0,
      barcode: barcode || name.replace(/\s+/g, '-').toUpperCase(),
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
      setUnit('pcs');
      setStockQty('');
      setBarcode('');
      setShowAddModal(false);
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name || '');
    setNameArabic(item.nameArabic || '');
    setCategory((item.category as SaleCategory) || 'Grocery');
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
            setUnit('pcs');
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
                    {item.category} • {item.unit || 'pcs'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => openEdit(item)}
                className="text-slate-400 hover:text-emerald-700 p-1 transition-colors"
                title="Edit Price/Stock"
              >
                <span className="material-symbols-outlined text-[18px]">
                  edit
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Unit Price
                </span>
                <span className="font-bold text-emerald-700 text-base">
                  AED {Number(item.selling_price || 0).toFixed(2)}
                </span>
              </div>

              {onAddToCart ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    add_shopping_cart
                  </span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Almarai Milk 1L"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Arabic Name
                </label>
                <input
                  type="text"
                  value={nameArabic}
                  onChange={(e) => setNameArabic(e.target.value)}
                  placeholder="e.g. حليب المراعي"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as SaleCategory)
                    }
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) =>
                      setUnit(e.target.value as GroceryItem['unit'])
                    }
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="ltr">ltr</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Price (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Barcode / SKU
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or enter barcode"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl text-sm border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 font-semibold text-white text-sm shadow-xs hover:bg-emerald-800"
                >
                  {editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
