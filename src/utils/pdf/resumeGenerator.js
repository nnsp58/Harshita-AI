/**
 * ResumeGenerator — प्रोफेशनल रिज्यूमे PDF बनाने के लिए यूटिलिटी
 * 
 * यह मॉड्यूल @react-pdf/renderer का उपयोग करके JSON डेटा से 
 * खूबसूरत PDF रिज्यूमे बनाता है।
 */
const React = require('react');
const { Document, Page, Text, View, StyleSheet, renderToBuffer } = require('@react-pdf/renderer');

/**
 * रिज्यूमे जेनरेट करें
 * @param {Object} data - यूज़र की प्रोफाइल डिटेल्स
 * @param {Object} theme - थीम कॉन्फ़िगरेशन (id, primaryColor, etc.)
 * @returns {Promise<Buffer>} - PDF फाइल का बफर
 */
async function generateResumePDF(data, theme = { id: 'modern', primaryColor: '#2563eb' }) {
  try {
    const styles = StyleSheet.create({
      page: { padding: 30, fontFamily: 'Helvetica' },
      header: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: theme.primaryColor || '#2563eb',
        borderBottomStyle: 'solid',
      },
      name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.primaryColor || '#2563eb',
        marginBottom: 5,
      },
      contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        fontSize: 9,
        color: '#666',
        marginBottom: 5,
      },
      section: { marginBottom: 15 },
      sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.primaryColor || '#2563eb',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.accentColor || '#3b82f6',
        borderBottomStyle: 'solid',
        paddingBottom: 2,
      },
      text: { fontSize: 10, marginBottom: 5, lineHeight: 1.4 },
      smallText: { fontSize: 9, color: '#666', marginBottom: 3 },
      skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
      skillItem: {
        fontSize: 8,
        backgroundColor: '#f0f0f0',
        padding: '2 6',
        borderRadius: 3,
      },
      expHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
      },
      bold: { fontSize: 11, fontWeight: 'bold', color: '#333' },
      italic: { fontSize: 10, color: '#666', fontStyle: 'italic' },
      bulletPoint: { fontSize: 9, marginBottom: 2, lineHeight: 1.4, marginLeft: 10 },
      expItem: { marginBottom: 12 },
    });

    const pi = data.personalInfo || {};
    const summary = data.summary || {};
    const skills = data.skills || [];
    const experience = data.experience || [];
    const education = data.education || [];

    // Modern Theme (Two Column)
    if (theme.id === 'modern') {
      const modernStyles = StyleSheet.create({
        page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 10 },
        leftCol: { width: '33%', backgroundColor: theme.primaryColor || '#2563eb', color: '#ffffff', padding: 25 },
        rightCol: { width: '67%', padding: 30 },
        name: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#ffffff' },
        contactText: { fontSize: 9, marginBottom: 6, color: '#eeeeee' },
        titleLeft: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffffff50', paddingBottom: 4, marginTop: 20, color: '#ffffff' },
        titleRight: { fontSize: 14, fontWeight: 'bold', color: theme.primaryColor || '#2563eb', marginBottom: 12, borderBottomWidth: 2, borderBottomColor: theme.accentColor || '#3b82f6', paddingBottom: 4, marginTop: 5 },
        textLeft: { fontSize: 9, marginBottom: 5, lineHeight: 1.4, color: '#eeeeee' },
        textRight: { fontSize: 10, marginBottom: 5, lineHeight: 1.4, color: '#333333' },
        boldRight: { fontSize: 11, fontWeight: 'bold', color: '#111111' },
        italicRight: { fontSize: 10, color: '#666666', fontStyle: 'italic', marginBottom: 3 },
        smallRight: { fontSize: 9, color: '#888888' },
        expItem: { marginBottom: 15 },
        expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
        bullet: { fontSize: 9, marginBottom: 3, lineHeight: 1.4, marginLeft: 12, color: '#444444' }
      });

      const leftSections = [
        React.createElement(View, { key: 'pi' },
          React.createElement(Text, { style: modernStyles.name }, String(pi.name || 'Your Name')),
          pi.email && React.createElement(Text, { style: modernStyles.contactText, key: 'e' }, String(pi.email)),
          pi.phone && React.createElement(Text, { style: modernStyles.contactText, key: 'p' }, String(pi.phone)),
          pi.location && React.createElement(Text, { style: modernStyles.contactText, key: 'l' }, String(pi.location))
        )
      ];

      if (skills.length > 0) {
        leftSections.push(
          React.createElement(View, { key: 'skl' },
            React.createElement(Text, { style: modernStyles.titleLeft }, 'Skills'),
            ...skills.map((s, i) => React.createElement(Text, { key: `s-${i}`, style: modernStyles.textLeft }, String(s.name || s)))
          )
        );
      }

      const rightSections = [];
      if (summary.text || summary) {
        rightSections.push(
          React.createElement(View, { key: 'sum' },
            React.createElement(Text, { style: modernStyles.titleRight }, 'Summary'),
            React.createElement(Text, { style: modernStyles.textRight }, String(summary.text || summary))
          )
        );
      }

      if (experience.length > 0) {
        rightSections.push(React.createElement(Text, { key: 'ext', style: modernStyles.titleRight }, 'Experience'));
        experience.forEach((exp, i) => {
          rightSections.push(
            React.createElement(View, { key: `exp-${i}`, style: modernStyles.expItem },
              React.createElement(View, { style: modernStyles.expHeader },
                React.createElement(Text, { style: modernStyles.boldRight }, String(exp.company)),
                React.createElement(Text, { style: modernStyles.smallRight }, String(exp.duration))
              ),
              React.createElement(Text, { style: modernStyles.italicRight }, String(exp.role)),
              ...(exp.description || []).map((b, bi) => React.createElement(Text, { key: `b-${bi}`, style: modernStyles.bullet }, `• ${b}`))
            )
          );
        });
      }

      const doc = React.createElement(Document, null,
        React.createElement(Page, { size: 'A4', style: modernStyles.page },
          React.createElement(View, { style: modernStyles.leftCol }, ...leftSections),
          React.createElement(View, { style: modernStyles.rightCol }, ...rightSections)
        )
      );

      return await renderToBuffer(doc);
    }

    // Default Fallback Theme (Simple)
    const sections = [
        React.createElement(View, { key: 'header', style: styles.header },
          React.createElement(Text, { style: styles.name }, String(pi.name || 'Your Name')),
          React.createElement(View, { style: styles.contactRow }, 
            pi.email && React.createElement(Text, { key: 'e' }, String(pi.email)),
            pi.phone && React.createElement(Text, { key: 'p' }, String(pi.phone))
          )
        )
    ];

    const doc = React.createElement(Document, null,
      React.createElement(Page, { size: 'A4', style: styles.page },
        React.createElement(View, null, ...sections)
      )
    );

    return await renderToBuffer(doc);

  } catch (err) {
    console.error('[ResumeGenerator] Error:', err);
    throw err;
  }
}

module.exports = { generateResumePDF };
