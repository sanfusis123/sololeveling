# Solo Leveling - Frontend

A beautiful, iPhone-inspired React application for personal development tracking. Level up your skills, track your progress, and become stronger every day.

## ✨ Features

- **🎨 iPhone-Inspired UI**: Glassmorphism, vibrant gradients, smooth animations
- **🌙 Dark Mode**: Carefully designed with proper contrast ratios
- **🔐 Secure Authentication**: JWT-based with admin approval system
- **📅 Smart Calendar**: Track tasks with priorities and recurring events
- **🎯 Progress Tracker**: Monitor improvements and distractions
- **🧠 Flashcards**: Spaced repetition system for effective learning
- **📚 Learning Materials**: Organize and share your notes
- **✍️ Personal Diary**: Daily journaling with mood tracking
- **✨ Fun Zone**: Creative space for poems, jokes, and personal expression
- **📊 Analytics**: Beautiful charts and productivity insights
- **🛡️ Admin Panel**: User management and system monitoring

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

- Dashboard with glassmorphic cards
- iPhone-style modals and forms
- Interactive calendar with drag-and-drop
- Beautiful analytics charts
- Admin user management panel

</details>

## 📋 Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Backend API running (see backend README)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd personal-dev-tracker-frontend
```

### 2. Install Dependencies

```bash
# Clean install (recommended)
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api/v1
```

For production:
```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

### 4. Start Development Server

```bash
npm start
# Or
yarn start
```

The app will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── Card.js         # Glassmorphic card component
│   ├── ViewModal.js    # iPhone-style modal
│   ├── Layout.js       # Main layout with sidebar
│   └── PrivateRoute.js # Protected route wrapper
├── contexts/           # React contexts
│   └── AuthContext.js  # Authentication state
├── pages/             # Page components
│   ├── Dashboard.js   # Main dashboard
│   ├── Calendar.js    # Smart calendar
│   ├── Admin.js       # Admin panel
│   └── ...           # Other pages
├── services/          # API services
│   └── api.js        # Axios configuration
├── styles/           # Global styles
│   ├── theme.css     # Design system variables
│   └── forms-enhanced.css # Form styles
├── utils/            # Utility functions
│   └── toast.js      # Toast notifications
└── App.js           # Main app component
```

## 🎨 Design System

### Color Palette

```css
/* Vibrant iOS-inspired colors */
--accent-primary: #7B68EE      /* Medium Slate Blue */
--accent-secondary: #FF6B6B    /* Coral Red */
--accent-success: #4ECDC4      /* Turquoise */
--accent-warning: #FFD93D      /* Sunshine Yellow */
--accent-error: #FF6B6B        /* Coral Red */
--accent-info: #4FC3F7         /* Sky Blue */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.05)
--glass-border: rgba(255, 255, 255, 0.18)
--backdrop-blur: blur(12px)
```

### Components

- **Glassmorphic Cards**: 3D mouse tracking, dynamic shadows
- **iPhone Modals**: Slide-up animations, rounded corners
- **Floating Labels**: Smooth input animations
- **Gradient Buttons**: Vibrant colors with hover effects

## 🚀 Usage Guide

### First Time Setup

1. **Register an Account**
   ```
   - Go to /register
   - Fill in your details
   - Wait for admin approval
   ```

2. **Admin Approval**
   ```
   - First user: Run backend script to become admin
   - Other users: Admin activates from /admin panel
   ```

3. **Login**
   ```
   - Use your credentials at /login
   - Start tracking your progress!
   ```

### Key Features

#### Dashboard
- Overview of daily tasks and statistics
- Recent activity timeline
- Motivational quotes
- Quick access to all features

#### Smart Calendar
- Create tasks with priorities (Low → Urgent)
- Set recurring events
- Mark tasks complete/skip with reasons
- Drag and drop to reschedule

#### Progress Tracker
- Log improvements and distractions
- Track progress with notes
- Organize by projects and skills
- Visualize your growth

#### Flashcards
- Create decks by topic
- Study with spaced repetition
- Track review performance
- Share decks publicly

#### Admin Panel (Admin Only)
- View all users
- Activate/deactivate accounts
- Grant/revoke admin privileges
- Monitor system statistics

## 🔒 Security Features

- JWT token authentication
- Automatic token refresh
- Admin approval for new users
- Protected routes
- Secure API communication
- Input validation

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop enhancements
- Touch-friendly interactions
- Smooth animations

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (careful!)
npm eject
```

### Code Style

- ES6+ JavaScript
- React Hooks
- Functional components
- CSS modules for styling
- Consistent naming conventions

### State Management

- React Context for auth
- Local state for components
- API integration with Axios
- Toast notifications

## 📦 Building for Production

```bash
# Create optimized build
npm run build

# Test production build locally
npm install -g serve
serve -s build
```

### Deployment Options

1. **Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Netlify**
   - Drop `build` folder to Netlify
   - Set environment variables

3. **Traditional Hosting**
   - Upload `build` folder contents
   - Configure server for SPA routing

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check backend is running
   - Verify REACT_APP_API_URL
   - Check CORS settings

2. **Login Issues**
   - Ensure account is activated
   - Check credentials
   - Clear localStorage

3. **Styling Issues**
   - Clear browser cache
   - Check CSS imports
   - Verify theme variables

4. **Build Errors**
   - Delete node_modules
   - Clear npm cache
   - Reinstall dependencies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Guidelines

- Follow existing code style
- Write meaningful commit messages
- Update documentation
- Test thoroughly
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Framer Motion for smooth animations
- Lucide React for beautiful icons
- The open source community

## 📞 Support

- Create an issue for bugs
- Discussions for features
- Email for security concerns

---

Built with ❤️ by the Solo Leveling team