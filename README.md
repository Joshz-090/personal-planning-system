# Shcadule - Personal Planning System

A comprehensive productivity web application built with React and Firebase, featuring daily planning, weekly scheduling, goal tracking, and analytics.

## Features

- 📅 **Daily Planner** - Manage daily tasks with progress tracking
- 📊 **Weekly Planner** - Plan your week with goals and progress
- ⏰ **Weekly Time & Plan Board** - Visual time slot scheduling with activities
- 🎯 **Goals Management** - Set and track monthly, quarterly, and yearly goals
- 📈 **Analytics** - Track your productivity with detailed insights
- 🌍 **Ethiopian Calendar Support** - Full support for Ethiopian calendar system
- 🎨 **Modern UI** - Clean, responsive design with dark mode support

## Tech Stack

- **Frontend**: React 19, Vite
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Shcadule
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values from your Firebase Console
   - Get your Firebase config from: Project Settings > General > Your apps

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Deploy Firestore security rules from `firestore.rules`
5. Copy your Firebase configuration to `.env` file

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

Or manually copy the rules from `firestore.rules` to Firebase Console > Firestore Database > Rules

## Security Notes

⚠️ **Important Security Information:**

- The `.env` file is already in `.gitignore` and will NOT be committed to Git
- Firebase client-side API keys are safe to expose (they're meant to be public)
- However, Firestore security rules protect your data - make sure they're properly deployed
- Never commit `.env` files with real credentials
- Use `.env.example` as a template for other developers

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── config/        # Configuration files (Firebase)
└── utils/         # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Weekly Time & Plan Board
- Create custom time slots
- Add activities to time slots
- Color-code and categorize activities
- Auto-generate future weeks
- Support for both Gregorian and Ethiopian calendars

### Goals Management
- Monthly, 3-month, 6-month, and yearly goals
- Checklist items for each goal
- Progress tracking

### Analytics
- Daily progress trends
- Weekly progress charts
- Category breakdowns
- Best/worst performing days
- Completion statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the repository.
