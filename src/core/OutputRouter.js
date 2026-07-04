class OutputRouter {
  /**
   * Routes the final output to the correct UI view based on the terminating agent or intent.
   * 
   * @param {Object} finalResponse - The response object from MasterAIOrchestrator
   * @returns {Object} - UI configured response
   */
  route(finalResponse) {
    let mode = 'chat';
    
    // Determine Output Mode based on which agent produced the final result
    switch(finalResponse.agentName) {
      case 'ApplicationAgent':
      case 'LegalAgent':
      case 'PDFAgent':
        mode = 'legal_generated'; // Maps to Center A4 Workspace
        break;
      case 'CodingAgent':
        mode = 'code_editor';
        break;
      case 'ImageAgent':
        mode = 'image_viewer';
        break;
      case 'VideoAgent':
        mode = 'video_player';
        break;
      case 'WebsiteAgent':
        mode = 'website_preview';
        break;
      default:
        mode = 'chat';
    }

    return {
      success: finalResponse.status === 'success',
      message: finalResponse.output,
      mode: mode,
      warnings: finalResponse.warnings,
      suggestions: finalResponse.suggestions,
      confidence: finalResponse.confidenceScore
    };
  }
}

module.exports = new OutputRouter();
