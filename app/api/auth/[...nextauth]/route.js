import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/db/connectDB';
import User from '@/models/Users';
import bcrypt from 'bcryptjs';

const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        await connectDB();
        console.log("connected")
        const user = await User.findOne({ email: credentials.email });
        console.log("hello",user);
        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.is_admin ? 'admin' : 'user'
          };
        } else {
          return null; // Return null if user is not found or password doesn't match
        }
      }
    })
  ],
  // Use JWT for session management
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: Add custom callbacks for more control
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.username = token.username;
      return session;
    }
  },
  pages: {
    signIn: '/login' // Set the custom sign-in page
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };