/**
 * RewriteTool - AI-powered text rewriting and improvement tool
 * Part of Agent Y's modular tool architecture
 */

class RewriteTool {
  constructor(config = {}) {
    this.name = 'rewrite';
    this.description = 'Rewrite and improve selected text with AI assistance';
    this.config = {
      preserveLength: config.preserveLength || false,
      defaultStyle: config.defaultStyle || 'improve',
      ...config
    };
    
    this.parameters = {
      text: {
        type: 'string',
        description: 'Text to rewrite',
        required: true
      },
      style: {
        type: 'string',
        description: 'Rewriting style (improve, formal, casual, academic, creative)',
        default: 'improve'
      },
      tone: {
        type: 'string',
        description: 'Desired tone (professional, friendly, persuasive, neutral)',
        default: 'neutral'
      },
      length: {
        type: 'string',
        description: 'Length preference (shorter, same, longer)',
        default: 'same'
      }
    };
  }

  /**
   * Execute the rewriting tool
   * @param {Object} params - Execution parameters
   * @returns {Promise<Object>} Rewriting result
   */
  async execute({ request, context, apiClient, config }) {
    try {
      // Get text to rewrite
      const textToRewrite = this.getTextToRewrite(request, context);
      
      if (!textToRewrite || textToRewrite.trim().length === 0) {
        return {
          success: false,
          error: 'No text available to rewrite. Please select text in the document.'
        };
      }

      // Parse rewriting instructions
      const instructions = this.parseRewriteInstructions(request);
      
      // Build rewriting prompt
      const prompt = this.buildRewritePrompt(textToRewrite, instructions);
      
      // Generate rewritten text using AI
      const rewrittenText = await apiClient.generateResponse(prompt, config);
      
      // Process and format the result
      const result = this.formatRewriteResult(rewrittenText, textToRewrite, instructions);
      
      return {
        success: true,
        result,
        metadata: {
          originalLength: textToRewrite.length,
          rewrittenLength: result.rewrittenText.length,
          style: instructions.style,
          tone: instructions.tone,
          lengthChange: this.calculateLengthChange(textToRewrite, result.rewrittenText),
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Error in RewriteTool:', error);
      return {
        success: false,
        error: `Rewriting failed: ${error.message}`
      };
    }
  }

  /**
   * Get text to rewrite from context and request
   * @param {Object} request - User request
   * @param {Object} context - Document context
   * @returns {string} Text to rewrite
   */
  getTextToRewrite(request, context) {
    // Check if user provided specific text in quotes
    const quotedTextMatch = request.parameters?.match(/"([^"]+)"/);
    if (quotedTextMatch) {
      return quotedTextMatch[1];
    }
    
    // Use selected text if available
    if (context.selection && context.selection.trim().length > 0) {
      return context.selection;
    }
    
    return '';
  }

  /**
   * Parse rewriting instructions from user request
   * @param {Object} request - User request
   * @returns {Object} Parsed instructions
   */
  parseRewriteInstructions(request) {
    const params = request.parameters?.toLowerCase() || '';
    
    return {
      style: this.extractStyle(params),
      tone: this.extractTone(params),
      length: this.extractLengthPreference(params),
      specific: this.extractSpecificInstructions(params)
    };
  }

  /**
   * Extract writing style from parameters
   * @param {string} params - Request parameters
   * @returns {string} Writing style
   */
  extractStyle(params) {
    const styles = {
      formal: ['formal', 'professional', 'business', 'official'],
      casual: ['casual', 'informal', 'conversational', 'relaxed'],
      academic: ['academic', 'scholarly', 'research', 'technical'],
      creative: ['creative', 'artistic', 'expressive', 'imaginative'],
      simple: ['simple', 'clear', 'plain', 'straightforward'],
      improve: ['improve', 'better', 'enhance', 'polish']
    };
    
    for (const [style, keywords] of Object.entries(styles)) {
      if (keywords.some(keyword => params.includes(keyword))) {
        return style;
      }
    }
    
    return 'improve';
  }

  /**
   * Extract tone from parameters
   * @param {string} params - Request parameters
   * @returns {string} Tone
   */
  extractTone(params) {
    const tones = {
      professional: ['professional', 'business', 'corporate'],
      friendly: ['friendly', 'warm', 'approachable', 'welcoming'],
      persuasive: ['persuasive', 'convincing', 'compelling'],
      authoritative: ['authoritative', 'confident', 'expert'],
      empathetic: ['empathetic', 'understanding', 'compassionate'],
      neutral: ['neutral', 'objective', 'balanced']
    };
    
    for (const [tone, keywords] of Object.entries(tones)) {
      if (keywords.some(keyword => params.includes(keyword))) {
        return tone;
      }
    }
    
    return 'neutral';
  }

  /**
   * Extract length preference from parameters
   * @param {string} params - Request parameters
   * @returns {string} Length preference
   */
  extractLengthPreference(params) {
    if (params.includes('shorter') || params.includes('concise') || params.includes('brief')) {
      return 'shorter';
    }
    if (params.includes('longer') || params.includes('expand') || params.includes('elaborate')) {
      return 'longer';
    }
    return 'same';
  }

  /**
   * Extract specific rewriting instructions
   * @param {string} params - Request parameters
   * @returns {Array} Specific instructions
   */
  extractSpecificInstructions(params) {
    const instructions = [];
    
    if (params.includes('grammar')) instructions.push('Fix grammar and spelling');
    if (params.includes('clarity')) instructions.push('Improve clarity');
    if (params.includes('flow')) instructions.push('Improve flow and readability');
    if (params.includes('active voice')) instructions.push('Use active voice');
    if (params.includes('passive voice')) instructions.push('Use passive voice');
    if (params.includes('remove jargon')) instructions.push('Remove jargon and technical terms');
    if (params.includes('add examples')) instructions.push('Add examples or illustrations');
    
    return instructions;
  }

  /**
   * Build AI prompt for rewriting
   * @param {string} text - Text to rewrite
   * @param {Object} instructions - Rewriting instructions
   * @returns {string} Formatted prompt
   */
  buildRewritePrompt(text, instructions) {
    let prompt = `You are an expert editor and writer. Please rewrite the following text according to these specifications:\n\n`;
    
    // Add style instructions
    prompt += `Style: ${this.getStyleDescription(instructions.style)}\n`;
    prompt += `Tone: ${this.getToneDescription(instructions.tone)}\n`;
    prompt += `Length: ${this.getLengthDescription(instructions.length)}\n`;
    
    // Add specific instructions
    if (instructions.specific && instructions.specific.length > 0) {
      prompt += `\nSpecific requirements:\n`;
      instructions.specific.forEach(instruction => {
        prompt += `- ${instruction}\n`;
      });
    }
    
    prompt += `\nOriginal text:\n"${text}"\n\n`;
    prompt += `Please provide the rewritten version that follows all the above requirements:`;
    
    return prompt;
  }

  /**
   * Get description for writing style
   * @param {string} style - Style identifier
   * @returns {string} Style description
   */
  getStyleDescription(style) {
    const descriptions = {
      formal: 'Professional and formal language, suitable for business or official documents',
      casual: 'Conversational and relaxed tone, as if speaking to a friend',
      academic: 'Scholarly and precise language, suitable for research or educational content',
      creative: 'Expressive and imaginative language with vivid descriptions',
      simple: 'Clear and straightforward language, easy to understand',
      improve: 'Enhanced version with better word choice, structure, and clarity'
    };
    
    return descriptions[style] || descriptions.improve;
  }

  /**
   * Get description for tone
   * @param {string} tone - Tone identifier
   * @returns {string} Tone description
   */
  getToneDescription(tone) {
    const descriptions = {
      professional: 'Maintain a professional and business-appropriate tone',
      friendly: 'Use a warm, approachable, and friendly tone',
      persuasive: 'Write in a compelling and convincing manner',
      authoritative: 'Use confident and expert language',
      empathetic: 'Show understanding and compassion',
      neutral: 'Maintain an objective and balanced tone'
    };
    
    return descriptions[tone] || descriptions.neutral;
  }

  /**
   * Get description for length preference
   * @param {string} length - Length preference
   * @returns {string} Length description
   */
  getLengthDescription(length) {
    const descriptions = {
      shorter: 'Make it more concise while preserving all key information',
      longer: 'Expand with additional details, examples, or explanations',
      same: 'Keep approximately the same length'
    };
    
    return descriptions[length] || descriptions.same;
  }

  /**
   * Format the rewrite result for display
   * @param {string} rewrittenText - AI-generated rewritten text
   * @param {string} originalText - Original text
   * @param {Object} instructions - Rewriting instructions
   * @returns {Object} Formatted result
   */
  formatRewriteResult(rewrittenText, originalText, instructions) {
    const cleanRewritten = rewrittenText.trim();
    
    return {
      originalText,
      rewrittenText: cleanRewritten,
      instructions,
      comparison: {
        originalWordCount: this.getWordCount(originalText),
        rewrittenWordCount: this.getWordCount(cleanRewritten),
        originalCharCount: originalText.length,
        rewrittenCharCount: cleanRewritten.length
      },
      action: 'rewrite',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate length change percentage
   * @param {string} original - Original text
   * @param {string} rewritten - Rewritten text
   * @returns {string} Length change description
   */
  calculateLengthChange(original, rewritten) {
    const originalLength = original.length;
    const rewrittenLength = rewritten.length;
    
    if (originalLength === 0) return 'N/A';
    
    const changePercent = ((rewrittenLength - originalLength) / originalLength * 100).toFixed(1);
    
    if (Math.abs(changePercent) < 5) return 'Similar length';
    if (changePercent > 0) return `${changePercent}% longer`;
    return `${Math.abs(changePercent)}% shorter`;
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
   * Get tool usage examples
   * @returns {Array} Array of usage examples
   */
  getUsageExamples() {
    return [
      {
        description: 'Make text more formal',
        command: 'Rewrite this in a formal style',
        context: 'User has selected casual text that needs to be professional'
      },
      {
        description: 'Simplify complex text',
        command: 'Make this simpler and clearer',
        context: 'User has selected complex or jargon-heavy text'
      },
      {
        description: 'Improve writing quality',
        command: 'Improve this text',
        context: 'User wants general enhancement of selected text'
      },
      {
        description: 'Change tone to friendly',
        command: 'Rewrite this with a friendly tone',
        context: 'User wants to make text more approachable'
      }
    ];
  }
}

// Export for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RewriteTool;
} else if (typeof window !== 'undefined') {
  window.RewriteTool = RewriteTool;
}
