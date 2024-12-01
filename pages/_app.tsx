import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Gaegu } from 'next/font/google';

const gaegu = Gaegu({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-gaegu',
})

export default function App({ Component, pageProps }: AppProps) {
    return (
        <div className={`min-h-screen ${gaegu.className}`}>
            <Component {...pageProps} />
        </div>
    );
}
