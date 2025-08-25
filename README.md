# Erino Lead Management System

A complete lead management system built with React frontend and Node.js backend, featuring JWT authentication, MongoDB database, and AG Grid for data management.

## 🚀 Features

### Authentication
- User registration and login with JWT tokens
- Secure httpOnly cookie-based authentication
- Password hashing with bcrypt
- Protected routes and middleware

### Lead Management
- Complete CRUD operations for leads
- Advanced filtering and search capabilities
- Pagination support
- Real-time data grid with AG Grid
- Lead scoring and qualification tracking

### User Interface
- Modern, responsive design with TailwindCSS
- Beautiful dashboard with statistics
- Intuitive forms with validation
- Mobile-friendly layout
- Toast notifications for user feedback

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **AG Grid** - Advanced data grid component
- **React Hook Form** - Form management and validation
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd erino-lead-management
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/erino_leads

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB installation
mongod

# Or if using MongoDB Atlas, update the MONGODB_URI in .env
```

### 5. Run the Application

#### Development Mode (Both Frontend and Backend)

From the root directory:

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

#### Individual Servers

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Leads
- `GET /api/leads` - Get leads with pagination and filters
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get single lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

## 🔧 Configuration

### Database Schema

#### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

#### Lead Model
```javascript
{
  first_name: String (required),
  last_name: String (required),
  email: String (unique, required),
  phone: String,
  company: String,
  city: String,
  state: String,
  source: Enum (website, facebook_ads, google_ads, referral, events, other),
  status: Enum (new, contacted, qualified, lost, won),
  score: Number (0-100),
  lead_value: Number,
  last_activity_at: Date,
  is_qualified: Boolean,
  created_by: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Filtering Options

The leads API supports advanced filtering:

- **String fields** (email, company, city): `equals`, `contains`
- **Enum fields** (status, source): `equals`, `in`
- **Number fields** (score, lead_value): `equals`, `gt`, `lt`, `between`
- **Date fields** (created_at, last_activity_at): `on`, `before`, `after`, `between`
- **Boolean fields** (is_qualified): `equals`

Example filter:
```javascript
{
  "status": { "in": ["new", "contacted"] },
  "score": { "gt": 50 },
  "company": { "contains": "tech" }
}
```

## 🎨 UI Components

### Status Badges
- New: Blue
- Contacted: Yellow
- Qualified: Green
- Lost: Red
- Won: Emerald

### Color Scheme
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

## 🔒 Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet security headers
- Protected API routes

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Backend Deployment

1. Set environment variables for production
2. Build the application: `npm run build`
3. Start the server: `npm start`

### Frontend Deployment

1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify your MongoDB connection
3. Ensure all environment variables are set correctly
4. Check that all dependencies are installed

## 🎯 Future Enhancements

- Email notifications
- Lead import/export functionality
- Advanced analytics and reporting
- Team collaboration features
- API rate limiting dashboard
- Real-time notifications
- Mobile app development

