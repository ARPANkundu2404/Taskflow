import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const TicketComment = () => {
  const { token } = useContext(AuthContext);
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const fetchTicket = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/${encodeURIComponent(id)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // protect against non-JSON or empty responses
        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json().catch(() => null) : null;

        // backend may wrap payload in { status|statusCode, data }
        const payload = data && (data.data || data) ? (data.data || data) : data;

        if (res.ok && payload) {
          setTicket(payload);
        } else if (res.ok && !payload) {
          // maybe API returned ticket directly as JSON
          setTicket(data);
        } else {
          setError(data?.message || `Unable to load ticket (HTTP ${res.status})`);
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

  useEffect(() => {
    if (!id) return;
    setLoadingComments(true);

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/${encodeURIComponent(id)}/comments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const ct = res.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await res.json().catch(() => null) : null;
        const payload = data && (data.data || data) ? (data.data || data) : data;

        // payload is expected as array of comment objects:
        // { id, comment, createdAt, updatedAt, authorId, authorEmail }
        if (res.ok && Array.isArray(payload)) {
          // normalize to local shape (optional)
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
    };

    fetchComments();
  }, [id, token]);

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
            <div className="text-sm text-gray-500 mb-2">Status: {ticket.status || "N/A"}</div>
            <p className="text-gray-800 mb-4">{ticket.description || "-"}</p>

            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div>Start: {ticket.startDate ? new Date(ticket.startDate).toLocaleDateString() : "-"}</div>
              <div>Due: {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : "-"}</div>
              <div>Updated: {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : "-"}</div>
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
                    <div className="text-sm text-gray-700">{c.text}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {c.authorEmail || "Unknown"} • {c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="text-gray-600">Ticket not found.</div>
        )}
      </div>
    </>
  );
};

export default TicketComment;