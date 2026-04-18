from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from . import models, schemas


def get_authors_with_book_count(db: Session, skip: int = 0, limit: int = 5):
    base_query = (
        db.query(
            models.Author.id,
            models.Author.name,
            func.count(models.Book.id).label("book_count"),
        )
        .outerjoin(models.Book, models.Author.id == models.Book.author_id)
        .group_by(models.Author.id, models.Author.name)
        .order_by(models.Author.id)
    )
    total = db.query(func.count(models.Author.id)).scalar()
    items = base_query.offset(skip).limit(limit).all()
    return items, total


def get_author_by_id(db: Session, author_id: int):
    return db.query(models.Author).filter(models.Author.id == author_id).first()


def update_author(db: Session, author_id: int, payload: schemas.AuthorBase):
    db_author = db.query(models.Author).filter(models.Author.id == author_id).first()
    if not db_author:
        return None
    db_author.name = payload.name
    db.commit()
    db.refresh(db_author)
    return db_author


def delete_author(db: Session, author_id: int) -> bool:
    db_author = db.query(models.Author).filter(models.Author.id == author_id).first()
    if not db_author:
        return False
    db.delete(db_author)
    db.commit()
    return True


def get_books_paginated(db: Session, skip: int = 0, limit: int = 5):
    total = db.query(func.count(models.Book.id)).scalar()
    items = (
        db.query(models.Book)
        .options(joinedload(models.Book.author))
        .order_by(models.Book.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_book_by_id(db: Session, book_id: int):
    return (
        db.query(models.Book)
        .options(joinedload(models.Book.author))
        .filter(models.Book.id == book_id)
        .first()
    )


def create_book(db: Session, payload: schemas.BookCreate):
    db_book = models.Book(title=payload.title, author_id=payload.author_id)
    db.add(db_book)
    db.commit()
    return get_book_by_id(db, db_book.id)


def update_book(db: Session, book_id: int, payload: schemas.BookCreate):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        return None
    db_book.title = payload.title
    db_book.author_id = payload.author_id
    db.commit()
    return get_book_by_id(db, book_id)


def delete_book(db: Session, book_id: int) -> bool:
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        return False
    db.delete(db_book)
    db.commit()
    return True


# --- Review ---

def get_reviews_by_book(db: Session, book_id: int, skip: int = 0, limit: int = 5):
    total = db.query(func.count(models.Review.id)).filter(models.Review.book_id == book_id).scalar()
    items = (
        db.query(models.Review)
        .filter(models.Review.book_id == book_id)
        .order_by(models.Review.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_all_reviews_paginated(db: Session, skip: int = 0, limit: int = 5):
    total = db.query(func.count(models.Review.id)).scalar()
    items = (
        db.query(models.Review)
        .order_by(models.Review.id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items, total


def get_review_by_id(db: Session, review_id: int):
    return db.query(models.Review).filter(models.Review.id == review_id).first()


def create_review(db: Session, payload: schemas.ReviewCreate):
    db_review = models.Review(content=payload.content, book_id=payload.book_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def update_review(db: Session, review_id: int, payload: schemas.ReviewCreate):
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        return None
    db_review.content = payload.content
    db_review.book_id = payload.book_id
    db.commit()
    db.refresh(db_review)
    return db_review


def delete_review(db: Session, review_id: int) -> bool:
    db_review = db.query(models.Review).filter(models.Review.id == review_id).first()
    if not db_review:
        return False
    db.delete(db_review)
    db.commit()
    return True
