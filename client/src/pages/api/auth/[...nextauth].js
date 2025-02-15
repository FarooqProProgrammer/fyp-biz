import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { token, user } = credentials;

        let parseUser = JSON.parse(user);

        if (user && token) {
          return parseUser;
        }

        return null;
      },
    }),
  ],

  pages: {
    signIn: "/auth/login", // Custom sign-in page path
  },
};

export default NextAuth(authOptions);
