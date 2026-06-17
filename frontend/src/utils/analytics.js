export const trackToolUsage = (toolId, success = true) => {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      event: 'tool_used', 
      data: { toolId, success } 
    })
  }).catch(() => {});
};
