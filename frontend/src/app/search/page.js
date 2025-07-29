"use client";
import './page.css';
import { useState, useEffect } from "react";
import axios from "axios";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [friendIds, setFriendIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }

    fetchFriendsList();  // fetch existing friends initially
  }, []);

  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    return match ? match[1] : '';
  };

  const fetchFriendsList = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/friends/list/", {
        withCredentials: true,
      });
      const ids = res.data.map(friend => friend.id);
      setFriendIds(new Set(ids));
    } catch (err) {
      console.error("Error fetching friends list:", err);
    }
  };

  const handleSearch = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/search?q=${searchQuery}`, {
        withCredentials: true,
      });

      const data = response.data;
      const users = data.users || [];
      const communities = data.communities || [];

      const processedUsers = users.map(user => ({
        ...user,
        type: "user"
      }));
      const processedCommunities = communities.map(comm => ({
        ...comm,
        type: "community"
      }));

      setResults([...processedUsers, ...processedCommunities]);
      setSentRequests(new Set(data.sent_requests || []));
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      window.history.pushState({}, "", `?q=${encodeURIComponent(query)}`);
      handleSearch(query);
    }
  };

  const sendFriendRequest = async (userId) => {
    try {
      const csrfToken = getCSRFToken();
      await axios.post(
        "http://localhost:8000/api/friends/request/",
        { user_id: userId },
        {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setSentRequests((prev) => new Set(prev).add(userId));
    } catch (err) {
      console.error("Friend request failed:", err);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users or communities..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px 0 0 6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 16px",
            background: "#6c63ff",
            color: "white",
            border: "none",
            borderRadius: "0 6px 6px 0",
          }}
        >
          🔍
        </button>
      </form>

      {query && <h3 style={{ marginTop: "1rem" }}>Results for &quot;{query}&quot;</h3>}

      {isLoading ? (
        <p>Loading...</p>
      ) : results.length > 0 ? (
        results.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "16px",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <img
                src={item.profile_image || item.profile_photo || "/default.png"}
                alt="avatar"
                style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <strong>{item.username || item.name}</strong>
                <p style={{ margin: 0, color: "#666" }}>{item.description || "No bio available"}</p>
              </div>
            </div>

            {item.type === "user" ? (
              friendIds.has(item.id) ? (
                <span style={{ color: "#6c63ff", fontWeight: "bold" }}>Friends</span>
              ) : sentRequests.has(item.id) ? (
                <span style={{ color: "green" }}>Request Sent</span>
              ) : (
                <button
                  onClick={() => sendFriendRequest(item.id)}
                  style={{
                    padding: "8px 12px",
                    background: "#6c63ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Add Friend
                </button>
              )
            ) : (
              <span style={{ fontStyle: "italic", color: "#444" }}>Community</span>
            )}
          </div>
        ))
      ) : (
        <p style={{ marginTop: "1rem", textAlign: "center" }}>No results found.</p>
      )}
    </div>
  );
}
