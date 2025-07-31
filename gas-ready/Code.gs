/**
 * Agent Y - Google Docs AI Assistant - Main Apps Script File
 * Powered by Agent Y's architecture for modular AI assistance
 */

// Global configuration
const CONFIG = {
  APP_NAME: 'Agent Y',
  VERSION: '1.0.0',
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300 // 5 minutes
};

/**
 * Called when the add-on is installed or document is opened
 */
function onInstall(e) {
  // Don't call onOpen during installation
  // The menu will be created when a document is opened
}

/**
 * Called when document is opened
 */
function onOpen(e) {
  try {
    // Create menu items for the add-on
    DocumentApp.getUi()
      .createAddonMenu()
      .addItem('Open Agent Y', 'showSidebar')
      .addItem('Settings', 'showSettings')
      .addSeparator()
      .addItem('Help', 'showHelp')
      .addToUi();
  } catch (error) {
    // Ignore errors during installation
    console.log('Menu creation skipped during installation');
  }
}

/**
 * Homepage trigger for Google Docs add-on
 */
function onDocsHomepage(e) {
  return createHomepageCard();
}

/**
 * Called when file scope is granted
 */
function onFileScopeGranted(e) {
  return createHomepageCard();
}

/**
 * Create the homepage card for the add-on
 */
function createHomepageCard() {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Agent Y')
      .setSubtitle('Intelligent document assistance')
      .setImageUrl('https://example.com/icon.png'))
    .addSection(CardService.newCardSection()
      .setHeader('Quick Actions')
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Summarize Selection')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleSummarizeAction')))
        .addButton(CardService.newTextButton()
          .setText('Improve Writing')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleRewriteAction'))))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Explain Text')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleExplainAction')))
        .addButton(CardService.newTextButton()
          .setText('Generate Content')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleGenerateAction')))))
    .addSection(CardService.newCardSection()
      .setHeader('Custom Prompt')
      .addWidget(CardService.newTextInput()
        .setFieldName('customPrompt')
        .setTitle('Enter your request')
        .setMultiline(true))
      .addWidget(CardService.newTextButton()
        .setText('Process Request')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('handleCustomPrompt'))))
    .build();
    
  return card;
}

/**
 * Show the sidebar interface
 */
function showSidebar() {
  const html = HtmlService.createTemplateFromFile('sidebar')
    .evaluate()
    .setTitle('Agent Y')
    .setWidth(350);
    
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Show the settings dialog
 */
function showSettings() {
  try {
    const html = HtmlService.createTemplateFromFile('settings')
      .evaluate()
      .setWidth(500)
      .setHeight(400);

    DocumentApp.getUi().showModalDialog(html, 'Agent Y Settings');
  } catch (error) {
    console.error('Error opening settings:', error);
    DocumentApp.getUi().alert('Error opening settings: ' + error.message);
  }
}

/**
 * Show the help dialog
 */
function showHelp() {
  const html = HtmlService.createTemplateFromFile('help')
    .evaluate()
    .setWidth(600)
    .setHeight(500);
    
  DocumentApp.getUi().showModalDialog(html, 'Agent Y Help');
}

/**
 * Process AI request from the sidebar
 */
async function processAIRequest(userInput, options = {}) {
  try {
    // Validate input
    if (!userInput || userInput.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide a request or question.'
      };
    }

    // Check if API key is configured
    const settings = getUserSettings();
    if (!settings.apiKey) {
      return {
        success: false,
        error: 'Please configure your OpenAI API key in Settings first.'
      };
    }

    // Simple AI request without complex agent system for now
    const result = await processSimpleAIRequest(userInput, settings, options);
    return result;

  } catch (error) {
    console.error('Error processing AI request:', error);
    return {
      success: false,
      error: `Request failed: ${error.message}`
    };
  }
}

/**
 * Process simple AI request without complex dependencies
 */
async function processSimpleAIRequest(userInput, settings, options = {}) {
  try {
    // Get document context
    const selection = getCurrentSelection();
    const context = {
      selection: selection,
      content: selection || 'No text selected'
    };

    // Create OpenAI client
    const apiClient = new OpenAIClient(settings);

    // Build prompt based on request type
    let prompt = '';
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('summarize')) {
      prompt = `Please summarize the following text:\n\n${context.selection || context.content}`;
    } else if (lowerInput.includes('improve') || lowerInput.includes('rewrite')) {
      prompt = `Please improve and enhance the following text:\n\n${context.selection || context.content}`;
    } else if (lowerInput.includes('explain')) {
      prompt = `Please explain the following text in clear, simple terms:\n\n${context.selection || context.content}`;
    } else if (lowerInput.includes('generate')) {
      prompt = `Please generate content based on this request: ${userInput}`;
    } else {
      // Custom request
      prompt = userInput;
      if (context.selection) {
        prompt += `\n\nSelected text: "${context.selection}"`;
      }
    }

    // Get AI response
    const response = await apiClient.generateResponse(prompt, settings);

    return {
      success: true,
      result: {
        text: response,
        summary: response,
        rewrittenText: response,
        explanation: response
      },
      metadata: {
        originalLength: context.selection ? context.selection.length : 0,
        responseLength: response.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error in simple AI request:', error);
    return {
      success: false,
      error: `AI request failed: ${error.message}`
    };
  }
}

/**
 * Handle quick action buttons
 */
function handleSummarizeAction() {
  return processAIRequest('summarize');
}

function handleRewriteAction() {
  return processAIRequest('improve writing');
}

function handleExplainAction() {
  return processAIRequest('explain');
}

function handleGenerateAction() {
  return processAIRequest('generate content');
}

/**
 * Handle custom prompt from card interface
 */
function handleCustomPrompt(e) {
  const prompt = e.formInput.customPrompt;
  return processAIRequest(prompt);
}

/**
 * Get current document selection
 */
function getCurrentSelection() {
  try {
    const selection = DocumentApp.getActiveDocument().getSelection();
    
    if (!selection) {
      return '';
    }
    
    const elements = selection.getSelectedElements();
    let selectedText = '';
    
    for (const element of elements) {
      const selectedElement = element.getElement();
      
      if (element.isPartial()) {
        const startOffset = element.getStartOffset();
        const endOffset = element.getEndOffsetInclusive();
        
        if (selectedElement.getType() === DocumentApp.ElementType.TEXT) {
          const text = selectedElement.asText().getText();
          selectedText += text.substring(startOffset, endOffset + 1);
        }
      } else {
        selectedText += extractTextFromElement(selectedElement);
      }
    }
    
    return selectedText.trim();
    
  } catch (error) {
    console.error('Error getting selection:', error);
    return '';
  }
}

/**
 * Extract text from document element
 */
function extractTextFromElement(element) {
  let text = '';
  
  try {
    const elementType = element.getType();
    
    switch (elementType) {
      case DocumentApp.ElementType.TEXT:
      case DocumentApp.ElementType.PARAGRAPH:
      case DocumentApp.ElementType.LIST_ITEM:
        text = element.getText();
        break;
        
      default:
        if (element.getNumChildren && element.getChild) {
          const numChildren = element.getNumChildren();
          for (let i = 0; i < numChildren; i++) {
            const child = element.getChild(i);
            text += extractTextFromElement(child);
          }
        }
    }
    
  } catch (error) {
    console.error('Error extracting text from element:', error);
  }
  
  return text;
}

/**
 * Save user settings
 */
function saveUserSettings(settings) {
  try {
    console.log('Saving settings:', settings);
    const properties = PropertiesService.getUserProperties();
    properties.setProperty('ai_agent_settings', JSON.stringify(settings));

    // Verify the save worked
    const saved = properties.getProperty('ai_agent_settings');
    console.log('Settings saved successfully:', saved);

    return { success: true, message: 'Settings saved successfully!' };

  } catch (error) {
    console.error('Error saving settings:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get user settings
 */
function getUserSettings() {
  try {
    const properties = PropertiesService.getUserProperties();
    const settings = properties.getProperty('ai_agent_settings');

    console.log('Retrieved settings:', settings);

    if (settings) {
      const parsed = JSON.parse(settings);
      console.log('Parsed settings:', parsed);

      // Force GPT-3.5 Turbo if GPT-4 is set (to avoid access errors)
      if (parsed.model === 'gpt-4' || parsed.model === 'gpt-4-turbo-preview') {
        console.log('Forcing model change from', parsed.model, 'to gpt-3.5-turbo');
        parsed.model = 'gpt-3.5-turbo';
        // Save the corrected settings
        PropertiesService.getUserProperties().setProperty('ai_agent_settings', JSON.stringify(parsed));
      }

      return parsed;
    }

    // Return default settings
    const defaultSettings = {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 4000,
      temperature: 0.7,
      saveHistory: true,
      analytics: true
    };

    console.log('Using default settings:', defaultSettings);
    return defaultSettings;

  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      apiKey: '',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
      saveHistory: true,
      analytics: true
    };
  }
}

/**
 * Clear all user settings (for troubleshooting)
 */
function clearUserSettings() {
  try {
    const properties = PropertiesService.getUserProperties();
    properties.deleteProperty('ai_agent_settings');
    console.log('User settings cleared');
    return { success: true, message: 'Settings cleared successfully' };
  } catch (error) {
    console.error('Error clearing settings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test API connection
 */
async function testAPIConnection() {
  try {
    console.log('Testing API connection...');
    const settings = getUserSettings();

    console.log('Settings for API test:', settings);

    if (!settings || !settings.apiKey || settings.apiKey.trim() === '') {
      console.log('No API key found in settings');
      return {
        success: false,
        error: 'No API key configured. Please enter your OpenAI API key and save settings first.'
      };
    }

    if (!settings.apiKey.startsWith('sk-')) {
      return {
        success: false,
        error: 'Invalid API key format. OpenAI API keys start with "sk-"'
      };
    }

    console.log('Creating OpenAI client...');
    const apiClient = new OpenAIClient(settings);
    const isConnected = await apiClient.testConnection();

    console.log('Connection test result:', isConnected);

    return {
      success: isConnected,
      message: isConnected ? 'Connection successful! Your API key is working.' : 'Connection failed. Please check your API key.'
    };

  } catch (error) {
    console.error('API connection test error:', error);
    return {
      success: false,
      error: 'Connection test failed: ' + error.message
    };
  }
}

/**
 * Insert text at cursor position
 */
function insertTextAtCursor(text) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();
    
    if (cursor) {
      cursor.insertText(text);
      return { success: true };
    } else {
      // If no cursor, append to end of document
      doc.getBody().appendParagraph(text);
      return { success: true };
    }
    
  } catch (error) {
    console.error('Error inserting text:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Replace selected text
 */
function replaceSelectedText(newText) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const selection = doc.getSelection();
    
    if (selection) {
      const elements = selection.getSelectedElements();
      
      // Clear selected content
      for (const element of elements) {
        if (element.isPartial()) {
          const selectedElement = element.getElement();
          const startOffset = element.getStartOffset();
          const endOffset = element.getEndOffsetInclusive();
          
          if (selectedElement.getType() === DocumentApp.ElementType.TEXT) {
            selectedElement.asText().deleteText(startOffset, endOffset);
            selectedElement.asText().insertText(startOffset, newText);
          }
        } else {
          element.getElement().removeFromParent();
        }
      }
      
      return { success: true };
    } else {
      return insertTextAtCursor(newText);
    }
    
  } catch (error) {
    console.error('Error replacing text:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
