'use client'

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  images: string[]
  hotelName: string
}

const ImageGallery = ({ images, hotelName }: ImageGalleryProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-xl overflow-hidden">
        {/* Main Image */}
        <div 
          className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => openModal(0)}
        >
          <Image
            src={images[0] || "/images/hotel1.png"}
            alt={`${hotelName} - Main view`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Secondary Images */}
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className="col-span-2 md:col-span-1 relative cursor-pointer group"
            onClick={() => openModal(index + 1)}
          >
            <Image
              src={image}
              alt={`${hotelName} - View ${index + 2}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        ))}

        {/* View All Photos Button */}
        <Button
          variant="outline"
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-100"
          onClick={() => openModal(0)}
        >
          <Grid3x3 className="w-4 h-4 mr-2" />
          View all {images.length} photos
        </Button>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          <button
            onClick={previousImage}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          {/* Current Image */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] mx-auto">
            <Image
              src={images[currentImageIndex]}
              alt={`${hotelName} - View ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery

