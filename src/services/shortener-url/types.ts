export interface IShortenerUrlFromDB {
    id: string
    original_url: string
    short_url: string
    url_code: string
    created_at: Date
    updated_at: Date
}

export interface IGetLatestUrl {
    user_id: string
    organization_id: string
    id_url_shorten: string
    original_url: string
    short_url: string
    created_at: string
}