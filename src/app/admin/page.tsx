'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { clearSession, hasValidSession } from '@/lib/admin-session'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Validité, pas simple présence : un jeton périmé ne doit pas ouvrir le
    // tableau de bord, sinon on retombe dans le va-et-vient d'origine.
    const valide = hasValidSession()
    if (!valide) clearSession()
    router.replace(valide ? '/admin/dashboard' : '/admin/login')
  }, [router])

  return null
}
