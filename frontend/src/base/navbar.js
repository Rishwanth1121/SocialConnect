'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './navbar.css';

export default function Navbar({ profileImage }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/", {
          credentials: "include",
        });
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const checkUnreadNotifications = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/notifications/has_unread/", {
          credentials: "include",
        });
        const data = await res.json();
        setHasUnread(data.has_unread);
      } catch {
        setHasUnread(false);
      }
    };
    checkUnreadNotifications();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/logout/", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      router.push("/login");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const wrapper = document.querySelector('.profile-wrapper');
      if (isDropdownOpen && wrapper && !wrapper.contains(e.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <i className="fas fa-users"></i>
        <span>SocialConnect</span>
      </div>

      <div className="nav-links">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          <i className="fas fa-home"></i> Home
        </Link>
        <Link href="/posts" className={pathname.includes('/posts') ? 'active' : ''}>
          <i className="fas fa-newspaper"></i> Posts
        </Link>
        <Link href="/communities" className={pathname.includes('/communities') ? 'active' : ''}>
          <i className="fas fa-users"></i> Communities
        </Link>

        <Link href="/search" className="nav-link">
          <i className="fas fa-search"></i>
        </Link>

        {isLoggedIn ? (
          <>
            <Link href="/notifications" className="notification-icon">
              <i className="fas fa-bell"></i>
              {hasUnread && <span className="notification-badge-dot" />}
            </Link>
            <div className="profile-wrapper">
              <img
                src={profileImage || '/images/default-profile.png'}
                alt="Profile"
                className="profile-icon"
                onClick={toggleDropdown}
              />
              <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <Link href="/profile"><i className="fas fa-user"></i> Profile</Link>
                <Link href="/settings"><i className="fas fa-cog"></i> Settings</Link>
                <Link href="/myposts"><i className="fas fa-file-alt"></i> My Posts</Link>
                <Link href="/users"><i className="fas fa-user-friends"></i> Users</Link>
                <button onClick={handleLogout} className="logout-button">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <Link href="/login" className="btn-login">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        )}
      </div>
    </nav>
  );
}
