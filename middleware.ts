import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes (accessible to everyone)
const isPublicRoute = createRouteMatcher([
  '/',
  '/hotels(.*)',
  '/hotel/(.*)',
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/otp(.*)',
  '/sso-callback(.*)',
  '/api/webhooks/clerk(.*)',
]);

// Define auth routes (should redirect if logged in)
//(.*) is a wildcard for any character
const isAuthRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/forgot-password(.*)',
  '/otp(.*)',
]);


// ✅ ADD THESE - Role-based route matchers
const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)']);
const isManagerRoute = createRouteMatcher(['/dashboard/manager(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;
  const userRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role;

  // If user is logged in and trying to access auth routes, redirect based on role
  if (userId && isAuthRoute(req)) {
    console.log('sessionClaims', sessionClaims)

    // Redirect admin to admin dashboard
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url));
    }

    // Redirect manager to manager dashboard
    if (userRole === 'manager') {
      return NextResponse.redirect(new URL('/dashboard/manager', req.url));
    }

    // Regular users go to home
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!userId && !isPublicRoute(req)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auto-redirect admin to dashboard when visiting homepage
  if (userId && pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url));
    }

    if (userRole === 'manager') {
      return NextResponse.redirect(new URL('/dashboard/manager', req.url));
    }
  }
  // ✅ Admin route protection
  if (userId && isAdminRoute(req)) {
    if (userRole !== 'admin') {
      console.log(`${userRole} trying to access admin route, redirecting...`);

      // Redirect to appropriate dashboard based on role
      if (userRole === 'manager') {
        return NextResponse.redirect(new URL('/dashboard/manager', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // ✅ Manager route protection
  if (userId && isManagerRoute(req)) {
    if (userRole !== 'manager') {
      console.log(`${userRole} trying to access manager route, redirecting...`);

      // Redirect to appropriate dashboard based on role
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url));
      }
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};