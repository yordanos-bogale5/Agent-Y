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
    
    return '';
  }

  /**
   * Parse explanation preferences from user request
   * @param {Object} request - User request
   * @returns {Object} Parsed preferences
   */
  parseExplanationPreferences(request) {
    const preferences = {
      style: 'clear',
      audience: 'general',
      includeExamples: true,
      depth: 'medium'
    };
    
    const params = request.parameters?.toLowerCase() || '';
    
    // Parse style
    if (params.includes('simple') || params.includes('basic')) preferences.style = 'simple';
    else if (params.includes('detailed') || params.includes('comprehensive')) preferences.style = 'detailed';
    else if (params.includes('technical')) preferences.style = 'technical';
    else if (params.includes('academic')) preferences.style = 'academic';
    
    // Parse audience
    if (params.includes('beginner') || params.includes('novice')) preferences.audience = 'beginner';
    else if (params.includes('expert') || params.includes('advanced')) preferences.audience = 'expert';
    else if (params.includes('child') || params.includes('kid')) preferences.audience = 'child';
    
    // Parse depth
    if (params.includes('brief') || params.includes('quick')) preferences.depth = 'brief';
    else if (params.includes('deep') || params.includes('thorough')) preferences.depth = 'deep';
    
    // Parse examples preference
    if (params.includes('no examples') || params.includes('without examples')) {
      preferences.includeExamples = false;
    }
    
    return preferences;
  }

  /**
   * Build AI prompt for explanation
   * @param {string} text - Text to explain
   * @param {Object} preferences - Explanation preferences
   * @returns {string} AI prompt
   */
  buildExplanationPrompt(text, preferences) {
    let prompt = `Please explain the following text or concept:\n\n"${text}"\n\n`;
    
    // Add style instructions
    switch (preferences.style) {
      case 'simple':
        prompt += 'Provide a simple, easy-to-understand explanation. ';
        break;
      case 'detailed':
        prompt += 'Provide a detailed, comprehensive explanation. ';
        break;
      case 'technical':
        prompt += 'Provide a technical explanation with precise terminology. ';
        break;
      case 'academic':
        prompt += 'Provide an academic-style explanation with proper context. ';
        break;
      case 'clear':
      default:
        prompt += 'Provide a clear and accessible explanation. ';
        break;
    }
    
    // Add audience instructions
    switch (preferences.audience) {
      case 'beginner':
        prompt += 'Assume the reader is new to this topic. ';
        break;
      case 'expert':
        prompt += 'Assume the reader has advanced knowledge in this field. ';
        break;
      case 'child':
        prompt += 'Explain it in a way a child could understand. ';
        break;
      case 'general':
      default:
        prompt += 'Assume a general educated audience. ';
        break;
    }
    
    // Add depth instructions
    switch (preferences.depth) {
      case 'brief':
        prompt += 'Keep the explanation concise. ';
        break;
      case 'deep':
        prompt += 'Provide an in-depth explanation with background context. ';
        break;
      case 'medium':
      default:
        prompt += 'Provide a moderately detailed explanation. ';
        break;
    }
    
    // Add examples instruction
    if (preferences.includeExamples) {
      prompt += 'Include relevant examples to illustrate your points. ';
    }
    
    prompt += 'Structure your explanation clearly and logically.';
    
    return prompt;
  }

  /**
   * Format the explanation result
   * @param {string} explanation - AI-generated explanation
   * @param {string} originalText - Original text
   * @param {Object} preferences - Explanation preferences
   * @returns {Object} Formatted result
   */
  formatExplanationResult(explanation, originalText, preferences) {
    return {
      explanation: explanation.trim(),
      originalText: originalText,
      keyPoints: this.extractKeyPoints(explanation),
      complexity: this.assessComplexity(originalText),
      preferences: preferences,
      readingTime: this.estimateReadingTime(explanation)
    };
  }

  /**
   * Extract key points from explanation
   * @param {string} explanation - Explanation text
   * @returns {Array} Key points
   */
  extractKeyPoints(explanation) {
    // Simple extraction based on sentence structure
    const sentences = explanation.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPoints = [];
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 20 && trimmed.length < 200) {
        keyPoints.push(trimmed);
      }
    });
    
    return keyPoints.slice(0, 5); // Limit to 5 key points
  }

  /**
   * Assess complexity of the original text
   * @param {string} text - Text to assess
   * @returns {string} Complexity level
   */
  assessComplexity(text) {
    const wordCount = this.getWordCount(text);
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
    const sentenceCount = text.split(/[.!?]+/).length - 1;
    const avgSentenceLength = wordCount / Math.max(sentenceCount, 1);
    
    if (avgWordLength > 6 || avgSentenceLength > 20) return 'high';
    if (avgWordLength > 4 || avgSentenceLength > 15) return 'medium';
    return 'low';
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
    const wordsPerMinute = 200;
    const wordCount = this.getWordCount(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Get tool capabilities
   * @returns {Array} Tool capabilities
   */
  getCapabilities() {
    return [
      'Text and concept explanation',
      'Multiple explanation styles (simple, detailed, technical, academic)',
      'Audience-aware explanations (beginner, general, expert)',
      'Complexity assessment',
      'Key point extraction',
      'Context-aware clarification'
    ];
  }
}
