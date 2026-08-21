import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-md border border-tinta/15 bg-porcelana px-4 text-sm text-tinta transition-colors placeholder:text-neutro focus-visible:border-cacau focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cacau/20 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
