import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Book, PagedResponse } from "../types";

export const CreateReview = () => {
	const navigate = useNavigate();
	const [content, setContent] = useState("");
	const [books, setBooks] = useState<Book[]>([]);
	const [bookTitle, setBookTitle] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				let currentPage = 1;
				let totalPages = 1;
				const allBooks: Book[] = [];

				while (currentPage <= totalPages) {
					const response = await api.get("/books", {
						params: { page: currentPage, page_size: 100 },
					});
					const payload = response.data as PagedResponse<Book>;
					allBooks.push(...(payload.items ?? []));
					totalPages = payload.total_pages ?? 1;
					currentPage += 1;
				}

				setBooks(allBooks);
			} catch (fetchError) {
				console.error("Error fetching books:", fetchError);
			}
		};

		fetchBooks();
	}, []);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!content.trim()) {
			setError("Please enter review content");
			return;
		}
		if (!bookTitle.trim()) {
			setError("Please enter book title");
			return;
		}

		const selectedBook = books.find((book) => book.title === bookTitle);
		if (!selectedBook) {
			setError("Please select a valid book title");
			return;
		}

		setError("");
		setSubmitting(true);
		try {
			await api.post("/reviews", { content: content.trim(), book_id: selectedBook.id });
			navigate("/reviews");
		} catch (submitError) {
			console.error("Error creating review:", submitError);
			setError("Create failed. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded border border-slate-300 bg-white p-6">
			<h2 className="text-lg font-semibold text-slate-800">Create Review</h2>

			<div className="space-y-3">
				<div className="flex w-full items-stretch">
					<label className="min-w-24 border border-slate-700 bg-slate-100 px-3 py-2 text-sm">Content</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={4}
						className="w-full border-y border-r border-slate-700 px-3 py-2 text-sm outline-none"
					/>
				</div>

				<div className="flex w-full items-stretch">
					<label className="min-w-24 border border-slate-700 bg-slate-100 px-3 py-2 text-sm">Book Title</label>
					<select
						value={bookTitle}
						onChange={(e) => setBookTitle(e.target.value)}
						className="w-full border-y border-r border-slate-700 px-3 py-2 text-sm outline-none"
					>
						<option value="">Select book</option>
						{books.map((book) => (
							<option key={book.id} value={book.title}>
								{book.title}
							</option>
						))}
					</select>

				</div>

				{error && <p className="border-b-2 border-dotted border-red-400 text-red-600">* {error}</p>}
			</div>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={() => navigate("/reviews")}
					className="rounded border border-slate-300 px-3 py-1 text-sm"
				>
					Cancel
				</button>
				<button
					type="submit"
					disabled={submitting}
					className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
				>
					Save
				</button>
			</div>
		</form>
	);
};
