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
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'User-Agent': 'GoogleDocsAIAgent/1.0'
      },
      payload: JSON.stringify(data),
      muteHttpExceptions: true
    };
    
    try {
      // Use Google Apps Script's UrlFetchApp
      const response = UrlFetchApp.fetch(url, requestOptions);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode !== 200) {
        throw new Error(`HTTP ${responseCode}: ${responseText}`);
      }
      
      const responseData = JSON.parse(responseText);
      
      if (responseData.error) {
        throw new Error(responseData.error.message || 'Unknown API error');
      }
      
      return responseData;
      
    } catch (error) {
      if (error.message.includes('timeout')) {
        throw new Error('Request timeout - please try again');
      }
      
      throw error;
    }
  }

  /**
   * Extract text from OpenAI API response
   * @param {Object} response - API response
   * @returns {string} Response text
   */
  extractResponseText(response) {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response choices received from API');
    }
    
    const choice = response.choices[0];
    
    if (!choice.message || !choice.message.content) {
      throw new Error('Invalid response format from API');
    }
    
    return choice.message.content.trim();
  }

  /**
   * Estimate token count for text (approximate)
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokenCount(text) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if text exceeds token limit
   * @param {string} text - Text to check
   * @param {number} maxTokens - Maximum tokens allowed
   * @returns {boolean} Whether text exceeds limit
   */
  exceedsTokenLimit(text, maxTokens = null) {
    const limit = maxTokens || this.config.maxTokens;
    const estimatedTokens = this.estimateTokenCount(text);
    return estimatedTokens > limit;
  }

  /**
   * Truncate text to fit within token limit
   * @param {string} text - Text to truncate
   * @param {number} maxTokens - Maximum tokens allowed
   * @returns {string} Truncated text
   */
  truncateToTokenLimit(text, maxTokens = null) {
    const limit = maxTokens || this.config.maxTokens;
    
    if (!this.exceedsTokenLimit(text, limit)) {
      return text;
    }
    
    // Rough truncation based on character count
    const maxChars = limit * 4;
    const truncated = text.substring(0, maxChars - 100); // Leave some buffer
    
    return truncated + '... [truncated]';
  }

  /**
   * Get available models
   * @returns {Promise<Array>} List of available models
   */
  async getAvailableModels() {
    try {
      const response = await this.makeAPIRequest('/models', {});
      
      return response.data
        .filter(model => model.id.includes('gpt'))
        .map(model => ({
          id: model.id,
          name: model.id,
          description: `OpenAI ${model.id}`
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
        
    } catch (error) {
      console.error('Error fetching models:', error);
      return [
        { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'OpenAI GPT-3.5 Turbo' }
      ];
    }
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection() {
    try {
      const testPrompt = 'Hello, please respond with "Connection successful"';
      const response = await this.generateResponse(testPrompt, { maxTokens: 50 });
      
      return {
        success: true,
        message: 'API connection successful',
        response: response.substring(0, 100)
      };
      
    } catch (error) {
      return {
        success: false,
        message: `API connection failed: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Get usage statistics (if available)
   * @returns {Promise<Object>} Usage statistics
   */
  async getUsageStats() {
    // Note: OpenAI doesn't provide usage stats through the API
    // This would need to be tracked separately
    return {
      tokensUsed: 0,
      requestsCount: 0,
      estimatedCost: 0,
      message: 'Usage tracking not available through OpenAI API'
    };
  }

  /**
   * Format conversation messages for OpenAI API
   * @param {Array} history - Conversation history
   * @returns {Array} Formatted messages
   */
  formatConversationHistory(history) {
    const messages = [];
    
    // Add system message if needed
    if (this.config.systemMessage) {
      messages.push({
        role: 'system',
        content: this.config.systemMessage
      });
    }
    
    // Add conversation history
    history.forEach(item => {
      if (item.role && item.content) {
        messages.push({
          role: item.role,
          content: item.content
        });
      }
    });
    
    return messages;
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration options
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    this.validateConfig();
  }

  /**
   * Get current configuration (without sensitive data)
   * @returns {Object} Configuration object
   */
  getConfig() {
    const { apiKey, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      apiKeySet: !!apiKey
    };
  }
}

// Export for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OpenAIClient;
} else if (typeof window !== 'undefined') {
  window.OpenAIClient = OpenAIClient;
}
