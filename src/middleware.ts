import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Protected route groups
  const protectedPaths = ['/dashboard', '/instructor', '/seller', '/admin']
  const isProtected = protectedPaths.some(p => path.startsWith(p))

  // Redirect unauthenticated users
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role + approval checks for authenticated users
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.redirect(new URL('/login', request.url))

    const { role, approval_status } = profile

    // Pending approval → redirect instructors/sellers to waiting page
    if (
      approval_status === 'pending' &&
      (path.startsWith('/instructor') || path.startsWith('/seller'))
    ) {
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }

    // Role-based access control
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/instructor') && role !== 'instructor' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (path.startsWith('/seller') && role !== 'vendor' && role !== 'seller' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (path === '/login' || path === '/signup')) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    
    // Fallback role mapping
    const fallbackRole = profile?.role === 'vendor' ? 'seller' : profile?.role;
    
    const redirectMap: Record<string, string> = {
      admin: '/admin/dashboard',
      instructor: '/instructor/dashboard',
      seller: '/seller',
      student: '/dashboard',
    }
    return NextResponse.redirect(
      new URL(redirectMap[fallbackRole || 'student'], request.url)
    )
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
