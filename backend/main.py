from typing import List

from fastapi import Depends, FastAPI, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app import crud, models, schemas
from app.database import Base, engine, get_db
from app.schemas import PagedResponse
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Haibazo Book Review API")

origins = [
    "http://localhost:5173",
    "https://haibazo-test2.vercel.app/",
]
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _paged(items, total: int, page: int, page_size: int) -> dict:
    import math
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if page_size else 0,
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Haibazo Book Review API!", "success": True}


@app.get("/authors", response_model=PagedResponse[schemas.AuthorResponse])
def get_authors(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    rows, total = crud.get_authors_with_book_count(db, skip=skip, limit=page_size)
    items = [{"id": r.id, "name": r.name, "book_count": r.book_count} for r in rows]
    return _paged(items, total, page, page_size)

@app.post("/authors", response_model=schemas.AuthorResponse, status_code=status.HTTP_201_CREATED)
def create_author(payload: schemas.AuthorBase, db: Session = Depends(get_db)):
    db_author = models.Author(name=payload.name)
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author


@app.put("/authors/{author_id}", response_model=schemas.AuthorResponse)
def update_author(author_id: int, payload: schemas.AuthorBase, db: Session = Depends(get_db)):
    updated = crud.update_author(db, author_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Author not found")
    return updated


@app.delete("/authors/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author(author_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_author(db, author_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Author not found")

@app.get("/books", response_model=PagedResponse[schemas.BookResponse])
def get_books(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * page_size
    items, total = crud.get_books_paginated(db, skip=skip, limit=page_size)
    return _paged(items, total, page, page_size)

@app.post("/books", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(payload: schemas.BookCreate, db: Session = Depends(get_db)):
    author = crud.get_author_by_id(db, payload.author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    return crud.create_book(db, payload)


@app.put("/books/{book_id}", response_model=schemas.BookResponse)
def update_book(book_id: int, payload: schemas.BookCreate, db: Session = Depends(get_db)):
    author = crud.get_author_by_id(db, payload.author_id)
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")

    updated = crud.update_book(db, book_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Book not found")

    return updated


@app.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(book_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_book(db, book_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Book not found")


# --- Reviews ---

@app.get("/reviews", response_model=PagedResponse[schemas.ReviewResponse])
def get_reviews(
    book_id: int,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
):
    book = crud.get_book_by_id(db, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    items, total = crud.get_reviews_by_book(db, book_id, skip=(page - 1) * page_size, limit=page_size)
    return _paged(items, total, page, page_size)

@app.get("/reviews/all", response_model=PagedResponse[schemas.ReviewResponse])
def get_all_reviews(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = crud.get_all_reviews_paginated(db, skip=(page - 1) * page_size, limit=page_size)
    return _paged(items, total, page, page_size)    

@app.post("/reviews", response_model=schemas.ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(payload: schemas.ReviewCreate, db: Session = Depends(get_db)):
    book = crud.get_book_by_id(db, payload.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return crud.create_review(db, payload)


@app.put("/reviews/{review_id}", response_model=schemas.ReviewResponse)
def update_review(review_id: int, payload: schemas.ReviewCreate, db: Session = Depends(get_db)):
    book = crud.get_book_by_id(db, payload.book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    updated = crud.update_review(db, review_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Review not found")
    return updated


@app.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_review(db, review_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Review not found")