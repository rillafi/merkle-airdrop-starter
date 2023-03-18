import "styles/global.scss"; // Global styles
import StateProvider from "state"; // Global state provider
import type { AppProps } from "next/app"; // Types
import Error from "next/error";

// Export application
export default function MerkleAirdropStarter({
  Component,
  pageProps,
}: AppProps) {
    // if (Date.now() / 1000 < 1678896000) {
    //     return <Error statusCode={404} />
    // }

  return (
    // Wrap application in global state provider
    <StateProvider>
      <Component {...pageProps} />
    </StateProvider>
  );
}
