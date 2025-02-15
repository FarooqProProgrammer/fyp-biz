import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

// Protect specific pages
export const config = {
  matcher: ["/dashboard"], // Add more protected routes if needed
};
