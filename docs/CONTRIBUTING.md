# Contributing to Agent Y

Thank you for your interest in contributing to Agent Y! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Google account with Google Apps Script access
- Basic knowledge of JavaScript and HTML/CSS
- Familiarity with Google Docs API
- Understanding of AI/LLM integration concepts

### Development Environment
1. **Google Apps Script**: Primary development platform
2. **Local Editor**: For code editing and version control
3. **Google Docs**: For testing the add-on functionality

## 📋 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/agent-y.git
cd agent-y

# Add upstream remote
git remote add upstream https://github.com/original/agent-y.git
```

### 2. Create a Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Development Workflow
1. **Make changes** in your local editor
2. **Test in Google Apps Script** by copying files to your test project
3. **Test thoroughly** in Google Docs environment
4. **Document your changes** with clear comments
5. **Update documentation** if needed

### 4. Testing Guidelines
- **Unit Testing**: Test individual functions
- **Integration Testing**: Test with Google Docs API
- **UI Testing**: Test sidebar interface and interactions
- **AI Testing**: Verify Gemini API integration works correctly

### 5. Submit Pull Request
```bash
# Commit your changes
git add .
git commit -m "feat: add new feature description"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 🎯 Contribution Areas

### 🐛 Bug Fixes
- Fix existing issues
- Improve error handling
- Enhance stability

### ✨ New Features
- Additional AI capabilities
- UI/UX improvements
- Performance optimizations
- New integrations

### 📚 Documentation
- Code documentation
- User guides
- API documentation
- Examples and tutorials

### 🧪 Testing
- Write test cases
- Improve test coverage
- Performance testing
- Cross-browser testing

## 📝 Coding Standards

### JavaScript Style Guide
```javascript
// Use const/let instead of var
const CONFIG = {
  API_KEY: 'your-key'
};

// Use descriptive function names
function processUserInstruction(instruction) {
  // Implementation
}

// Add JSDoc comments
/**
 * Process AI request from user
 * @param {string} userInput - User instruction
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Response object
 */
async function processAIRequest(userInput, options = {}) {
  // Implementation
}
```

### HTML/CSS Guidelines
```html
<!-- Use semantic HTML -->
<div class="chat-container">
  <div class="chat-messages" id="chatMessages">
    <!-- Messages -->
  </div>
</div>

<!-- Use CSS custom properties for theming -->
<style>
:root {
  --primary-color: #3b82f6;
  --text-color: #1f2937;
}
</style>
```

### File Organization
```
src/
├── Code.gs              # Main backend logic
├── GeminiClient.gs      # AI integration
├── sidebar.html         # Chat interface
├── settings.html        # Configuration
├── help.html           # Documentation
└── appsscript.json     # Manifest
```

## 🔍 Code Review Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console errors
- [ ] Tested in Google Docs environment

### Review Criteria
- **Functionality**: Does it work as expected?
- **Code Quality**: Is it clean and maintainable?
- **Performance**: Does it impact performance?
- **Security**: Are there any security concerns?
- **Documentation**: Is it properly documented?

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g. Chrome]
- Google Apps Script version
- Agent Y version
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature.

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this feature work?

**Alternatives**
Any alternative solutions considered?
```

## 📚 Resources

### Documentation
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Docs API](https://developers.google.com/docs/api)
- [Gemini API Documentation](https://ai.google.dev/docs)

### Tools
- [Google Apps Script Editor](https://script.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Google AI Studio](https://makersuite.google.com)

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully

### Be Collaborative
- Help others learn and grow
- Share knowledge and resources
- Work together towards common goals

### Be Professional
- Keep discussions focused and on-topic
- Provide constructive feedback
- Follow the code of conduct

## 📞 Getting Help

### Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: contribute@agent-y.dev

### Response Times
- **Bug reports**: 24-48 hours
- **Feature requests**: 3-5 days
- **Pull requests**: 2-3 days

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Agent Y! 🚀
