/**
 * GeminiClient - Integration with Google Gemini API
 * Handles API communication, error handling, and response processing
 */

class GeminiClient {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'gemini-1.5-flash',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
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
      throw new Error('Gemini API key is required');
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
      
      const response = await this.makeAPIRequest('/models/gemini-1.5-flash:generateContent', {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: requestConfig.temperature,
          maxOutputTokens: requestConfig.maxTokens
        }
      });
      
      return this.extractResponseText(response);
      
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Make HTTP request to Gemini API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} API response
   */
  async makeAPIRequest(endpoint, data) {
    const url = `${this.config.baseURL}${endpoint}?key=${this.config.apiKey}`;
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(data)
    };

    try {
      console.log('Making API request to:', url);
      console.log('Request payload:', JSON.stringify(data, null, 2));
      
      // Use Google Apps Script UrlFetchApp
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      console.log('Response code:', responseCode);
      console.log('Response text:', responseText);
      
      if (responseCode !== 200) {
        throw new Error(`HTTP ${responseCode}: ${responseText}`);
      }
      
      return JSON.parse(responseText);
      
    } catch (error) {
      console.error('API request failed:', error);
      console.error('URL:', url);
      console.error('Options:', options);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Extract text from Gemini response
   * @param {Object} response - API response
   * @returns {string} Response text
   */
  extractResponseText(response) {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error('No response candidates received from Gemini');
    }
    
    const candidate = response.candidates[0];
    
    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
      return candidate.content.parts[0].text.trim();
    }
    
    throw new Error('Unable to extract text from Gemini response');
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
    
    // Gemini Pro has a 30K token context limit
    const contextLimit = 30000;
    
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
    const contextLimit = 30000; // Gemini Pro limit
    
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
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
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
      // Simple test request
      const url = `${this.config.baseURL}/models/gemini-1.5-flash:generateContent?key=${this.config.apiKey}`;
      
      const testData = {
        contents: [{
          parts: [{
            text: "Hello"
          }]
        }]
      };
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(testData)
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const responseCode = response.getResponseCode();
      
      console.log('Test connection response code:', responseCode);
      console.log('Test connection response:', response.getContentText());
      
      return responseCode === 200;
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
