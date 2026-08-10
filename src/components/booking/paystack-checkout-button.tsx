'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PaystackCheckoutButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Preparing secure checkout…
        </>
      ) : (
        <>
          <LockKeyhole className="size-4" /> Pay securely with MoMo or card
        </>
      )}
    </Button>
  )
}
