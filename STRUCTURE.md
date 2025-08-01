# Agent Y - Project Structure

This document outlines the professional project structure for Agent Y, a modern AI assistant for Google Docs.

## 📁 Directory Structure

```
agent-y/
├── 📄 README.md                    # Main project documentation
├── 📄 LICENSE                      # MIT License
├── 📄 .gitignore                   # Git ignore rules
├── 📄 STRUCTURE.md                 # This file - project structure guide
│
├── 📂 src/                         # Source code (Google Apps Script files)
│   ├── 📄 Code.gs                  # Main backend logic and entry points
│   ├── 📄 GeminiClient.gs          # Gemini AI API integration
│   ├── 📄 sidebar.html             # Modern chat interface (Cursor-style)
│   ├── 📄 settings.html            # Configuration interface
│   ├── 📄 help.html                # User documentation and help
│   └── 📄 appsscript.json          # Google Apps Script project manifest
│
├── 📂 docs/                        # Documentation
│   ├── 📄 CONTRIBUTING.md          # Contribution guidelines for developers
│   ├── 📄 API.md                   # Detailed API documentation
│   └── 📄 DEPLOYMENT.md            # Deployment and configuration guide
│
└── 📂 examples/                    # Usage examples and samples
    └── 📄 sample-prompts.md        # Example prompts and use cases
```

## 🎯 File Descriptions

### Core Source Files (`/src/`)

#### **Code.gs**
- **Purpose**: Main backend logic for Google Apps Script
- **Contains**:
  - Add-on initialization and menu creation
  - Document interaction functions (selection, insertion)
  - AI request processing and routing
  - Settings management
  - Error handling and logging

#### **GeminiClient.gs**
- **Purpose**: Google Gemini AI API integration
- **Contains**:
  - Gemini API client class
  - Request/response handling
  - Token management and optimization
  - Error handling for AI operations
  - Configuration management

#### **sidebar.html**
- **Purpose**: Modern chat interface inspired by Cursor Agent AI
- **Features**:
  - Dark/light theme support
  - Real-time chat experience
  - Typing indicators and animations
  - Message bubbles and avatars
  - Responsive design

#### **settings.html**
- **Purpose**: Configuration interface for users
- **Contains**:
  - API key management
  - Model selection
  - Performance settings
  - Theme preferences
  - User preferences

#### **help.html**
- **Purpose**: User documentation and help system
- **Contains**:
  - Getting started guide
  - Feature explanations
  - Troubleshooting tips
  - FAQ section
  - Contact information

#### **appsscript.json**
- **Purpose**: Google Apps Script project manifest
- **Contains**:
  - Project metadata
  - OAuth scopes and permissions
  - Runtime version
  - Library dependencies
  - URL fetch whitelist

### Documentation (`/docs/`)

#### **CONTRIBUTING.md**
- **Purpose**: Guidelines for contributors
- **Sections**:
  - Development setup
  - Coding standards
  - Testing procedures
  - Pull request process
  - Community guidelines

#### **API.md**
- **Purpose**: Comprehensive API documentation
- **Sections**:
  - Function reference
  - Parameter descriptions
  - Return value formats
  - Usage examples
  - Error codes

#### **DEPLOYMENT.md**
- **Purpose**: Deployment and configuration guide
- **Sections**:
  - Quick setup instructions
  - Environment configuration
  - Production deployment
  - Troubleshooting
  - Security considerations

### Examples (`/examples/`)

#### **sample-prompts.md**
- **Purpose**: Example prompts and use cases
- **Sections**:
  - Basic instructions
  - Advanced use cases
  - Best practices
  - Common workflows
  - Pro tips

## 🚀 Getting Started

### For Users
1. Read the main [README.md](README.md)
2. Follow the installation guide
3. Check [sample-prompts.md](examples/sample-prompts.md) for usage examples

### For Developers
1. Read [CONTRIBUTING.md](docs/CONTRIBUTING.md)
2. Review [API.md](docs/API.md) for technical details
3. Follow [DEPLOYMENT.md](docs/DEPLOYMENT.md) for setup

### For Deployment
1. Copy all files from `/src/` to Google Apps Script
2. Configure API key in `Code.gs`
3. Deploy as Google Docs add-on
4. Test functionality

## 🔧 Configuration

### Required Setup
- **API Key**: Gemini API key in `Code.gs` CONFIG object
- **Permissions**: Google Docs and external URL access
- **Dependencies**: No external libraries required

### Optional Configuration
- **Theme**: Default light/dark mode preference
- **Model**: Gemini model selection (flash vs pro)
- **Performance**: Token limits and caching settings

## 📊 File Sizes and Complexity

| File | Purpose | Lines | Complexity |
|------|---------|-------|------------|
| Code.gs | Backend Logic | ~400 | High |
| GeminiClient.gs | AI Integration | ~300 | Medium |
| sidebar.html | UI Interface | ~800 | High |
| settings.html | Configuration | ~400 | Medium |
| help.html | Documentation | ~300 | Low |
| appsscript.json | Manifest | ~50 | Low |

## 🔄 Development Workflow

### 1. Local Development
- Edit files in your preferred editor
- Use version control (Git) for tracking changes
- Test changes in Google Apps Script environment

### 2. Testing
- Copy updated files to test Google Apps Script project
- Test functionality in Google Docs
- Verify UI/UX in different browsers

### 3. Deployment
- Copy files to production Google Apps Script project
- Update configuration for production environment
- Deploy as add-on and test thoroughly

### 4. Documentation
- Update relevant documentation files
- Add examples for new features
- Update API documentation for changes

## 🛡️ Security Considerations

### Sensitive Data
- **API Keys**: Stored in Google Apps Script properties
- **User Data**: Processed locally, not stored externally
- **Permissions**: Minimal required permissions only

### Best Practices
- Never commit API keys to version control
- Use environment-specific configurations
- Validate all user inputs
- Implement proper error handling

## 📈 Maintenance

### Regular Tasks
- Update dependencies and libraries
- Monitor API usage and limits
- Review and update documentation
- Test with new Google Apps Script features

### Version Management
- Use semantic versioning (e.g., 1.0.0)
- Tag releases in version control
- Maintain changelog for updates
- Provide migration guides for breaking changes

## 🤝 Contributing

This project welcomes contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines on:

- Code style and standards
- Testing requirements
- Pull request process
- Community guidelines

## 📞 Support

For questions, issues, or contributions:
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: See `/docs/` directory
- **Examples**: See `/examples/` directory

---

This structure ensures a professional, maintainable, and scalable codebase for Agent Y.
