import SmallStatButton from '@/components/ui/SmallStatButton'
import type { LeaderboardResponse } from '@/types/api'
import { ChevronDown, Loader } from 'lucide-react'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const WRAPPED_RELEASE_DATE = new Date('2024-12-04T12:00:00Z')

function useCountdown() {
    const [timeLeft, setTimeLeft] = useState<{hours: number, minutes: number, seconds: number} | null>(null)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const difference = WRAPPED_RELEASE_DATE.getTime() - now.getTime()

            if (difference <= 0) {
                setTimeLeft(null)
                return
            }

            const hours = Math.floor(difference / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({ hours, minutes, seconds })
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [])

    return timeLeft
}

export default function Home() {
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingExplore, setIsLoadingExplore] = useState(false)
    const router = useRouter()
    const timeLeft = useCountdown()
    
    const { data, error } = useSWR<LeaderboardResponse>(
        'https://api.trackify.am/wrapped/leaderboard',
        fetcher
    )

    if (timeLeft !== null) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
                <div className="h-screen flex flex-col items-center justify-center px-4">
                    <div className="text-center mb-8 animate-fade-in">
                        <h1 className="text-4xl sm:text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text tracking-tight">
                            spotify wrapped leaderboard 2024
                        </h1>
                        <p className="text-zinc-400 text-lg sm:text-2xl mb-8 sm:mb-12">
                            coming soon
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center text-3xl sm:text-6xl font-bold text-green-400">
                            <div className="flex gap-4">
                                <div className="flex-1 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-zinc-800 min-w-[100px] sm:min-w-[160px]">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                    <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1 sm:mt-2">hours</div>
                                </div>
                                <div className="flex-1 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-zinc-800 min-w-[100px] sm:min-w-[160px]">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                    <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1 sm:mt-2">minutes</div>
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-zinc-800 min-w-[100px] sm:min-w-[160px] sm:w-[160px]">
                                {String(timeLeft.seconds).padStart(2, '0')}
                                <div className="text-xs sm:text-sm text-zinc-400 font-normal mt-1 sm:mt-2">seconds</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Wrapped 2024 Leaderboard</title>
                <meta name="description" content="See where you rank among other Spotify users with the Wrapped 2024 Leaderboard." />

                <meta property="og:url" content="https://wrapped.trackify.am" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Wrapped 2024 Leaderboard" />
                <meta property="og:description" content="See where you rank among other Spotify users with the Wrapped 2024 Leaderboard." />
                <meta property="og:image" content="https://wrapped.trackify.am/leaderboard-preview.png" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta property="twitter:domain" content="wrapped.trackify.am" />
                <meta property="twitter:url" content="https://wrapped.trackify.am" />
                <meta name="twitter:title" content="Wrapped 2024 Leaderboard" />
                <meta name="twitter:description" content="See where you rank among other Spotify users with the Wrapped 2024 Leaderboard." />
                <meta name="twitter:image" content="https://wrapped.trackify.am/leaderboard-preview.png" />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
                <div className="h-screen flex flex-col items-center justify-center px-4 relative">
                    <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text tracking-tight">
                            spotify wrapped leaderboard
                        </h1>

                        <p className="text-zinc-400 text-base sm:text-lg mb-6 sm:mb-8">
                            upload your spotify wrapped to get your rank
                        </p>
                    </div>

                    <SmallStatButton
                        theme="green"
                        onPress={() => {
                            setIsLoading(true)
                            router.push('/upload')
                        }}
                        className="px-8 sm:px-10 py-4 sm:py-5 bg-[#1db954] text-lg sm:text-xl font-bold rounded-2xl hover:bg-[#1db954]/90 transition-all text-center border-2 border-[#1db954] [box-shadow:0_4px_0_0_rgb(22_163_74)] hover:translate-y-[4px] hover:shadow-none"
                    >
                        {isLoading ? (
                            <Loader className="animate-spin mx-auto" />
                        ) : (
                            "Get Your Rank"
                        )}
                    </SmallStatButton>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-75 hover:opacity-100 transition-opacity cursor-pointer">
                        <p className="text-zinc-400 mb-2 text-lg font-medium">View Leaderboard</p>
                        <ChevronDown className="w-7 h-7 text-zinc-400 animate-bounce" />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl p-6 sm:p-10 mb-10 border-2 border-zinc-800 [box-shadow:0_4px_0_0_#27272a] translate-y-0">
                        {error && (
                            <div className="text-center p-12">
                                <p className="text-red-400 text-xl">Failed to load leaderboard</p>
                            </div>
                        )}
                        
                        {!data && !error && (
                            <div className="flex justify-center p-12">
                                <Loader className="animate-spin w-10 h-10 text-green-400" />
                            </div>
                        )}
                        
                        {data && (
                            <div className="space-y-5">
                                {data.data.slice(0, 100).map((entry, index) => (
                                    <div 
                                        key={entry.user.spotify_id} 
                                        className="bg-zinc-800/50 rounded-2xl border-2 border-zinc-700 [box-shadow:0_4px_0_0_#374151] p-5 hover:bg-zinc-800/70 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                                            <div className="flex items-center gap-5 flex-1">
                                                <div className="text-3xl font-bold text-green-400 w-10">
                                                    #{index + 1}
                                                </div>
                                                <div className="relative h-16 w-16 rounded-xl overflow-hidden border-2 border-zinc-600">
                                                    <Image
                                                        src={entry.user.profile_picture_url}
                                                        alt={entry.user.display_name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-xl mb-1">{entry.user.display_name}</div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-400">
                                                        <span className="text-green-400 font-medium">
                                                            {entry.minutes_listened.toLocaleString()} minutes
                                                        </span>
                                                        <span>{entry.top_genre}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={`/wrapped/${entry.user.spotify_id}`}
                                                className="px-8 py-3 bg-zinc-700/50 text-base font-bold rounded-xl hover:bg-zinc-700 transition-all text-center border-2 border-zinc-600 w-full sm:w-auto [box-shadow:0_4px_0_0_#374151] hover:translate-y-[4px] hover:shadow-none"
                                            >
                                                View Wrapped
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            setIsLoadingExplore(true)
                            router.push('/leaderboard/explore')
                        }}
                        className="w-full px-10 py-5 bg-zinc-800 text-xl font-bold rounded-2xl hover:bg-zinc-700 transition-all text-center border-2 border-zinc-700 [box-shadow:0_4px_0_0_#374151] hover:translate-y-[4px] hover:shadow-none"
                    >
                        {isLoadingExplore ? (
                            <Loader className="animate-spin mx-auto" />
                        ) : (
                            "🌎 Explore Other Leaderboards"
                        )}
                    </button>
                </div>

                <footer className="border-t border-zinc-800 mt-12">
                    <div className="max-w-6xl mx-auto px-4 py-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-400">
                            <div className="flex gap-4">
                                <a 
                                    href="https://github.com/carter-0/wrapped-leaderboard" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors"
                                >
                                    GitHub
                                </a>
                                <a 
                                    href="https://trackify.am/terms-of-service" 
                                    className="hover:text-white transition-colors"
                                >
                                    Terms of Service
                                </a>
                                <a 
                                    href="https://trackify.am/privacy-policy" 
                                    className="hover:text-white transition-colors"
                                >
                                    Privacy Policy
                                </a>
                            </div>
                            <div className="text-sm">
                                © 2024 Carter Annandale
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}
