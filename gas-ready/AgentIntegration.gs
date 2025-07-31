/**
 * AgentIntegration - Main integration file that brings together all components
 * This file demonstrates how to integrate the AI agent with Google Apps Script
 */

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
    description: 'Handle general AI requests and questions',
    async execute({ request, context, apiClient, config }) {
      try {
        const prompt = buildGeneralPrompt(request, context);
        const response = await apiClient.generateResponse(prompt, config);
        
        return {
          success: true,
          result: {
            response: response.trim(),
            type: 'general'
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `General request failed: ${error.message}`
        };
      }
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
    description: 'Generate new content based on prompts',
    async execute({ request, context, apiClient, config }) {
      try {
        const prompt = buildGeneratePrompt(request, context);
        const response = await apiClient.generateResponse(prompt, config);
        
        return {
          success: true,
          result: {
            generatedContent: response.trim(),
            type: 'generation'
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Content generation failed: ${error.message}`
        };
      }
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
    async execute({ request, context, apiClient, config }) {
      try {
        const textToTranslate = context.selection || context.content;
        const targetLanguage = extractTargetLanguage(request.parameters);
        
        const prompt = `Translate the following text to ${targetLanguage}:\n\n${textToTranslate}`;
        const response = await apiClient.generateResponse(prompt, config);
        
        return {
          success: true,
          result: {
            translatedText: response.trim(),
            originalText: textToTranslate,
            targetLanguage: targetLanguage
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Translation failed: ${error.message}`
        };
      }
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
    async execute({ request, context, apiClient, config }) {
      try {
        const textToFormat = context.selection || context.content;
        const formatType = extractFormatType(request.parameters);
        
        const prompt = `Format the following text as ${formatType}:\n\n${textToFormat}`;
        const response = await apiClient.generateResponse(prompt, config);
        
        return {
          success: true,
          result: {
            formattedText: response.trim(),
            originalText: textToFormat,
            formatType: formatType
          }
        };
      } catch (error) {
        return {
          success: false,
          error: `Formatting failed: ${error.message}`
        };
      }
    }
  };
}

/**
 * Build prompt for general requests
 * @param {Object} request - User request
 * @param {Object} context - Document context
 * @returns {string} AI prompt
 */
function buildGeneralPrompt(request, context) {
  let prompt = request.parameters || request.command || '';
  
  if (context.selection && context.selection.trim().length > 0) {
    prompt += `\n\nSelected text: "${context.selection}"`;
  }
  
  if (context.content && context.content.trim().length > 0 && !context.selection) {
    prompt += `\n\nDocument content: "${context.content.substring(0, 1000)}..."`;
  }
  
  return prompt;
}

/**
 * Build prompt for content generation
 * @param {Object} request - User request
 * @param {Object} context - Document context
 * @returns {string} AI prompt
 */
function buildGeneratePrompt(request, context) {
  let prompt = `Generate content based on this request: ${request.parameters || request.command}`;
  
  if (context.content && context.content.trim().length > 0) {
    prompt += `\n\nContext from document: "${context.content.substring(0, 500)}..."`;
  }
  
  return prompt;
}

/**
 * Extract target language from request parameters
 * @param {string} parameters - Request parameters
 * @returns {string} Target language
 */
function extractTargetLanguage(parameters) {
  const languages = {
    'spanish': 'Spanish',
    'french': 'French',
    'german': 'German',
    'italian': 'Italian',
    'portuguese': 'Portuguese',
    'chinese': 'Chinese',
    'japanese': 'Japanese',
    'korean': 'Korean',
    'russian': 'Russian',
    'arabic': 'Arabic'
  };
  
  const lowerParams = (parameters || '').toLowerCase();
  
  for (const [key, value] of Object.entries(languages)) {
    if (lowerParams.includes(key)) {
      return value;
    }
  }
  
  return 'English';
}

/**
 * Extract format type from request parameters
 * @param {string} parameters - Request parameters
 * @returns {string} Format type
 */
function extractFormatType(parameters) {
  const lowerParams = (parameters || '').toLowerCase();
  
  if (lowerParams.includes('bullet') || lowerParams.includes('list')) return 'bullet points';
  if (lowerParams.includes('table')) return 'a table';
  if (lowerParams.includes('outline')) return 'an outline';
  if (lowerParams.includes('paragraph')) return 'paragraphs';
  
  return 'a well-structured format';
}

/**
 * Get user settings from PropertiesService
 * @returns {Object} User settings
 */
function getUserSettings() {
  try {
    const properties = PropertiesService.getUserProperties();
    const settings = properties.getProperty('ai_agent_settings');
    
    if (settings) {
      return JSON.parse(settings);
    }
    
    return {};
  } catch (error) {
    console.error('Error getting user settings:', error);
    return {};
  }
}

/**
 * Process AI request with enhanced error handling and logging
 * @param {string} userInput - User input
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing result
 */
async function processAIRequestEnhanced(userInput, options = {}) {
  const startTime = Date.now();
  
  try {
    // Initialize agent system
    const agentSystem = initializeAIAgent(options.config);
    
    // Get current context
    const context = await agentSystem.contextManager.getContext();
    
    // Process the request
    const result = await agentSystem.agent.executeCommand(userInput, {
      context,
      ...options
    });
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    result.processingTime = processingTime;
    
    // Store interaction in memory
    if (result.success && agentSystem.memoryManager) {
      await agentSystem.memoryManager.storeInteraction(userInput, result, context);
    }
    
    return result;
    
  } catch (error) {
    console.error('Error processing AI request:', error);
    return {
      success: false,
      error: error.message,
      processingTime: Date.now() - startTime
    };
  }
}
