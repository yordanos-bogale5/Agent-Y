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
    
    // Fall back to document content
    if (context.content && context.content.trim().length > 0) {
      return context.content;
    }
    
    return '';
  }

  /**
   * Build AI prompt for summarization
   * @param {string} text - Text to summarize
   * @param {Object} request - User request
   * @returns {string} AI prompt
   */
  buildSummarizationPrompt(text, request) {
    const style = this.extractStyle(request.parameters);
    const length = this.extractLength(request.parameters);
    
    let prompt = `Please summarize the following text:\n\n${text}\n\n`;
    
    // Add style instructions
    switch (style) {
      case 'bullet-points':
        prompt += 'Format the summary as clear bullet points highlighting the main ideas.';
        break;
      case 'detailed':
        prompt += 'Provide a detailed summary that captures all important points and context.';
        break;
      case 'concise':
      default:
        prompt += 'Provide a concise summary focusing on the most important points.';
        break;
    }
    
    // Add length instructions
    switch (length) {
      case 'short':
        prompt += ' Keep it brief (1-2 sentences).';
        break;
      case 'long':
        prompt += ' Provide a comprehensive summary (multiple paragraphs if needed).';
        break;
      case 'medium':
      default:
        prompt += ' Aim for a moderate length (2-4 sentences).';
        break;
    }
    
    return prompt;
  }

  /**
   * Format the summary result
   * @param {string} summary - AI-generated summary
   * @param {string} originalText - Original text
   * @returns {Object} Formatted result
   */
  formatSummaryResult(summary, originalText) {
    return {
      summary: summary.trim(),
      originalText: originalText,
      wordCount: {
        original: this.getWordCount(originalText),
        summary: this.getWordCount(summary)
      },
      readingTime: {
        original: this.estimateReadingTime(originalText),
        summary: this.estimateReadingTime(summary)
      }
    };
  }

  /**
   * Extract style parameter from request
   * @param {string} parameters - Request parameters
   * @returns {string} Style
   */
  extractStyle(parameters) {
    if (!parameters) return 'concise';
    
    if (parameters.includes('bullet') || parameters.includes('points')) {
      return 'bullet-points';
    }
    if (parameters.includes('detailed') || parameters.includes('comprehensive')) {
      return 'detailed';
    }
    return 'concise';
  }

  /**
   * Extract length parameter from request
   * @param {string} parameters - Request parameters
   * @returns {string} Length
   */
  extractLength(parameters) {
    if (!parameters) return 'medium';
    
    if (parameters.includes('short') || parameters.includes('brief')) {
      return 'short';
    }
    if (parameters.includes('long') || parameters.includes('comprehensive')) {
      return 'long';
    }
    return 'medium';
  }

  /**
   * Get maximum tokens based on length parameter
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
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} Word count
   */
  getWordCount(text) {
    if (!text || typeof text !== 'string') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate reading time in minutes
   * @param {string} text - Text to estimate
   * @returns {number} Reading time in minutes
   */
  estimateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.getWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Get tool capabilities
   * @returns {Array} Tool capabilities
   */
  getCapabilities() {
    return [
      'Text summarization',
      'Multiple summary styles (concise, detailed, bullet-points)',
      'Adjustable summary length',
      'Word count and reading time analysis',
      'Context-aware summarization'
    ];
  }
}
