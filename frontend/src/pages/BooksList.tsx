import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Author, Book, PagedResponse } from "../types";

export const BooksList = () => {
	const [books, setBooks] = useState<Book[]>([]);
	const [authors, setAuthors] = useState<Author[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [editingBook, setEditingBook] = useState<Book | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editAuthorId, setEditAuthorId] = useState<number>(0);
	const [deletingBook, setDeletingBook] = useState<Book | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const fetchAuthors = async () => {
		try {
			const response = await api.get("/authors", {
				params: { page: 1, page_size: 100 },
			});
			const payload = response.data as PagedResponse<Author>;
			setAuthors(payload.items ?? []);
		} catch (error) {
			console.error("Error fetching authors:", error);
		}
	};

	const fetchBooks = async (targetPage: number) => {
		try {
			const response = await api.get("/books", {
				params: { page: targetPage, page_size: 5 },
			});
			const payload = response.data as PagedResponse<Book>;
			setBooks(payload.items ?? []);
			setPage(payload.page ?? targetPage);
			setTotalPages(payload.total_pages ?? 1);
		} catch (error) {
			console.error("Error fetching books:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuthors();
		fetchBooks(1);
	}, []);

	const openEditModal = (book: Book) => {
		setEditingBook(book);
		setEditTitle(book.title);
		setEditAuthorId(book.author_id);
	};

	const handleUpdate = async () => {
		if (!editingBook || !editTitle.trim() || !editAuthorId) {
			return;
		}
		setSubmitting(true);
		try {
			await api.put(`/books/${editingBook.id}`, {
				title: editTitle.trim(),
				author_id: editAuthorId,
			});
			setEditingBook(null);
			await fetchBooks(page);
		} catch (error) {
			console.error("Error updating book:", error);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!deletingBook) {
			return;
		}
		setSubmitting(true);
		try {
			await api.delete(`/books/${deletingBook.id}`);
			setDeletingBook(null);
			await fetchBooks(page);
		} catch (error) {
			console.error("Error deleting book:", error);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="text-sm text-slate-500">Loading books...</div>;

	return (
		<div className="space-y-4">
			<div className="rounded border border-slate-400 bg-white overflow-hidden">
				<table className="w-full border-collapse text-left text-sm">
					<thead>
						<tr className="bg-slate-200">
							<th className="w-16 border border-slate-500 px-3 py-1 text-center">No</th>
							<th className="border border-slate-500 px-3 py-1">Title</th>
							<th className="border border-slate-500 px-3 py-1">Author</th>
							<th className="w-40 border border-slate-500 px-3 py-1 text-center">Actions</th>
						</tr>
					</thead>
					<tbody>
						{books.map((book, index) => (
							<tr key={book.id}>
								<td className="border border-slate-500 px-3 py-1 text-center">{(page - 1) * 5 + index + 1}</td>
								<td className="border border-slate-500 px-3 py-1">{book.title}</td>
								<td className="border border-slate-500 px-3 py-1">{book.author?.name ?? `Author #${book.author_id}`}</td>
								<td className="border border-slate-500 px-2 py-1 bg-yellow-100">
									<div className="flex items-center justify-center gap-2">
										<button
											type="button"
											onClick={() => openEditModal(book)}
											className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700"
										>
											Edit
										</button>
										<button
											type="button"
											onClick={() => setDeletingBook(book)}
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
					onClick={() => fetchBooks(page - 1)}
					className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-50"
				>
					Prev
				</button>
				<span className="text-slate-600">Page {page}/{totalPages}</span>
				<button
					type="button"
					disabled={page >= totalPages}
					onClick={() => fetchBooks(page + 1)}
					className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-50"
				>
					Next
				</button>
			</div>

			{editingBook && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
						<h2 className="text-lg font-semibold text-slate-800">Update Book</h2>
						<div className="mt-3 space-y-2">
							<label className="block text-sm text-slate-600">Title</label>
							<input
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
								className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
							/>
							<label className="block text-sm text-slate-600">Author</label>
							<select
								value={editAuthorId}
								onChange={(e) => setEditAuthorId(Number(e.target.value))}
								className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
							>
								<option value={0}>Select author</option>
								{authors.map((author) => (
									<option key={author.id} value={author.id}>
										{author.name}
									</option>
								))}
							</select>
						</div>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setEditingBook(null)}
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

			{deletingBook && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
						<h2 className="text-lg font-semibold text-slate-800">Delete Book</h2>
						<p className="mt-2 text-sm text-slate-600">
							Are you sure you want to delete <strong>{deletingBook.title}</strong>?
						</p>
						<div className="mt-4 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setDeletingBook(null)}
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
