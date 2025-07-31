/**
 * Agent Y - Google Docs AI Assistant - Main Apps Script File
 * Powered by Agent Y's architecture for modular AI assistance
 */

// Global configuration
const CONFIG = {
  APP_NAME: 'Agent Y',
  VERSION: '1.0.0',
  DEFAULT_MODEL: 'gpt-4',
  MAX_CONTENT_LENGTH: 10000,
  CACHE_DURATION: 300 // 5 minutes
};

/**
 * Called when the add-on is installed or document is opened
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Called when document is opened
 */
function onOpen(e) {
  // Create menu items for the add-on
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Open Agent Y', 'showSidebar')
    .addItem('Settings', 'showSettings')
    .addSeparator()
    .addItem('Help', 'showHelp')
    .addToUi();
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
 * Show settings dialog
 */
function showSettings() {
  const html = HtmlService.createTemplateFromFile('settings')
    .evaluate()
    .setWidth(400)
    .setHeight(300);
    
  DocumentApp.getUi().showModalDialog(html, 'Settings');
}

/**
 * Show help dialog
 */
function showHelp() {
  const html = HtmlService.createTemplateFromFile('help')
    .evaluate()
    .setWidth(500)
    .setHeight(400);
    
  DocumentApp.getUi().showModalDialog(html, 'Help');
}

/**
 * Handle summarize action from card
 */
function handleSummarizeAction(e) {
  try {
    const result = processAIRequest('summarize', '');
    return createResultCard('Summary', result.result.summary);
  } catch (error) {
    return createErrorCard('Summarization Error', error.message);
  }
}

/**
 * Handle rewrite action from card
 */
function handleRewriteAction(e) {
  try {
    const result = processAIRequest('rewrite', 'improve this text');
    return createResultCard('Improved Text', result.result.rewrittenText);
  } catch (error) {
    return createErrorCard('Rewrite Error', error.message);
  }
}

/**
 * Handle explain action from card
 */
function handleExplainAction(e) {
  try {
    const result = processAIRequest('explain', '');
    return createResultCard('Explanation', result.result);
  } catch (error) {
    return createErrorCard('Explanation Error', error.message);
  }
}

/**
 * Handle generate action from card
 */
function handleGenerateAction(e) {
  try {
    const result = processAIRequest('generate', 'generate relevant content');
    return createResultCard('Generated Content', result.result);
  } catch (error) {
    return createErrorCard('Generation Error', error.message);
  }
}

/**
 * Handle custom prompt from card
 */
function handleCustomPrompt(e) {
  try {
    const prompt = e.formInput.customPrompt;
    if (!prompt) {
      return createErrorCard('Error', 'Please enter a prompt');
    }
    
    const result = processAIRequest('general', prompt);
    return createResultCard('AI Response', result.result);
  } catch (error) {
    return createErrorCard('Processing Error', error.message);
  }
}

/**
 * Create result card for displaying AI responses
 */
function createResultCard(title, content) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle(title))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(content))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Insert into Document')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('insertTextIntoDocument')
            .setParameters({text: content})))
        .addButton(CardService.newTextButton()
          .setText('Back')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('onDocsHomepage')))))
    .build();
}

/**
 * Create error card for displaying errors
 */
function createErrorCard(title, message) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle(title))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(message))
      .addWidget(CardService.newTextButton()
        .setText('Back')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('onDocsHomepage'))))
    .build();
}

/**
 * Insert text into the document at cursor position
 */
function insertTextIntoDocument(e) {
  try {
    const text = e.parameter.text;
    const doc = DocumentApp.getActiveDocument();
    const cursor = doc.getCursor();
    
    if (cursor) {
      cursor.insertText(text);
    } else {
      // If no cursor, append to end of document
      doc.getBody().appendParagraph(text);
    }
    
    return createResultCard('Success', 'Text inserted into document');
  } catch (error) {
    return createErrorCard('Insert Error', error.message);
  }
}

/**
 * Main function to process AI requests
 * This will be expanded to use the full agent architecture
 */
function processAIRequest(command, userInput) {
  try {
    // Initialize the agent controller
    const agent = initializeAgent();
    
    // Get document context
    const context = getDocumentContext();
    
    // Process the request
    const result = agent.processRequest(userInput || command, context);
    
    return result;
    
  } catch (error) {
    console.error('Error processing AI request:', error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
}

/**
 * Initialize the AI agent with configuration
 */
function initializeAgent() {
  // This will be expanded to include the full AgentController
  // For now, return a mock agent
  return {
    processRequest: function(input, context) {
      return {
        success: true,
        result: `Mock response for: ${input}`,
        timestamp: new Date().toISOString()
      };
    }
  };
}

/**
 * Get current document context
 */
function getDocumentContext() {
  try {
    const doc = DocumentApp.getActiveDocument();
    const selection = doc.getSelection();
    
    let selectedText = '';
    if (selection) {
      const elements = selection.getSelectedElements();
      selectedText = elements.map(element => {
        const el = element.getElement();
        if (element.isPartial()) {
          return el.asText().getText().substring(
            element.getStartOffset(),
            element.getEndOffsetInclusive() + 1
          );
        } else {
          return el.asText().getText();
        }
      }).join('');
    }
    
    const fullText = doc.getBody().getText();
    
    return {
      selection: selectedText,
      content: fullText.length > CONFIG.MAX_CONTENT_LENGTH 
        ? fullText.substring(0, CONFIG.MAX_CONTENT_LENGTH) + '...'
        : fullText,
      metadata: {
        id: doc.getId(),
        name: doc.getName(),
        url: doc.getUrl()
      }
    };
    
  } catch (error) {
    console.error('Error getting document context:', error);
    return {
      selection: '',
      content: '',
      metadata: {}
    };
  }
}

/**
 * Get user settings from PropertiesService
 */
function getUserSettings() {
  const userProperties = PropertiesService.getUserProperties();
  return {
    apiKey: userProperties.getProperty('OPENAI_API_KEY') || '',
    model: userProperties.getProperty('AI_MODEL') || CONFIG.DEFAULT_MODEL,
    temperature: parseFloat(userProperties.getProperty('TEMPERATURE')) || 0.7,
    maxTokens: parseInt(userProperties.getProperty('MAX_TOKENS')) || 4000
  };
}

/**
 * Save user settings to PropertiesService
 */
function saveUserSettings(settings) {
  const userProperties = PropertiesService.getUserProperties();
  
  if (settings.apiKey) {
    userProperties.setProperty('OPENAI_API_KEY', settings.apiKey);
  }
  if (settings.model) {
    userProperties.setProperty('AI_MODEL', settings.model);
  }
  if (settings.temperature !== undefined) {
    userProperties.setProperty('TEMPERATURE', settings.temperature.toString());
  }
  if (settings.maxTokens) {
    userProperties.setProperty('MAX_TOKENS', settings.maxTokens.toString());
  }
}

/**
 * Include HTML files for templates
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
