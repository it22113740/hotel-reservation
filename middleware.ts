import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes (accessible to everyone)
const isPublicRoute = createRouteMatcher([
  '/',
  '/hotels(.*)',
  '/hotel/(.*)',
  '/partner-hotel(.*)',
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

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // If user is logged in and trying to access auth routes, redirect to home
  if (userId && isAuthRoute(req)) {
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  // If user is not logged in and trying to access protected routes, redirect to login
  if (!userId && !isPublicRoute(req)) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect_url', pathname);
    return NextResponse.redirect(loginUrl);
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