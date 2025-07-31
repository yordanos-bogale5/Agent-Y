/**
 * ExplainTool - AI-powered text explanation and clarification tool
 * Part of Agent Y's modular tool architecture
 */

class ExplainTool {
  constructor(config = {}) {
    this.name = 'explain';
    this.description = 'Explain and clarify selected text or concepts';
    this.config = {
      explanationStyle: config.explanationStyle || 'clear',
      includeExamples: config.includeExamples !== false,
      ...config
    };
    
    this.parameters = {
      text: {
        type: 'string',
        description: 'Text to explain',
        required: true
      },
      style: {
        type: 'string',
        description: 'Explanation style (simple, detailed, technical, academic)',
        default: 'clear'
      },
      audience: {
        type: 'string',
        description: 'Target audience (general, expert, beginner)',
        default: 'general'
      }
    };
  }

  /**
   * Execute the explanation tool
   * @param {Object} params - Execution parameters
   * @returns {Promise<Object>} Explanation result
   */
  async execute({ request, context, apiClient, config }) {
    try {
      // Get text to explain
      const textToExplain = this.getTextToExplain(request, context);
      
      if (!textToExplain || textToExplain.trim().length === 0) {
        return {
          success: false,
          error: 'No text available to explain. Please select text in the document.'
        };
      }

      // Parse explanation preferences
      const preferences = this.parseExplanationPreferences(request);
      
      // Build explanation prompt
      const prompt = this.buildExplanationPrompt(textToExplain, preferences);
      
      // Generate explanation using AI
      const explanation = await apiClient.generateResponse(prompt, config);
      
      // Process and format the result
      const result = this.formatExplanationResult(explanation, textToExplain, preferences);
      
      return {
        success: true,
        result,
        metadata: {
          originalLength: textToExplain.length,
          explanationLength: result.explanation.length,
          style: preferences.style,
          audience: preferences.audience,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error in ExplainTool:', error);
      return {
        success: false,
        error: `Explanation failed: ${error.message}`
      };
    }
  }

  /**
   * Get text to explain from context and request
   * @param {Object} request - User request
   * @param {Object} context - Document context
   * @returns {string} Text to explain
   */
  getTextToExplain(request, context) {
    // Check if user provided specific text or concept
    const conceptMatch = request.parameters?.match(/explain\s+"([^"]+)"/i);
    if (conceptMatch) {
      return conceptMatch[1];
    }
    
    // Check for "what is" or "what does" patterns
    const whatMatch = request.parameters?.match(/what\s+(?:is|does|are)\s+(.+?)(?:\?|$)/i);
    if (whatMatch) {
      return whatMatch[1].trim();
    }
    
    // Use selected text if available
    if (context.selection && context.selection.trim().length > 0) {
      return context.selection;
    }
    
    // Extract key terms from the request
    const keyTerms = this.extractKeyTerms(request.parameters || '');
    if (keyTerms.length > 0) {
      return keyTerms.join(' ');
    }
    
    return '';
  }

  /**
   * Parse explanation preferences from user request
   * @param {Object} request - User request
   * @returns {Object} Parsed preferences
   */
  parseExplanationPreferences(request) {
    const params = request.parameters?.toLowerCase() || '';
    
    return {
      style: this.extractStyle(params),
      audience: this.extractAudience(params),
      includeExamples: this.shouldIncludeExamples(params),
      depth: this.extractDepth(params)
    };
  }

  /**
   * Extract explanation style from parameters
   * @param {string} params - Request parameters
   * @returns {string} Explanation style
   */
  extractStyle(params) {
    const styles = {
      simple: ['simple', 'easy', 'basic', 'plain'],
      detailed: ['detailed', 'comprehensive', 'thorough', 'in-depth'],
      technical: ['technical', 'precise', 'scientific', 'formal'],
      academic: ['academic', 'scholarly', 'research-based'],
      conversational: ['conversational', 'casual', 'friendly']
    };
    
    for (const [style, keywords] of Object.entries(styles)) {
      if (keywords.some(keyword => params.includes(keyword))) {
        return style;
      }
    }
    
    return 'clear';
  }

  /**
   * Extract target audience from parameters
   * @param {string} params - Request parameters
   * @returns {string} Target audience
   */
  extractAudience(params) {
    if (params.includes('beginner') || params.includes('novice') || params.includes('new to')) {
      return 'beginner';
    }
    if (params.includes('expert') || params.includes('advanced') || params.includes('professional')) {
      return 'expert';
    }
    if (params.includes('child') || params.includes('kid') || params.includes('5 year old')) {
      return 'child';
    }
    
    return 'general';
  }

  /**
   * Determine if examples should be included
   * @param {string} params - Request parameters
   * @returns {boolean} Whether to include examples
   */
  shouldIncludeExamples(params) {
    if (params.includes('no examples') || params.includes('without examples')) {
      return false;
    }
    if (params.includes('with examples') || params.includes('give examples')) {
      return true;
    }
    
    return this.config.includeExamples;
  }

  /**
   * Extract explanation depth preference
   * @param {string} params - Request parameters
   * @returns {string} Explanation depth
   */
  extractDepth(params) {
    if (params.includes('brief') || params.includes('quick') || params.includes('short')) {
      return 'brief';
    }
    if (params.includes('detailed') || params.includes('comprehensive') || params.includes('thorough')) {
      return 'detailed';
    }
    
    return 'moderate';
  }

  /**
   * Extract key terms from text
   * @param {string} text - Text to analyze
   * @returns {Array} Key terms
   */
  extractKeyTerms(text) {
    // Simple keyword extraction - could be enhanced with NLP
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
    
    return words
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Limit to 5 key terms
  }

  /**
   * Build AI prompt for explanation
   * @param {string} text - Text to explain
   * @param {Object} preferences - Explanation preferences
   * @returns {string} Formatted prompt
   */
  buildExplanationPrompt(text, preferences) {
    let prompt = `You are an expert educator and communicator. Please explain the following text or concept clearly and accurately.\n\n`;
    
    // Add style instructions
    prompt += `Style: ${this.getStyleDescription(preferences.style)}\n`;
    prompt += `Audience: ${this.getAudienceDescription(preferences.audience)}\n`;
    prompt += `Depth: ${this.getDepthDescription(preferences.depth)}\n`;
    
    if (preferences.includeExamples) {
      prompt += `Please include relevant examples to illustrate your explanation.\n`;
    }
    
    prompt += `\nText/concept to explain:\n"${text}"\n\n`;
    
    // Add specific instructions based on text type
    if (this.isCodeSnippet(text)) {
      prompt += `This appears to be code. Please explain what it does, how it works, and any important concepts.\n`;
    } else if (this.isTechnicalTerm(text)) {
      prompt += `This appears to be a technical term. Please provide a clear definition and context.\n`;
    } else if (this.isComplexSentence(text)) {
      prompt += `This appears to be complex text. Please break it down and clarify the meaning.\n`;
    }
    
    prompt += `Please provide your explanation now:`;
    
    return prompt;
  }

  /**
   * Get description for explanation style
   * @param {string} style - Style identifier
   * @returns {string} Style description
   */
  getStyleDescription(style) {
    const descriptions = {
      simple: 'Use simple, everyday language that anyone can understand',
      detailed: 'Provide comprehensive coverage with thorough explanations',
      technical: 'Use precise, technical language appropriate for experts',
      academic: 'Use scholarly language suitable for academic contexts',
      conversational: 'Use a friendly, conversational tone as if talking to a friend',
      clear: 'Use clear, straightforward language that is easy to follow'
    };
    
    return descriptions[style] || descriptions.clear;
  }

  /**
   * Get description for target audience
   * @param {string} audience - Audience identifier
   * @returns {string} Audience description
   */
  getAudienceDescription(audience) {
    const descriptions = {
      beginner: 'Assume no prior knowledge and explain basic concepts',
      expert: 'Assume advanced knowledge and focus on nuanced details',
      child: 'Use very simple language appropriate for children',
      general: 'Assume general education level and moderate familiarity'
    };
    
    return descriptions[audience] || descriptions.general;
  }

  /**
   * Get description for explanation depth
   * @param {string} depth - Depth identifier
   * @returns {string} Depth description
   */
  getDepthDescription(depth) {
    const descriptions = {
      brief: 'Keep the explanation concise and to the point',
      detailed: 'Provide comprehensive coverage with multiple aspects',
      moderate: 'Provide adequate detail without being overwhelming'
    };
    
    return descriptions[depth] || descriptions.moderate;
  }

  /**
   * Check if text appears to be a code snippet
   * @param {string} text - Text to check
   * @returns {boolean} Whether text appears to be code
   */
  isCodeSnippet(text) {
    const codeIndicators = ['{', '}', '()', '=>', 'function', 'class', 'def ', 'var ', 'let ', 'const ', 'import ', '#include', 'public ', 'private '];
    return codeIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Check if text appears to be a technical term
   * @param {string} text - Text to check
   * @returns {boolean} Whether text appears to be technical
   */
  isTechnicalTerm(text) {
    // Simple heuristic: short text with technical-sounding words
    return text.length < 50 && /[A-Z]{2,}|[a-z]+[A-Z][a-z]+/.test(text);
  }

  /**
   * Check if text is a complex sentence
   * @param {string} text - Text to check
   * @returns {boolean} Whether text is complex
   */
  isComplexSentence(text) {
    const complexIndicators = [';', ':', 'however', 'therefore', 'furthermore', 'nevertheless', 'consequently'];
    return text.length > 100 && complexIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Format the explanation result for display
   * @param {string} explanation - AI-generated explanation
   * @param {string} originalText - Original text
   * @param {Object} preferences - Explanation preferences
   * @returns {Object} Formatted result
   */
  formatExplanationResult(explanation, originalText, preferences) {
    const cleanExplanation = explanation.trim();
    
    return {
      originalText,
      explanation: cleanExplanation,
      preferences,
      metadata: {
        originalWordCount: this.getWordCount(originalText),
        explanationWordCount: this.getWordCount(cleanExplanation),
        readingTime: this.estimateReadingTime(cleanExplanation)
      },
      action: 'explain',
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
   * Estimate reading time for text
   * @param {string} text - Text to estimate
   * @returns {string} Reading time estimate
   */
  estimateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.getWordCount(text);
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    if (minutes < 1) return 'Less than 1 minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  }

  /**
   * Get tool usage examples
   * @returns {Array} Array of usage examples
   */
  getUsageExamples() {
    return [
      {
        description: 'Explain selected technical term',
        command: 'Explain this term',
        context: 'User has selected a technical term or jargon'
      },
      {
        description: 'Explain complex sentence',
        command: 'What does this mean?',
        context: 'User has selected a complex or unclear sentence'
      },
      {
        description: 'Simple explanation for beginners',
        command: 'Explain this simply',
        context: 'User wants a basic explanation'
      },
      {
        description: 'Detailed technical explanation',
        command: 'Explain this in detail',
        context: 'User wants comprehensive technical explanation'
      }
    ];
  }
}

// Export for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExplainTool;
} else if (typeof window !== 'undefined') {
  window.ExplainTool = ExplainTool;
}
