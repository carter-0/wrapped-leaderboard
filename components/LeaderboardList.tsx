import { Loader } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

interface User {
    spotify_id: string
    display_name: string
    profile_picture_url: string
    image_url: string
}

interface LeaderboardEntry {
    user: User
    minutes_listened: number
    top_genre: string
    nickname: string
    diversity: number
}

interface LeaderboardListProps {
    data?: LeaderboardEntry[]
    error?: any
    title: string
    subtitle?: string
    isLoading?: boolean
    isReachingEnd?: boolean
    onLoadMore: () => void
}

export default function LeaderboardList({ 
    data, 
    error, 
    title, 
    subtitle,
    isLoading,
    isReachingEnd,
    onLoadMore 
}: LeaderboardListProps) {
    const observerTarget = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && !isLoading && !isReachingEnd) {
                    onLoadMore()
                }
            },
            { threshold: 1.0 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => observer.disconnect()
    }, [isLoading, isReachingEnd, onLoadMore])

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                        {title}
                    </h1>
                    {subtitle && (
                        <div className="inline-block bg-zinc-800/50 px-6 py-2 rounded-full border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0 transition-all">
                            <p className="text-xl sm:text-2xl font-medium">
                                {subtitle}
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-8 mb-8 border-2 border-zinc-800 [box-shadow:0_3px_0_0_#27272a] translate-y-0">
                    {error && (
                        <div className="text-center p-8">
                            <p className="text-red-400 text-lg">Failed to load leaderboard</p>
                        </div>
                    )}
                    
                    {!data && !error && (
                        <div className="flex justify-center p-8">
                            <Loader className="animate-spin w-8 h-8 text-green-400" />
                        </div>
                    )}
                    
                    {data && (
                        <div className="space-y-4">
                            {data.map((entry, index) => (
                                <div 
                                    key={`${entry.user.spotify_id}-${index}`}
                                    className="bg-zinc-800/50 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] p-4"
                                >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="text-2xl font-bold text-green-400 min-w-[3ch] text-right">
                                                #{index + 1}
                                            </div>
                                            <div className="relative h-14 w-14 rounded-xl overflow-hidden border-2 border-zinc-600">
                                                <Image
                                                    src={entry.user.profile_picture_url}
                                                    alt={entry.user.display_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{entry.user.display_name}</div>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-400 text-sm">
                                                    <span className="text-green-400 font-medium">
                                                        {entry.minutes_listened.toLocaleString()} minutes
                                                    </span>
                                                    <span>{entry.top_genre}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={`/wrapped/${entry.user.spotify_id}`}
                                            className="px-6 py-2 bg-zinc-700/50 text-sm font-bold rounded-xl hover:bg-zinc-700 transition-all text-center border-2 border-zinc-600 w-full sm:w-auto [box-shadow:0_3px_0_0_#374151] hover:translate-y-[3px] hover:shadow-none"
                                        >
                                            View Wrapped
                                        </a>
                                    </div>
                                </div>
                            ))}
                            <div ref={observerTarget} className="h-4" />
                            {isLoading && (
                                <div className="flex justify-center p-4">
                                    <Loader className="animate-spin w-8 h-8 text-green-400" />
                                </div>
                            )}
                            {isReachingEnd && (
                                <div className="text-center p-4 text-zinc-400">
                                    No more results
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 