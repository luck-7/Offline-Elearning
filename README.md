# 🚀 Offline E-Learning Portal

A comprehensive, production-ready eLearning web application built with React and Spring Boot that provides full functionality even with poor or no internet connection.

## 🎯 Features

- **Offline-First Architecture**: Full functionality in low/no network conditions
- **Interactive Learning Tools**: Canvas-based visual quizzes and drawing tools
- **Smart Content Loading**: Preloads lessons during idle time
- **Adaptive Content**: Adjusts quality based on network speed
- **Smooth Animations**: Intersection Observer for scroll-triggered animations
- **JWT Authentication**: Secure login with role-based access (Student/Teacher)
- **Progress Tracking**: Visual progress indicators and offline sync
- **PWA Support**: Installable as mobile app
- **Notification System**: Toast notifications for user feedback

## 🏗️ Architecture

```
offline-elearning-portal/
├── frontend/                 # React 18 frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utility functions
│   ├── public/
│   │   └── sw.js           # Service Worker
│   └── package.json
├── offline/                  # Spring Boot backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
├── DEPLOYMENT_GUIDE.md      # Complete deployment guide
├── ENVIRONMENT_VARIABLES.md # Environment configuration
└── README.md
```

## 🚀 Technology Stack

### Frontend
- **React 18**: Modern UI framework with hooks
- **React Router**: Client-side routing
- **Bootstrap 5**: Responsive CSS framework
- **Canvas API**: Interactive drawing and visual quizzes
- **Service Workers**: Offline caching and background sync
- **IndexedDB**: Local data storage
- **Network Information API**: Connection detection
- **Intersection Observer API**: Scroll animations
- **Background Tasks API**: Idle-time preloading

### Backend
- **Spring Boot 3**: REST API framework
- **Spring Security**: JWT authentication
- **Spring Data JPA**: Database abstraction
- **PostgreSQL**: Primary database
- **Maven**: Build and dependency management

## 🔧 Quick Setup

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- PostgreSQL

### Backend Setup
```bash
cd offline
mvn clean install
mvn spring-boot:run
```
API will be available at `http://localhost:8080/api`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend will be available at `http://localhost:3000`

## 📱 Key Features

### Offline Capabilities
- Service Worker caches essential app files
- IndexedDB stores lessons and progress locally
- Background sync when connection restored
- Visual offline/online status indicators
- Smart preloading during idle time

### Interactive Learning
- Canvas-based drawing tools with pen/eraser
- Interactive whiteboards for lessons
- Visual quizzes with shape drawing
- Progress visualization charts
- Undo/redo functionality

### Modern UI/UX
- Responsive design for all devices
- Smooth scroll animations
- Loading states and progress indicators
- Toast notification system
- Enhanced feature cards with hover effects
- Confirmation dialogs for important actions

## 🔐 Authentication & Roles

- **Students**: Access courses, take quizzes, track progress
- **Teachers**: Create/manage courses, view student progress
- **JWT Tokens**: Secure, stateless authentication
- **Role-based Access**: Different UI/features per role

## 🌐 Deployment

This project includes comprehensive deployment configurations for:

### Frontend (Netlify)
- Automatic deployments from Git
- Global CDN delivery
- HTTPS certificates
- SPA routing support

### Backend (Render)
- Auto-scaling web service
- Managed PostgreSQL database
- Health monitoring
- Environment variable management



## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration

### Courses & Learning
- `GET /api/courses/public/all` - Fetch available courses
- `GET /api/lessons/{courseId}` - Get course lessons
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/user/progress` - Get user progress

### Health & Monitoring
- `GET /api/actuator/health` - Health check endpoint

## 🎨 UI/UX Features

- **Enhanced Feature Cards**: Modern design with gradients and animations
- **Notification System**: Toast notifications for user feedback
- **Confirmation Dialogs**: User-friendly confirmation popups
- **Responsive Design**: Optimized for all screen sizes
- **Loading States**: Smooth loading indicators
- **Offline Status**: Visual network status indicators
- **Accessibility**: WCAG compliant design

## 🧪 Testing

Use the included `test-deployment.html` tool to verify:
- Backend health endpoints
- Frontend connectivity
- API integration
- CORS configuration

## 📈 Performance Optimizations

- **Lazy Loading**: Images and content
- **Code Splitting**: React lazy loading
- **Service Worker Caching**: Strategic caching
- **Background Tasks**: Idle-time processing
- **Network Adaptation**: Quality based on connection
- **Intersection Observer**: Efficient scroll handling

## 🔄 Offline Sync Strategy

1. **Cache First**: Essential app files and UI
2. **Network First**: Dynamic content and user data
3. **Background Sync**: Queue actions when offline
4. **Smart Preloading**: Content during idle time
5. **Conflict Resolution**: Handle data conflicts on reconnection

## 🎯 Production Features

- **PWA Support**: Installable web app
- **Auto-deployment**: Git-based deployments
- **Health Monitoring**: Built-in health checks
- **Error Handling**: Comprehensive error management
- **Security**: HTTPS, CORS, JWT protection
- **Performance**: CDN, caching, compression

## 📝 Documentation

- `DEPLOYMENT_GUIDE.md` - Complete deployment instructions
- `DEPLOYMENT_SUMMARY.md` - Quick deployment guide
- `ENVIRONMENT_VARIABLES.md` - Configuration reference
- `Web_APIs_Code_Implementation.html` - Technical documentation


<img width="1125" height="601" alt="Screenshot 2025-07-25 183213" src="https://github.com/user-attachments/assets/e0e84abd-bc86-40a0-8455-754980d9d68d" />




<img width="1177" height="573" alt="Screenshot 2025-07-25 182308" src="https://github.com/user-attachments/assets/2d2dd6ec-fdc5-478e-af5f-e99ea5d7a356" />






<img width="1233" height="599" alt="Screenshot 2025-07-25 182826" src="https://github.com/user-attachments/assets/6dbde931-2405-4003-8685-ea7beb8381a9" />






<img width="1252" height="614" alt="Screenshot 2025-07-25 182905" src="https://github.com/user-attachments/assets/c601db14-3a9d-48c7-b1ef-19cc079d922a" />





<img width="10" height="7" alt="Screenshot 2025-07-25 183143" src="https://github.com/user-attachments/assets/52c6aa82-1835-4b97-aaab-e75148538024" />





<img width="1019" height="606" alt="Screenshot 2025-07-25 183153" src="https://github.com/user-attachments/assets/ac3eb282-68f8-4e08-8e1e-b091e2a1f9ec" />



## 📝 License

MIT License - see LICENSE file for details
