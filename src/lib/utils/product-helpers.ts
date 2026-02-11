type ProductPricing = {
  isOnSale: boolean
  displayPrice: number
  savingsPercent: number
}

export function calculateProductPricing(price: number, salePrice: number | null): ProductPricing {
// Calculate isOnSale
const isOnSale = (salePrice == null ? false : true);

// Calculate displayPrice
const displayPrice = salePrice ?? price;

// Calculate savingsPercent (optional)
const savingsPercent = salePrice ? ((price - salePrice) / price) * 100 : 0;

// Return object with all values }
return { isOnSale, displayPrice, savingsPercent }
}