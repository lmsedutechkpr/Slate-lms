'use client'
import { AlertCircle } from 'lucide-react'

export function FieldError({
  error
}: {
  error?: string
}) {
  if (!error) return null
  
  return (
    <div className="flex items-center gap-1.5 mt-1.5
                     animate-in slide-in-from-top-1
                     fade-in duration-200">
      <AlertCircle className="w-3.5 h-3.5 text-red-500
                               flex-shrink-0" />
      <p className="text-red-500 text-xs leading-tight">
        {error}
      </p>
    </div>
  )
}
