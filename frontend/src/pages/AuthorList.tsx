import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Author, PagedResponse } from "../types";

export const AuthorList = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
    const [editName, setEditName] = useState("");
    const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchAuthors = async (targetPage: number) => {
        try {
            const response = await api.get("/authors", {
                params: { page: targetPage, page_size: 5 },
            });
            const payload = response.data as PagedResponse<Author>;
            setAuthors(payload.items ?? []);
            setPage(payload.page ?? targetPage);
            setTotalPages(payload.total_pages ?? 1);
        } catch (error) {
            console.error("Error fetching authors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors(page);
    }, []);

    const openEditModal = (author: Author) => {
        setEditingAuthor(author);
        setEditName(author.name);
    };

    const handleUpdate = async () => {
        if (!editingAuthor || !editName.trim()) {
            return;
        }
        setSubmitting(true);
        try {
            await api.put(`/authors/${editingAuthor.id}`, {
                name: editName.trim(),
            });
            setEditingAuthor(null);
            await fetchAuthors(page);
        } catch (error) {
            console.error("Error updating author:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingAuthor) {
            return;
        }
        setSubmitting(true);
        try {
            await api.delete(`/authors/${deletingAuthor.id}`);
            setDeletingAuthor(null);
            await fetchAuthors(page);
        } catch (error) {
            console.error("Error deleting author:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-sm text-slate-500">Loading authors...</div>;

    return (
        <div className="space-y-4">
            <div className="rounded border border-slate-400 bg-white overflow-hidden">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-slate-200">
                            <th className="w-16 border border-slate-500 px-3 py-1 text-center">No</th>
                            <th className="border border-slate-500 px-3 py-1">Name</th>
                            <th className="w-24 border border-slate-500 px-3 py-1 text-center">Books</th>
                            <th className="w-40 border border-slate-500 px-3 py-1 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {authors.map((author, index) => (
                            <tr key={author.id}>
                                <td className="border border-slate-500 px-3 py-1 text-center">{(page - 1) * 5 + index + 1}</td>
                                <td className="border border-slate-500 px-3 py-1">{author.name}</td>
                                <td className="border border-slate-500 px-3 py-1 text-center">{author.book_count ?? 0}</td>
                                <td className="border border-slate-500 px-2 py-1 bg-yellow-100">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(author)}
                                            className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white hover:bg-blue-700"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingAuthor(author)}
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
                    onClick={() => fetchAuthors(page - 1)}
                    className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-slate-600">Page {page}/{totalPages}</span>
                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => fetchAuthors(page + 1)}
                    className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {editingAuthor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
                        <h2 className="text-lg font-semibold text-slate-800">Update Author</h2>
                        <div className="mt-3 space-y-2">
                            <label className="block text-sm text-slate-600">Name</label>
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setEditingAuthor(null)}
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

            {deletingAuthor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded bg-white p-4 shadow-lg">
                        <h2 className="text-lg font-semibold text-slate-800">Delete Author</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Are you sure you want to delete <strong>{deletingAuthor.name}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeletingAuthor(null)}
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