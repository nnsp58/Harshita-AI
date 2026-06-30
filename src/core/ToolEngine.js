class ToolEngine {
  constructor() {
    this.name = 'ToolEngine';
    this.tools = new Map();
  }

  /**
   * Register a new external tool or utility.
   * @param {string} name - Tool name
   * @param {Object} config - Tool configuration and execution logic
   */
  registerTool(name, config) {
    if (!name || typeof config.execute !== 'function') {
      throw new Error(`Invalid tool configuration for ${name}`);
    }
    this.tools.set(name, config);
    console.log(`[ToolEngine] Registered tool: ${name}`);
  }

  /**
   * Get a registered tool by name.
   */
  getTool(name) {
    return this.tools.get(name);
  }

  /**
   * Execute a tool with retries and fallback.
   * @param {string} name - Tool name
   * @param {Object} params - Parameters for the tool
   */
  async executeTool(name, params) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    let attempt = 0;
    const maxRetries = tool.maxRetries || 2;
    let lastError = null;

    while (attempt <= maxRetries) {
      try {
        console.log(`[ToolEngine] Executing ${name} (Attempt ${attempt + 1})`);
        const result = await tool.execute(params);
        return result;
      } catch (e) {
        lastError = e;
        console.warn(`[ToolEngine] Tool ${name} failed:`, e.message);
        attempt++;
        if (attempt <= maxRetries) {
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }
      }
    }

    throw new Error(`Tool ${name} failed after ${maxRetries} retries. Last error: ${lastError?.message}`);
  }
}

const toolEngine = new ToolEngine();
module.exports = { ToolEngine, toolEngine };
