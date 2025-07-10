"use client";
import Link from "next/link";
import "./page.css";

const settings = [
  { name: "Change Password", href: "/settings/change-password", icon: "🔐" },
  { name: "Delete Account", href: "/settings/delete-account", icon: "🗑️" },
  { name: "Block Users", href: "/settings/block-users", icon: "🚫" },
  { name: "Help & Support", href: "/settings/help-support", icon: "🆘" },
  { name: "About", href: "/settings/about", icon: "ℹ️" },
];

export default function SettingsPage() {
  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      <ul className="settings-list">
        {settings.map((item) => (
          <li key={item.name} className="settings-item">
            <Link href={item.href} className="settings-link">
              <span className="settings-icon">{item.icon}</span>
              <span className="settings-text">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
