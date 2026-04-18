import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Book, PagedResponse, Review } from "../types";

export const ReviewList = () => {
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [bookMap, setBookMap] = useState<Record<number, Book>>({});
	const [editingReview, setEditingReview] = useState<Review | null>(null);
	const [editContent, setEditContent] = useState("");
	const [editBookId, setEditBookId] = useState<number>(0);
	const [deletingReview, setDeletingReview] = useState<Review | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const fetchReviews = async (targetPage: number) => {
		try {
			const response = await api.get("/reviews/all", {
				params: { page: targetPage, page_size: 5 },
			});
			const payload = response.data as PagedResponse<Review>;
			setReviews(payload.items ?? []);
			setPage(payload.page ?? targetPage);
			setTotalPages(payload.total_pages ?? 1);
		} catch (error) {
			console.error("Error fetching reviews:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchBookDictionary = async () => {
		try {
			let currentPage = 1;
			let maxPages = 1;
			const nextMap: Record<number, Book> = {};

			while (currentPage <= maxPages) {
				const response = await api.get("/books", {
					params: { page: currentPage, page_size: 100 },
				});
				const payload = response.data as PagedResponse<Book>;
				(payload.items ?? []).forEach((book) => {
					nextMap[book.id] = book;
				});
				maxPages = payload.total_pages ?? 1;
				currentPage += 1;
			}

			setBookMap(nextMap);
		} catch (error) {
			console.error("Error fetching books:", error);
		}
	};

	useEffect(() => {
		fetchBookDictionary();
		fetchReviews(1);
	}, []);

	const openEditModal = (review: Review) => {
		setEditingReview(review);
		setEditContent(review.content);
		setEditBookId(review.book_id);
	};

	const handleUpdate = async () => {
		if (!editingReview || !editContent.trim() || !editBookId) {
			return;
		}
		setSubmitting(true);
		try {
			await api.put(`/reviews/${editingReview.id}`, {
				content: editContent.trim(),
				book_id: editBookId,
			});
			setEditingReview(null);
			await fetchReviews(page);
		} catch (error) {
			console.error("Error updating review:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!deletingReview) {
			return;
		}
		setSubmitting(true);
		try {
			await api.delete(`/reviews/${deletingReview.id}`);
			setDeletingReview(null);
			await fetchReviews(page);
		} catch (error) {
			console.error("Error deleting review:", error);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="text-sm text-slate-500">Loading reviews...</div>;

	return (
		<div className="space-y-4">
			<div className="rounded border border-slate-400 bg-white overflow-hidden">
				<table className="w-full border-collapse text-left text-sm">
					<thead>
						<tr className="bg-slate-200">
							<th className="w-16 border border-slate-500 px-3 py-1 text-center">No</th>
							<th className="border border-slate-500 px-3 py-1">Book</th>
							<th className="border border-slate-500 px-3 py-1">Author</th>
							<th className="border border-slate-500 px-3 py-1">Review</th>
							<th className="w-40 border border-slate-500 px-3 py-1 text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{reviews.map((review, index) => (
							<tr key={review.id}>
								<td className="border border-slate-500 px-3 py-1 text-center">{(page - 1) * 5 + index + 1}</td>
								<td className="border border-slate-500 px-3 py-1">{bookMap[review.book_id]?.title ?? `Book #${review.book_id}`}</td>
								<td className="border border-slate-500 px-3 py-1">{bookMap[review.book_id]?.author?.name ?? "-"}</td>
								<td className="border border-slate-500 px-3 py-1">{review.content}</td>
								<td className="border border-slate-500 px-2 py-1 bg-yellow-100">
									<div className="flex items-center justify-center gap-2">
										<button
											type="button"
											onClick={() => openEditModal(review)}
											className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => setDeletingReview(review)}
											className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700"
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-end gap-2 text-sm">
				<button
					type="button"
					disabled={page <= 1}
					onClick={() => fetchReviews(page - 1)}
					className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-50"
				>
					Prev
				</button>
				<span className="text-slate-600">Page {page}/{totalPages}</span>
				<button
					type="button"
					disabled={page >= totalPages}
					onClick={() => fetchReviews(page + 1)}
					className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-50"
				>
					Next
				</button>
			</div>

			{editingReview && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
						<h2 className="text-lg font-semibold text-slate-800">Update Review</h2>
						<div className="mt-3 space-y-2">
							<label className="block text-sm text-slate-600">Content</label>
							<textarea
								value={editContent}
								onChange={(e) => setEditContent(e.target.value)}
								className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
								rows={4}
							/>
							<label className="block text-sm text-slate-600">Book</label>
							<select
								value={editBookId}
								onChange={(e) => setEditBookId(Number(e.target.value))}
								className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
							>
								<option value={0}>Select book</option>
								{Object.values(bookMap).map((book) => (
									<option key={book.id} value={book.id}>
										{book.title} - {book.author?.name ?? `Author #${book.author_id}`}
									</option>
								))}
							</select>
						</div>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setEditingReview(null)}
								className="rounded border border-slate-300 px-3 py-1 text-sm"
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={submitting}
								onClick={handleUpdate}
								className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}

			{deletingReview && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
						<h2 className="text-lg font-semibold text-slate-800">Delete Review</h2>
						<p className="mt-2 text-sm text-slate-600">
							Are you sure you want to delete review #{deletingReview.id}?
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setDeletingReview(null)}
								className="rounded border border-slate-300 px-3 py-1 text-sm"
							>
								Cancel
							</button>
							<button
								type="button"
								disabled={submitting}
								onClick={handleDelete}
								className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
