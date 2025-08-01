# Agent Y API Documentation

This document provides detailed information about Agent Y's API functions and integration points.

## 🏗️ Architecture Overview

Agent Y consists of several key components:

- **Code.gs**: Main backend logic and Google Apps Script integration
- **GeminiClient.gs**: Gemini AI API client and response handling
- **sidebar.html**: Modern chat interface with Cursor-style design
- **settings.html**: Configuration interface
- **help.html**: User documentation

## 📡 Core API Functions

### Main Entry Points

#### `processAIRequest(userInput, options)`
Main function for processing user instructions.

**Parameters:**
- `userInput` (string): User instruction or command
- `options` (Object): Optional configuration parameters

**Returns:**
```javascript
{
  success: boolean,
  result: {
    text: string,        // Generated response
    instruction: string  // Original user instruction
  },
  metadata: {
    instruction: string,
    hasSelection: boolean,
    responseLength: number,
    timestamp: string
  }
}
```

**Example:**
```javascript
const result = await processAIRequest("Create a table with 3 columns");
if (result.success) {
  console.log(result.result.text);
}
```

#### `insertTextAtCursor(text)`
Inserts text at the current cursor position or replaces selected text.

**Parameters:**
- `text` (string): Text to insert

**Returns:**
```javascript
{
  success: boolean
}
```

### Document Interaction

#### `getCurrentSelection()`
Gets the currently selected text in the document.

**Returns:**
- `string`: Selected text or empty string if no selection

#### `getDocumentContent()`
Retrieves the full document content.

**Returns:**
- `string`: Complete document text

#### `getCursorInfo()`
Gets information about the current cursor position and selection.

**Returns:**
```javascript
{
  hasCursor: boolean,
  hasSelection: boolean,
  selectionText: string,
  documentLength: number
}
```

### Settings Management

#### `getUserSettings()`
Retrieves user configuration settings.

**Returns:**
```javascript
{
  apiKey: string,
  model: string,
  maxTokens: number,
  temperature: number,
  saveHistory: boolean,
  analytics: boolean
}
```

#### `saveUserSettings(settings)`
Saves user configuration settings.

**Parameters:**
- `settings` (Object): Settings object

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

## 🤖 Gemini Client API

### GeminiClient Class

#### Constructor
```javascript
const client = new GeminiClient({
  apiKey: 'your-api-key',
  model: 'gemini-1.5-flash',
  maxTokens: 4000,
  temperature: 0.7
});
```

#### `generateResponse(prompt, options)`
Generates AI response for given prompt.

**Parameters:**
- `prompt` (string): Input prompt
- `options` (Object): Generation options

**Returns:**
- `Promise<string>`: Generated response text

#### `testConnection()`
Tests the API connection.

**Returns:**
- `Promise<boolean>`: Connection status

### Configuration Options

```javascript
{
  apiKey: string,           // Gemini API key
  model: string,            // Model name (gemini-1.5-flash, etc.)
  baseURL: string,          // API base URL
  maxTokens: number,        // Maximum response tokens
  temperature: number,      // Response creativity (0-1)
  timeout: number          // Request timeout in ms
}
```

## 🎨 UI Integration

### Sidebar Interface

The sidebar uses a modern chat interface with the following key functions:

#### JavaScript Functions

##### `sendMessage()`
Sends user message to AI and displays response.

##### `addMessage(type, content, actions)`
Adds a message to the chat interface.

**Parameters:**
- `type` (string): 'user' or 'ai'
- `content` (string): Message content
- `actions` (boolean): Whether to show action buttons

##### `toggleTheme()`
Switches between light and dark themes.

##### `insertIntoDocument(text)`
Inserts AI response into the Google Doc.

##### `copyToClipboard(text)`
Copies text to clipboard.

### CSS Custom Properties

The interface uses CSS custom properties for theming:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  --accent-color: #3b82f6;
  /* ... more properties */
}

[data-theme="dark"] {
  --bg-primary: #111827;
  --text-primary: #f9fafb;
  /* ... dark theme overrides */
}
```

## 🔧 Configuration

### Global Configuration

```javascript
const CONFIG = {
  APP_NAME: 'Agent Y',
  VERSION: '1.0.0',
  DEFAULT_MODEL: 'gemini-1.5-flash',
  API_KEY: 'your-api-key-here',
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300
};
```

### Model Options

Available Gemini models:
- `gemini-1.5-flash`: Fast, efficient model
- `gemini-1.5-pro`: Advanced capabilities
- `gemini-pro`: Legacy model

## 🚨 Error Handling

### Error Response Format

```javascript
{
  success: false,
  error: string  // Error message
}
```

### Common Error Types

1. **API Key Error**: Invalid or missing Gemini API key
2. **Model Error**: Unsupported model name
3. **Network Error**: Connection issues
4. **Permission Error**: Google Apps Script permissions
5. **Content Error**: Invalid or too long content

### Error Handling Example

```javascript
try {
  const result = await processAIRequest(userInput);
  if (!result.success) {
    console.error('AI request failed:', result.error);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## 🔒 Security Considerations

### API Key Management
- API keys are stored in Google Apps Script properties
- Never expose API keys in client-side code
- Use environment-specific configurations

### Content Validation
- Validate user input before processing
- Sanitize content before insertion
- Implement rate limiting for API calls

### Permissions
- Request minimal necessary permissions
- Use Google Apps Script's built-in security features
- Validate user permissions before operations

## 📊 Performance Optimization

### Best Practices

1. **Caching**: Cache frequently used responses
2. **Batching**: Batch multiple operations when possible
3. **Lazy Loading**: Load components as needed
4. **Debouncing**: Debounce user input for real-time features

### Token Management

```javascript
// Estimate token usage
const estimatedTokens = client.estimateTokenCount(prompt);

// Check limits before request
if (client.isWithinTokenLimits(prompt)) {
  const response = await client.generateResponse(prompt);
}

// Truncate if necessary
const truncatedPrompt = client.truncatePrompt(prompt, {
  maxTokens: 2000,
  reservedTokens: 500
});
```

## 🧪 Testing

### Unit Testing Example

```javascript
function testProcessAIRequest() {
  const mockInput = "Create a simple table";
  const result = processAIRequest(mockInput);
  
  console.assert(result.success === true, 'Request should succeed');
  console.assert(result.result.text.length > 0, 'Should return content');
}
```

### Integration Testing

```javascript
function testDocumentIntegration() {
  const testText = "Test content";
  const insertResult = insertTextAtCursor(testText);
  
  console.assert(insertResult.success === true, 'Insert should succeed');
  
  const selection = getCurrentSelection();
  console.assert(selection.includes(testText), 'Text should be inserted');
}
```

## 📚 Examples

### Basic Usage

```javascript
// Simple instruction processing
const result = await processAIRequest("Summarize this text");

// Insert response into document
if (result.success) {
  await insertTextAtCursor(result.result.text);
}
```

### Advanced Usage

```javascript
// Custom configuration
const customClient = new GeminiClient({
  model: 'gemini-1.5-pro',
  temperature: 0.9,
  maxTokens: 2000
});

// Generate with custom settings
const response = await customClient.generateResponse(
  "Create a creative story",
  { temperature: 0.8 }
);
```

## 🔗 External APIs

### Google Apps Script APIs
- DocumentApp: Document manipulation
- HtmlService: UI rendering
- PropertiesService: Settings storage
- UrlFetchApp: HTTP requests

### Gemini API Endpoints
- Base URL: `https://generativelanguage.googleapis.com/v1beta`
- Generate Content: `/models/{model}:generateContent`

## 📝 Changelog

### Version 1.0.0
- Initial release with Cursor-style interface
- Gemini AI integration
- Dark/light theme support
- Real-time chat experience

---

For more information, see the [Contributing Guide](CONTRIBUTING.md) and [Deployment Guide](DEPLOYMENT.md).
