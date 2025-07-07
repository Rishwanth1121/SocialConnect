"use client";
import Link from "next/link";
import "./page.css";

const settings = [
  { name: "Change Password", href: "/settings/change-password" },
  { name: "Delete Account", href: "/settings/delete-account" },
  { name: "Who Can View My Profile and Posts", href: "/settings/privacy" },
  { name: "Block Users", href: "/settings/block-users" },
  { name: "Private Account", href: "/settings/privacy" },
  { name: "Help & Support", href: "/settings/help-support" },
  { name: "About", href: "/settings/about" },
];

export default function SettingsPage() {
  return (
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>
      <ul className="settings-list">
        {settings.map((item) => (
          <li key={item.name} className="settings-item">
            <Link href={item.href}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}