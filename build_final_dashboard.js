require('dotenv').config();
const { UIBuilderAgent } = require('./src/agents/uiBuilderAgent');

async function buildFinal() {
  const agent = new UIBuilderAgent();
  const result = await agent.execute({
    action: 'generate_page',
    prompt: `
      ULTIMATE HARSHITA AI ENTERPRISE COMMAND CENTER (V6 - FULLY LOADED):
      - LAYOUT: Resizable 3-Panel Split Screen (Flexbox with mouse drag handles).
      - DUAL ROLE: Top right toggle to switch between "Admin Mode" and "Operator Mode".
      - INTERNAL COMMUNICATION:
        1. "Admin Broadcast" Bar: A scrolling or highlighted bar at the top for real-time orders from the Owner (e.g., "Operator 4: Prioritize Ration Cards!").
        2. "Team Chat": A small chat bubble or left-panel tab to message other operators directly.
      - LEFT PANEL: Tabs for Tasks, Operators, Analytics, and Internal Messages.
      - CENTER PANEL: 
        - Admin View: Overview of all active sessions.
        - Operator View: Live Browser for work.
      - RIGHT PANEL: 
        - Top: Harshita AI Supervisor (monitoring both Admin & Operators).
        - Bottom: Customer Chat with Voice/Media support.
      - THEME: Premium Dark Blue Enterprise with Glowing "Action" indicators.
    `,
    pageType: 'dashboard',
    options: {
      features: 'Resizable Panels, Internal Team Chat, Admin Broadcast, Dual Role Toggle, Voice Support'
    }
  });
  console.log(result.message);
}

buildFinal().catch(console.error);
