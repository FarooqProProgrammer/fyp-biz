import "@fontsource/poppins";
import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <Toaster />
    </Provider>
  );
}
