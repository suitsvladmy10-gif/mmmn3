import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Публичные маршруты
        if (pathname === "/login" || pathname === "/register") {
          return !token; // Разрешить доступ только если не авторизован
        }
        
        // Защищенные маршруты
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/transactions/:path*", "/upload/:path*", "/login", "/register"],
};
