import SmallStatButton from '@/components/ui/SmallStatButton'
import type { LeaderboardResponse } from '@/types/api'
import { ChevronDown, Loader } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingExplore, setIsLoadingExplore] = useState(false)
    const router = useRouter()
    
    const { data, error } = useSWR<LeaderboardResponse>(
        'https://api.trackify.am/wrapped/leaderboard',
        fetcher
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
            <div className="h-screen flex flex-col items-center justify-center px-4 relative">
                <div className="text-center mb-8 sm:mb-12 animate-fade-in">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-transparent bg-clip-text tracking-tight">
                        wrapped leaderboard
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
                    className="px-8 sm:px-10 py-4 sm:py-5 bg-[#1db954] text-lg sm:text-xl font-bold rounded-2xl hover:bg-[#1db954]/90 transition-all text-center border-2 border-[#1db954] [box-shadow:0_4px_0_0_rgb(22_163_74)] hover:translate-y-[4px] hover:shadow-none animate-bounce-slow"
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
        </div>
    )
}
