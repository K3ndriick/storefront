// Barrel file - re-export all types from a single entry point.
// Consumers can import from '@/lib/types' instead of '@/lib/types/products' etc.
// Existing imports that use the full path still work - this is additive only.

export * from './products'
export * from './cart'
export * from './auth'
export * from './order'
export * from './address'
export * from './admin'
export * from './review'
export * from './inventory'
export * from './appointment'