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
   * @param {ContextManager} contextManager - Context manager instance
   */
  setContextManager(contextManager) {
    this.contextManager = contextManager;
  }

  /**
   * Set the memory manager for conversation history
   * @param {MemoryManager} memoryManager - Memory manager instance
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
   * Parse user command and determine appropriate tool
   * @param {string} command - User command/request
   * @returns {Object} Parsed command with tool and parameters
   */
  parseCommand(command) {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Command patterns for different tools
    const patterns = {
      summarize: [
        /summarize/i,
        /summary/i,
        /sum up/i,
        /brief/i,
        /overview/i
      ],
      rewrite: [
        /rewrite/i,
        /improve/i,
        /enhance/i,
        /better/i,
        /rephrase/i,
        /revise/i
      ],
      explain: [
        /explain/i,
        /clarify/i,
        /what does.*mean/i,
        /help me understand/i,
        /break down/i
      ],
      generate: [
        /generate/i,
        /create/i,
        /write/i,
        /compose/i,
        /draft/i
      ],
      translate: [
        /translate/i,
        /translation/i,
        /convert.*to/i
      ],
      format: [
        /format/i,
        /structure/i,
        /organize/i,
        /layout/i
      ]
    };

    // Find matching tool
    for (const [toolName, toolPatterns] of Object.entries(patterns)) {
      for (const pattern of toolPatterns) {
        if (pattern.test(normalizedCommand)) {
          return {
            tool: toolName,
            originalCommand: command,
            confidence: 0.8
          };
        }
      }
    }

    // Default to generate if no specific pattern matches
    return {
      tool: 'generate',
      originalCommand: command,
      confidence: 0.5
    };
  }

  /**
   * Execute a command using the appropriate tool
   * @param {string} command - User command
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result
   */
  async executeCommand(command, options = {}) {
    try {
      // Parse the command to determine tool
      const parsedCommand = this.parseCommand(command);
      const toolName = parsedCommand.tool;

      // Get the tool
      const tool = this.tools.get(toolName);
      if (!tool) {
        throw new Error(`Tool '${toolName}' not found`);
      }

      // Prepare context if context manager is available
      let context = {};
      if (this.contextManager) {
        context = await this.contextManager.getCurrentContext();
      }

      // Prepare memory if memory manager is available
      let memory = {};
      if (this.memoryManager) {
        memory = await this.memoryManager.getRecentMemory();
      }

      // Prepare execution parameters
      const executionParams = {
        command: parsedCommand.originalCommand,
        context,
        memory,
        config: this.config,
        apiClient: this.apiClient,
        ...options
      };

      // Execute the tool
      const result = await tool.execute(executionParams);

      // Store interaction in memory if memory manager is available
      if (this.memoryManager) {
        await this.memoryManager.addInteraction({
          command: parsedCommand.originalCommand,
          tool: toolName,
          result: result.content || result.text || '',
          timestamp: new Date().toISOString()
        });
      }

      return {
        success: true,
        tool: toolName,
        result,
        parsedCommand
      };

    } catch (error) {
      console.error('AgentController execution error:', error);
      return {
        success: false,
        error: error.message,
        tool: null,
        result: null
      };
    }
  }

  /**
   * Get available tools and their descriptions
   * @returns {Array} List of available tools
   */
  getAvailableTools() {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }));
  }

  /**
   * Process a quick action (predefined command)
   * @param {string} action - Quick action name
   * @param {Object} options - Action options
   * @returns {Promise<Object>} Action result
   */
  async processQuickAction(action, options = {}) {
    const quickActions = {
      'summarize-selection': 'Summarize the selected text',
      'improve-writing': 'Improve and enhance the selected text',
      'explain-content': 'Explain the selected content in simple terms',
      'generate-content': 'Generate new content based on the context'
    };

    const command = quickActions[action];
    if (!command) {
      throw new Error(`Unknown quick action: ${action}`);
    }

    return await this.executeCommand(command, options);
  }

  /**
   * Get agent status and configuration
   * @returns {Object} Agent status
   */
  getStatus() {
    return {
      toolsRegistered: this.tools.size,
      availableTools: Array.from(this.tools.keys()),
      hasContextManager: !!this.contextManager,
      hasMemoryManager: !!this.memoryManager,
      hasApiClient: !!this.apiClient,
      config: this.config
    };
  }

  /**
   * Update agent configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }

  /**
   * Reset agent state
   */
  reset() {
    if (this.memoryManager) {
      this.memoryManager.clearMemory();
    }
    // Keep tools and configuration, just reset state
  }

  /**
   * Validate agent setup
   * @returns {Object} Validation result
   */
  validateSetup() {
    const issues = [];
    
    if (!this.apiClient) {
      issues.push('No API client configured');
    }
    
    if (this.tools.size === 0) {
      issues.push('No tools registered');
    }
    
    if (!this.contextManager) {
      issues.push('No context manager configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
