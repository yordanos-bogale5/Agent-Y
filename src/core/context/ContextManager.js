/**
 * ContextManager - Handles document context capture and processing
 * Powered by Agent Y's context management system
 */

class ContextManager {
  constructor(config = {}) {
    this.config = {
      maxContentLength: config.maxContentLength || 10000,
      includeMetadata: config.includeMetadata !== false,
      ...config
    };
  }

  /**
   * Get current document context including selection and full content
   * @param {Object} options - Context options
   * @returns {Promise<Object>} Context object
   */
  async getContext(options = {}) {
    try {
      const context = {
        selection: '',
        content: '',
        metadata: {},
        timestamp: new Date().toISOString()
      };

      // Get current selection
      context.selection = await this.getCurrentSelection();
      
      // Get full document content if needed
      if (options.includeFullDocument !== false) {
        context.content = await this.getDocumentContent();
      }
      
      // Get document metadata
      if (this.config.includeMetadata) {
        context.metadata = await this.getDocumentMetadata();
      }
      
      // Process and clean context
      return this.processContext(context);
      
    } catch (error) {
      console.error('Error getting context:', error);
      return {
        selection: '',
        content: '',
        metadata: {},
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get currently selected text in the document
   * @returns {Promise<string>} Selected text
   */
  async getCurrentSelection() {
    try {
      // Use Google Docs API to get current selection
      const selection = DocumentApp.getActiveDocument().getSelection();
      
      if (!selection) {
        return '';
      }
      
      const elements = selection.getSelectedElements();
      let selectedText = '';
      
      for (const element of elements) {
        const selectedElement = element.getElement();
        
        if (element.isPartial()) {
          // Handle partial selection
          const startOffset = element.getStartOffset();
          const endOffset = element.getEndOffsetInclusive();
          
          if (selectedElement.getType() === DocumentApp.ElementType.TEXT) {
            const text = selectedElement.asText().getText();
            selectedText += text.substring(startOffset, endOffset + 1);
          }
        } else {
          // Handle full element selection
          selectedText += this.extractTextFromElement(selectedElement);
        }
      }
      
      return selectedText.trim();
      
    } catch (error) {
      console.error('Error getting selection:', error);
      return '';
    }
  }

  /**
   * Get full document content
   * @returns {Promise<string>} Document content
   */
  async getDocumentContent() {
    try {
      const doc = DocumentApp.getActiveDocument();
      const body = doc.getBody();
      
      return this.extractTextFromElement(body);
      
    } catch (error) {
      console.error('Error getting document content:', error);
      return '';
    }
  }

  /**
   * Extract text content from a document element
   * @param {Object} element - Document element
   * @returns {string} Extracted text
   */
  extractTextFromElement(element) {
    let text = '';
    
    try {
      const elementType = element.getType();
      
      switch (elementType) {
        case DocumentApp.ElementType.TEXT:
          text = element.getText();
          break;
          
        case DocumentApp.ElementType.PARAGRAPH:
          text = element.getText();
          break;
          
        case DocumentApp.ElementType.LIST_ITEM:
          text = element.getText();
          break;
          
        case DocumentApp.ElementType.TABLE:
          // Extract text from table cells
          const numRows = element.getNumRows();
          for (let i = 0; i < numRows; i++) {
            const row = element.getRow(i);
            const numCells = row.getNumCells();
            for (let j = 0; j < numCells; j++) {
              const cell = row.getCell(j);
              text += this.extractTextFromElement(cell) + '\t';
            }
            text += '\n';
          }
          break;
          
        default:
          // For container elements, recursively extract text from children
          if (element.getNumChildren && element.getChild) {
            const numChildren = element.getNumChildren();
            for (let i = 0; i < numChildren; i++) {
              const child = element.getChild(i);
              text += this.extractTextFromElement(child);
            }
          }
      }
      
    } catch (error) {
      console.error('Error extracting text from element:', error);
    }
    
    return text;
  }

  /**
   * Get document metadata
   * @returns {Promise<Object>} Document metadata
   */
  async getDocumentMetadata() {
    try {
      const doc = DocumentApp.getActiveDocument();
      
      return {
        id: doc.getId(),
        name: doc.getName(),
        url: doc.getUrl(),
        lastModified: new Date().toISOString(), // Apps Script doesn't provide last modified
        wordCount: this.getWordCount(await this.getDocumentContent()),
        language: doc.getLanguage() || 'en'
      };
      
    } catch (error) {
      console.error('Error getting document metadata:', error);
      return {};
    }
  }

  /**
   * Process and clean context data
   * @param {Object} context - Raw context
   * @returns {Object} Processed context
   */
  processContext(context) {
    // Truncate content if too long
    if (context.content.length > this.config.maxContentLength) {
      context.content = context.content.substring(0, this.config.maxContentLength) + '...';
      context.truncated = true;
    }
    
    // Clean up whitespace
    context.selection = context.selection.replace(/\s+/g, ' ').trim();
    context.content = context.content.replace(/\s+/g, ' ').trim();
    
    // Add context statistics
    context.stats = {
      selectionLength: context.selection.length,
      contentLength: context.content.length,
      selectionWordCount: this.getWordCount(context.selection),
      contentWordCount: this.getWordCount(context.content)
    };
    
    return context;
  }

  /**
   * Get word count for text
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
   * Get context for specific range in document
   * @param {number} startIndex - Start index
   * @param {number} endIndex - End index
   * @returns {Promise<Object>} Range context
   */
  async getRangeContext(startIndex, endIndex) {
    try {
      const doc = DocumentApp.getActiveDocument();
      const body = doc.getBody();
      const fullText = body.getText();
      
      const rangeText = fullText.substring(startIndex, endIndex);
      
      return {
        text: rangeText,
        startIndex,
        endIndex,
        length: rangeText.length,
        wordCount: this.getWordCount(rangeText),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error getting range context:', error);
      return null;
    }
  }

  /**
   * Find text in document and return context around it
   * @param {string} searchText - Text to find
   * @param {number} contextLength - Characters of context to include
   * @returns {Promise<Array>} Array of context objects
   */
  async findTextContext(searchText, contextLength = 200) {
    try {
      const content = await this.getDocumentContent();
      const results = [];
      
      let index = content.indexOf(searchText);
      while (index !== -1) {
        const start = Math.max(0, index - contextLength);
        const end = Math.min(content.length, index + searchText.length + contextLength);
        
        results.push({
          text: searchText,
          context: content.substring(start, end),
          index,
          beforeContext: content.substring(start, index),
          afterContext: content.substring(index + searchText.length, end)
        });
        
        index = content.indexOf(searchText, index + 1);
      }
      
      return results;
      
    } catch (error) {
      console.error('Error finding text context:', error);
      return [];
    }
  }
}

// Export for use in Google Apps Script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContextManager;
} else if (typeof window !== 'undefined') {
  window.ContextManager = ContextManager;
}
