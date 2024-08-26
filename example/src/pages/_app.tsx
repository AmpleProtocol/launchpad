import "@near-wallet-selector/modal-ui/styles.css";
import "../styles/global.css"
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
