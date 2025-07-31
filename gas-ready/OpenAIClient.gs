/**
 * OpenAIClient - Integration with OpenAI GPT-4 API
 * Handles API communication, error handling, and response processing
 */

class OpenAIClient {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'gpt-4',
      baseURL: config.baseURL || 'https://api.openai.com/v1',
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
      timeout: config.timeout || 30000,
      ...config
    };
    
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    if (!this.config.apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format');
    }
  }

  /**
   * Generate AI response for given prompt
   * @param {string} prompt - Input prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated response
   */
  async generateResponse(prompt, options = {}) {
    try {
      const requestConfig = {
        ...this.config,
        ...options
      };
      
      const response = await this.makeAPIRequest('/chat/completions', {
        model: requestConfig.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: requestConfig.maxTokens,
        temperature: requestConfig.temperature,
        top_p: requestConfig.topP || 1,
        frequency_penalty: requestConfig.frequencyPenalty || 0,
        presence_penalty: requestConfig.presencePenalty || 0
      });
      
      return this.extractResponseText(response);
      
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Generate response with conversation history
   * @param {Array} messages - Conversation messages
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated response
   */
  async generateResponseWithHistory(messages, options = {}) {
    try {
      const requestConfig = {
        ...this.config,
        ...options
      };
      
      const response = await this.makeAPIRequest('/chat/completions', {
        model: requestConfig.model,
        messages: messages,
        max_tokens: requestConfig.maxTokens,
        temperature: requestConfig.temperature,
        top_p: requestConfig.topP || 1,
        frequency_penalty: requestConfig.frequencyPenalty || 0,
        presence_penalty: requestConfig.presencePenalty || 0
      });
      
      return this.extractResponseText(response);
      
    } catch (error) {
      console.error('Error generating response with history:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Make HTTP request to OpenAI API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} API response
   */
  async makeAPIRequest(endpoint, data) {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(data)
    };

    try {
      // Use Google Apps Script UrlFetchApp
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode !== 200) {
        throw new Error(`HTTP ${responseCode}: ${responseText}`);
      }
      
      return JSON.parse(responseText);
      
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Extract text from OpenAI response
   * @param {Object} response - API response
   * @returns {string} Response text
   */
  extractResponseText(response) {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response choices received from OpenAI');
    }
    
    const choice = response.choices[0];
    
    if (choice.message && choice.message.content) {
      return choice.message.content.trim();
    }
    
    if (choice.text) {
      return choice.text.trim();
    }
    
    throw new Error('Unable to extract text from OpenAI response');
  }

  /**
   * Estimate token count for text
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokenCount(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if request would exceed token limits
   * @param {string} prompt - Input prompt
   * @param {Object} options - Request options
   * @returns {boolean} Whether request is within limits
   */
  isWithinTokenLimits(prompt, options = {}) {
    const maxTokens = options.maxTokens || this.config.maxTokens;
    const estimatedInputTokens = this.estimateTokenCount(prompt);
    const totalEstimated = estimatedInputTokens + maxTokens;
    
    // GPT-4 has different context limits
    const contextLimit = this.config.model.includes('gpt-4') ? 8192 : 4096;
    
    return totalEstimated <= contextLimit;
  }

  /**
   * Truncate prompt to fit within token limits
   * @param {string} prompt - Input prompt
   * @param {Object} options - Truncation options
   * @returns {string} Truncated prompt
   */
  truncatePrompt(prompt, options = {}) {
    const maxTokens = options.maxTokens || this.config.maxTokens;
    const reservedTokens = options.reservedTokens || 500; // Reserve for response
    const contextLimit = this.config.model.includes('gpt-4') ? 8192 : 4096;
    
    const maxInputTokens = contextLimit - maxTokens - reservedTokens;
    const maxInputChars = maxInputTokens * 4; // Rough estimation
    
    if (prompt.length <= maxInputChars) {
      return prompt;
    }
    
    return prompt.substring(0, maxInputChars) + '...';
  }

  /**
   * Get available models
   * @returns {Array} Available model names
   */
  getAvailableModels() {
    return [
      'gpt-4',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ];
  }

  /**
   * Update API key
   * @param {string} apiKey - New API key
   */
  updateApiKey(apiKey) {
    this.config.apiKey = apiKey;
    this.validateConfig();
  }

  /**
   * Update model
   * @param {string} model - Model name
   */
  updateModel(model) {
    const availableModels = this.getAvailableModels();
    if (!availableModels.includes(model)) {
      throw new Error(`Model ${model} is not available`);
    }
    this.config.model = model;
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.validateConfig();
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection test result
   */
  async testConnection() {
    try {
      const response = await this.generateResponse('Hello', { maxTokens: 10 });
      return !!response;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get configuration (without sensitive data)
   * @returns {Object} Safe configuration
   */
  getConfig() {
    const { apiKey, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      apiKeySet: !!apiKey
    };
  }
}
