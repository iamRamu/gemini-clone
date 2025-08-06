# 🤖 Gemini Clone - AI Chat Application

A modern, fully responsive AI chat application inspired by Google Gemini, built with React 18, Redux, and Tailwind CSS. Features include OTP-based authentication, real-time messaging, dark/light themes, and a beautiful mobile-first design.

## 🚀 Live Demo

[Live Demo](https://gemini-clone-12.netlify.app/auth) | [GitHub Repository](https://github.com/iamRamu/gemini-clone)

## ✨ Features

### 🔐 Authentication
- **Phone-based OTP Authentication** with international country code support
- **Smart form validation** with real-time error clearing on focus
- **Country selector** with search functionality and flags
- **Secure localStorage** session management
- **Demo Mode**: Enter any 6-digit number as OTP

### 💬 Chat Management
- **Create & Delete** chatrooms with confirmation modals
- **Smart search** with debounced input and live filtering
- **Conversation history** with timestamps and last message preview
- **Drag-to-refresh** for mobile users

### 💭 Chat Interface
- **AI-powered responses** with realistic typing simulation
- **Message bubbles** with user/AI distinction
- **Image support** with drag-and-drop upload
- **Copy to clipboard** functionality
- **Auto-scroll** with smooth animations
- **Message threading** and conversation context

### ✨ Enhanced UX
- **Dark/Light theme** toggle with system preference detection
- **Beautiful animations** and micro-interactions
- **Toast notifications** with contextual styling
- **Loading states** with skeleton screens
- **Keyboard shortcuts** and accessibility features
- **Offline support** with localStorage persistence
- **Responsive design** optimized for mobile, tablet, and desktop
- **Modern UI components** with glassmorphism effects

## 🛠️ Tech Stack

### Core Technologies
- **React 18** - Latest React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Redux** - Predictable state management (vanilla Redux for learning)
- **React Router v6** - Client-side routing with lazy loading

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS** - Advanced animations and glassmorphism effects
- **Lucide React** - Beautiful, customizable icons
- **Responsive Design** - Mobile-first approach

### Form & Validation
- **React Hook Form** - Performant form handling
- **Zod** - TypeScript-first schema validation
- **Real-time validation** - Smart error clearing

### Additional Features
- **React Hot Toast** - Elegant notifications
- **localStorage** - Data persistence
- **REST Countries API** - Country data and flags

## 📦 Quick Start

### Prerequisites
- **Node.js** 16.x or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone & Navigate**
   ```bash
   git clone https://github.com/yourusername/gemini-clone.git
   cd gemini-clone
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser

4. **Production Build**
   ```bash
   npm run build && npm run preview
   # or
   yarn build && yarn preview
   ```

## 📁 Project Architecture

```
gemini-clone/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Sidebar.jsx     # Navigation sidebar with user menu
│   │   ├── ConfirmModal.jsx# Beautiful confirmation modals
│   │   ├── Layout.jsx      # Main app layout wrapper
│   │   └── ErrorBoundary.jsx# Error handling component
│   ├── pages/              # Route components
│   │   ├── SignupPage.jsx  # Phone-based registration
│   │   ├── LoginPage.jsx   # OTP authentication
│   │   ├── Dashboard.jsx   # Chat management hub
│   │   └── ChatRoom.jsx    # AI conversation interface
│   ├── store/              # Redux state management
│   │   ├── authSlice.js    # Authentication state
│   │   ├── authActions.js  # Async auth actions
│   │   ├── chatActions.js  # Chat operations
│   │   ├── themeActions.js # Theme switching
│   │   └── store.js        # Redux store config
│   ├── utils/              # Helper functions
│   │   ├── countryApi.js   # REST Countries integration
│   │   ├── phoneValidation.js# Phone number formatting
│   │   └── mockData.js     # Demo data generators
│   ├── hooks/              # Custom React hooks
│   │   └── useDebounce.js  # Performance optimization
│   ├── index.css           # Global styles & Tailwind
│   └── App.jsx             # Root component
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite build configuration
└── package.json            # Dependencies & scripts
```

## 🎯 Key Implementation Details

### Redux State Management
- **Simple Redux** implementation without Redux Toolkit for better learning
- **Action creators** and reducers following standard patterns
- **Thunk middleware** for async operations
- **localStorage integration** for data persistence

### Form Validation
- **Zod schemas** for type-safe validation
- **React Hook Form** for efficient form handling
- **Real-time validation** with error messages

### Chat Features
- **Message pagination** with reverse infinite scroll
- **AI response simulation** with random delays
- **Image upload** with base64 encoding
- **Copy-to-clipboard** functionality

### Responsive Design
- **Mobile-first** approach with Tailwind CSS
- **Flexible layouts** that adapt to screen sizes
- **Touch-friendly** interactions

## 🔧 Configuration

### Environment Variables
No environment variables required for this demo application.

### Customization
- **Colors**: Update `tailwind.config.js` for custom color schemes
- **AI Responses**: Modify `chatActions.js` to customize AI responses
- **Validation**: Update Zod schemas in component files

## 📱 How to Use

### Getting Started
1. **Sign Up/Login** 📞
   - Select your country from the dropdown
   - Enter your phone number
   - Verify with any 6-digit OTP (demo mode)

2. **Dashboard Navigation** 🏠
   - Click **"New Chat"** to create a conversation
   - Use the **search bar** to find specific chats
   - **Delete chats** with the trash icon (confirmation required)

3. **Chat Interface** 💬
   - Type messages in the input field
   - Upload images by clicking the image icon
   - Copy messages by hovering over them
   - Watch AI responses with typing indicators

4. **Customization** 🎨
   - Toggle **dark/light mode** in the user menu
   - Access user settings from the bottom sidebar
   - **Logout** from the user dropdown

### Demo Features
- 📱 **Fully responsive** - Works on all devices
- 🌙 **Dark mode** - Easy on the eyes
- 🔔 **Smart notifications** - Non-intrusive feedback
- 💾 **Auto-save** - Your chats persist across sessions

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with default settings

### Netlify Deployment
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure redirects for SPA routing

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build for production
npm run build

# Deploy dist folder to Netlify
# Configure: Redirect rules for SPA routing
```

### Docker
```bash
# Build image
docker build -t gemini-clone .

# Run container
docker run -p 3000:3000 gemini-clone
```

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes on mobile and desktop
- Update README if needed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🌍 **REST Countries API** - Comprehensive country data
- 🎨 **Lucide React** - Beautiful, consistent icons
- ⚡ **Vite** - Lightning-fast development experience
- 🎯 **Tailwind CSS** - Utility-first CSS framework
- ⚛️ **React Team** - Amazing framework and ecosystem

## 📞 Support

If you have questions or need help:
- 📧 Email: your.email@example.com
- 🐛 [Report Issues](https://github.com/yourusername/gemini-clone/issues)
- 💬 [Discussions](https://github.com/yourusername/gemini-clone/discussions)

---

**Made with ❤️ using React, Redux & Tailwind CSS**
