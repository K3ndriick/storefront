/**
 * ============================================================================
 * FILTER STORE - CLIENT-SIDE STATE MANAGEMENT
 * ============================================================================
 * 
 * Purpose:
 * Manages user preferences for product filtering, sorting, and display options.
 * Uses Zustand for lightweight, performant state management with persistence.
 * 
 * Key Features:
 * - Persist state to localStorage (survives page refresh)
 * - Redux DevTools integration (for debugging)
 * - TypeScript type safety
 * - Optimized re-renders (only components using specific state update)
 * 
 * Store Structure:
 * - State: Current filter/sort values
 * - Actions: Functions to update state
 * - Selectors: Convenience hooks to access specific state slices
 * 
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ProductSortOption, ProductCategory } from '@/lib/types/products';

// interface to define shape of filter store
interface FilterState {
  // Define state properties 
  sortBy: ProductSortOption,
  priceRange: {min: number, max: number },
  selectedCategories: ProductCategory[],
  selectedBrands: string[],
  inStockOnly: boolean,
  onSaleOnly: boolean,
  viewMode: 'grid' | 'list',

  setSortBy:(productSortOption: ProductSortOption) => void ;

  setPriceRange:(minValue: number, maxValue: number) => void;
  
  toggleCategory:(productCategory: ProductCategory) => void;
  
  setCategories:(productCategoryArr: ProductCategory[]) => void;
  
  toggleBrand:(brand: string) => void;
  
  setBrands:(selectedBrands: string[]) => void;
  
  setInStockOnly:(inStockOnly: boolean) => void;
  
  setOnSaleOnly:(onSaleOnly: boolean) => void;
  
  setViewMode:(viewMode: 'grid' | 'list') => void;
  
  resetFilters:() => void;
}


/**
 * Default State Configuration
 * 
 * These are the initial values when:
 * - User first visits the site
 * - User clicks "Reset Filters"
 * - localStorage is cleared
 * 
 * Note: Type assertions (as X) are required for TypeScript to infer
 * the exact union types rather than just 'string' or 'array'
 */
const defaultState = {
  sortBy: 'newest' as ProductSortOption,
  priceRange: { min: 0, max: 5000 },
  selectedCategories: [] as ProductCategory[],
  selectedBrands: [] as string[],
  inStockOnly: false,
  onSaleOnly: false,
  viewMode: 'grid' as 'grid' | 'list',
}

// Main Zustand filter store for managing product filter state
export const useFilterStore = create<FilterState>()(
  devtools(
    persist(
      (set) => ({
        // ==================== INITIAL STATE ====================
        ...defaultState,
        
        setSortBy: (sort) => set({ sortBy: sort}),
        
        setPriceRange: (min, max) => set({ priceRange: { min: min, max: max }}),
        
        /**
         * Toggle Category Filter
         * 
         * Complex state update - needs current state to check if category exists.
         * 
         * Logic:
         * 1. Check if category is already in selectedCategories array
         * 2. If yes: Remove it using filter() (deselect)
         * 3. If no: Add it using spread operator (select)
         * 
         * The filter() method:
         * - Takes a function that returns true/false for each item
         * - Keeps items where function returns true
         * - Removes items where function returns false
         * - (c) => c !== category means "keep all items except this category"
         */
        toggleCategory: (category) => set((state) => ({
          selectedCategories: state.selectedCategories.includes(category)
          ? state.selectedCategories.filter((c) => c !== category)
          : [...state.selectedCategories, category]
        })),
        
        setCategories: (categories) => set({ selectedCategories: categories }),
        
        toggleBrand: (brand) => set((state) => ({
          selectedBrands: state.selectedBrands.includes(brand)
          ? state.selectedBrands.filter((b) => b !== brand)
          : [...state.selectedBrands, brand]
        })),
        
        setBrands: (brands) => set({ selectedBrands: brands }),
        
        setInStockOnly: (enabled) => set({ inStockOnly: enabled }),
        
        setOnSaleOnly: (enabled) => set({ onSaleOnly: enabled }),
        
        setViewMode: (mode) => set({ viewMode: mode }),
        
        resetFilters: () => set(defaultState),
      }),
      {
        name: 'powerproshop-filters', // localStorage key
      }
    )
  )
)


/**
 * CONVENIENCE HOOKS
 * helper hooks that make the store easier to use
 * convenience wrappers around the store selectors
 * 
 * Instead of:
 * const sortBy = useFilterStore(state => state.sortBy)
 * 
 * You can write:
 * const sortBy = useSortBy()
 */
export const useSortBy = () => useFilterStore((state) => state.sortBy);

export const usePriceRange = () => useFilterStore((state) => state.priceRange);

export const useSelectedCategories = () => useFilterStore((state) => state.selectedCategories);

export const useActiveFilterCount = () => useFilterStore((state) => {
  let count = 0
  if (state.selectedCategories.length > 0) count++
  if (state.selectedBrands.length > 0) count++
  if (state.priceRange.min > 0 || state.priceRange.max < 5000) count++
  if (state.inStockOnly) count++
  if (state.onSaleOnly) count++
  return count
})