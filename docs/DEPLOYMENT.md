# Agent Y Deployment Guide

This guide covers how to deploy Agent Y in different environments, from development to production.

## 🚀 Quick Deployment

### Prerequisites
- Google account with Google Apps Script access
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Basic understanding of Google Apps Script

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select "Create API key in new project" or choose existing project
5. Copy the generated API key (starts with "AIza...")

### 2. Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Rename project to "Agent Y"

### 3. Upload Source Files

Copy the contents of each file from the `/src/` directory:

#### Required Files:
- **Code.gs** - Main backend logic
- **GeminiClient.gs** - AI integration
- **sidebar.html** - Chat interface
- **settings.html** - Configuration UI
- **help.html** - Documentation
- **appsscript.json** - Project manifest

#### Upload Process:
1. In Google Apps Script, delete the default `Code.gs` content
2. Copy content from `src/Code.gs` and paste it
3. Add new files: Files → New → Script file (for .gs files) or HTML file (for .html files)
4. Copy content from each source file

### 4. Configure API Key

Edit `Code.gs` and update the CONFIG object:

```javascript
const CONFIG = {
  APP_NAME: 'Agent Y',
  VERSION: '1.0.0',
  DEFAULT_MODEL: 'gemini-1.5-flash',
  API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // Replace with your key
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300
};
```

### 5. Deploy as Add-on

1. Click "Deploy" → "Test deployments"
2. Click "Install"
3. Grant necessary permissions
4. The add-on is now available in Google Docs

### 6. Test Installation

1. Open any Google Doc
2. Go to "Extensions" → "Agent Y"
3. The sidebar should open with the chat interface
4. Test with a simple instruction like "Create a table"

## 🏗️ Development Environment

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-y.git
cd agent-y

# Create development branch
git checkout -b development
```

### Development Workflow

1. **Edit locally** in your preferred editor
2. **Copy to Google Apps Script** for testing
3. **Test in Google Docs** environment
4. **Commit changes** to version control
5. **Deploy updates** to test environment

### Testing Configuration

Create a separate Google Apps Script project for testing:

```javascript
const CONFIG = {
  APP_NAME: 'Agent Y (Dev)',
  VERSION: '1.0.0-dev',
  DEFAULT_MODEL: 'gemini-1.5-flash',
  API_KEY: 'YOUR_DEV_API_KEY',
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300
};
```

## 🌐 Production Deployment

### Production Checklist

- [ ] API key is properly configured
- [ ] All source files are uploaded
- [ ] Permissions are correctly set
- [ ] Error handling is implemented
- [ ] Performance is optimized
- [ ] Security measures are in place

### Production Configuration

```javascript
const CONFIG = {
  APP_NAME: 'Agent Y',
  VERSION: '1.0.0',
  DEFAULT_MODEL: 'gemini-1.5-flash',
  API_KEY: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'),
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300
};
```

### Environment Variables

Store sensitive data in Google Apps Script properties:

```javascript
// Set script properties (run once)
function setupEnvironment() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperties({
    'GEMINI_API_KEY': 'your-production-api-key',
    'ENVIRONMENT': 'production'
  });
}
```

### Publishing as Public Add-on

1. **Prepare for review**:
   - Complete OAuth verification
   - Prepare privacy policy
   - Create store listing assets

2. **Submit to Google Workspace Marketplace**:
   - Go to Google Cloud Console
   - Navigate to Google Workspace Marketplace SDK
   - Submit application for review

## 🔧 Configuration Management

### Environment-Specific Settings

```javascript
function getEnvironmentConfig() {
  const environment = PropertiesService.getScriptProperties().getProperty('ENVIRONMENT') || 'development';
  
  const configs = {
    development: {
      API_KEY: 'dev-api-key',
      DEBUG: true,
      LOG_LEVEL: 'debug'
    },
    production: {
      API_KEY: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'),
      DEBUG: false,
      LOG_LEVEL: 'error'
    }
  };
  
  return configs[environment];
}
```

### Feature Flags

```javascript
const FEATURES = {
  DARK_MODE: true,
  ADVANCED_PROMPTS: true,
  ANALYTICS: false
};
```

## 📊 Monitoring and Analytics

### Error Tracking

```javascript
function logError(error, context) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString(),
    user: Session.getActiveUser().getEmail()
  };
  
  console.error('Agent Y Error:', errorData);
  
  // Optional: Send to external logging service
  // sendToLoggingService(errorData);
}
```

### Usage Analytics

```javascript
function trackUsage(action, metadata = {}) {
  const analyticsData = {
    action: action,
    metadata: metadata,
    timestamp: new Date().toISOString(),
    user: Session.getActiveUser().getEmail()
  };
  
  // Store in Google Sheets or external analytics service
  // recordAnalytics(analyticsData);
}
```

## 🔒 Security Configuration

### API Key Security

```javascript
// Never expose API keys in client-side code
function getSecureApiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}
```

### Input Validation

```javascript
function validateUserInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  
  if (input.length > CONFIG.MAX_CONTENT_LENGTH) {
    throw new Error('Input too long');
  }
  
  // Additional validation rules
  return input.trim();
}
```

### Rate Limiting

```javascript
function checkRateLimit(userId) {
  const cache = CacheService.getUserCache();
  const key = `rate_limit_${userId}`;
  const requests = cache.get(key) || 0;
  
  if (requests > 100) { // 100 requests per hour
    throw new Error('Rate limit exceeded');
  }
  
  cache.put(key, requests + 1, 3600); // 1 hour
}
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### 1. API Key Errors
```
Error: Gemini API key is required
```
**Solution**: Verify API key is correctly set in CONFIG

#### 2. Permission Errors
```
Error: You do not have permission to call DocumentApp.getActiveDocument
```
**Solution**: Re-authorize the add-on with proper permissions

#### 3. Model Not Found
```
Error: models/gemini-pro is not found for API version v1
```
**Solution**: Use correct model name (gemini-1.5-flash) and API version (v1beta)

### Debug Mode

Enable debug logging:

```javascript
const DEBUG = true;

function debugLog(message, data) {
  if (DEBUG) {
    console.log(`[Agent Y Debug] ${message}`, data);
  }
}
```

### Health Check

```javascript
function healthCheck() {
  const checks = {
    apiKey: !!CONFIG.API_KEY,
    geminiConnection: false,
    documentAccess: false
  };
  
  try {
    // Test Gemini connection
    const client = new GeminiClient({ apiKey: CONFIG.API_KEY });
    checks.geminiConnection = client.testConnection();
    
    // Test document access
    DocumentApp.getActiveDocument();
    checks.documentAccess = true;
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  return checks;
}
```

## 📈 Performance Optimization

### Caching Strategy

```javascript
function getCachedResponse(prompt) {
  const cache = CacheService.getUserCache();
  const key = `response_${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, prompt)}`;
  return cache.get(key);
}

function setCachedResponse(prompt, response) {
  const cache = CacheService.getUserCache();
  const key = `response_${Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, prompt)}`;
  cache.put(key, response, CONFIG.CACHE_DURATION);
}
```

### Batch Operations

```javascript
function batchProcessInstructions(instructions) {
  const results = [];
  
  for (const instruction of instructions) {
    try {
      const result = processAIRequest(instruction);
      results.push(result);
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
}
```

## 🔄 Update Management

### Version Control

```javascript
function checkForUpdates() {
  const currentVersion = CONFIG.VERSION;
  const latestVersion = getLatestVersion(); // Implement version check
  
  if (currentVersion !== latestVersion) {
    // Notify user of available update
    showUpdateNotification(latestVersion);
  }
}
```

### Migration Scripts

```javascript
function migrateUserData(fromVersion, toVersion) {
  console.log(`Migrating from ${fromVersion} to ${toVersion}`);
  
  // Implement migration logic
  if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
    migrateSettingsFormat();
  }
}
```

## 📞 Support and Maintenance

### Backup Strategy

```javascript
function backupUserSettings() {
  const settings = getUserSettings();
  const backup = {
    settings: settings,
    timestamp: new Date().toISOString(),
    version: CONFIG.VERSION
  };
  
  // Store backup in user properties
  PropertiesService.getUserProperties().setProperty('settings_backup', JSON.stringify(backup));
}
```

### Maintenance Mode

```javascript
function isMaintenanceMode() {
  return PropertiesService.getScriptProperties().getProperty('MAINTENANCE_MODE') === 'true';
}

function enableMaintenanceMode(message) {
  PropertiesService.getScriptProperties().setProperties({
    'MAINTENANCE_MODE': 'true',
    'MAINTENANCE_MESSAGE': message
  });
}
```

---

For additional help, see the [API Documentation](API.md) and [Contributing Guide](CONTRIBUTING.md).
