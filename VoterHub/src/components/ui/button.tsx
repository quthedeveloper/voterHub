import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import "./button.css"

const buttonVariants = cva("ui-btn", {
  variants: {
    variant: {
      default: "ui-btn-default",
      destructive: "ui-btn-destructive",
      outline: "ui-btn-outline",
      secondary: "ui-btn-secondary",
      ghost: "ui-btn-ghost",
      link: "ui-btn-link",
    },
    size: {
      default: "ui-btn-size-default",
      sm: "ui-btn-size-sm",
      lg: "ui-btn-size-lg",
      icon: "ui-btn-size-icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
