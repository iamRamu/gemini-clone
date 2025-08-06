# Gemini Clone - AI Chat Application

A fully functional, responsive frontend for a Gemini-style conversational AI chat application built with React, Redux, and Tailwind CSS.

## 🚀 Live Demo

[Live Demo Link](your-deployment-url-here)

## ✨ Features

### Authentication
- **OTP-based Login/Signup** with country code selection
- **Country data fetched** from REST Countries API
- **Form validation** using React Hook Form + Zod
- **Simulated OTP** verification (enter any 6-digit number)

### Dashboard
- **Chatroom management** - Create and delete chatrooms
- **Search functionality** with debounced input
- **Responsive design** for mobile and desktop
- **Dark mode toggle**

### Chat Interface
- **Real-time messaging** with AI responses
- **Typing indicators** - "Gemini is typing..."
- **Message timestamps** and status
- **Auto-scroll** to latest messages
- **Reverse infinite scroll** for message history
- **Image upload** with preview
- **Copy-to-clipboard** on message hover
- **Message throttling** (simulated AI thinking time)

### UX Features
- **Dark/Light mode** with persistent settings
- **Toast notifications** for user feedback
- **Loading skeletons** for better UX
- **Responsive design** for all screen sizes
- **Keyboard accessibility**
- **localStorage persistence** for chat data

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **State Management**: Redux (classic approach)
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form + Zod
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gemini-clone.git
   cd gemini-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── AuthPage.jsx    # OTP authentication
│   ├── Dashboard.jsx   # Chatroom management
│   └── ChatRoom.jsx    # Chat interface
├── store/              # Redux state management
│   ├── authReducer.js  # Authentication state
│   ├── authActions.js  # Auth action creators
│   ├── chatReducer.js  # Chat state management
│   ├── chatActions.js  # Chat action creators
│   ├── themeReducer.js # Theme state
│   ├── themeActions.js # Theme actions
│   └── store.js        # Redux store configuration
├── utils/              # Utility functions
│   ├── countryApi.js   # Country data fetching
│   └── mockData.js     # Mock data generators
├── hooks/              # Custom React hooks
│   └── useDebounce.js  # Debouncing hook
└── App.jsx             # Main application component
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

## 📱 Demo Instructions

1. **Login**: Enter any phone number and 6-digit OTP to access the app
2. **Create Chat**: Click "New Chat" to create a chatroom
3. **Send Messages**: Type messages and get AI responses
4. **Upload Images**: Click the image icon to upload pictures
5. **Dark Mode**: Toggle between light and dark themes
6. **Search**: Use the search bar to filter chatrooms

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy with default settings

### Netlify Deployment
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure redirects for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created by [Your Name] for Kuvaka Tech Frontend Assignment

## 🙏 Acknowledgments

- REST Countries API for country data
- Lucide React for beautiful icons
- Tailwind CSS for rapid styling
- React ecosystem for powerful tools
