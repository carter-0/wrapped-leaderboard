import NumberFlow from '@number-flow/react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useSWR from 'swr'

interface User {
    spotify_id: string
    display_name: string
    profile_picture_url: string
    image_url: string
}

interface WrappedData {
    user: User
    minutes_listened: number
    top_genre: string
    rank: number
    artist_rank: number
    genre_rank: number
    same_top_5_count: number
    nickname: string
    diversity: number
    top_artists: string[]
    enabled: boolean
    banned: boolean
}

interface SoulmateData {
    user: User
    minutes_listened: number
    top_genre: string
    matching_artists: number
    top_artists: string[]
}

interface LeaderboardEntry {
    user: User
    minutes_listened: number
    top_genre: string
    nickname: string
    diversity: number
}

interface Props {
    data: WrappedData
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

function calculateOffset(rank: number, limit: number) {
    return Math.max(0, Math.floor(rank - limit / 2))
}

export default function WrappedProfile({ data }: Props) {
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const storedId = localStorage.getItem('spotify_id')
        setIsOwnProfile(storedId === data.user.spotify_id)
        
        // Set isFirstRender to false after a small delay to trigger animations
        const timer = setTimeout(() => {
            setIsFirstRender(false)
        }, 100)
        
        return () => clearTimeout(timer)
    }, [data.user.spotify_id])

    const handleButtonClick = async () => {
        if (isOwnProfile) {
            try {
                await navigator.clipboard.writeText(window.location.href)
                alert('Link copied to clipboard!')
            } catch {
                const input = document.createElement('input')
                input.value = window.location.href
                document.body.appendChild(input)
                input.select()
                document.execCommand('copy')
                document.body.removeChild(input)
                alert('Link copied to clipboard!')
            }
            return
        }
        router.push('/upload')
    }

    const { data: soulmateData, isLoading } = useSWR<{ status: string, data: SoulmateData }>(
        `https://api.trackify.am/wrapped/${data.user.spotify_id}/soulmate`,
        fetcher
    )

    const limit = 5
    const globalOffset = calculateOffset(data.rank, limit)
    const genreOffset = calculateOffset(data.genre_rank, limit)
    const artistOffset = calculateOffset(data.artist_rank, limit)

    const { data: globalLeaderboard } = useSWR<{ status: string, data: LeaderboardEntry[] }>(
        `https://api.trackify.am/wrapped/leaderboard?limit=${limit}&offset=${globalOffset}`,
        fetcher
    )

    const { data: genreLeaderboard } = useSWR<{ status: string, data: LeaderboardEntry[] }>(
        `https://api.trackify.am/wrapped/leaderboard?genre=${encodeURIComponent(data.top_genre)}&limit=${limit}&offset=${genreOffset}`,
        fetcher
    )

    const { data: artistLeaderboard } = useSWR<{ status: string, data: LeaderboardEntry[] }>(
        `https://api.trackify.am/wrapped/leaderboard?artist=${encodeURIComponent(data.top_artists[0])}&limit=${limit}&offset=${artistOffset}`,
        fetcher
    )

    return (
        <>
            <Head>
                <title key="title">{`${data.user.display_name}'s 2024 Wrapped`}</title>
                <meta key="og:title" property="og:title" content={`${data.user.display_name}'s 2024 Wrapped`} />

                <meta key="og:description" property="og:description" content={`${data.user.display_name} ranked #${data.rank} on the leaderboard with ${data.minutes_listened.toLocaleString()} minutes of music in 2024`} />
                <meta key="description" name="description" content={`${data.user.display_name} ranked #${data.rank} on the leaderboard with ${data.minutes_listened.toLocaleString()} minutes of music in 2024`} />
                <meta key="og:image" property="og:image" content={data.user.image_url} />

                <meta name="twitter:card" content="app"/>

                <link rel="canonical" href={`https://wrapped.trackify.am/wrapped/${data.user.spotify_id}`} />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    {data.banned ? (
                        <div className="bg-red-500/10 border-2 border-red-500/20 rounded-2xl p-6 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-500/20">
                                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-red-400 mb-2">Wrapped Flagged</h3>
                                    <p className="text-zinc-300 mb-4">
                                        This wrapped has been flagged as suspicious by our anti-cheat system and is excluded from all leaderboards. If you believe this is a mistake, please contact support.
                                    </p>
                                    <a 
                                        href="mailto:support@trackify.am?subject=Wrapped Anti-Cheat"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 transition-colors rounded-lg text-red-400 font-medium"
                                    >
                                        Contact Support
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="text-center mb-8">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                            {data.user.display_name}&apos;s 2024 wrapped
                        </h1>
                        <div className="inline-block bg-zinc-800/50 px-6 py-2 rounded-full border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0 transition-all">
                            <p className="text-xl sm:text-2xl font-medium">
                                Ranked <span className="text-green-400 font-bold">
                                    #<NumberFlow value={isFirstRender ? 0 : data.rank} />
                                </span> on the leaderboard
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-8 mb-8 border-2 border-zinc-800 [box-shadow:0_3px_0_0_#27272a] translate-y-0">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                            <div className="relative w-full aspect-[9/16] lg:w-[400px] mx-auto lg:mx-0">
                                <Image
                                    src={data.user.image_url}
                                    alt="Spotify Wrapped Screenshot"
                                    fill
                                    className="rounded-2xl object-contain"
                                    priority
                                />
                            </div>
                            
                            <div className="flex-1 space-y-6">
                                <div className="bg-zinc-800/50 p-6 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0">
                                    <h2 className="text-3xl sm:text-4xl font-bold">
                                        <NumberFlow value={isFirstRender ? 0 : data.minutes_listened} /> minutes
                                    </h2>
                                    <p className="text-lg sm:text-xl text-zinc-400">
                                        That&apos;s <NumberFlow value={isFirstRender ? 0 : Math.round(data.minutes_listened / 60)} /> hours or <NumberFlow value={isFirstRender ? 0 : Math.round(data.minutes_listened / 60 / 24)} /> days of music!
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-zinc-800/50 p-6 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0">
                                        <p className="text-zinc-400 mb-1">Top Song</p>
                                        <p className="text-xl sm:text-2xl font-bold">{data.top_genre}</p>
                                        <p className="text-sm text-zinc-500">
                                            #<NumberFlow value={isFirstRender ? 0 : data.genre_rank} /> among {data.top_genre} listeners
                                        </p>
                                    </div>
                                    <div className="bg-zinc-800/50 p-6 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0">
                                        <p className="text-zinc-400 mb-1">Music Taste</p>
                                        <p className="text-xl sm:text-2xl font-bold">{data.nickname}</p>
                                        <p className="text-sm text-zinc-500">Diversity Score: <NumberFlow value={isFirstRender ? 0 : data.diversity} />%</p>
                                    </div>
                                </div>
                                
                                <div className="bg-zinc-800/50 p-6 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold">Top Artists</h3>
                                        <p className="text-sm text-zinc-400">
                                            #<NumberFlow value={isFirstRender ? 0 : data.artist_rank} /> among users with same top artist
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {data.top_artists.map(artist => (
                                            <span 
                                                key={artist} 
                                                className="bg-zinc-700/50 px-4 py-2 rounded-full text-sm border border-zinc-600"
                                            >
                                                {artist}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-zinc-800/50 p-6 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] translate-y-0">
                                    <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-600 text-transparent bg-clip-text">
                                        Your Wrapped Soulmate
                                    </h3>
                                    
                                    {isLoading ? (
                                        <div className="flex gap-6 items-center">
                                            <div className="w-16 h-16 rounded-xl bg-zinc-700/50 animate-pulse shrink-0" />
                                            <div className="flex-1">
                                                <div className="h-7 bg-zinc-700/50 rounded-lg w-48 mb-2 animate-pulse" />
                                                <div className="flex gap-2">
                                                    <div className="h-5 bg-zinc-700/50 rounded-lg w-32 animate-pulse" />
                                                    <div className="h-5 bg-zinc-700/50 rounded-lg w-24 animate-pulse" />
                                                    <div className="h-5 bg-zinc-700/50 rounded-lg w-28 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : soulmateData?.status === "success" && (
                                        <div className="flex gap-6 items-center">
                                            <div className="relative w-16 h-16 shrink-0">
                                                <Image
                                                    src={soulmateData.data.user.image_url}
                                                    alt="Soulmate's Wrapped"
                                                    fill
                                                    className="rounded-xl object-cover border-2 border-pink-500/20"
                                                />
                                            </div>
                                            
                                            <div className="flex-1">
                                                <a href={`/wrapped/${soulmateData.data.user.spotify_id}`} className="text-xl font-bold mb-2">
                                                    {soulmateData.data.user.display_name}
                                                </a>
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-zinc-400 text-sm">
                                                    <span className="text-pink-400 font-medium">
                                                        <NumberFlow value={isFirstRender ? 0 : soulmateData.data.matching_artists} /> shared artists
                                                    </span>
                                                    <span>{soulmateData.data.top_genre}</span>
                                                    <span><NumberFlow value={isFirstRender ? 0 : soulmateData.data.minutes_listened} /> minutes</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={handleButtonClick}
                                        className="flex-1 px-8 py-4 bg-[#1db954] text-lg sm:text-xl font-bold rounded-xl hover:bg-[#1db954]/80 transition-all text-center border-2 border-[#1db954] [box-shadow:0_3px_0_0_rgb(22_163_74)] hover:translate-y-[3px] hover:shadow-none"
                                    >
                                        {isOwnProfile ? 'Share' : 'Get your rank'}
                                    </button>
                                    <Link
                                        href="/"
                                        className="flex-1 px-8 py-4 bg-zinc-800 text-lg sm:text-xl font-bold rounded-xl hover:bg-zinc-700 transition-all text-center border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] hover:translate-y-[3px] hover:shadow-none"
                                    >
                                        View Leaderboard
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-zinc-800 [box-shadow:0_3px_0_0_#27272a]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Global Ranking</h3>
                                <Link 
                                    href="/leaderboard"
                                    className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                                >
                                    View All
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            {globalLeaderboard?.data.map((entry, index) => (
                                <div 
                                    key={entry.user.spotify_id}
                                    className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                                        entry.user.spotify_id === data.user.spotify_id 
                                            ? "bg-green-500/10 border-2 border-green-500/20" 
                                            : "bg-zinc-800/30"
                                    }`}
                                >
                                    <span className="text-sm font-medium text-zinc-400 min-w-[32px]">
                                        #<NumberFlow value={isFirstRender ? 0 : Number(globalOffset + index + 1)} />
                                    </span>
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                        <Image
                                            src={entry.user.profile_picture_url}
                                            alt={entry.user.display_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{entry.user.display_name}</p>
                                        <p className="text-sm text-zinc-400">
                                            <NumberFlow value={isFirstRender ? 0 : entry.minutes_listened} /> minutes
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-zinc-800 [box-shadow:0_3px_0_0_#27272a]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{data.top_genre} Listeners</h3>
                                <Link 
                                    href={`/leaderboard/song/${encodeURIComponent(data.top_genre)}`}
                                    className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                                >
                                    View All
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            {genreLeaderboard?.data.map((entry, index) => (
                                <div 
                                    key={entry.user.spotify_id}
                                    className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                                        entry.user.spotify_id === data.user.spotify_id 
                                            ? "bg-green-500/10 border-2 border-green-500/20" 
                                            : "bg-zinc-800/30"
                                    }`}
                                >
                                    <span className="text-sm font-medium text-zinc-400 min-w-[32px]">
                                        #<NumberFlow value={isFirstRender ? 0 : Number(genreOffset + index + 1)} />
                                    </span>
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                        <Image
                                            src={entry.user.profile_picture_url}
                                            alt={entry.user.display_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{entry.user.display_name}</p>
                                        <p className="text-sm text-zinc-400">
                                            <NumberFlow value={isFirstRender ? 0 : entry.minutes_listened} /> minutes
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-zinc-800 [box-shadow:0_3px_0_0_#27272a]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{data.top_artists[0]} Fans</h3>
                                <Link 
                                    href={`/leaderboard/artist/${encodeURIComponent(data.top_artists[0])}`}
                                    className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                                >
                                    View All
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                            {artistLeaderboard?.data.map((entry, index) => (
                                <div 
                                    key={entry.user.spotify_id}
                                    className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                                        entry.user.spotify_id === data.user.spotify_id 
                                            ? "bg-green-500/10 border-2 border-green-500/20" 
                                            : "bg-zinc-800/30"
                                    }`}
                                >
                                    <span className="text-sm font-medium text-zinc-400 min-w-[32px]">
                                        #<NumberFlow value={isFirstRender ? 0 : Number(artistOffset + index + 1)} />
                                    </span>
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                                        <Image
                                            src={entry.user.profile_picture_url}
                                            alt={entry.user.display_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{entry.user.display_name}</p>
                                        <p className="text-sm text-zinc-400">
                                            <NumberFlow value={isFirstRender ? 0 : entry.minutes_listened} /> minutes
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {!isOwnProfile && (
                        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-zinc-800 [box-shadow:0_3px_0_0_#27272a]">
                            <h3 className="text-2xl font-bold mb-2">Want to see your own Wrapped?</h3>
                            <p className="text-zinc-400 mb-4">Find out where you rank among other spotify users!</p>
                            <Link
                                href="/upload"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#1db954] text-lg font-bold rounded-xl hover:bg-[#1db954]/80 transition-all border-2 border-[#1db954] [box-shadow:0_3px_0_0_rgb(22_163_74)] hover:translate-y-[3px] hover:shadow-none"
                            >
                                Upload Your Wrapped
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
    const spotify_id = params?.spotify_id as string

    try {
        const response = await fetch(`https://api.trackify.am/wrapped/${spotify_id}`)
        
        if (!response.ok) {
            return {
                notFound: true
            }
        }

        const result = await response.json()
        
        if (result.status !== "success") {
            return {
                notFound: true
            }
        }

        return {
            props: {
                data: result.data
            }
        }
    } catch (error) {
        console.error('Error fetching wrapped data:', error)
        return {
            notFound: true
        }
    }
}
