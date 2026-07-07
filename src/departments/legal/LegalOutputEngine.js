/**
 * LegalOutputEngine
 * Converts the abstract document tree into printable PDF/DOCX/HTML formats.
 */
class LegalOutputEngine {
  async renderOutput(draftText, format = 'HTML') {
    if (format === 'HTML') {
      return `<pre>${draftText}</pre>`;
    }
    // TODO: Add DOCX and PDF renderers
    return draftText;
  }
}

module.exports = { LegalOutputEngine };
