'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './page.css';

export default function EditCommunityPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    purpose: '',
    image: null,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const [communityRes, currentUserRes] = await Promise.all([
          fetch(`http://localhost:8000/api/communities/${id}/`, { credentials: 'include' }),
          fetch(`http://localhost:8000/api/user/`, { credentials: 'include' }),
        ]);

        if (!communityRes.ok || !currentUserRes.ok) throw new Error('Failed to load data');

        const community = await communityRes.json();
        const currentUser = await currentUserRes.json();

        setIsAdmin(currentUser.id === community.created_by.id);
        setFormData({
          name: community.name || '',
          description: community.description || '',
          purpose: community.purpose || '',
          image: null,
        });
      } catch (err) {
        console.error('Error loading:', err);
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [id]);

  const getCSRFToken = () => {
    const match = document.cookie.match(/csrftoken=([\w-]+)/);
    return match ? match[1] : '';
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const csrfToken = getCSRFToken();
      const bodyData = new FormData();

      bodyData.append('name', formData.name);
      bodyData.append('description', formData.description);
      bodyData.append('purpose', formData.purpose);
      if (formData.image) {
        bodyData.append('image', formData.image);
      }

      const response = await fetch(`http://localhost:8000/api/communities/${id}/edit/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        body: bodyData,
      });

      if (!response.ok) {
        throw new Error('Failed to update community');
      }

      router.push('/communities');
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update community');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!isAdmin) return <div className="container alertError">Only the admin can edit this community.</div>;

  return (
    <div className="container">
      <h1 className="formTitle">Edit Community Profile</h1>
      {error && <div className="alertError">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="formGroup">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formGroup">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="formGroup">
          <label>Purpose</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
          />
        </div>

        <div className="formGroup">
          <label>Profile Picture</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submitBtn" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
