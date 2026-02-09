'use client'

import Link from 'next/link'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { MegaMenuShop } from './mega-menu-shop'
import { MegaMenuServices } from './mega-menu-services'
import { NavItem } from './nav-item'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartItemCount = 3 // TODO: Replace with Zustand

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
              
              {/* Shop - With Mega Menu */}
              <div className="group relative">
                {/* Nav item with higher z-index so underline appears above mega menu */}
                <div className="relative z-20">
                  <NavItem href="/products">Shop</NavItem>
                </div>
                
                {/* Mega Menu - lower z-index, positioned absolutely from viewport edge */}
                <div className="fixed left-0 right-0 top-[64px] z-10">
                  <MegaMenuShop />
                </div>
              </div>

              {/* Services - With Mega Menu */}
              <div className="group relative">
                {/* Nav item with higher z-index so underline appears above mega menu */}
                <div className="relative z-20">
                  <NavItem href="/services">Services</NavItem>
                </div>
                
                {/* Mega Menu - lower z-index, positioned absolutely from viewport edge */}
                <div className="fixed left-0 right-0 top-[64px] z-10">
                  <MegaMenuServices />
                </div>
              </div>

              {/* Contact */}
              <div className="group relative">
                <div className="relative z-20">
                  <NavItem href="/contact">Contact</NavItem>
                </div>
                {/* No mega menu, but same wrapper structure */}
              </div>           

            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 z-10">
              
              {/* Search */}
              <button
                className="text-foreground hover:text-accent transition-colors"
                aria-label="Search"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* User Account */}
              <Link
                href="/login"
                className="hidden sm:block text-foreground hover:text-accent transition-colors"
                aria-label="Account"
              >
                <User className="h-6 w-6" />
              </Link>

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
              <Link
                href="/login"
                className="text-foreground hover:text-accent font-medium sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}