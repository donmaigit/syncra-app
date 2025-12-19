import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

// i18n for landing + app pages that live under /[locale]/...
const intlMiddleware = createMiddleware({
  locales: ["ja", "en"],
  defaultLocale: "ja",
  localePrefix: "as-needed",
});

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  let hostname = req.headers.get("host") || "";
  hostname = hostname.split(":")[0].toLowerCase();

  // Skip API + Next static + files
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes(".") ||
    path === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const APP_DOMAIN = "app.syncra.jp";
  const SITE_DOMAIN = "syncra.page";

  // Avoid treating these as user sites
  const RESERVED_SITES = new Set(["www", "app", "api", "admin"]);

  // Affiliate cookie helper
  const refCode = url.searchParams.get("ref");
  const handleResponse = (res: NextResponse) => {
    if (refCode) {
      res.cookies.set("syncra_affiliate", refCode, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return res;
  };

  // ---------------------------------------------------------
  // A) App domain (real app + dashboard)
  // ---------------------------------------------------------
  if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}` || hostname === "localhost") {
    const isProtected = /^\/(en|ja)?\/?dashboard/.test(path);
    if (isProtected) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!token) return NextResponse.redirect(new URL("/login", req.url));
    }
    return handleResponse(intlMiddleware(req));
  }

  // ---------------------------------------------------------
  // B) Apex site domain (syncra.page)
  // This should show your landing page in app/[locale]/page.tsx,
  // not /sites/syncra.page (which would be treated as a custom domain).
  // ---------------------------------------------------------
  if (hostname === SITE_DOMAIN || hostname === `www.${SITE_DOMAIN}`) {
    return handleResponse(intlMiddleware(req));
  }

  // ---------------------------------------------------------
  // C) User sites (abc.syncra.page) -> /sites/abc/...
  // ---------------------------------------------------------
  if (hostname.endsWith(`.${SITE_DOMAIN}`)) {
    const site = hostname.slice(0, -(`.${SITE_DOMAIN}`).length);

    if (!site || RESERVED_SITES.has(site)) {
      // safest: show landing rather than letting it fall through
      return handleResponse(intlMiddleware(req));
    }

    return handleResponse(
      NextResponse.rewrite(new URL(`/sites/${site}${path}`, req.url))
    );
  }

  // ---------------------------------------------------------
  // D) Custom domains (brand.com) -> /sites/brand.com/...
  // ---------------------------------------------------------
  return handleResponse(
    NextResponse.rewrite(new URL(`/sites/${hostname}${path}`, req.url))
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
