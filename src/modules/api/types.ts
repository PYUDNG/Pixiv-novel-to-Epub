export interface PixivAPIResponse<T> {
    error: boolean;
    message: string;
    body: T;
}
