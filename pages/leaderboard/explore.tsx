import { GetServerSideProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'

interface Artist {
    name: string
    user_count: number
    total_minutes: number
    avg_diversity: number
    image_url: string | null
}

interface Genre {
    name: string
    user_count: number
    total_minutes: number
    avg_diversity: number
    top_artists: string[]
}

interface ExplorePageProps {
    initialArtists: Artist[]
    initialGenres: Genre[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ExplorePage({ initialArtists, initialGenres }: ExplorePageProps) {
    const { data: artistsData } = useSWR<{ status: string, data: Artist[] }>(
        'http://localhost:5001/wrapped/top_artists?limit=50',
        fetcher,
        { fallbackData: { status: 'success', data: initialArtists } }
    )

    const { data: genresData } = useSWR<{ status: string, data: Genre[] }>(
        'http://localhost:5001/wrapped/top_genres?limit=50',
        fetcher,
        { fallbackData: { status: 'success', data: initialGenres } }
    )

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                        Explore Leaderboards
                    </h1>

                    <p className="text-zinc-400 mb-5">
                        click on a genre or artist to see their leaderboard
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-center mb-6">Top Genres</h2>
                        <div className="space-y-4">
                            {genresData?.data.map((genre, index) => (
                                <Link
                                    key={genre.name}
                                    href={`/leaderboard/genre/${encodeURIComponent(genre.name.toLowerCase().replace(/ /g, '-'))}`}
                                    className="block bg-zinc-800/50 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] p-4 hover:bg-zinc-800/70 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-2xl font-bold text-green-400 min-w-[3ch] text-right">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg mb-1">{genre.name}</div>
                                            <div className="text-sm text-zinc-400">
                                                <span className="text-green-400 font-medium">
                                                    {genre.user_count.toLocaleString()} listeners
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>{Number(genre.total_minutes).toLocaleString()} total minutes</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold text-center mb-6">Top Artists</h2>
                        <div className="space-y-4">
                            {artistsData?.data.map((artist, index) => (
                                <Link
                                    key={artist.name}
                                    href={`/leaderboard/artist/${encodeURIComponent(artist.name.toLowerCase().replace(/ /g, '-'))}`}
                                    className="block bg-zinc-800/50 rounded-xl border-2 border-zinc-700 [box-shadow:0_3px_0_0_#374151] p-4 hover:bg-zinc-800/70 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl font-bold text-green-400 min-w-[3ch] text-right">
                                            #{index + 1}
                                        </div>
                                        <div className="relative h-14 w-14 rounded-xl overflow-hidden border-2 border-zinc-600">
                                            {artist.image_url ? (
                                                <Image
                                                    src={artist.image_url}
                                                    alt={artist.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-lg font-bold">
                                                    {artist.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg mb-1">{artist.name}</div>
                                            <div className="text-sm text-zinc-400">
                                                <span className="text-green-400 font-medium">
                                                    {artist.user_count.toLocaleString()} listeners
                                                </span>
                                                <span className="mx-2">•</span>
                                                <span>{Number(artist.total_minutes).toLocaleString()} total minutes</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps<ExplorePageProps> = async () => {
    const [artistsRes, genresRes] = await Promise.all([
        fetch('http://localhost:5001/wrapped/top_artists?limit=50'),
        fetch('http://localhost:5001/wrapped/top_genres?limit=50')
    ])

    const [artists, genres] = await Promise.all([
        artistsRes.json(),
        genresRes.json()
    ])

    return {
        props: {
            initialArtists: artists.data,
            initialGenres: genres.data
        }
    }
}
