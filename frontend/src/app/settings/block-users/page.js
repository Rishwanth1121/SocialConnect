"use client";
import { useState } from "react";

export default function BlockUsers() {
  const [username, setUsername] = useState("");

  const handleBlock = async () => {
    const res = await fetch("/api/block-user/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div>
      <input placeholder="Username to block" onChange={(e) => setUsername(e.target.value)} />
      <button onClick={handleBlock}>Block User</button>
    </div>
  );
}