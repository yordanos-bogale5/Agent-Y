/**
 * SummarizeTool - AI-powered text summarization tool
 * Part of Agent Y's modular tool architecture
 */

class SummarizeTool {
  constructor(config = {}) {
    this.name = 'summarize';
    this.description = 'Summarize selected text or entire document with AI';
    this.config = {
      maxLength: config.maxLength || 500,
      style: config.style || 'concise', // concise, detailed, bullet-points
      ...config
    };
    
    this.parameters = {
      text: {
        type: 'string',
        description: 'Text to summarize',
        required: true
      },
      length: {
        type: 'string',
        description: 'Summary length (short, medium, long)',
        default: 'medium'
      },
      style: {
        type: 'string',
        description: 'Summary style (concise, detailed, bullet-points)',
        default: 'concise'
      }
    };
  }

  /**
   * Execute the summarization tool
   * @param {Object} params - Execution parameters
   * @returns {Promise<Object>} Summarization result
   */
  async execute({ request, context, apiClient, config }) {
    try {
      // Determine what to summarize
      const textToSummarize = this.getTextToSummarize(request, context);
      
      if (!textToSummarize || textToSummarize.trim().length === 0) {
        return {
          success: false,
          error: 'No text available to summarize. Please select text or ensure document has content.'
        };
      }

      // Build summarization prompt
      const prompt = this.buildSummarizationPrompt(textToSummarize, request);
      
      // Generate summary using AI
      const summary = await apiClient.generateResponse(prompt, {
        ...config,
        maxTokens: this.getMaxTokensForLength(request.parameters)
      });
      
      // Process and format the result
      const result = this.formatSummaryResult(summary, textToSummarize);
      
      return {
        success: true,
        result,
        metadata: {
          originalLength: textToSummarize.length,
          summaryLength: result.summary.length,
          compressionRatio: (result.summary.length / textToSummarize.length).toFixed(2),
          style: this.extractStyle(request.parameters),
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error in SummarizeTool:', error);
      return {
        success: false,
        error: `Summarization failed: ${error.message}`
      };
    }
  }

  /**
   * Determine what text to summarize based on context and request
   * @param {Object} request - User request
   * @param {Object} context - Document context
   * @returns {string} Text to summarize
   */
  getTextToSummarize(request, context) {
    // If user provided specific text in the request
    if (request.parameters && request.parameters.includes('summarize:')) {
      const textMatch = request.parameters.match(/summarize:\s*"([^"]+)"/);
      if (textMatch) {
        return textMatch[1];
      }
    }
    
    // Use selected text if available
    if (context.selection && context.selection.trim().length > 0) {
      return context.selection;
    }
    
    // Fall back to full document content
    return context.content;
  }

  /**
   * Build AI prompt for summarization
   * @param {string} text - Text to summarize
   * @param {Object} request - User request
   * @returns {string} Formatted prompt
   */
  buildSummarizationPrompt(text, request) {
    const style = this.extractStyle(request.parameters);
    const length = this.extractLength(request.parameters);
    
    let prompt = `You are an expert at creating clear, accurate summaries. `;
    
    // Add style-specific instructions
    switch (style) {
      case 'bullet-points':
        prompt += `Create a bullet-point summary that captures the key points. `;
        break;
      case 'detailed':
        prompt += `Create a comprehensive summary that covers all important details. `;
        break;
      case 'concise':
      default:
        prompt += `Create a concise summary that captures the main ideas. `;
        break;
    }
    
    // Add length instructions
    switch (length) {
      case 'short':
        prompt += `Keep it brief - 1-2 sentences maximum. `;
        break;
      case 'long':
        prompt += `Provide a thorough summary with multiple paragraphs if needed. `;
        break;
      case 'medium':
      default:
        prompt += `Aim for a moderate length - 3-5 sentences. `;
        break;
    }
    
    prompt += `\n\nText to summarize:\n"${text}"\n\n`;
    prompt += `Please provide the summary now:`;
    
    return prompt;
  }

  /**
   * Extract style preference from request parameters
   * @param {string} parameters - Request parameters
   * @returns {string} Style preference
   */
  extractStyle(parameters) {
    if (!parameters) return 'concise';
    
    const lowerParams = parameters.toLowerCase();
    
    if (lowerParams.includes('bullet') || lowerParams.includes('points') || lowerParams.includes('list')) {
      return 'bullet-points';
    }
    if (lowerParams.includes('detailed') || lowerParams.includes('comprehensive') || lowerParams.includes('thorough')) {
      return 'detailed';
    }
    
    return 'concise';
  }

  /**
   * Extract length preference from request parameters
   * @param {string} parameters - Request parameters
   * @returns {string} Length preference
   */
  extractLength(parameters) {
    if (!parameters) return 'medium';
    
    const lowerParams = parameters.toLowerCase();
    
    if (lowerParams.includes('short') || lowerParams.includes('brief') || lowerParams.includes('quick')) {
      return 'short';
    }
    if (lowerParams.includes('long') || lowerParams.includes('detailed') || lowerParams.includes('extensive')) {
      return 'long';
    }
    
    return 'medium';
  }

  /**
   * Get maximum tokens based on requested length
   * @param {string} parameters - Request parameters
   * @returns {number} Max tokens
   */
  getMaxTokensForLength(parameters) {
    const length = this.extractLength(parameters);
    
    switch (length) {
      case 'short': return 100;
      case 'long': return 800;
      case 'medium':
      default: return 300;
    }
  }

  /**
   * Format the summary result for display
   * @param {string} summary - AI-generated summary
   * @param {string} originalText - Original text
   * @returns {Object} Formatted result
   */
  formatSummaryResult(summary, originalText) {
    // Clean up the summary
    const cleanSummary = summary.trim();
    
    // Calculate statistics
    const originalWordCount = this.getWordCount(originalText);
    const summaryWordCount = this.getWordCount(cleanSummary);
    
    return {
      summary: cleanSummary,
      statistics: {
        originalWords: originalWordCount,
        summaryWords: summaryWordCount,
        compressionRatio: originalWordCount > 0 ? (summaryWordCount / originalWordCount).toFixed(2) : 0,
        originalCharacters: originalText.length,
        summaryCharacters: cleanSummary.length
      },
      action: 'summarize',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} Word count
   */
  getWordCount(text) {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Validate input parameters
   * @param {Object} params - Parameters to validate
   * @returns {Object} Validation result
   */
  validateParameters(params) {
    const errors = [];
    
    if (!params.text || params.text.trim().length === 0) {
      errors.push('Text to summarize is required');
    }
    
    if (params.text && params.text.length > 50000) {
      errors.push('Text is too long for summarization (max 50,000 characters)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get tool usage examples
   * @returns {Array} Array of usage examples
   */
  getUsageExamples() {
    return [
      {
        description: 'Summarize selected text',
        command: 'Summarize this text',
        context: 'User has selected text in the document'
      },
      {
        description: 'Create bullet-point summary',
        command: 'Create a bullet-point summary',
        context: 'User wants a structured summary'
      },
      {
        description: 'Brief summary',
        command: 'Give me a short summary',
        context: 'User wants a concise overview'
      },
      {
        description: 'Detailed summary',
        command: 'Provide a detailed summary',
        context: 'User wants comprehensive coverage'
      }
    ];
  }
}

// Export for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SummarizeTool;
} else if (typeof window !== 'undefined') {
  window.SummarizeTool = SummarizeTool;
}
