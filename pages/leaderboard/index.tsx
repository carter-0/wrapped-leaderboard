import LeaderboardList from '@/components/LeaderboardList'
import useSWRInfinite from 'swr/infinite'

const PAGE_SIZE = 250

const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null
    return `https://api.trackify.am/wrapped/leaderboard?limit=${PAGE_SIZE}&offset=${pageIndex * PAGE_SIZE}`
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function GlobalLeaderboard() {
    const { data, error, size, setSize, isLoading } = useSWRInfinite(getKey, fetcher)

    const entries = data ? data.flatMap(page => page.data) : []
    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")
    const isEmpty = data?.[0]?.data?.length === 0
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < PAGE_SIZE)

    return (
        <LeaderboardList
            data={entries}
            error={error}
            title="Global Leaderboard"
            subtitle="Top Spotify Listeners of 2024"
            isLoading={isLoadingMore}
            isReachingEnd={isReachingEnd}
            onLoadMore={() => setSize(size + 1)}
        />
    )
}
