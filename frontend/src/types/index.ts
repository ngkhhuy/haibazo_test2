export interface Author {
  id: number;
  name: string;
  book_count?: number;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Book {
  id: number;
  title: string;
  author_id: number;
  author?: Author;
}

export interface Review {
  id: number;
  book_id: number;
  content: string;
}

