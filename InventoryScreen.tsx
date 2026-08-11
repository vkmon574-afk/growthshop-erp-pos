import React, { useEffect, useState } from 'react';
import { SaleCategory } from './types';

// Updated Interface to support both API and UI key structures cleanly
export interface ProductItem {
  id: string | number;
  name: string;
  nameArabic?: string;
  sku?: string;
  category: SaleCategory | string;
  selling_price?: number | string;
  price?: number | string;
  cost_price?: number | string;
  stock_qty?: number;
  stockQty?: number;
  unit?: string;
  barcode?: string;
  icon?: string;
}

interface InventoryScreenProps {
  items?: ProductItem[];
  onAddItem?: (item: any) => void;
  onUpdateItem?: (id: string, updated: any) => void;
  onAddToCart?: (item: ProductItem) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  onAddToCart,
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [nameArabic, setNameArabic] = useState('');
  const [category, setCategory] = useState<SaleCategory>('Grocery');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<string>('pcs');
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
    'Bakery',
  ];

  // 1. Fetch products from API on Mount
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filtered Products Logic
  const filteredItems = products.filter((item) => {
    if (!item) return false;
    const matchesCat =
      selectedCategory === 'All' || item.category === selectedCategory;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (item.name && item.name.toLowerCase().includes(query)) ||
      (item.nameArabic && item.nameArabic.toLowerCase().includes(query)) ||
      (item.sku && item.sku.toLowerCase().includes(query)) ||
      (item.barcode && item.barcode.toLowerCase().includes(query));

    return matchesCat && matchesSearch;
  });

  // 3 & 4. Save / Edit Handler (API Sync)
  const handleSaveNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    const numericPrice = parseFloat(price) || 0;
    const numericStock = parseInt(stockQty) || 0;
    const computedSku = barcode.trim() || `${name.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const payload = {
      name: name.trim(),
      sku: computedSku,
      category,
      cost_price: numericPrice,
      selling_price: numericPrice,
      stock_qty: numericStock,
    };

    try {
      if (editingItem) {
        // Edit Existing Product (PUT)
        const res = await fetch(`/api/products/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to update product');
        const updatedProduct = await res.json();

        setProducts((prev) =>
          prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
        );
      } else {
        // Add New Product (POST)
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to create product');
        const createdProduct = await res.json();

        setProducts((prev) => [createdProduct, ...prev]);
      }

      // Reset Modal Form
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
      console.error('Error saving product to backend:', err);
      alert('Could not save product. Please check server logs.');
    }
  };

  // Open Edit Modal with Mapped State
  const openEdit = (item: ProductItem) => {
    setEditingItem(item);
    setName(item.name || '');
    setNameArabic(item.nameArabic || '');
    setCategory((item.category as SaleCategory) || 'Grocery');
    
    // Fallback safe price calculation
    const currentPrice = item.selling_price ?? item.price ?? 0;
    setPrice(String(currentPrice));

    // Fallback safe stock calculation
    const currentStock = item.stock_qty ?? item.stockQty ?? 0;
    setStockQty(String(currentStock));

    setUnit(item.unit || 'pcs');
    setBarcode(item.barcode || item.sku || '');
    setShowAddModal(true);
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto px-4 pt-4 pb-28 animate-fadeIn gap-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Store Items & Prices
          </span>
          {/* 6. Product Count Line */}
          <div className="text-xl text-slate-900 font-bold mt-0.5">
            {filteredItems.length} Products
          </div>
          <span className="text-xs text-slate-400">
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
          className="bg-emerald-700 text-white p-3 rounded-xl shadow-md flex items-center gap-1.5 font-semibold text-xs active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_box</span>
          Add Product
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search product, SKU, or scan barcode..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 focus:bg-white transition-all"
        />
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid Loading / Items List */}
      {isLoading ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading Database Catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">
                inventory_2
              </span>
              <p className="font-bold text-slate-800 text-sm">No items found</p>
              <p className="text-xs text-slate-500 mt-1">
                Add a new product or adjust search filters.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              // Safe field mapping for UI
              const displayPrice = Number(item.selling_price ?? item.price ?? 0).toFixed(2);
              const displayStock = item.stock_qty ?? item.stockQty ?? 0;
              const displayUnit = item.unit || 'pcs';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between gap-3 hover:border-emerald-600/50 transition-all"
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
                          {item.category} • {displayUnit}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openEdit(item)}
                      className="text-slate-400 hover:text-emerald-700 p-1 transition-colors cursor-pointer"
                      title="Edit Product"
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
                        AED {displayPrice}
                      </span>
                    </div>

                    {onAddToCart ? (
                      <button
                        onClick={() => onAddToCart({ ...item, price: Number(displayPrice) })}
                        className="bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          add_shopping_cart
                        </span>
                        + Add to Bill
                      </button>
                    ) : (
                      /* 5. Final Stock Display Line */
                      <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        Stock: {displayStock} {displayUnit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
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
                <span className="material-symbols-outlined text-emerald-700">
                  inventory
                </span>
                {editingItem ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Al Rawabi Fresh Milk 1L"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Arabic Name
                </label>
                <input
                  type="text"
                  value={nameArabic}
                  onChange={(e) => setNameArabic(e.target.value)}
                  placeholder="حليب المراعي"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Selling Price (AED) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="11.00"
                    className="p-3 bg-slate-50 rounded-xl text-sm font-bold text-emerald-700 outline-none border border-slate-200 focus:border-emerald-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 text-slate-900"
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
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
                    className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 text-slate-900"
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

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    placeholder="20"
                    className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">
                  Barcode / SKU
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="e.g. MLK1L"
                  className="p-3 bg-slate-50 rounded-xl text-sm outline-none border border-slate-200 focus:border-emerald-600 font-mono text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-800 shadow-md cursor-pointer"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
