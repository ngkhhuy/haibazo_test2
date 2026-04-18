from typing import Generic, List, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PagedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class AuthorBase(BaseModel):
    name: str = Field(..., example="J.K. Rowling")


class AuthorResponse(AuthorBase):
    id: int
    book_count: int = 0

    class Config:
        from_attributes = True


class BookBase(BaseModel):
    title: str = Field(..., example="Harry Potter and the Sorcerer's Stone")
    author_id: int = Field(..., example=1)


class BookCreate(BookBase):
    pass


class BookResponse(BookBase):
    id: int
    author: AuthorResponse

    class Config:
        from_attributes = True


class BookRessponse(BookResponse):
    pass


class ReviewBase(BaseModel):
    content: str = Field(..., example="Great book with amazing storytelling.")
    book_id: int = Field(..., example=1)


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int

    class Config:
        from_attributes = True