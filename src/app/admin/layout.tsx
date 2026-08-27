'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar, MobileMenuButton } from '@/components/admin/sidebar'
import { SidebarProvider, useSidebar } from '@/components/admin/sidebar-context'
import { clearSession, hasValidSession } from '@/lib/admin-session'
import { cn } from '@/lib/utils'

const publicPaths = ['/admin/login', '/admin/register']

function AdminMain({ children }: { children: React.ReactNode }) {
  const { collapsed, isMobile } = useSidebar()
  return (
    <main className={cn(
      'flex-1 min-h-screen bg-muted/30 transition-all duration-200',
      isMobile ? 'ml-0' : collapsed ? 'ml-[60px]' : 'ml-[220px]'
    )}>
      {children}
    </main>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const isPublicPage = publicPaths.includes(pathname)

  useEffect(() => {
    // On teste la VALIDITÉ du jeton, pas sa simple présence : un jeton expiré
    // reste dans localStorage et faisait passer l'admin pour connectée alors
    // que le serveur refusait déjà toutes ses requêtes (401).
    const valid = hasValidSession()

    // Session morte : on la purge tout de suite. C'est ce qui casse le
    // ping-pong page protégée → /admin/login → tableau de bord, qui ramenait
    // l'admin au tableau de bord sans jamais lui montrer ses données.
    if (!valid) clearSession()

    if (isPublicPage) {
      if (valid) {
        router.replace('/admin/dashboard')
        return
      }
      setLoading(false)
      return
    }

    if (!valid) {
      router.replace('/admin/login?expired=1')
      return
    }

    setAuthenticated(true)
    setLoading(false)
  }, [router, isPublicPage])

  if (loading) return null
  if (isPublicPage) return children
  if (!authenticated) return null

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <MobileMenuButton />
        <AdminMain>{children}</AdminMain>
      </div>
    </SidebarProvider>
  )
}
