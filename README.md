# Europ Assistance - Full Stack Application

A comprehensive insurance assistance platform built with Node.js, Express, MongoDB, React, and TypeScript.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Customer Management**: Complete CRUD operations for customer data
- **Policy Management**: Insurance policy tracking and management
- **Segment Management**: Customer segmentation for targeted services
- **Dashboard Analytics**: Real-time charts and metrics for business insights
- **Interactive UI**: Modern React interface with Material-UI components

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Zod** for schema validation
- **Bcryptjs** for password hashing
- **Morgan** for HTTP request logging
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Frontend
- **React 19** with **TypeScript**
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Styled Components** for styling
- **Vite** for build tooling

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd europ-assistance
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .example.env .env
```

### 3. Environment Configuration

Edit the `.env` file in the backend directory with your configuration:

```env
# Environment
NODE_ENV=development
PORT=8080

# Database
MONGODB_URI=mongodb://localhost:27017/europ-assistance
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/europ-assistance

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# JWT Secret (use a strong secret in production)
JWT_SECRET=your-jwt-secret-key
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:8080`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

### Production Mode

#### Build and Start Backend
```bash
cd backend
npm run build
npm start
```

#### Build Frontend
```bash
cd frontend
npm run build
```

## 📁 Project Structure

```
europ-assistance/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Utility functions
│   │   ├── validations/     # Zod schemas
│   │   ├── app.ts           # Express app configuration
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── component/       # Reusable components
│   │   ├── constant/        # Application constants
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layout/          # Layout components
│   │   ├── pages/           # Page components
│   │   ├── routes/          # Routing configuration
│   │   ├── theme/           # Material-UI theme
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main App component
│   │   └── main.tsx         # Application entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Customers
- `GET /api/customers` - Get all customers (with filtering)
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Policies
- `GET /api/policies` - Get all policies
- `POST /api/policies` - Create new policy
- `GET /api/policies/:id` - Get policy by ID
- `PUT /api/policies/:id` - Update policy
- `DELETE /api/policies/:id` - Delete policy

### Segments
- `GET /api/segments` - Get all segments
- `POST /api/segments` - Create new segment
- `GET /api/segments/:id` - Get segment by ID
- `PUT /api/segments/:id` - Update segment
- `DELETE /api/segments/:id` - Delete segment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/revenue` - Get revenue data
- `GET /api/dashboard/customers` - Get customer analytics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Security headers with Helmet
- CORS protection
- Input validation with Zod schemas

## 🧪 Development Scripts

### Backend Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm run start    # Start production server
```

### Frontend Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify the MONGODB_URI in your .env file

2. **Port Already in Use**
   - Change the PORT in your .env file
   - Kill processes using the default ports (8080 for backend, 5173 for frontend)

3. **CORS Issues**
   - Ensure ALLOWED_ORIGINS in .env matches your frontend URL
   - Check that frontend is running on the correct port

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript version compatibility

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode | development | No |
| PORT | Backend server port | 8080 | No |
| MONGODB_URI | MongoDB connection string | - | Yes |
| ALLOWED_ORIGINS | CORS allowed origins | - | No |
| JWT_SECRET | JWT signing secret | - | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Review the existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Coding! 🚀**