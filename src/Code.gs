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
 * Insert text at precise cursor position (Augment/Cursor-style controlled insertion)
 */
function insertTextAtCursor(text, options = {}) {
  try {
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();
    const selection = doc.getSelection();

    // Validate that we have a valid insertion point
    if (!cursor && !selection) {
      return {
        success: false,
        error: 'No cursor position found. Please click in the document where you want to insert the text.'
      };
    }

    let insertionResult = null;

    if (selection) {
      // Replace selected text with AI response
      insertionResult = replaceSelectedText(selection, text);
    } else if (cursor) {
      // Insert at exact cursor position
      insertionResult = insertAtCursorPosition(cursor, text);
    }

    if (insertionResult && insertionResult.success) {
      // Move cursor to end of inserted text
      positionCursorAfterInsertion(doc, insertionResult.insertedLength || text.length);

      return {
        success: true,
        message: `Inserted ${text.length} characters at cursor position`,
        insertedLength: text.length
      };
    } else {
      throw new Error(insertionResult?.error || 'Unknown insertion error');
    }

  } catch (error) {
    console.error('Error inserting text:', error);
    return {
      success: false,
      error: `Failed to insert text: ${error.message}`
    };
  }
}

/**
 * Replace selected text with new content
 */
function replaceSelectedText(selection, text) {
  try {
    const elements = selection.getSelectedElements();
    if (elements.length === 0) {
      return { success: false, error: 'No selected elements found' };
    }

    // Handle single element selection
    if (elements.length === 1) {
      const element = elements[0];
      if (element.getElement().editAsText) {
        const textElement = element.getElement().editAsText();

        if (element.isPartial()) {
          // Replace partial selection
          const startOffset = element.getStartOffset();
          const endOffset = element.getEndOffsetInclusive();
          textElement.deleteText(startOffset, endOffset);
          textElement.insertText(startOffset, text);
        } else {
          // Replace entire element
          textElement.setText(text);
        }

        return { success: true, insertedLength: text.length };
      }
    }

    // Handle multi-element selection (more complex)
    return replaceMultiElementSelection(elements, text);

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Insert text at exact cursor position
 */
function insertAtCursorPosition(cursor, text) {
  try {
    const element = cursor.getElement();
    const offset = cursor.getOffset();

    if (element.editAsText) {
      // Insert in text element
      element.editAsText().insertText(offset, text);
      return { success: true, insertedLength: text.length };
    } else {
      // Cursor is in non-text element, insert new paragraph
      const body = DocumentApp.getActiveDocument().getBody();
      const newParagraph = body.insertParagraph(body.getNumChildren(), text);
      return { success: true, insertedLength: text.length };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle multi-element selection replacement
 */
function replaceMultiElementSelection(elements, text) {
  try {
    // For now, replace content in the first editable element
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.getElement().editAsText) {
        const textElement = element.getElement().editAsText();

        if (element.isPartial()) {
          const startOffset = element.getStartOffset();
          const endOffset = element.getEndOffsetInclusive();
          textElement.deleteText(startOffset, endOffset);
          textElement.insertText(startOffset, text);
        } else {
          textElement.setText(text);
        }

        return { success: true, insertedLength: text.length };
      }
    }

    return { success: false, error: 'No editable text elements in selection' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Position cursor after inserted text
 */
function positionCursorAfterInsertion(doc, insertedLength) {
  try {
    // This is a best-effort attempt to position cursor
    // Google Apps Script has limitations with cursor positioning
    const body = doc.getBody();
    const text = body.getText();

    // Try to set cursor position (may not always work due to API limitations)
    const range = doc.newRange();
    const elements = body.getParagraphs();

    if (elements.length > 0) {
      const lastElement = elements[elements.length - 1];
      range.addElement(lastElement);
      doc.setSelection(range.build());
    }

  } catch (error) {
    console.log('Could not position cursor after insertion:', error.message);
    // This is not critical, so we don't throw
  }
}

/**
 * Process dynamic AI query from the sidebar (like Augment/Cursor)
 */
async function processAIRequest(userInput, options = {}) {
  try {
    // Validate input
    if (!userInput || userInput.trim().length === 0) {
      return {
        success: false,
        error: 'Please ask me anything or give me an instruction.'
      };
    }

    // Use hardcoded API key and settings
    const settings = {
      apiKey: CONFIG.API_KEY,
      model: CONFIG.DEFAULT_MODEL,
      maxTokens: 4000,
      temperature: 0.7
    };

    // Process as dynamic Q&A with context awareness
    const result = await processDynamicQuery(userInput, settings, options);
    return result;

  } catch (error) {
    console.error('Error processing AI query:', error);
    return {
      success: false,
      error: `Request failed: ${error.message}`
    };
  }
}

/**
 * Process dynamic query with context awareness (like Augment/Cursor)
 */
async function processDynamicQuery(userInput, settings, options = {}) {
  try {
    // Get document context
    const selection = getCurrentSelection();
    const documentContent = getDocumentContent();
    const cursorInfo = getCursorInfo();

    // Create Gemini client
    const apiClient = new GeminiClient(settings);

    // Build dynamic context-aware prompt
    let prompt = `You are an advanced AI assistant integrated into Google Docs, similar to Cursor or Augment. You can help with any question, task, or request related to writing, editing, analysis, or general knowledge.

User Query: "${userInput}"

CONTEXT INFORMATION:
`;

    // Add document context if available
    if (selection && selection.trim().length > 0) {
      prompt += `- Selected text: "${selection}"\n`;
    }

    if (documentContent && documentContent.trim().length > 0) {
      const preview = documentContent.substring(0, 1500);
      prompt += `- Document content preview: "${preview}${documentContent.length > 1500 ? '...' : ''}"\n`;
    }

    prompt += `- Cursor position: ${cursorInfo.hasCursor ? 'Active' : 'None'}\n`;
    prompt += `- Document length: ${cursorInfo.documentLength} characters\n\n`;

    // Determine response type based on query
    const queryType = analyzeQueryType(userInput);

    switch (queryType) {
      case 'content_creation':
        prompt += `INSTRUCTION: The user wants content created. Provide the exact text that should be inserted into their document. Be helpful and create exactly what they asked for.`;
        break;
      case 'question_answer':
        prompt += `INSTRUCTION: The user has a question. Provide a helpful, informative answer. If they're asking about their document content, analyze it and respond accordingly.`;
        break;
      case 'text_editing':
        prompt += `INSTRUCTION: The user wants text edited or improved. If they have text selected, work with that. Otherwise, provide guidance or ask for clarification.`;
        break;
      case 'analysis':
        prompt += `INSTRUCTION: The user wants analysis or explanation. Analyze their document content or selected text and provide insights.`;
        break;
      default:
        prompt += `INSTRUCTION: Respond helpfully to the user's request. If they want content created, provide it. If they have a question, answer it. Be conversational and helpful.`;
    }

    // Get AI response
    const response = await apiClient.generateResponse(prompt, settings);

    return {
      success: true,
      result: {
        text: response.trim(),
        query: userInput,
        queryType: queryType,
        canInsert: queryType === 'content_creation' || (queryType === 'text_editing' && selection),
        hasContext: !!(selection || documentContent)
      },
      metadata: {
        query: userInput,
        queryType: queryType,
        hasSelection: !!selection,
        hasDocument: !!documentContent,
        responseLength: response.length,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error processing dynamic query:', error);
    return {
      success: false,
      error: `Query failed: ${error.message}`
    };
  }
}

/**
 * Analyze query type to determine appropriate response strategy
 */
function analyzeQueryType(query) {
  const lowerQuery = query.toLowerCase();

  // Content creation patterns
  if (lowerQuery.match(/\b(create|write|generate|make|add|insert|build)\b/) ||
      lowerQuery.match(/\b(table|list|paragraph|section|heading|bullet)\b/)) {
    return 'content_creation';
  }

  // Text editing patterns
  if (lowerQuery.match(/\b(edit|improve|fix|rewrite|change|modify|update)\b/) ||
      lowerQuery.match(/\b(grammar|spelling|tone|style|format)\b/)) {
    return 'text_editing';
  }

  // Analysis patterns
  if (lowerQuery.match(/\b(analyze|explain|summarize|review|check)\b/) ||
      lowerQuery.match(/\b(what|why|how|tell me about)\b/)) {
    return 'analysis';
  }

  // Question patterns
  if (lowerQuery.match(/\b(what|who|when|where|why|how|can you|could you)\b/) ||
      lowerQuery.includes('?')) {
    return 'question_answer';
  }

  // Default to content creation for ambiguous requests
  return 'content_creation';
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
