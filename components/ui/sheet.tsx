import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"

export const Sheet = DrawerPrimitive.Root
export const SheetTrigger = DrawerPrimitive.Trigger
export const SheetClose = DrawerPrimitive.Close

const SheetPortal = DrawerPrimitive.Portal
const SheetOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-black/40", className)}
      {...props}
    />
  )
)
SheetOverlay.displayName = "SheetOverlay"

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  side?: "right" | "left" | "bottom" | "top"
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ className, side = "right", children, ...props }, ref) => {
    const sideClasses =
      side === "right"
        ? "inset-y-0 right-0 w-3/4 max-w-sm"
        : side === "left"
        ? "inset-y-0 left-0 w-3/4 max-w-sm"
        : side === "bottom"
        ? "inset-x-0 bottom-0 h-1/2 max-h-[85vh]"
        : "inset-x-0 top-0 h-1/2 max-h-[85vh]"

    return (
      <SheetPortal>
        <SheetOverlay />
        <DrawerPrimitive.Content
          ref={ref}
          className={cn(
            "fixed z-50 bg-white p-6 shadow-lg outline-none",
            sideClasses,
            className
          )}
          {...props}
        >
          {children}
        </DrawerPrimitive.Content>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = "SheetContent"

