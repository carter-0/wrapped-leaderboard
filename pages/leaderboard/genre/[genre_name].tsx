import LeaderboardList from '@/components/LeaderboardList'
import { useRouter } from 'next/router'
import useSWRInfinite from 'swr/infinite'

const PAGE_SIZE = 250

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GenreLeaderboard() {
    const router = useRouter()
    const { genre_name } = router.query

    const formattedGenreName = genre_name 
        ? decodeURIComponent(genre_name as string).replace(/-/g, ' ')
        : ''

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && !previousPageData.data.length) return null
        if (!genre_name) return null
        return `https://api.trackify.am/wrapped/leaderboard?genre=${encodeURIComponent(formattedGenreName)}&limit=${PAGE_SIZE}&offset=${pageIndex * PAGE_SIZE}`
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
            title={formattedGenreName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            subtitle="Top Listeners by Minutes"
            isLoading={isLoadingMore}
            isReachingEnd={isReachingEnd}
            onLoadMore={() => setSize(size + 1)}
        />
    )
}
