import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export const CreateAuthor = () => {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (!name.trim()) {
			setError("Please enter name");
			return;
		}

		setError("");
		setSubmitting(true);
		try {
			await api.post("/authors", { name: name.trim() });
			navigate("/authors");
		} catch (submitError) {
			console.error("Error creating author:", submitError);
			setError("Create failed. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded border border-slate-300 bg-white p-6">
			<h2 className="text-lg font-semibold text-slate-800">Create Author</h2>

			<div>
				<div className="flex w-full items-stretch">
					<label className="min-w-24 border border-slate-700 bg-slate-100 px-3 py-2 text-sm">Name</label>
					<input
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full border-y border-r border-slate-700 px-3 py-2 text-sm outline-none"
					/>
				</div>
				{error && <p className="mt-1 border-b-2 border-dotted border-red-400 text-red-600">* {error}</p>}
			</div>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={() => navigate("/authors")}
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
