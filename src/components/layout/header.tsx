'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { UserMenu } from '@/components/auth/user-menu';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MegaMenuShop } from './mega-menu-shop';
import { MegaMenuServices } from './mega-menu-services';
import { NavItem } from './nav-item';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/lib/auth/auth-context';
import { searchProducts } from '@/lib/actions/products';
import type { Product } from '@/lib/types/products';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen]         = useState(false)
  const [searchQuery, setSearchQuery]       = useState('')
  const [results, setResults]               = useState<Product[]>([])
  const [searching, setSearching]           = useState(false)

  const searchInputRef  = useRef<HTMLInputElement>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  const cartItemCount = useCartStore(state => state.itemCount());
  const { role } = useAuth();
  const router = useRouter()

  // Debounced search - fires 300ms after the user stops typing
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) { setResults([]); return }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await searchProducts(q)
        setResults(data.slice(0, 6))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close dropdown when clicking outside the search wrapper
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    if (searchOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 0)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
    setResults([])
  }

  function handleSearchSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    closeSearch()
    router.push(`/products?search=${encodeURIComponent(q)}`)
  }

  return (
    <>
      {/* Main Header - NO transparency, solid background */}
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center z-10">
              <span className="text-xl font-bold text-foreground">
                PowerProShop
              </span>
            </Link>

            {/* Desktop Navigation with Mega Menus */}
            <nav className="hidden md:flex items-center space-x-12">

              {/* Admin - No Mega Menu */}
              {role === "admin" && (
                <div className="relative">
                  <NavItem href="/admin">Admin</NavItem>
                </div>
              )}

              {/* Shop - With Mega Menu */}
              <div className="group relative">
                <div className="relative z-20">
                  <NavItem href="/products">Shop</NavItem>
                </div>
                <div className="fixed left-0 right-0 top-[64px] z-10">
                  <MegaMenuShop />
                </div>
              </div>

              {/* Services - With Mega Menu */}
              <div className="group relative">
                <div className="relative z-20">
                  <NavItem href="/services">Services</NavItem>
                </div>
                <div className="fixed left-0 right-0 top-[64px] z-10">
                  <MegaMenuServices />
                </div>
              </div>

              {/* Contact */}
              <div className="group relative">
                <div className="relative z-20">
                  <NavItem href="/contact">Contact</NavItem>
                </div>
              </div>

            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 z-10">

              {/* Search */}
              {searchOpen ? (
                <div ref={searchWrapperRef} className="relative">
                  <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                      placeholder="Search products..."
                      className="w-56 border-b border-foreground bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <button type="submit" aria-label="Submit search" className="text-foreground hover:text-accent transition-colors">
                      <Search className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={closeSearch} aria-label="Close search" className="text-foreground hover:text-accent transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </form>

                  {/* Dropdown */}
                  {(results.length > 0 || searching) && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-background border shadow-lg z-50">
                      {searching && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">Searching...</p>
                      )}
                      {!searching && results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={closeSearch}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                        >
                          {product.primary_image ? (
                            <Image
                              src={product.primary_image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 object-cover rounded-none shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.sale_price
                                ? `$${product.sale_price.toFixed(2)}`
                                : `$${product.price.toFixed(2)}`}
                            </p>
                          </div>
                        </Link>
                      ))}
                      {!searching && results.length > 0 && (
                        <Link
                          href={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={closeSearch}
                          className="block px-4 py-3 text-sm text-accent border-t hover:bg-muted transition-colors"
                        >
                          View all results for &ldquo;{searchQuery.trim()}&rdquo;
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openSearch}
                  className="text-foreground hover:text-accent transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-6 w-6" />
                </button>
              )}

              {/* User Account */}
              <div className="hidden sm:flex sm:items-center">
                <UserMenu />
              </div>

              {/* Cart with Badge */}
              <Link
                href="/cart"
                className="relative text-foreground hover:text-accent transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {role === "admin" && (
              <Link
                href="/admin"
                className="text-foreground hover:text-accent font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
              )}

              <Link
                href="/products"
                className="text-foreground hover:text-accent font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/services"
                className="text-foreground hover:text-accent font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:text-accent font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="sm:hidden">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
