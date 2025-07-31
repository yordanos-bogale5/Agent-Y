# Agent Y - Google Docs AI Assistant - Deployment Guide

This guide walks you through deploying Agent Y to Google Apps Script and publishing it to the Google Workspace Marketplace.

## Prerequisites

- Google Account with Google Apps Script access
- OpenAI API key or Google Cloud Platform account for Gemini API
- Basic knowledge of Google Apps Script
- Google Cloud Console project (for marketplace publishing)

## Step 1: Set Up Google Apps Script Project

### 1.1 Create New Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click "New Project"
3. Rename the project to "Agent Y"

### 1.2 Configure Project Settings

1. Click on the gear icon (Project Settings)
2. Check "Show 'appsscript.json' manifest file in editor"
3. Save the settings

### 1.3 Set Up Project Files

Replace the default `Code.gs` and create the following files:

**Files to create:**
- `Code.gs` (replace default)
- `appsscript.json` (replace default)
- `sidebar.html`
- `settings.html`
- `help.html`

Copy the content from the corresponding files in the `gas/` directory.

## Step 2: Add Core JavaScript Libraries

Since Google Apps Script doesn't support ES6 modules, you'll need to include the core libraries directly:

### 2.1 Create Library Files

Create these additional `.gs` files and copy the corresponding JavaScript code:

- `AgentController.gs` - Copy from `src/core/agent/AgentController.js`
- `ContextManager.gs` - Copy from `src/core/context/ContextManager.js`
- `MemoryManager.gs` - Copy from `src/core/memory/MemoryManager.js`
- `OpenAIClient.gs` - Copy from `src/api/openai/OpenAIClient.js`
- `SummarizeTool.gs` - Copy from `src/core/tools/SummarizeTool.js`
- `RewriteTool.gs` - Copy from `src/core/tools/RewriteTool.js`
- `ExplainTool.gs` - Copy from `src/core/tools/ExplainTool.js`

### 2.2 Remove Module Exports

For each `.gs` file, remove the module export code at the bottom:

```javascript
// Remove these lines from each .gs file:
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClassName;
} else if (typeof window !== 'undefined') {
  window.ClassName = ClassName;
}
```

## Step 3: Configure API Access

### 3.1 Update appsscript.json

Ensure your `appsscript.json` includes the necessary OAuth scopes:

```json
{
  "timeZone": "America/New_York",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v3",
        "serviceId": "drive"
      }
    ]
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/documents.currentonly",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/script.external_request"
  ],
  "addOns": {
    "common": {
      "name": "AI Writing Assistant",
      "logoUrl": "https://your-domain.com/logo.png",
      "layoutProperties": {
        "primaryColor": "#4285f4",
        "secondaryColor": "#34a853"
      }
    },
    "docs": {
      "homepageTrigger": {
        "runFunction": "onDocsHomepage",
        "enabled": true
      },
      "onFileScopeGrantedTrigger": {
        "runFunction": "onFileScopeGranted"
      }
    }
  },
  "urlFetchWhitelist": [
    "https://api.openai.com/",
    "https://generativelanguage.googleapis.com/"
  ]
}
```

### 3.2 Test the Add-on

1. Click "Deploy" > "Test deployments"
2. Click "Install"
3. Open a Google Doc
4. Look for the add-on in the Extensions menu

## Step 4: Set Up Google Cloud Console Project

### 4.1 Create Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Note the project ID

### 4.2 Link Apps Script Project

1. In Apps Script, go to Project Settings
2. Under "Google Cloud Platform (GCP) Project", enter your project ID
3. Click "Set Project"

### 4.3 Configure OAuth Consent Screen

1. In Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in required information:
   - App name: "Agent Y"
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/documents.currentonly`
   - `https://www.googleapis.com/auth/script.container.ui`
   - `https://www.googleapis.com/auth/script.external_request`
5. Save and continue

## Step 5: Deploy to Google Workspace Marketplace

### 5.1 Prepare Marketplace Assets

Create the following assets:

**Required Images:**
- App icon: 128x128 pixels
- Marketplace icon: 220x140 pixels
- Screenshots: 1280x800 pixels (at least 1, max 5)

**Required Information:**
- App description (short and detailed)
- Privacy policy URL
- Terms of service URL
- Support URL

### 5.2 Create Marketplace Listing

1. Go to [Google Workspace Marketplace SDK](https://console.cloud.google.com/marketplace/browse)
2. Click "Publish" > "Apps"
3. Click "Create Application"
4. Fill in all required information:
   - Application name
   - Short description
   - Detailed description
   - Category: "Productivity"
   - Upload icons and screenshots
   - Add privacy policy and terms of service URLs

### 5.3 Configure App Configuration

1. In the "App Configuration" section:
   - Extension ID: Get from Apps Script deployment
   - OAuth scopes: Same as in appsscript.json
   - Supported file types: Google Docs

### 5.4 Submit for Review

1. Complete all required sections
2. Click "Submit for Review"
3. Wait for Google's approval (typically 1-2 weeks)

## Step 6: Testing and Quality Assurance

### 6.1 Test Deployment

Before submitting to marketplace:

1. Test all core features:
   - Summarization
   - Text rewriting
   - Explanation
   - Content generation
2. Test error handling
3. Test with different document types
4. Test API key configuration
5. Test settings persistence

### 6.2 Performance Testing

1. Test with large documents
2. Test with long text selections
3. Monitor API usage and costs
4. Test response times

### 6.3 Security Testing

1. Verify API keys are stored securely
2. Test OAuth flow
3. Verify no sensitive data is logged
4. Test with restricted documents

## Step 7: Post-Deployment

### 7.1 Monitor Usage

1. Set up Google Analytics (optional)
2. Monitor Apps Script execution logs
3. Track API usage and costs
4. Monitor user feedback

### 7.2 Maintenance

1. Regular updates for new features
2. Bug fixes based on user reports
3. API compatibility updates
4. Security patches

## Troubleshooting

### Common Issues

**1. OAuth Errors**
- Verify all scopes are correctly configured
- Check OAuth consent screen setup
- Ensure project linking is correct

**2. API Errors**
- Verify API keys are correctly stored
- Check URL fetch whitelist
- Monitor API quotas and limits

**3. Deployment Errors**
- Check all required files are present
- Verify appsscript.json syntax
- Ensure all functions are properly defined

**4. Marketplace Rejection**
- Review Google's policies carefully
- Ensure all required assets are provided
- Check privacy policy and terms compliance

### Getting Help

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Workspace Marketplace Documentation](https://developers.google.com/workspace/marketplace)
- [Google Cloud Console Support](https://cloud.google.com/support)

## Security Considerations

1. **API Key Storage**: Use PropertiesService for secure storage
2. **Data Privacy**: Minimize data sent to external APIs
3. **User Consent**: Clear disclosure of data usage
4. **Error Handling**: Don't expose sensitive information in errors
5. **Rate Limiting**: Implement appropriate rate limiting

## Cost Considerations

1. **OpenAI API Costs**: Monitor token usage
2. **Google Cloud Costs**: Minimal for Apps Script
3. **Marketplace Fees**: One-time $5 developer fee
4. **Maintenance Costs**: Ongoing development time

## Next Steps

After successful deployment:

1. Gather user feedback
2. Plan feature enhancements
3. Consider additional AI providers
4. Explore enterprise features
5. Build user community

This completes the deployment guide for the Google Docs AI Agent Extension. Follow these steps carefully to ensure a successful deployment and marketplace publication.
