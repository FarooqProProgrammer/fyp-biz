import "@fontsource/poppins";
import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react"



export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <Component {...pageProps} />
        <Toaster />
      </Provider>
    </SessionProvider>
  );
}
