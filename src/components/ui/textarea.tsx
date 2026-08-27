import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-36 w-full rounded-xl border border-tinta/15 bg-porcelana px-5 py-4 text-base text-tinta transition-colors placeholder:text-neutro focus-visible:border-cacau focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cacau/20 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
