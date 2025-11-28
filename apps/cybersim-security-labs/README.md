# CyberSim Security Labs

> Interactive CompTIA Security+ (SY0-701) Performance-Based Question (PBQ) Simulator

## Overview

CyberSim Security Labs is a comprehensive web-based training platform designed to help cybersecurity students and professionals prepare for CompTIA Security+ certification through hands-on, interactive performance-based questions. Built with React and TypeScript, this application provides realistic simulation environments for practicing critical security concepts.

## Features

### 🎯 Performance-Based Questions (PBQs)
- **13 Interactive Modules** covering key Security+ domains
- **Three Difficulty Levels**: Foundational, Intermediate, Advanced
- Real-world scenario-based learning
- Immediate feedback and scoring

### 📚 Available Modules

#### Foundational (5 modules)
- Password Policy Configuration
- Common Ports Identification
- Basic Access Control
- SIEM Log Analysis
- Network Labeling

#### Intermediate (4 modules)
- Basic Incident Response Steps
- Firewall Rule Configuration
- Risk Assessment Matrix
- Cloud Security Configuration

#### Advanced (4 modules)
- Vulnerability Management
- Cryptography Basics
- Secure Protocols Selection
- DDoS Mitigation Strategies

### 🧪 Practice Quiz System
- **100+ Questions** in question bank
- Randomized 10-question quizzes
- Covers: Threats, Architecture, Operations, Governance
- Instant feedback and explanations

### 📖 Quick Reference Terminal
- Built-in command-line reference
- Common security tools and syntax
- Accessible during PBQ practice

### 💾 Session Persistence
- Automatic progress saving
- Filter preferences remembered
- Resume where you left off

## Technology Stack

- **Frontend**: React 19.2.0
- **Language**: TypeScript 5.8.2
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome 6.4.0
- **Deployment**: Google AI Studio compatible

## Installation

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/8eight8toes8/Sec-PBQ.git
   cd Sec-PBQ/apps/cybersim-security-labs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (if using Gemini API)
   ```bash
   # Create .env.local file
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
cybersim-security-labs/
├── src/
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # Application entry point
│   ├── types.ts             # TypeScript type definitions
│   ├── data.ts              # PBQ module data
│   ├── questions.ts         # Practice quiz questions
│   ├── components/
│   │   ├── FilterTabs.tsx   # Difficulty filter component
│   │   ├── PBQCard.tsx      # Module card component
│   │   ├── QuizInterface.tsx
│   │   ├── QuickReference.tsx
│   │   └── pbqs/            # Individual PBQ simulators
│   │       ├── PasswordPolicyPBQ.tsx
│   │       ├── CommonPortsPBQ.tsx
│   │       ├── FirewallPBQ.tsx
│   │       └── ...
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Usage

### Navigating the Dashboard

1. **Filter Modules**: Use the difficulty tabs to filter PBQs
   - All Modules (13)
   - Foundational (5)
   - Intermediate (4)
   - Advanced (4)

2. **Launch PBQ**: Click any module card to start simulation

3. **Take Quick Quiz**: Click "Quick Quiz" button for randomized test

4. **Access Quick Reference**: Click "Quick Ref" for command reference

### Completing PBQs

1. Read scenario carefully
2. Interact with simulation interface
3. Submit answers when ready
4. Review feedback and explanations
5. Exit to return to dashboard

### Taking Practice Quizzes

1. Click "Start Quiz" button
2. Answer 10 randomized questions
3. Receive immediate feedback
4. Review correct answers
5. Track your progress

## Development

### Adding New PBQ Modules

1. **Create PBQ Component**
   ```tsx
   // src/components/pbqs/NewPBQ.tsx
   import React from 'react';
   
   interface Props {
     onComplete: (score: number) => void;
     onExit: () => void;
   }
   
   const NewPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
     // Your PBQ implementation
   };
   
   export default NewPBQ;
   ```

2. **Register in App.tsx**
   ```tsx
   import NewPBQ from './components/pbqs/NewPBQ';
   
   const PBQ_COMPONENTS = {
     'new-pbq': NewPBQ,
     // ... other PBQs
   };
   ```

3. **Add Module Data**
   ```tsx
   // src/data.ts
   export const pbqModules = [
     {
       id: 'new-pbq',
       title: 'New PBQ',
       description: 'Description',
       difficulty: DifficultyLevel.Foundational,
       category: 'Security Operations',
       estimatedTime: 10,
       objectives: ['Objective 1', 'Objective 2']
     },
     // ... other modules
   ];
   ```

### Adding Quiz Questions

Edit `src/questions.ts`:

```tsx
export const practiceQuestions: PracticeQuestion[] = [
  {
    id: 'q101',
    question: 'Your question here?',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0, // Index of correct option
    explanation: 'Detailed explanation',
    domain: 'Threats',
    difficulty: DifficultyLevel.Intermediate
  },
  // ... more questions
];
```

## SY0-701 Exam Coverage

This application covers all five Security+ exam domains:

1. **General Security Concepts** (12%)
2. **Threats, Vulnerabilities, and Mitigations** (22%)
3. **Security Architecture** (18%)
4. **Security Operations** (28%)
5. **Security Program Management and Oversight** (20%)

## Keyboard Shortcuts

- `Esc` - Exit current PBQ or quiz
- `Enter` - Submit answers (context-dependent)
- `Tab` - Navigate between input fields

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

- Lazy loading for PBQ components
- Session storage for user preferences
- Memoized filter calculations
- Optimized re-renders with React 19

## Contributing

This is a personal learning project. If you'd like to contribute:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewPBQ`)
3. Commit changes (`git commit -m 'Add new PBQ module'`)
4. Push to branch (`git push origin feature/NewPBQ`)
5. Open Pull Request

## Future Enhancements

- [ ] User authentication and progress tracking
- [ ] Advanced analytics and performance metrics
- [ ] Additional PBQ modules for advanced scenarios
- [ ] Mobile app version
- [ ] Multiplayer challenge mode
- [ ] Integration with actual Security+ exam objectives mapping
- [ ] Video explanations for complex topics
- [ ] Community-contributed questions

## License

MIT License - See LICENSE file for details

## Author

**8eight8toes8**  
Cybersecurity Intern @ MCCoE  
GitHub: [@8eight8toes8](https://github.com/8eight8toes8)

## Acknowledgments

- CompTIA for Security+ certification framework
- React and Vite communities
- Tailwind CSS for styling framework
- Font Awesome for iconography
- Google AI Studio for deployment platform

## Changelog

### Version 0.0.0 (Initial Release)
- 13 interactive PBQ modules
- 100+ practice questions
- Three difficulty levels
- Quick reference terminal
- Session persistence
- Responsive design

---

**Study Smart. Practice Hard. Pass with Confidence.** 🎓🔒
