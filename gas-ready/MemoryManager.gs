/**
 * MemoryManager - Handles conversation history and session state
 * Powered by Agent Y's memory and state management architecture
 */

class MemoryManager {
  constructor(config = {}) {
    this.config = {
      maxHistoryItems: config.maxHistoryItems || 50,
      maxHistoryAge: config.maxHistoryAge || 24 * 60 * 60 * 1000, // 24 hours
      persistToStorage: config.persistToStorage !== false,
      storageKey: config.storageKey || 'ai_agent_memory',
      ...config
    };
    
    this.conversationHistory = [];
    this.sessionData = {};
    this.documentContext = {};
    
    this.loadFromStorage();
  }

  /**
   * Store an interaction in conversation history
   * @param {string} userInput - User's input
   * @param {Object} aiResponse - AI's response
   * @param {Object} context - Document context at time of interaction
   */
  async storeInteraction(userInput, aiResponse, context = {}) {
    const interaction = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      userInput,
      aiResponse,
      context: {
        selection: context.selection || '',
        documentId: context.metadata?.id || '',
        documentName: context.metadata?.name || ''
      },
      metadata: {
        tool: aiResponse.tool || 'unknown',
        success: aiResponse.success || false,
        processingTime: aiResponse.processingTime || 0
      }
    };
    
    this.conversationHistory.unshift(interaction);
    
    // Trim history if it exceeds limits
    this.trimHistory();
    
    // Persist to storage
    if (this.config.persistToStorage) {
      await this.saveToStorage();
    }
    
    return interaction;
  }

  /**
   * Get conversation history
   * @param {Object} options - Filtering options
   * @returns {Array} Conversation history
   */
  getConversationHistory(options = {}) {
    let history = [...this.conversationHistory];
    
    // Filter by document if specified
    if (options.documentId) {
      history = history.filter(item => 
        item.context.documentId === options.documentId
      );
    }
    
    // Filter by time range
    if (options.since) {
      const sinceDate = new Date(options.since);
      history = history.filter(item => 
        new Date(item.timestamp) >= sinceDate
      );
    }
    
    // Filter by tool/command
    if (options.tool) {
      history = history.filter(item => 
        item.metadata.tool === options.tool
      );
    }
    
    // Limit results
    if (options.limit) {
      history = history.slice(0, options.limit);
    }
    
    return history;
  }

  /**
   * Get recent interactions for context
   * @param {number} count - Number of recent interactions
   * @returns {Array} Recent interactions
   */
  getRecentInteractions(count = 5) {
    return this.conversationHistory.slice(0, count);
  }

  /**
   * Get conversation context for AI prompts
   * @param {Object} options - Context options
   * @returns {string} Formatted conversation context
   */
  getConversationContext(options = {}) {
    const recentCount = options.recentCount || 3;
    const recent = this.getRecentInteractions(recentCount);
    
    if (recent.length === 0) {
      return '';
    }
    
    let context = 'Recent conversation history:\n';
    
    recent.reverse().forEach((interaction, index) => {
      context += `\n${index + 1}. User: ${interaction.userInput}\n`;
      context += `   AI: ${this.summarizeResponse(interaction.aiResponse)}\n`;
    });
    
    return context;
  }

  /**
   * Store session data
   * @param {string} key - Data key
   * @param {*} value - Data value
   */
  setSessionData(key, value) {
    this.sessionData[key] = {
      value,
      timestamp: new Date().toISOString()
    };
    
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Get session data
   * @param {string} key - Data key
   * @returns {*} Data value
   */
  getSessionData(key) {
    const data = this.sessionData[key];
    return data ? data.value : null;
  }

  /**
   * Store document context
   * @param {string} documentId - Document ID
   * @param {Object} context - Document context
   */
  setDocumentContext(documentId, context) {
    this.documentContext[documentId] = {
      ...context,
      lastUpdated: new Date().toISOString()
    };
    
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Get document context
   * @param {string} documentId - Document ID
   * @returns {Object} Document context
   */
  getDocumentContext(documentId) {
    return this.documentContext[documentId] || null;
  }

  /**
   * Search conversation history
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Search results
   */
  searchHistory(query, options = {}) {
    const lowerQuery = query.toLowerCase();
    
    return this.conversationHistory.filter(interaction => {
      const userInput = interaction.userInput.toLowerCase();
      const aiResponse = this.summarizeResponse(interaction.aiResponse).toLowerCase();
      
      return userInput.includes(lowerQuery) || aiResponse.includes(lowerQuery);
    }).slice(0, options.limit || 10);
  }

  /**
   * Get usage statistics
   * @returns {Object} Usage statistics
   */
  getUsageStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayInteractions = this.conversationHistory.filter(item =>
      new Date(item.timestamp) >= today
    );
    
    const weekInteractions = this.conversationHistory.filter(item =>
      new Date(item.timestamp) >= thisWeek
    );
    
    const toolUsage = {};
    this.conversationHistory.forEach(item => {
      const tool = item.metadata.tool;
      toolUsage[tool] = (toolUsage[tool] || 0) + 1;
    });
    
    return {
      totalInteractions: this.conversationHistory.length,
      todayInteractions: todayInteractions.length,
      weekInteractions: weekInteractions.length,
      toolUsage,
      documentsUsed: new Set(
        this.conversationHistory.map(item => item.context.documentId)
      ).size,
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  /**
   * Clear conversation history
   * @param {Object} options - Clear options
   */
  clearHistory(options = {}) {
    if (options.olderThan) {
      const cutoffDate = new Date(options.olderThan);
      this.conversationHistory = this.conversationHistory.filter(item =>
        new Date(item.timestamp) >= cutoffDate
      );
    } else if (options.documentId) {
      this.conversationHistory = this.conversationHistory.filter(item =>
        item.context.documentId !== options.documentId
      );
    } else {
      this.conversationHistory = [];
    }
    
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Export conversation history
   * @param {Object} options - Export options
   * @returns {Object} Exported data
   */
  exportHistory(options = {}) {
    const history = this.getConversationHistory(options);
    
    return {
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalInteractions: history.length,
      interactions: history,
      metadata: {
        config: this.config,
        stats: this.getUsageStats()
      }
    };
  }

  /**
   * Import conversation history
   * @param {Object} data - Imported data
   * @param {Object} options - Import options
   */
  importHistory(data, options = {}) {
    if (!data.interactions || !Array.isArray(data.interactions)) {
      throw new Error('Invalid import data format');
    }
    
    if (options.replace) {
      this.conversationHistory = [];
    }
    
    data.interactions.forEach(interaction => {
      // Validate interaction format
      if (interaction.userInput && interaction.aiResponse && interaction.timestamp) {
        this.conversationHistory.push(interaction);
      }
    });
    
    // Sort by timestamp (newest first)
    this.conversationHistory.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    this.trimHistory();
    
    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Trim history to stay within limits
   */
  trimHistory() {
    // Remove old items
    const cutoffDate = new Date(Date.now() - this.config.maxHistoryAge);
    this.conversationHistory = this.conversationHistory.filter(item =>
      new Date(item.timestamp) >= cutoffDate
    );

    // Limit number of items
    if (this.conversationHistory.length > this.config.maxHistoryItems) {
      this.conversationHistory = this.conversationHistory.slice(0, this.config.maxHistoryItems);
    }
  }

  /**
   * Summarize AI response for context
   * @param {Object} response - AI response
   * @returns {string} Summary
   */
  summarizeResponse(response) {
    if (typeof response === 'string') {
      return response.length > 100 ? response.substring(0, 100) + '...' : response;
    }

    if (response.result) {
      const result = response.result;
      if (typeof result === 'string') {
        return result.length > 100 ? result.substring(0, 100) + '...' : result;
      }
      if (result.summary) return result.summary;
      if (result.rewrittenText) return result.rewrittenText;
    }

    return 'AI response';
  }

  /**
   * Calculate average response time
   * @returns {number} Average response time in ms
   */
  calculateAverageResponseTime() {
    const times = this.conversationHistory
      .map(item => item.metadata.processingTime)
      .filter(time => time > 0);

    if (times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Save data to storage
   */
  async saveToStorage() {
    try {
      const data = {
        conversationHistory: this.conversationHistory,
        sessionData: this.sessionData,
        documentContext: this.documentContext,
        lastSaved: new Date().toISOString()
      };

      // Use Google Apps Script PropertiesService
      if (typeof PropertiesService !== 'undefined') {
        PropertiesService.getUserProperties()
          .setProperty(this.config.storageKey, JSON.stringify(data));
      }

    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Load data from storage
   */
  loadFromStorage() {
    try {
      // Use Google Apps Script PropertiesService
      if (typeof PropertiesService !== 'undefined') {
        const stored = PropertiesService.getUserProperties()
          .getProperty(this.config.storageKey);

        if (stored) {
          const data = JSON.parse(stored);
          this.conversationHistory = data.conversationHistory || [];
          this.sessionData = data.sessionData || {};
          this.documentContext = data.documentContext || {};

          // Clean up old data
          this.trimHistory();
        }
      }

    } catch (error) {
      console.error('Error loading from storage:', error);
      // Reset to empty state on error
      this.conversationHistory = [];
      this.sessionData = {};
      this.documentContext = {};
    }
  }
}
