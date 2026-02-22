import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Scrollable from "../components/Scrollable";
import ConfirmationModal from "../components/ConfirmationModal";

const TicketComment = () => {
  const { token, user } = useContext(AuthContext);
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newSelectedFiles, setNewSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editSelectedFiles, setEditSelectedFiles] = useState([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);

  // delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deletingComment, setDeletingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/tickets/${encodeURIComponent(id)}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          },
        );

        // protect against non-JSON or empty responses
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json")
          ? await res.json().catch(() => null)
          : null;

        // backend may wrap payload in { status|statusCode, data }
        const payload = data && (data.data || data) ? data.data || data : data;

        if (res.ok && payload) {
          setTicket(payload);
        } else if (res.ok && !payload) {
          // maybe API returned ticket directly as JSON
          setTicket(data);
        } else {
          setError(
            data?.message || `Unable to load ticket (HTTP ${res.status})`,
          );
        }
      } catch (err) {
        console.error("Fetch ticket error:", err);
        setError("Network error while loading ticket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    setLoadingComments(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${encodeURIComponent(id)}/comments`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json().catch(() => null)
        : null;
      const payload = data && (data.data || data) ? data.data || data : data;

      if (res.ok && Array.isArray(payload)) {
        const normalized = payload.map((c) => ({
          id: c.id,
          text: c.comment ?? "",
          createdAt: c.createdAt ?? c.createdAt,
          updatedAt: c.updatedAt,
          authorEmail: c.authorEmail ?? c.author,
        }));
        setComments(normalized);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (!id) return;
    fetchComments();
  }, [id, token, fetchComments]);

  const handleSubmitComment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newComment || !newComment.trim()) {
      if (!newSelectedFiles || newSelectedFiles.length === 0) return;
    }
    if (!token) return;

    setSubmitting(true);
    try {
      // send multipart/form-data including files
      const form = new FormData();
      form.append("comment", newComment.trim());
      newSelectedFiles.forEach((f) => form.append("files", f));

      setUploadingMessage("Uploading...");

      const res = await fetch(
        `http://localhost:8080/api/tickets/${encodeURIComponent(id)}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        },
      );

      if (res.status === 201) {
        setNewComment("");
        setNewSelectedFiles([]);
        await fetchComments();
      } else {
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json")
          ? await res.json().catch(() => null)
          : null;
        console.error("Failed to post comment:", res.status, data);
      }
    } catch (err) {
      console.error("Submit comment error:", err);
    } finally {
      setSubmitting(false);
      setUploadingMessage("");
    }
  };

  const isAdminUser = () => {
    if (!user) return false;
    if (Array.isArray(user.roles) && user.roles.includes("ROLE_ADMIN"))
      return true;
    if (
      Array.isArray(user.authorities) &&
      user.authorities.includes("ROLE_ADMIN")
    )
      return true;
    return false;
  };

  // Opens the confirmation modal for a comment
  const handleDeleteComment = (comment) => {
    if (!comment) return;
    setCommentToDelete({ id: comment.id ?? comment, text: comment.text ?? "" });
    setIsDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete?.id) {
      cancelDelete();
      return;
    }
    if (!token) return;

    setDeletingComment(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/comments/${encodeURIComponent(commentToDelete.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        await fetchComments();
        setIsDeleteModalOpen(false);
        setCommentToDelete(null);
      } else {
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json")
          ? await res.json().catch(() => null)
          : null;
        console.error("Failed to delete comment:", res.status, data);
      }
    } catch (err) {
      console.error("Delete comment error:", err);
    } finally {
      setDeletingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!commentId) return;
    if (!editContent || !editContent.trim()) {
      if (!editSelectedFiles || editSelectedFiles.length === 0) return;
    }
    if (!token) return;

    setEditSubmitting(true);
    try {
      const form = new FormData();
      form.append("comment", editContent.trim());
      editSelectedFiles.forEach((f) => form.append("files", f));

      setUploadingMessage("Uploading...");

      const res = await fetch(
        `http://localhost:8080/api/comments/${encodeURIComponent(commentId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        },
      );

      if (res.ok) {
        setEditingCommentId(null);
        setEditContent("");
        setEditSelectedFiles([]);
        await fetchComments();
      } else {
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json")
          ? await res.json().catch(() => null)
          : null;
        console.error("Failed to update comment:", res.status, data);
      }
    } catch (err) {
      console.error("Update comment error:", err);
    } finally {
      setEditSubmitting(false);
      setUploadingMessage("");
    }
  };

  // reusable file validation + handlers
  const allowedExt = /\.(jpe?g|png|xls|xlsx|doc|docx|csv|pdf)$/i;
  const validateFiles = (fileList) => {
    const ok = [];
    for (const f of Array.from(fileList)) {
      if (allowedExt.test(f.name)) ok.push(f);
      else console.warn("Rejected file (invalid type):", f.name);
    }
    return ok;
  };

  const FileDropZone = ({ files, setFiles, idPrefix = "fdz" }) => {
    const inputRef = useRef(null);

    const onFiles = (fileList) => {
      const validated = validateFiles(fileList);
      if (validated.length === 0) return;
      // append to existing
      setFiles((prev) => [...prev, ...validated]);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files) {
        onFiles(e.dataTransfer.files);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    return (
      <div>
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="mt-3 border-2 border-dashed border-gray-300 rounded p-3 text-center cursor-pointer"
        >
          <input
            ref={inputRef}
            id={`${idPrefix}-input`}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
            accept=".jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx,.csv"
          />
          <div className="text-sm text-gray-500">
            Drag & drop files here, or click to select
          </div>
          <div className="text-xs text-gray-400">
            Allowed: JPG, PNG, XLS, XLSX, DOC, DOCX, CSV
          </div>
        </div>

        {files && files.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {files.map((f, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <div className="truncate mr-2">
                  {f.name}{" "}
                  <span className="text-xs text-gray-400">
                    ({Math.round(f.size / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="ml-2 text-red-500 font-bold px-2"
                  aria-label={`Remove ${f.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ticket Details</h2>
        </div>
        {loading ? (
          <div className="text-gray-600">Loading ticket...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : ticket ? (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-medium mb-1">{ticket.subject}</h3>
            <div className="text-sm text-gray-500 mb-2">
              Status: {ticket.status || "N/A"}
            </div>
            <p className="text-gray-800 mb-4">{ticket.description || "-"}</p>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div>
                Start:{" "}
                {ticket.startDate
                  ? new Date(ticket.startDate).toLocaleDateString()
                  : "-"}
              </div>
              <div>
                Due:{" "}
                {ticket.dueDate
                  ? new Date(ticket.dueDate).toLocaleDateString()
                  : "-"}
              </div>
              <div>
                Updated:{" "}
                {ticket.updatedAt
                  ? new Date(ticket.updatedAt).toLocaleString()
                  : "-"}
              </div>
            </div>

            <hr className="my-4" />

            <h4 className="font-semibold mb-2">Comments</h4>
            {loadingComments ? (
              <div className="text-gray-600">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-gray-500">No comments yet.</div>
            ) : (
              <ul className="space-y-3">
                {comments.map((c) => (
                  <li key={c.id} className="p-3 bg-gray-50 rounded">
                    {editingCommentId === c.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full border border-gray-300 rounded p-2 resize-y text-sm"
                          rows={3}
                        />
                        <FileDropZone
                          files={editSelectedFiles}
                          setFiles={setEditSelectedFiles}
                          idPrefix={`edit-${c.id}`}
                        />
                        <div className="mt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateComment(c.id)}
                            disabled={
                              editSubmitting ||
                              ((!editContent || !editContent.trim()) &&
                                editSelectedFiles.length === 0)
                            }
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {editSubmitting ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null);
                              setEditContent("");
                            }}
                            className="px-3 py-1 text-sm text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                          {c.text}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-xs text-gray-500">
                            {c.authorEmail || "Unknown"} •{" "}
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleString()
                              : "-"}
                          </div>
                          <div className="text-xs">
                            {(user?.email === c.authorEmail ||
                              isAdminUser()) && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCommentId(c.id);
                                    setEditContent(c.text || "");
                                    setEditSelectedFiles([]);
                                  }}
                                  className="text-sm text-blue-600 hover:underline mr-3"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(c)}
                                  className="text-sm text-red-600 hover:underline"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <hr className="my-4" />

            <form onSubmit={handleSubmitComment} className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add a comment
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 resize-y min-h-[80px] text-sm"
                placeholder="Write your comment..."
                rows={4}
              />
              <FileDropZone
                files={newSelectedFiles}
                setFiles={setNewSelectedFiles}
                idPrefix="new"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    ((!newComment || !newComment.trim()) &&
                      newSelectedFiles.length === 0)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingMessage ||
                    (submitting ? "Posting..." : "Post Comment")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-gray-600">Ticket not found.</div>
        )}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Comment"
          message={`Are you sure you want to delete this comment "${(commentToDelete?.text || "").slice(0, 140)}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={confirmDeleteComment}
          onCancel={cancelDelete}
          isLoading={deletingComment}
        />

        <Scrollable />
      </div>
    </>
  );
};

export default TicketComment;
