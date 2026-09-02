import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Keeps the Supabase session cookie fresh and guards the whole app.
 *
 * Named proxy, not middleware: the middleware file convention is deprecated
 * in Next 16 and warns on every build.
 *
 * The board itself is gated, not just /admin. That is what lets Vercel
 * Deployment Protection stay off: the URL is public, but nothing renders
 * without a Supabase session, so access is controlled by accounts you create
 * rather than by Vercel team seats. Anyone you want to give access to gets an
 * account; they do not need a Vercel login.
 *
 * Only the JWT is checked here — whether that user is an allowed admin is
 * decided in /admin itself, which can reach the database.
 */
const PUBLIC_PATHS = ["/admin/login", "/admin/setup"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refreshes the token when it has expired. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except:
     *  - /api/sheets   the Google Sheets webhook, which carries its own secret
     *                  and is called by a server that can never hold a session
     *  - Next internals and static files
     */
    "/((?!api/sheets|_next/static|_next/image|favicon.ico|logo\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
