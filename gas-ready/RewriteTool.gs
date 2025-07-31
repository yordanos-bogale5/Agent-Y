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
    const instructions = {
      style: 'improve',
      tone: 'neutral',
      length: 'same',
      specific: []
    };
    
    const params = request.parameters?.toLowerCase() || '';
    
    // Parse style
    if (params.includes('formal')) instructions.style = 'formal';
    else if (params.includes('casual') || params.includes('informal')) instructions.style = 'casual';
    else if (params.includes('academic')) instructions.style = 'academic';
    else if (params.includes('creative')) instructions.style = 'creative';
    else if (params.includes('improve') || params.includes('better')) instructions.style = 'improve';
    
    // Parse tone
    if (params.includes('professional')) instructions.tone = 'professional';
    else if (params.includes('friendly')) instructions.tone = 'friendly';
    else if (params.includes('persuasive')) instructions.tone = 'persuasive';
    
    // Parse length preference
    if (params.includes('shorter') || params.includes('concise')) instructions.length = 'shorter';
    else if (params.includes('longer') || params.includes('expand')) instructions.length = 'longer';
    
    // Parse specific instructions
    if (params.includes('grammar')) instructions.specific.push('grammar');
    if (params.includes('clarity')) instructions.specific.push('clarity');
    if (params.includes('flow')) instructions.specific.push('flow');
    if (params.includes('vocabulary')) instructions.specific.push('vocabulary');
    
    return instructions;
  }

  /**
   * Build AI prompt for rewriting
   * @param {string} text - Text to rewrite
   * @param {Object} instructions - Rewriting instructions
   * @returns {string} AI prompt
   */
  buildRewritePrompt(text, instructions) {
    let prompt = `Please rewrite the following text:\n\n"${text}"\n\n`;
    
    // Add style instructions
    switch (instructions.style) {
      case 'formal':
        prompt += 'Make it more formal and professional. ';
        break;
      case 'casual':
        prompt += 'Make it more casual and conversational. ';
        break;
      case 'academic':
        prompt += 'Rewrite in an academic style with precise language. ';
        break;
      case 'creative':
        prompt += 'Make it more creative and engaging. ';
        break;
      case 'improve':
      default:
        prompt += 'Improve the clarity, flow, and overall quality. ';
        break;
    }
    
    // Add tone instructions
    switch (instructions.tone) {
      case 'professional':
        prompt += 'Use a professional tone. ';
        break;
      case 'friendly':
        prompt += 'Use a friendly and approachable tone. ';
        break;
      case 'persuasive':
        prompt += 'Make it more persuasive and compelling. ';
        break;
    }
    
    // Add length instructions
    switch (instructions.length) {
      case 'shorter':
        prompt += 'Make it more concise. ';
        break;
      case 'longer':
        prompt += 'Expand with more detail and explanation. ';
        break;
      case 'same':
        prompt += 'Keep approximately the same length. ';
        break;
    }
    
    // Add specific instructions
    if (instructions.specific.length > 0) {
      prompt += `Focus especially on: ${instructions.specific.join(', ')}. `;
    }
    
    prompt += 'Return only the rewritten text without any explanations or comments.';
    
    return prompt;
  }

  /**
   * Format the rewrite result
   * @param {string} rewrittenText - AI-generated rewritten text
   * @param {string} originalText - Original text
   * @param {Object} instructions - Rewriting instructions
   * @returns {Object} Formatted result
   */
  formatRewriteResult(rewrittenText, originalText, instructions) {
    return {
      rewrittenText: rewrittenText.trim(),
      originalText: originalText,
      improvements: this.identifyImprovements(originalText, rewrittenText),
      wordCount: {
        original: this.getWordCount(originalText),
        rewritten: this.getWordCount(rewrittenText)
      },
      instructions: instructions
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
    const changePercent = ((rewrittenLength - originalLength) / originalLength * 100).toFixed(1);
    
    if (Math.abs(changePercent) < 5) return 'similar length';
    if (changePercent > 0) return `${changePercent}% longer`;
    return `${Math.abs(changePercent)}% shorter`;
  }

  /**
   * Identify improvements made in rewriting
   * @param {string} original - Original text
   * @param {string} rewritten - Rewritten text
   * @returns {Array} List of improvements
   */
  identifyImprovements(original, rewritten) {
    const improvements = [];
    
    // Simple heuristics for identifying improvements
    if (rewritten.length > original.length * 1.1) {
      improvements.push('Added detail and explanation');
    }
    if (rewritten.length < original.length * 0.9) {
      improvements.push('Made more concise');
    }
    if (rewritten.split('.').length !== original.split('.').length) {
      improvements.push('Improved sentence structure');
    }
    
    return improvements;
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
   * Get tool capabilities
   * @returns {Array} Tool capabilities
   */
  getCapabilities() {
    return [
      'Text improvement and enhancement',
      'Style adjustment (formal, casual, academic, creative)',
      'Tone modification (professional, friendly, persuasive)',
      'Length control (shorter, same, longer)',
      'Grammar and clarity improvements',
      'Context-aware rewriting'
    ];
  }
}
