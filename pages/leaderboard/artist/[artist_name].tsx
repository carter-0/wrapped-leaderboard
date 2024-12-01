import LeaderboardList from '@/components/LeaderboardList'
import { useRouter } from 'next/router'
import useSWRInfinite from 'swr/infinite'

const PAGE_SIZE = 250

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ArtistLeaderboard() {
    const router = useRouter()
    const { artist_name } = router.query

    const formattedArtistName = artist_name 
        ? decodeURIComponent(artist_name as string).replace(/-/g, ' ')
        : ''

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.data.length) return null
        if (!artist_name) return null
        return `http://localhost:5001/wrapped/leaderboard?artist=${encodeURIComponent(formattedArtistName)}&limit=${PAGE_SIZE}&offset=${pageIndex * PAGE_SIZE}`
    }

    const { data, error, size, setSize, isLoading } = useSWRInfinite(getKey, fetcher)

    const entries = data ? data.flatMap(page => page.data) : []
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
    const isEmpty = data?.[0]?.data?.length === 0
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < PAGE_SIZE)

    return (
        <LeaderboardList
            data={entries}
            error={error}
            title={formattedArtistName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            subtitle="Top Listeners by Minutes"
            isLoading={isLoadingMore}
            isReachingEnd={isReachingEnd}
            onLoadMore={() => setSize(size + 1)}
        />
    )
}
