# Recruitment Offer Portal - Setup Guide

## Project Structure

```
recruitment-offer-portal/
├── backend/                 # Node.js + Express + MongoDB
│   ├── config/             # Database configuration
│   ├── controller/         # Business logic
│   ├── middleware/         # Authentication middleware
│   ├── model/             # Mongoose schemas
│   ├── route/             # API routes
│   └── index.js           # Server entry point
│
└── frontend/Auto-offer/    # React + Vite + Tailwind CSS + Flowbite
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── context/       # Authentication context
    │   ├── pages/         # Page components
    │   ├── services/      # API service layer
    │   └── utils/         # Utility functions
    └── package.json
```

## Backend API Endpoints

### Authentication
- `POST /createUser` - Register new user
- `POST /login` - Login user

### Candidates (Protected)
- `POST /createCandidate` - Create new candidate
- `GET /getAllCandidates` - Get all candidates
- `GET /getCandidate/:id` - Get single candidate
- `PATCH /updateCandidate/:id` - Update candidate
- `DELETE /deleteCandidate/:id` - Delete candidate

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=offerLetterPortal
PORT=5000
```

Start backend server:
```bash
npm start
```

Server will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend/Auto-offer
npm install
```

Start frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Features

### Authentication
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Persistent login session

### Candidate Management
- ✅ Create new candidate offers
- ✅ View all candidates in a table
- ✅ View individual candidate details
- ✅ Edit candidate information
- ✅ Delete candidates
- ✅ Search and filter capabilities

### UI/UX
- ✅ Modern, clean design inspired by UPRIO
- ✅ Responsive layout (mobile-friendly)
- ✅ Tailwind CSS for styling
- ✅ Flowbite React components
- ✅ Professional color scheme (blue/indigo theme)
- ✅ Intuitive navigation

## Usage Flow

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in at `/login`
3. **Dashboard**: View all candidates
4. **Add Candidate**: Click "Add Candidate" button
5. **Edit**: Click edit icon on any candidate
6. **View Details**: Click view icon to see full details
7. **Delete**: Click delete icon to remove candidate

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Bcrypt for password hashing

### Frontend
- React 19
- Vite
- React Router DOM v6
- Tailwind CSS v3
- Flowbite React
- Axios
- React Icons

## Default Credentials

After registering, use your own credentials to login.

## Notes

- Backend must be running before starting frontend
- Make sure MongoDB is connected
- CORS is enabled for cross-origin requests
- Tokens are stored in localStorage
