"use client";
import { useState } from "react";

export default function PrivacySettings() {
  const [visibility, setVisibility] = useState("public");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleUpdate = async () => {
    const res = await fetch("/api/privacy-settings/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility, private: isPrivate }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <h2>Privacy Settings</h2>
      <select onChange={(e) => setVisibility(e.target.value)}>
        <option value="public">Public</option>
        <option value="followers">Followers</option>
        <option value="private">Only Me</option>
      </select>
      <label>
        <input type="checkbox" onChange={(e) => setIsPrivate(e.target.checked)} />
        Private Account
      </label>
      <button onClick={handleUpdate}>Save Settings</button>
    </div>
  );
}
