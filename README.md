# Workcohol_project
A social community platform.
# 🧠 Workcohol – A Community-Based Social Platform

**Workcohol** is a full-stack community-centric social media platform designed to connect like-minded individuals. Developed using **Django (REST Framework)** and **Next.js**, this platform supports features like posting content, managing user profiles, joining communities, commenting, and real-time notifications.

---

## 🚀 Technologies Used

### 🖥 Frontend:
- Next.js
- React.js
- Tailwind CSS / CSS Modules
- Axios
- React Hooks (useState, useEffect)

### 🧠 Backend:
- Django
- Django REST Framework
- SQLite (default) / MySQL (optional)
- CORS Headers
- JWT/Session Authentication

---

## ✨ Features

- 🔐 User Authentication (Login, Register, Logout)
- 👥 Create and Manage Communities
- 📸 Create Posts with Image Uploads
- 💬 Comment on Posts
- 🧑‍💼 Edit & View User Profiles
- 🔍 Global Search for Users and Communities
- 🛡️ Block Users and Set Privacy Preferences
- 🔔 Notification System
- 📦 Media Upload and Access via Django

---

## 🛠 Setup Instructions

### ⚙️ Prerequisites:
- Python 3.10+
- Node.js 18+
- MySQL (optional) or SQLite
- VS Code or any IDE

---

## 🔧 Backend (Django)

```bash
# Navigate to backend directory
cd social_platform

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Run server
python manage.py runserver
