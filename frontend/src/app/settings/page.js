'use client'
import './page.css';

export default function HelpSupport() {
  return (
    <div className="page-container">
      <h1>Help & Support</h1>

      <p>
        We're here to help you make the most out of SocialConnect. Whether you need assistance with your account, reporting a bug, or understanding how a feature works, this page provides the help you need.
      </p>

      <h2>📌 Common Questions</h2>
      <ul>
        <li><strong>How do I reset my password?</strong><br />Go to Settings → Change Password and follow the instructions.</li>
        <li><strong>How can I delete my account?</strong><br />Navigate to Settings → Delete Account. Warning: This action is permanent.</li>
        <li><strong>How do I block someone?</strong><br />Use Settings → Block Users to prevent someone from interacting with you.</li>
        <li><strong>Can I edit a community I created?</strong><br />Yes! Go to the Communities page, click the three dots, and select Edit.</li>
        <li><strong>Where are voice messages available?</strong><br />In both group and private chat conversations.</li>
      </ul>

      <h2>📬 Contact Support</h2>
      <p>
        Need more help? Reach out to our team at <strong>support@socialconnect.com</strong> and we’ll get back to you within 24 hours.
      </p>

      <h2>📚 Help Center</h2>
      <p>
        For detailed guides and feature walkthroughs, visit our <a href="/help-center">Help Center</a> (coming soon).
      </p>
    </div>
  );
}
