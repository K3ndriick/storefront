'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFilterStore } from '@/store/useFilterStore';
import type { ProductSortOption } from '@/lib/types/products';

 // Sort Options Configuration
 // This array defines what shows in the dropdown.
 // - value: The internal value (stored in Zustand)
 // - label: What the user sees in the dropdown
const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
]

/**
 * 🎯 TODO: Complete the ProductSort component
 * 
 * Steps:
 * 1. Get the current sortBy value from the store
 * 2. Get the setSortBy action from the store
 * 3. Wire them to the Select component
 * 
 * Hints:
 * - Use useFilterStore with a selector
 * - Remember the pattern: useFilterStore(state => state.something)
 * - Select needs: value, onValueChange props
 */
export function ProductSort() {
  // 🎯 TODO 1: Get current sortBy value from Zustand store
  // Hint: const sortBy = useFilterStore(???)
  const sortBy = useFilterStore(state => state.sortBy);
  
  // 🎯 TODO 2: Get setSortBy action from Zustand store
  // Hint: const setSortBy = useFilterStore(???)
  const setSortBy = useFilterStore(state => state.setSortBy);

  return (
    <div className="flex items-center gap-2">
      {/* Label */}
      <label 
        htmlFor="sort-select" 
        className="text-sm font-medium text-foreground whitespace-nowrap"
      >
        Sort by:
      </label>
      
      {/* 
        // Wire up the Select component
        // casting the value: (value) => setSortBy(value as ProductSortOption)
        // onValueChange gives new value as a param that needs to be passed to setSortBy(), and specified as ProductSortOption typescript type
      */}
      <Select
        value={sortBy}
        onValueChange={(value) => setSortBy(value as ProductSortOption)}
      >
        <SelectTrigger 
          id="sort-select"
          className="w-[200px]"
        >
          <SelectValue placeholder="Select sort order" />
        </SelectTrigger>
        
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/**
 * ============================================================================
 * UNDERSTANDING THIS COMPONENT
 * ============================================================================
 * 
 * 1. WHY 'use client'?
 *    - This component needs interactivity (dropdown, clicks)
 *    - Server Components can't have interactivity
 *    - 'use client' tells Next.js to run this in the browser
 * 
 * 2. HOW DOES THE SELECT WORK?
 *    - value: Shows what's currently selected
 *    - onValueChange: Called when user picks something new
 *    - SelectItems: The options in the dropdown
 * 
 * 3. TYPE SAFETY:
 *    - ProductSortOption ensures only valid values
 *    - TypeScript won't let you set invalid sort options
 *    - Type casting (as ProductSortOption) tells TS what type the value is
 * 
 * 4. DATA FLOW:
 *    Store → Component → UI → User Clicks → onValueChange → Store → Component
 *    (This creates a "reactive" loop - UI always matches store!)
 * 
 * ============================================================================
 * 
 * // If you only need the VALUE:
 * const sortBy = useSortBy()  // Shorter, cleaner
 * 
 * // If you need VALUE + ACTION:
 * const sortBy = useFilterStore(state => state.sortBy)
 * const setSortBy = useFilterStore(state => state.setSortBy)
 * 
 * // Or get both at once:
 * const { sortBy, setSortBy } = useFilterStore()  // Works, but re-renders on ANY change
 */