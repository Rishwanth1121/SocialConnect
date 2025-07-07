"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css"; // your existing CSS file

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setError("");
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/delete-account/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Your account has been deleted.");
        router.push("/login");
      } else {
        setError(data.message || "Failed to delete account.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
      console.error(err);
    }
  };

  return (
    <div className="delete-account-container">
      <h2>Do you want to delete your account?</h2>
      <p>
        Once you delete your account, this action cannot be undone. All your data will be permanently removed.
      </p>

      <button className="btn-red" onClick={() => setModalVisible(true)}>
        Delete My Account
      </button>

      <button className="btn-gray" onClick={() => router.back()}>
        Go Back
      </button>

      {modalVisible && (
        <div className="confirmation-modal">
          <div className="confirmation-box">
            <h3>Are you sure?</h3>
            <p>This action will permanently delete your account.</p>

            <input
              type="password"
              placeholder="Enter your password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", margin: "1rem 0" }}
            />

            {error && <p style={{ color: "red", marginBottom: "0.5rem" }}>{error}</p>}

            <div className="button-group">
              <button className="cancel-btn" onClick={() => setModalVisible(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleDelete}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
