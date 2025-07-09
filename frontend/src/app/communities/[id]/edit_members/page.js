'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './page.css';

export default function EditCommunityMembersPage() {
  const { id } = useParams();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState([]);
  const [community, setCommunity] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const [communityRes, usersRes, currentUserRes] = await Promise.all([
          fetch(`http://localhost:8000/api/communities/${id}/`, { credentials: 'include' }),
          fetch(`http://localhost:8000/api/users/`, { credentials: 'include' }),
          fetch(`http://localhost:8000/api/user/`, { credentials: 'include' }),
        ]);

        if (!communityRes.ok || !usersRes.ok || !currentUserRes.ok) {
          throw new Error('Failed to load data');
        }

        const [communityData, usersData, currentUser] = await Promise.all([
          communityRes.json(),
          usersRes.json(),
          currentUserRes.json(),
        ]);

        setCommunity(communityData);
        setAllUsers(usersData);
        setSelectedMembers(communityData.members_info.map((member) => member.id));
        setIsAdmin(currentUser.id === communityData.created_by.id);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const csrfToken = getCSRFToken();

      const response = await fetch(
        `http://localhost:8000/api/communities/${id}/edit_members/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({ members: selectedMembers }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update members');
      }

      router.push('/communities');
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update members');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="container">Loading community data...</div>;

  if (!isAdmin) {
    return <div className="container alertError">Only the admin can edit members.</div>;
  }

  return (
    <div className="container">
      <h1 className="formTitle">Edit Community Members</h1>
      {error && <div className="alertError">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label className="formLabel">Select Members</label>
          <div className="checkboxList">
            {allUsers.map((user) => (
              <label key={user.id}>
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(user.id)}
                  onChange={() => toggleMember(user.id)}
                />{' '}
                {user.username}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="submitBtn" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
