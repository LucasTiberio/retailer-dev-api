export interface IShortenerUrlFromDB{
    id: string
    original_url: string
    short_url: string
    url_code: string
    created_at: Date
    updated_at: Date
}