'use client'
import './page.css';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/profile/', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()

      // Add full image URL if needed
      if (data.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `http://localhost:8000${data.profile_image}`
      }

      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/friends/list/', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to load friends list')
      const data = await res.json()

      const updated = data.map(friend => ({
        ...friend,
        profile_image: friend.profile_image && !friend.profile_image.startsWith('http')
          ? `http://localhost:8000${friend.profile_image}`
          : friend.profile_image || '/images/default-profile.png',
      }))

      setFriends(updated)
    } catch (err) {
      console.error('Error fetching friends:', err)
    }
  }

  const handleRemoveFriend = async (friendId) => {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];

  try {
    const res = await fetch(`http://localhost:8000/api/friends/remove/${friendId}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      credentials: "include", // VERY IMPORTANT
    });

    if (!res.ok) {
      throw new Error("Failed to remove friend");
    }

    // optionally reload friends list or update UI
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
  } catch (err) {
    console.error("Error removing friend:", err);
  }
};


  useEffect(() => {
    fetchProfile()
    fetchFriends()
  }, [])

  if (loading) return <p className="text-center">Loading profile...</p>
  if (!profile) return <p className="text-center">No profile found</p>

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={profile.profile_image || '/images/default-profile.png'}
          alt="Profile"
          className="profile-image"
        />
        <h2>{profile.user.username}</h2>
        <p>Email: {profile.user.email}</p>
        <div className="profile-info">
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>Facebook:</strong> {profile.facebook || 'Not Provided'}</p>
          <p><strong>Twitter:</strong> {profile.twitter || 'Not Provided'}</p>
          <p><strong>Instagram:</strong> {profile.instagram || 'Not Provided'}</p>
          <p><strong>LinkedIn:</strong> {profile.linkedin || 'Not Provided'}</p>
        </div>
        <Link href="/profile/edit" className="edit-profile-btn">
          ✏️ Edit Profile
        </Link>
      </div>

      {/* Friends Section */}
      <div className="friends-list">
        <h3>Friends</h3>
        {friends.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>You have no friends yet.</p>
        ) : (
          <ul>
            {friends.map(friend => (
              <li key={friend.id} className="friend-item">
                <img
                  src={friend.profile_image}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <span className="friend-name">{friend.username}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFriend(friend.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
