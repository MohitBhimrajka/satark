/**
 * Satark — Standard API response envelope types.
 */

/** Wraps a single-item success response. */
export interface ApiResponse<T> {
  data: T
  message?: string
}

/** Wraps a paginated list response. */
export interface ApiListResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/** Pagination metadata returned with list endpoints. */
export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

/** Flat paginated response (used by incident list). */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

/** Standard error envelope. */
export interface ApiError {
  error: {
    code: string
    message: string
    details: unknown[]
  }
}
