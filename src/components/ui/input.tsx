import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-14 w-full rounded-xl border border-tinta/15 bg-porcelana px-5 text-base text-tinta transition-colors placeholder:text-neutro focus-visible:border-cacau focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cacau/20 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
