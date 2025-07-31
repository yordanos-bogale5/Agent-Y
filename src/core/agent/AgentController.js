/**
 * AgentController - Main AI agent controller powered by Agent Y's architecture
 * Handles command parsing, tool execution, and response generation
 */

class AgentController {
  constructor(config = {}) {
    this.config = {
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      model: config.model || 'gpt-4',
      ...config
    };
    
    this.tools = new Map();
    this.contextManager = null;
    this.memoryManager = null;
    this.apiClient = null;
    
    this.initializeTools();
  }

  /**
   * Initialize available tools/commands
   */
  initializeTools() {
    // Tools will be registered here
    // Following Agent Y's modular tool architecture
  }

  /**
   * Register a new tool with the agent
   * @param {string} name - Tool name
   * @param {Object} tool - Tool implementation
   */
  registerTool(name, tool) {
    if (!tool.execute || typeof tool.execute !== 'function') {
      throw new Error(`Tool ${name} must have an execute method`);
    }
    
    this.tools.set(name, {
      name,
      description: tool.description || '',
      parameters: tool.parameters || {},
      execute: tool.execute.bind(tool)
    });
  }

  /**
   * Set the context manager for document content handling
   * @param {Object} contextManager - Context management instance
   */
  setContextManager(contextManager) {
    this.contextManager = contextManager;
  }

  /**
   * Set the memory manager for conversation state
   * @param {Object} memoryManager - Memory management instance
   */
  setMemoryManager(memoryManager) {
    this.memoryManager = memoryManager;
  }

  /**
   * Set the API client for AI service communication
   * @param {Object} apiClient - API client instance
   */
  setApiClient(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Process a user request and generate response
   * @param {string} userInput - User's input/command
   * @param {Object} context - Current document context
   * @returns {Promise<Object>} Response object
   */
  async processRequest(userInput, context = {}) {
    try {
      // Parse the user input to determine intent and extract parameters
      const parsedRequest = this.parseUserInput(userInput);
      
      // Get document context if needed
      const documentContext = await this.getDocumentContext(context);
      
      // Determine the appropriate tool/command to use
      const tool = this.selectTool(parsedRequest);
      
      // Execute the tool with context
      const result = await this.executeTool(tool, parsedRequest, documentContext);
      
      // Store interaction in memory
      if (this.memoryManager) {
        await this.memoryManager.storeInteraction(userInput, result);
      }
      
      return {
        success: true,
        result,
        tool: tool.name,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error processing request:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Parse user input to extract intent and parameters
   * @param {string} input - Raw user input
   * @returns {Object} Parsed request object
   */
  parseUserInput(input) {
    // Simple command parsing - can be enhanced with NLP
    const trimmedInput = input.trim().toLowerCase();
    
    // Check for explicit commands
    if (trimmedInput.startsWith('/')) {
      const parts = trimmedInput.slice(1).split(' ');
      return {
        command: parts[0],
        parameters: parts.slice(1).join(' '),
        isExplicitCommand: true
      };
    }
    
    // Infer command from natural language
    const inferredCommand = this.inferCommand(trimmedInput);
    
    return {
      command: inferredCommand,
      parameters: input,
      isExplicitCommand: false,
      originalInput: input
    };
  }

  /**
   * Infer command from natural language input
   * @param {string} input - User input
   * @returns {string} Inferred command
   */
  inferCommand(input) {
    const keywords = {
      summarize: ['summarize', 'summary', 'sum up', 'brief', 'overview'],
      rewrite: ['rewrite', 'rephrase', 'improve', 'edit', 'revise'],
      explain: ['explain', 'clarify', 'what does', 'what is', 'help me understand'],
      generate: ['generate', 'create', 'write', 'compose', 'draft'],
      analyze: ['analyze', 'review', 'examine', 'assess', 'evaluate'],
      translate: ['translate', 'convert to', 'in spanish', 'in french'],
      format: ['format', 'style', 'make it', 'change to']
    };
    
    for (const [command, words] of Object.entries(keywords)) {
      if (words.some(word => input.includes(word))) {
        return command;
      }
    }
    
    return 'general'; // Default command for general AI assistance
  }

  /**
   * Get document context based on current selection or full document
   * @param {Object} context - Context information
   * @returns {Promise<Object>} Document context
   */
  async getDocumentContext(context) {
    if (!this.contextManager) {
      return { content: '', selection: '', metadata: {} };
    }
    
    return await this.contextManager.getContext(context);
  }

  /**
   * Select appropriate tool based on parsed request
   * @param {Object} parsedRequest - Parsed user request
   * @returns {Object} Selected tool
   */
  selectTool(parsedRequest) {
    const toolName = parsedRequest.command;
    
    if (this.tools.has(toolName)) {
      return this.tools.get(toolName);
    }
    
    // Fallback to general tool
    return this.tools.get('general') || this.createDefaultTool();
  }

  /**
   * Execute the selected tool with given parameters and context
   * @param {Object} tool - Tool to execute
   * @param {Object} request - Parsed request
   * @param {Object} context - Document context
   * @returns {Promise<Object>} Tool execution result
   */
  async executeTool(tool, request, context) {
    if (!this.apiClient) {
      throw new Error('API client not configured');
    }
    
    return await tool.execute({
      request,
      context,
      apiClient: this.apiClient,
      config: this.config
    });
  }

  /**
   * Create a default tool for general AI assistance
   * @returns {Object} Default tool
   */
  createDefaultTool() {
    return {
      name: 'general',
      description: 'General AI assistance',
      execute: async ({ request, context, apiClient, config }) => {
        const prompt = this.buildGeneralPrompt(request, context);
        return await apiClient.generateResponse(prompt, config);
      }
    };
  }

  /**
   * Build a general prompt for AI assistance
   * @param {Object} request - User request
   * @param {Object} context - Document context
   * @returns {string} Formatted prompt
   */
  buildGeneralPrompt(request, context) {
    let prompt = `You are an AI assistant helping with Google Docs content. `;
    
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
   * Get list of available tools
   * @returns {Array} List of tool information
   */
  getAvailableTools() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }
}

// Export for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentController;
} else if (typeof window !== 'undefined') {
  window.AgentController = AgentController;
}
