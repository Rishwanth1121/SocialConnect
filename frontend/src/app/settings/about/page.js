'use client'
import './page.css';

export default function About() {
  return (
    <div className="page-container">
      <h1>About SocialConnect</h1>

      <p>
        <strong>SocialConnect</strong> is a next-generation social platform designed to help people connect, communicate, and collaborate in meaningful ways.
        Whether you are looking to make new friends, join interest-based communities, or express yourself through posts and discussions, SocialConnect provides a friendly and secure space to do it all.
      </p>

      <h2>🚀 Core Features</h2>
      <ul>
        <li>👤 Personal profile creation and editing</li>
        <li>🤝 Add, view, and manage friends</li>
        <li>🔎 Search for users and communities</li>
        <li>🌐 Create, join, edit, and manage communities</li>
        <li>🖼️ Post content with text and optional images</li>
        <li>❤️ Like and 💬 comment on posts</li>
        <li>💬 Real-time chat in communities and one-on-one DMs</li>
        <li>🎤 Voice message support in chat</li>
        <li>🔔 Notification system for interactions and changes</li>
        <li>🔐 Privacy settings, block users, delete account</li>
      </ul>

      <h2>🛠️ Built With</h2>
      <p>
        ❤️ <strong>Django</strong> on the backend for robust API, authentication, and real-time channels<br />
        ⚛️ <strong>Next.js</strong> on the frontend for fast, interactive UI<br />
        🔊 <strong>Django Channels</strong> for real-time messaging<br />
        💾 <strong>MySQL</strong> for scalable data storage
      </p>

      <h2>👥 Team</h2>
      <p>
        <strong>Maintainer:</strong> Rishwanth M<br />
        Designer, developer, and architect of the full platform.
      </p>

      <h2>📅 Roadmap (Upcoming Features)</h2>
      <ul>
        <li>📸 Story sharing and disappearing messages</li>
        <li>📅 Event creation within communities</li>
        <li>📱 Mobile PWA version</li>
        <li>📊 Community analytics and engagement stats</li>
        <li>🧑‍💻 Admin dashboards for moderation</li>
      </ul>

      <p><strong>Version:</strong> 1.0.0</p>
    </div>
  );
}
