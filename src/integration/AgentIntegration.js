/**
 * AgentIntegration - Main integration file that brings together all components
 * This file demonstrates how to integrate the AI agent with Google Apps Script
 */

// Import all the core components (in a real GAS environment, these would be included differently)
// For now, we'll assume they're available globally

/**
 * Initialize the complete AI agent system
 * @param {Object} config - Configuration options
 * @returns {Object} Initialized agent system
 */
function initializeAIAgent(config = {}) {
  try {
    // Get user settings
    const userSettings = getUserSettings();
    
    // Merge with provided config
    const agentConfig = {
      ...userSettings,
      ...config
    };
    
    // Initialize core components
    const contextManager = new ContextManager({
      maxContentLength: agentConfig.maxContentLength || 10000,
      includeMetadata: true
    });
    
    const memoryManager = new MemoryManager({
      maxHistoryItems: 50,
      persistToStorage: agentConfig.saveHistory !== false,
      storageKey: 'ai_agent_memory'
    });
    
    const apiClient = new OpenAIClient({
      apiKey: agentConfig.apiKey,
      model: agentConfig.model || 'gpt-4',
      maxTokens: agentConfig.maxTokens || 4000,
      temperature: agentConfig.temperature || 0.7
    });
    
    // Initialize agent controller
    const agent = new AgentController(agentConfig);
    
    // Set up dependencies
    agent.setContextManager(contextManager);
    agent.setMemoryManager(memoryManager);
    agent.setApiClient(apiClient);
    
    // Register all tools
    registerAllTools(agent);
    
    return {
      agent,
      contextManager,
      memoryManager,
      apiClient,
      config: agentConfig
    };
    
  } catch (error) {
    console.error('Error initializing AI agent:', error);
    throw new Error(`Agent initialization failed: ${error.message}`);
  }
}

/**
 * Register all available tools with the agent
 * @param {AgentController} agent - Agent instance
 */
function registerAllTools(agent) {
  // Register summarize tool
  const summarizeTool = new SummarizeTool();
  agent.registerTool('summarize', summarizeTool);
  
  // Register rewrite tool
  const rewriteTool = new RewriteTool();
  agent.registerTool('rewrite', rewriteTool);
  
  // Register explain tool
  const explainTool = new ExplainTool();
  agent.registerTool('explain', explainTool);
  
  // Register general tool for other requests
  agent.registerTool('general', createGeneralTool());
  
  // Register generate tool
  agent.registerTool('generate', createGenerateTool());
  
  // Register translate tool
  agent.registerTool('translate', createTranslateTool());
  
  // Register format tool
  agent.registerTool('format', createFormatTool());
}

/**
 * Create a general-purpose tool for miscellaneous requests
 * @returns {Object} General tool
 */
function createGeneralTool() {
  return {
    name: 'general',
    description: 'General AI assistance for various tasks',
    execute: async ({ request, context, apiClient, config }) => {
      const prompt = buildGeneralPrompt(request, context);
      const response = await apiClient.generateResponse(prompt, config);
      
      return {
        result: response,
        action: 'general_assistance',
        timestamp: new Date().toISOString()
      };
    }
  };
}

/**
 * Create a content generation tool
 * @returns {Object} Generate tool
 */
function createGenerateTool() {
  return {
    name: 'generate',
    description: 'Generate new content based on prompts and context',
    execute: async ({ request, context, apiClient, config }) => {
      const prompt = buildGeneratePrompt(request, context);
      const response = await apiClient.generateResponse(prompt, config);
      
      return {
        result: response,
        action: 'content_generation',
        timestamp: new Date().toISOString()
      };
    }
  };
}

/**
 * Create a translation tool
 * @returns {Object} Translate tool
 */
function createTranslateTool() {
  return {
    name: 'translate',
    description: 'Translate text to different languages',
    execute: async ({ request, context, apiClient, config }) => {
      const prompt = buildTranslatePrompt(request, context);
      const response = await apiClient.generateResponse(prompt, config);
      
      return {
        result: response,
        action: 'translation',
        timestamp: new Date().toISOString()
      };
    }
  };
}

/**
 * Create a formatting tool
 * @returns {Object} Format tool
 */
function createFormatTool() {
  return {
    name: 'format',
    description: 'Format and structure text content',
    execute: async ({ request, context, apiClient, config }) => {
      const prompt = buildFormatPrompt(request, context);
      const response = await apiClient.generateResponse(prompt, config);
      
      return {
        result: response,
        action: 'formatting',
        timestamp: new Date().toISOString()
      };
    }
  };
}

/**
 * Build prompt for general assistance
 * @param {Object} request - User request
 * @param {Object} context - Document context
 * @returns {string} Formatted prompt
 */
function buildGeneralPrompt(request, context) {
  let prompt = `You are an AI writing assistant helping with Google Docs content. `;
  
  if (context.selection) {
    prompt += `The user has selected this text: "${context.selection}"\n\n`;
  }
  
  if (context.content && context.content !== context.selection) {
    prompt += `Document context: ${context.content.substring(0, 1000)}...\n\n`;
  }
  
  prompt += `User request: ${request.originalInput || request.parameters}\n\n`;
  prompt += `Please provide a helpful response based on the context and request.`;
  
  return prompt;
}

/**
 * Build prompt for content generation
 * @param {Object} request - User request
 * @param {Object} context - Document context
 * @returns {string} Formatted prompt
 */
function buildGeneratePrompt(request, context) {
  let prompt = `You are a creative writing assistant. Generate content based on the user's request. `;
  
  if (context.content) {
    prompt += `Use this document context for inspiration and consistency: ${context.content.substring(0, 500)}...\n\n`;
  }
  
  prompt += `Generation request: ${request.originalInput || request.parameters}\n\n`;
  prompt += `Please generate relevant, high-quality content that fits the request and context.`;
  
  return prompt;
}

/**
 * Build prompt for translation
 * @param {Object} request - User request
 * @param {Object} context - Document context
 * @returns {string} Formatted prompt
 */
function buildTranslatePrompt(request, context) {
  const textToTranslate = context.selection || extractTextFromRequest(request);
  const targetLanguage = extractTargetLanguage(request);
  
  let prompt = `Please translate the following text to ${targetLanguage}. `;
  prompt += `Maintain the original meaning, tone, and style as much as possible.\n\n`;
  prompt += `Text to translate: "${textToTranslate}"\n\n`;
  prompt += `Provide only the translation without additional commentary.`;
  
  return prompt;
}

/**
 * Build prompt for formatting
 * @param {Object} request - User request
 * @param {Object} context - Document context
 * @returns {string} Formatted prompt
 */
function buildFormatPrompt(request, context) {
  const textToFormat = context.selection || context.content;
  const formatType = extractFormatType(request);
  
  let prompt = `Please format the following text as ${formatType}. `;
  prompt += `Maintain the original content while improving structure and presentation.\n\n`;
  prompt += `Text to format: "${textToFormat}"\n\n`;
  prompt += `Provide the formatted version.`;
  
  return prompt;
}

/**
 * Extract target language from request
 * @param {Object} request - User request
 * @returns {string} Target language
 */
function extractTargetLanguage(request) {
  const params = request.parameters?.toLowerCase() || '';
  
  const languages = {
    spanish: ['spanish', 'español', 'es'],
    french: ['french', 'français', 'fr'],
    german: ['german', 'deutsch', 'de'],
    italian: ['italian', 'italiano', 'it'],
    portuguese: ['portuguese', 'português', 'pt'],
    chinese: ['chinese', 'mandarin', 'zh'],
    japanese: ['japanese', 'ja'],
    korean: ['korean', 'ko'],
    russian: ['russian', 'ru'],
    arabic: ['arabic', 'ar']
  };
  
  for (const [language, keywords] of Object.entries(languages)) {
    if (keywords.some(keyword => params.includes(keyword))) {
      return language;
    }
  }
  
  return 'the target language specified';
}

/**
 * Extract format type from request
 * @param {Object} request - User request
 * @returns {string} Format type
 */
function extractFormatType(request) {
  const params = request.parameters?.toLowerCase() || '';
  
  if (params.includes('bullet') || params.includes('list')) return 'a bulleted list';
  if (params.includes('table')) return 'a table';
  if (params.includes('outline')) return 'an outline';
  if (params.includes('paragraph')) return 'paragraphs';
  if (params.includes('heading')) return 'with proper headings';
  
  return 'a well-structured format';
}

/**
 * Extract text from request parameters
 * @param {Object} request - User request
 * @returns {string} Extracted text
 */
function extractTextFromRequest(request) {
  const params = request.parameters || '';
  const quotedMatch = params.match(/"([^"]+)"/);
  
  if (quotedMatch) {
    return quotedMatch[1];
  }
  
  return params;
}

/**
 * Enhanced processAIRequest function that uses the full agent system
 * This replaces the simple version in Code.gs
 */
function processAIRequestEnhanced(command, userInput, documentContext = null) {
  try {
    // Initialize the agent system
    const agentSystem = initializeAIAgent();
    
    // Get document context if not provided
    const context = documentContext || getDocumentContext();
    
    // Add conversation history to context
    const conversationContext = agentSystem.memoryManager.getConversationContext();
    if (conversationContext) {
      context.conversationHistory = conversationContext;
    }
    
    // Process the request
    const result = agentSystem.agent.processRequest(userInput || command, context);
    
    // Store the interaction in memory
    agentSystem.memoryManager.storeInteraction(userInput || command, result, context);
    
    return result;
    
  } catch (error) {
    console.error('Error in enhanced AI request processing:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Utility function to validate agent configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result
 */
function validateAgentConfig(config) {
  const errors = [];
  
  if (!config.apiKey) {
    errors.push('API key is required');
  }
  
  if (config.maxTokens && (config.maxTokens < 100 || config.maxTokens > 8000)) {
    errors.push('Max tokens must be between 100 and 8000');
  }
  
  if (config.temperature && (config.temperature < 0 || config.temperature > 1)) {
    errors.push('Temperature must be between 0 and 1');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get agent system status and health check
 * @returns {Object} System status
 */
function getAgentSystemStatus() {
  try {
    const settings = getUserSettings();
    const validation = validateAgentConfig(settings);
    
    return {
      configured: validation.valid,
      errors: validation.errors,
      settings: {
        hasApiKey: !!settings.apiKey,
        model: settings.model || 'not set',
        maxTokens: settings.maxTokens || 'default',
        temperature: settings.temperature || 'default'
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      configured: false,
      errors: [error.message],
      timestamp: new Date().toISOString()
    };
  }
}

// Export functions for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeAIAgent,
    processAIRequestEnhanced,
    validateAgentConfig,
    getAgentSystemStatus
  };
} else if (typeof window !== 'undefined') {
  window.AgentIntegration = {
    initializeAIAgent,
    processAIRequestEnhanced,
    validateAgentConfig,
    getAgentSystemStatus
  };
}
