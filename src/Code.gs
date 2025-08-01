/**
 * Agent Y - Google Docs AI Assistant - Direct Instruction Agent
 * Simple AI agent that follows user instructions directly
 */

// Global configuration with hardcoded API key
const CONFIG = {
  APP_NAME: 'Agent Y',
  VERSION: '1.0.0',
  DEFAULT_MODEL: 'gemini-1.5-flash',
  API_KEY: 'AIzaSyA1eLKBKTqaX-1A0ibBlyA53IQ-4UGxEws',
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300 // 5 minutes
};

/**
 * Initialize the add-on when document opens
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Add menu items when document opens
 */
function onOpen(e) {
  try {
    const ui = DocumentApp.getUi();
    ui.createAddonMenu()
      .addItem('Open Agent Y', 'showSidebar')
      .addSeparator()
      .addItem('Settings', 'showSettings')
      .addItem('Help', 'showHelp')
      .addToUi();
  } catch (error) {
    console.error('Error creating menu:', error);
  }
}

/**
 * Show the main sidebar
 */
function showSidebar() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Agent Y')
      .setWidth(350);
    
    DocumentApp.getUi().showSidebar(html);
  } catch (error) {
    console.error('Error showing sidebar:', error);
    throw new Error('Failed to open Agent Y. Please try again.');
  }
}

/**
 * Show settings dialog
 */
function showSettings() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('settings')
      .setWidth(500)
      .setHeight(600);
    
    DocumentApp.getUi().showModalDialog(html, 'Agent Y Settings');
  } catch (error) {
    console.error('Error showing settings:', error);
    throw new Error('Failed to open settings. Please try again.');
  }
}

/**
 * Show help dialog
 */
function showHelp() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('help')
      .setWidth(600)
      .setHeight(700);
    
    DocumentApp.getUi().showModalDialog(html, 'Agent Y Help');
  } catch (error) {
    console.error('Error showing help:', error);
    throw new Error('Failed to open help. Please try again.');
  }
}

/**
 * Get current text selection or cursor position
 */
function getCurrentSelection() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const selection = doc.getSelection();
    
    if (selection) {
      const elements = selection.getSelectedElements();
      let selectedText = '';
      
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        if (element.getElement().editAsText) {
          const text = element.getElement().editAsText();
          
          if (element.isPartial()) {
            selectedText += text.getText().substring(
              element.getStartOffset(),
              element.getEndOffsetInclusive() + 1
            );
          } else {
            selectedText += text.getText();
          }
        }
      }
      
      return selectedText.trim();
    }
    
    return '';
  } catch (error) {
    console.error('Error getting selection:', error);
    return '';
  }
}

/**
 * Insert text at cursor position
 */
function insertTextAtCursor(text) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();
    const selection = doc.getSelection();
    
    if (selection) {
      // Replace selected text
      const elements = selection.getSelectedElements();
      if (elements.length > 0) {
        const element = elements[0];
        if (element.getElement().editAsText) {
          const textElement = element.getElement().editAsText();
          
          if (element.isPartial()) {
            textElement.deleteText(element.getStartOffset(), element.getEndOffsetInclusive());
            textElement.insertText(element.getStartOffset(), text);
          } else {
            textElement.setText(text);
          }
        }
      }
    } else if (cursor) {
      // Insert at cursor position
      const element = cursor.getElement();
      const offset = cursor.getOffset();
      
      if (element.editAsText) {
        element.editAsText().insertText(offset, text);
      } else {
        // If cursor is not in a text element, insert a new paragraph
        const body = doc.getBody();
        const paragraph = body.insertParagraph(body.getNumChildren(), text);
      }
    } else {
      // No cursor or selection, append to end of document
      const body = doc.getBody();
      body.appendParagraph(text);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error inserting text:', error);
    throw new Error('Failed to insert text into document');
  }
}

/**
 * Process AI instruction from the sidebar
 */
async function processAIRequest(userInput, options = {}) {
  try {
    // Validate input
    if (!userInput || userInput.trim().length === 0) {
      return {
        success: false,
        error: 'Please provide an instruction.'
      };
    }

    // Use hardcoded API key and settings
    const settings = {
      apiKey: CONFIG.API_KEY,
      model: CONFIG.DEFAULT_MODEL,
      maxTokens: 4000,
      temperature: 0.7
    };

    // Process the instruction directly
    const result = await processDirectInstruction(userInput, settings, options);
    return result;

  } catch (error) {
    console.error('Error processing AI instruction:', error);
    return {
      success: false,
      error: `Request failed: ${error.message}`
    };
  }
}

/**
 * Process direct instruction from user
 */
async function processDirectInstruction(userInput, settings, options = {}) {
  try {
    // Get document context
    const selection = getCurrentSelection();
    const documentContent = getDocumentContent();
    
    // Create Gemini client
    const apiClient = new GeminiClient(settings);
    
    // Build instruction prompt
    let prompt = `You are an AI assistant helping with Google Docs. The user wants you to: ${userInput}\n\n`;
    
    // Add context if available
    if (selection && selection.trim().length > 0) {
      prompt += `Selected text: "${selection}"\n\n`;
    }
    
    if (documentContent && documentContent.trim().length > 0) {
      prompt += `Current document content: "${documentContent.substring(0, 1000)}${documentContent.length > 1000 ? '...' : ''}"\n\n`;
    }
    
    prompt += `Please provide the exact content that should be inserted into the document to fulfill this request. Only return the content to be inserted, no explanations.`;

    // Get AI response
    const response = await apiClient.generateResponse(prompt, settings);
    
    return {
      success: true,
      result: {
        text: response.trim(),
        instruction: userInput
      },
      metadata: {
        instruction: userInput,
        hasSelection: !!selection,
        responseLength: response.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error processing instruction:', error);
    return {
      success: false,
      error: `Instruction failed: ${error.message}`
    };
  }
}

/**
 * Get current document cursor position info
 */
function getCursorInfo() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();
    const selection = doc.getSelection();
    
    return {
      hasCursor: !!cursor,
      hasSelection: !!selection,
      selectionText: selection ? getCurrentSelection() : '',
      documentLength: doc.getBody().getText().length
    };
  } catch (error) {
    console.error('Error getting cursor info:', error);
    return {
      hasCursor: false,
      hasSelection: false,
      selectionText: '',
      documentLength: 0
    };
  }
}

/**
 * Get full document content
 */
function getDocumentContent() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    return extractTextFromElement(body);
  } catch (error) {
    console.error('Error getting document content:', error);
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
 * Get user settings (always returns hardcoded API key)
 */
function getUserSettings() {
  return {
    apiKey: CONFIG.API_KEY,
    model: CONFIG.DEFAULT_MODEL,
    maxTokens: 4000,
    temperature: 0.7,
    saveHistory: true,
    analytics: true
  };
}

/**
 * Save user settings
 */
function saveUserSettings(settings) {
  try {
    const properties = PropertiesService.getUserProperties();
    properties.setProperty('ai_agent_settings', JSON.stringify(settings));
    
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { 
      success: false, 
      error: 'Failed to save settings: ' + error.message 
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
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing settings:', error);
    return { 
      success: false, 
      error: 'Failed to clear settings: ' + error.message 
    };
  }
}

/**
 * Get app information
 */
function getAppInfo() {
  return {
    name: CONFIG.APP_NAME,
    version: CONFIG.VERSION,
    model: CONFIG.DEFAULT_MODEL
  };
}
