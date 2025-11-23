"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SheetContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextValue>({
  isOpen: false,
  setIsOpen: () => {},
})

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Sheet = ({ children, open, onOpenChange }: SheetProps) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  const handleSetIsOpen = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen: handleSetIsOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, asChild, ...props }, ref) => {
    const { setIsOpen } = React.useContext(SheetContext)

    if (asChild && React.isValidElement(children)) {
      const childProps = (children as React.ReactElement<any>).props
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        onClick: (e: React.MouseEvent) => {
          setIsOpen(true)
          childProps.onClick?.(e)
        },
      })
    }

    return (
      <button ref={ref} onClick={() => setIsOpen(true)} {...props}>
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left"
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SheetContext)

    const sideClasses = {
      top: "inset-x-0 top-0 border-b",
      bottom: "inset-x-0 bottom-0 border-t",
      left: "inset-y-0 left-0 h-full border-r",
      right: "inset-y-0 right-0 h-full border-l",
    }

    const animationClasses = {
      top: isOpen ? "animate-slide-in-from-top" : "animate-slide-out-to-top",
      bottom: isOpen ? "animate-slide-in-from-bottom" : "animate-slide-out-to-bottom",
      left: isOpen ? "animate-slide-in-from-left" : "animate-slide-out-to-left",
      right: isOpen ? "animate-slide-in-from-right" : "animate-slide-out-to-right",
    }

    if (!isOpen) return null

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-50 bg-black/80 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Content */}
        <div
          ref={ref}
          className={cn(
            "fixed z-50 gap-4 bg-white p-6 shadow-lg transition-transform duration-300",
            sideClasses[side],
            animationClasses[side],
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </>
    )
  }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold text-gray-900", className)}
    {...props}
  />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}

