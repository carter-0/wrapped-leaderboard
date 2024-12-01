export interface LeaderboardUser {
    user: {
        spotify_id: string
        display_name: string
        profile_picture_url: string
        image_url: string
    }
    minutes_listened: number
    top_genre: string
    nickname: string
    diversity: number
}

export interface LeaderboardResponse {
    status: string
    data: LeaderboardUser[]
} 