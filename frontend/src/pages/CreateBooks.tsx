import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import type { Author, PagedResponse } from "../types";

export const CreateBooks = () => {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [authorId, setAuthorId] = useState<number>(0);
	const [authors, setAuthors] = useState<Author[]>([]);
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchAuthors = async () => {
			try {
				const response = await api.get("/authors", { params: { page: 1, page_size: 100 } });
				const payload = response.data as PagedResponse<Author>;
				setAuthors(payload.items ?? []);
			} catch (fetchError) {
				console.error("Error fetching authors:", fetchError);
			}
		};
		fetchAuthors();
	}, []);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!title.trim()) {
			setError("Please enter title");
			return;
		}
		if (!authorId) {
			setError("Please select author");
			return;
		}

		setError("");
		setSubmitting(true);
		try {
			await api.post("/books", { title: title.trim(), author_id: authorId });
			navigate("/books");
		} catch (submitError) {
			console.error("Error creating book:", submitError);
			setError("Create failed. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded border border-slate-300 bg-white p-6">
			<h2 className="text-lg font-semibold text-slate-800">Create Book</h2>

			<div className="space-y-3">
				<div className="flex w-full items-stretch">
					<label className="min-w-24 border border-slate-700 bg-slate-100 px-3 py-2 text-sm">Title</label>
					<input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full border-y border-r border-slate-700 px-3 py-2 text-sm outline-none"
					/>
				</div>

				<div className="flex w-full items-stretch">
					<label className="min-w-24 border border-slate-700 bg-slate-100 px-3 py-2 text-sm">Author</label>
					<select
						value={authorId}
						onChange={(e) => setAuthorId(Number(e.target.value))}
						className="w-full border-y border-r border-slate-700 px-3 py-2 text-sm outline-none"
					>
						<option value={0}>Select author</option>
						{authors.map((author) => (
							<option key={author.id} value={author.id}>
								{author.name}
							</option>
						))}
					</select>
				</div>

				{error && <p className="border-b-2 border-dotted border-red-400 text-red-600">* {error}</p>}
			</div>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={() => navigate("/books")}
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
