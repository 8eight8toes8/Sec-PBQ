# Sec-PBQ: Security+ Performance-Based Questions Repository

> A collection of interactive cybersecurity training applications for CompTIA Security+ exam preparation

## Overview

This repository houses multiple web-based applications designed to help cybersecurity students and professionals prepare for industry certifications through hands-on, interactive learning experiences. Each application focuses on practical, performance-based scenarios that mirror real-world security challenges.

## Repository Structure

```
Sec-PBQ/
├── apps/
│   ├── cybersim-security-labs/          # CompTIA Security+ PBQ Simulator
│   │   ├── README.md                     # App-specific documentation
│   │   ├── package.json                  # Dependencies and scripts
│   │   ├── index.html                    # Entry point
│   │   ├── metadata.json                 # App metadata
│   │   └── src/                          # Source code
│   └── [future-apps]/                    # Additional apps will be added here
└── README.md                            # This file
```

## Applications

### 1. CyberSim Security Labs

**Location**: `/apps/cybersim-security-labs/`  
**Status**: Active Development  
**Version**: 0.0.0

#### Description
Interactive CompTIA Security+ (SY0-701) Performance-Based Question simulator with 13 hands-on modules covering all exam domains.

#### Features
- 🎯 **13 Interactive PBQ Modules** across three difficulty levels
- 🧪 **100+ Practice Questions** with instant feedback
- 📖 **Quick Reference Terminal** for command-line practice
- 💾 **Session Persistence** to track progress

#### Quick Start
```bash
cd apps/cybersim-security-labs
npm install
npm run dev
```

[View Full Documentation](./apps/cybersim-security-labs/README.md)

## Naming Convention

All applications in this repository follow a standardized naming convention:

- **Folder Names**: `lowercase-with-hyphens`
- **App Names**: Descriptive, indicating purpose
- **Structure**: Each app is self-contained in its own directory under `/apps/`

## Adding New Applications

To add a new application to this repository:

1. **Create App Directory**
   ```bash
   mkdir -p apps/your-app-name
   cd apps/your-app-name
   ```

2. **Required Files**
   - `README.md` - Comprehensive app documentation
   - `package.json` - Dependencies and build scripts
   - `index.html` - Application entry point
   - `metadata.json` - App metadata (name, description)

3. **README Template**
   Each app README should include:
   - Overview and description
   - Features list
   - Installation instructions
   - Usage guide
   - Project structure
   - Development guidelines
   - Technology stack

4. **Commit and Document**
   - Add app to this main README
   - Commit with descriptive message
   - Update app count and features

## Development Guidelines

### Technology Stack
Applications in this repository use:
- **Frontend**: React 19+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome

### Code Standards
- Use TypeScript for type safety
- Follow React best practices
- Implement responsive design
- Include comprehensive documentation
- Write clear commit messages

### Testing
Each application should include:
- Unit tests for core functionality
- Integration tests for user flows
- Manual testing procedures

## Roadmap

### Current Focus
- [x] CyberSim Security Labs initial release
- [x] Repository structure and documentation
- [ ] Add source code files for CyberSim (App.tsx, components, etc.)
- [ ] Deploy CyberSim to production

### Planned Applications
- [ ] Network Topology Builder
- [ ] Incident Response Simulator
- [ ] Vulnerability Assessment Lab
- [ ] Cryptography Practice Suite
- [ ] SIEM Log Analysis Trainer
- [ ] Penetration Testing Lab

## Contributing

This is a personal learning project, but contributions are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- One feature per pull request

## Learning Objectives

This repository aims to provide:
- Practical, hands-on cybersecurity training
- Interactive learning experiences
- Real-world scenario practice
- Exam preparation resources
- Skill development tools

## Certification Coverage

Currently supporting:
- ✅ CompTIA Security+ (SY0-701)

Future support planned for:
- 🕒 CompTIA CySA+
- 🕒 CompTIA PenTest+
- 🕒 CEH (Certified Ethical Hacker)
- 🕒 CISSP (Certified Information Systems Security Professional)

## License

MIT License - See LICENSE file for details

## Author

**8eight8toes8**  
Cybersecurity Intern @ MCCoE  
GitHub: [@8eight8toes8](https://github.com/8eight8toes8)

## Acknowledgments

- CompTIA for certification frameworks
- Missouri Cybersecurity Center of Excellence (MCCoE)
- Open-source communities for tools and libraries
- Cybersecurity education community

## Contact

For questions, suggestions, or collaboration opportunities:
- Open an issue in this repository
- Connect on GitHub: [@8eight8toes8](https://github.com/8eight8toes8)

---

**Built with ❤️ for the cybersecurity community**

*Last Updated: November 2025*
