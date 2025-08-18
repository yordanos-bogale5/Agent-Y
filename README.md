# Agent Y - AI Assistant for Google Docs

<div align="center">

![Agent Y Logo](https://img.shields.io/badge/Agent%20Y-AI%20Assistant-blue?style=for-the-badge&logo=google&logoColor=white)

[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat&logo=google&logoColor=white)](https://script.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-FREE-green?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A modern, Cursor-style AI assistant that integrates seamlessly with Google Docs**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Contributing](#contributing) • [License](#license)

</div>

## 🚀 Features

### ✨ **Modern Chat Interface**
- **Cursor Agent AI inspired design** with clean, minimal UI
- **Dark/Light mode support** with persistent theme switching
- **Real-time chat experience** with typing indicators
- **Message bubbles** with user/AI distinction

### 🤖 **Powerful AI Integration**
- **FREE Google Gemini API** - no costs, unlimited usage
- **Direct instruction following** - just tell it what you want
- **Context-aware responses** - understands your document content
- **One-click insertion** - seamlessly add AI output to your document

### 🎯 **Smart Document Assistance**
- **Create tables, lists, and formatted content**
- **Improve and rewrite text**
- **Summarize and explain content**
- **Generate new content based on instructions**

### 🛠️ **Developer-Friendly**
- **Clean, modular codebase**
- **Well-documented functions**
- **Easy to extend and customize**
- **Professional project structure**

## 📦 Installation

### Prerequisites
- Google account with access to Google Docs
- Google Apps Script access
- Free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Quick Setup

1. **Get your FREE Gemini API key**
   ```
   Visit: https://makersuite.google.com/app/apikey
   Sign in with Google → Create API Key → Copy the key
   ```

2. **Create new Google Apps Script project**
   ```
   Visit: https://script.google.com
   New Project → Name it "Agent Y"
   ```

3. **Upload project files**
   ```
   Copy the contents of each file from /src/ to your Apps Script project:
   - Code.gs (main backend logic)
   - GeminiClient.gs (AI integration)
   - sidebar.html (modern UI)
   - settings.html (configuration)
   - help.html (documentation)
   - appsscript.json (project manifest)
   ```

4. **Configure your API key**
   ```
   Edit Code.gs → Find CONFIG.API_KEY
   Replace with your Gemini API key
   ```

5. **Deploy as add-on**
   ```
   Deploy → Test deployments → Install
   ```

6. **Start using in Google Docs**
   ```
   Open any Google Doc → Extensions → Agent Y
   ```

## Interface Guide
- **💬 Chat Interface**: Type instructions naturally
- **⚡ AI Responses**: Get instant, contextual help
- **📄 Insert Button**: Add AI output to your document
- **📋 Copy Button**: Copy responses to clipboard
- **🌙 Theme Toggle**: Switch between light/dark modes

## 🏗️ Project Structure

```
agent-y/
├── src/                    # Source code
│   ├── Code.gs            # Main backend logic
│   ├── GeminiClient.gs    # Gemini AI integration
│   ├── sidebar.html       # Modern chat interface
│   ├── settings.html      # Configuration UI
│   ├── help.html          # User documentation
│   └── appsscript.json    # Project manifest
├── docs/                  # Documentation
│   ├── CONTRIBUTING.md    # Contribution guidelines
│   ├── API.md            # API documentation
│   └── DEPLOYMENT.md     # Deployment guide
├── examples/              # Usage examples
│   └── sample-prompts.md  # Example prompts
└── README.md             # This file
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Test thoroughly** in Google Apps Script environment
5. **Submit a pull request** with detailed description

### Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/agent-y.git
cd agent-y

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test in Google Apps Script
# Submit PR when ready
```

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Detailed API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[Contributing Guide](docs/CONTRIBUTING.md)** - How to contribute
- **[Example Prompts](examples/sample-prompts.md)** - Usage examples

## 🔧 Configuration

### Environment Variables
```javascript
// In Code.gs - CONFIG object
const CONFIG = {
  API_KEY: 'your-gemini-api-key-here',
  DEFAULT_MODEL: 'gemini-1.5-flash',
  MAX_CONTENT_LENGTH: 10000
};
```

### Customization
- **Theme colors**: Modify CSS custom properties in sidebar.html
- **AI behavior**: Adjust prompts in GeminiClient.gs
- **UI layout**: Customize HTML structure in sidebar.html

## 🐛 Troubleshooting

### Common Issues
- **API Key Error**: Ensure Gemini API is enabled in Google Cloud Console
- **404 Model Error**: Verify model name matches available Gemini models
- **Permission Error**: Check Google Apps Script execution permissions

### Getting Help
- **Issues**: [GitHub Issues](https://github.com/yourusername/agent-y/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/agent-y/discussions)
- **Email**: support@agent-y.dev

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing free, powerful AI capabilities
- **Cursor AI** for design inspiration
- **Google Apps Script** for the platform
- **Contributors** who make this project better

---

<div align="center">

**Made with ❤️ by the Agent Y team**

[⭐ Star this repo](https://github.com/yourusername/agent-y) • [🐛 Report Bug](https://github.com/yourusername/agent-y/issues) • [💡 Request Feature](https://github.com/yourusername/agent-y/issues)

</div>
