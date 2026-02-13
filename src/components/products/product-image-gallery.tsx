'use client'

import { useState } from 'react'
import Image from 'next/image'

type ProductImageGalleryProps = {
  images: string[] | null
  productName: string  // For alt text
}

export function ProductImageGallery({ 
  images, 
  productName 
}: ProductImageGalleryProps) {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  
  // Track which image is currently displayed
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // ========================================
  // EDGE CASE HANDLING
  // ========================================
  
  // Handle null or empty images
  const imageArray = images && images.length > 0 
    ? images 
    : ['/placeholder-product.jpg']  // Fallback
  
  // Get current image URL
  const currentImage = imageArray[selectedImageIndex]
  
  // Only show thumbnails if we have more than 1 image
  const showThumbnails = imageArray.length > 1
  
  // ========================================
  // RENDER
  // ========================================
  
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      
      {/* THUMBNAILS - Desktop Only (Left Side) */}
      {showThumbnails && (
        <div className="hidden lg:flex lg:flex-col gap-2 order-1">
          {imageArray.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`
                relative w-20 h-20 border-2 rounded-md overflow-hidden
                transition-all duration-200
                ${index === selectedImageIndex 
                  ? 'border-primary ring-2 ring-primary' 
                  : 'border-border hover:border-accent'
                }
              `}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* MAIN IMAGE (Center/Right) */}
      <div className="flex-1 order-2">
        <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
          <Image
            src={currentImage}
            alt={productName}
            fill
            className="object-cover"
            priority  // Load main image first
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
          />
        </div>
        
        {/* IMAGE INDICATORS - Mobile Only (Dots Below) */}
        {showThumbnails && (
          <div className="flex lg:hidden justify-center gap-2 mt-4">
            {imageArray.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${index === selectedImageIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-muted-foreground/30'
                  }
                `}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}