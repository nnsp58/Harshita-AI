const fs = require('fs');
const path = require('path');

describe('PRD-066: Enterprise Routing Tests', () => {
    let appJsxContent = '';
    let convertersJsContent = '';
    let simpleDashboardContent = '';

    beforeAll(() => {
        const appPath = path.join(__dirname, '../frontend/src/App.jsx');
        appJsxContent = fs.readFileSync(appPath, 'utf8');

        const convertersPath = path.join(__dirname, '../frontend/src/data/converters.js');
        convertersJsContent = fs.readFileSync(convertersPath, 'utf8');
        
        const dashboardPath = path.join(__dirname, '../frontend/src/pages/SimpleDashboard.jsx');
        simpleDashboardContent = fs.readFileSync(dashboardPath, 'utf8');
    });

    test('App.jsx should NOT contain global redirect to home (Navigate to="/")', () => {
        expect(appJsxContent).not.toMatch(/<Route path="\*" element={<Navigate to="\/"/);
    });

    test('App.jsx should use NotFoundWorkspace for 404s', () => {
        expect(appJsxContent).toMatch(/<Route path="\*" element={<NotFoundWorkspace \/>} \/>/);
    });

    test('converters.js should not contain .html tool links', () => {
        expect(convertersJsContent).not.toMatch(/\.html/);
    });

    test('SimpleDashboard.jsx should not contain .html tool links', () => {
        expect(simpleDashboardContent).not.toMatch(/\.html/);
    });

    test('App.jsx must declare all converter workspaces', () => {
        const expectedWorkspaces = [
            'PassportWorkspace', 'AudioWorkspace', 'DocumentWorkspace', 
            'ImageWorkspace', 'ImageFormatWorkspace', 'PDFWorkspace', 
            'QRWorkspace', 'VideoWorkspace', 'VoiceWorkspace', 'PasswordWorkspace'
        ];

        expectedWorkspaces.forEach(workspace => {
            expect(appJsxContent).toContain(workspace);
        });
    });

    test('All defined tools in converters.js must route to /workspace', () => {
        const hrefMatches = convertersJsContent.match(/href:\s*'([^']+)'/g);
        expect(hrefMatches).toBeDefined();
        
        hrefMatches.forEach(match => {
            const url = match.split("'")[1];
            expect(url.startsWith('/workspace/') || url.startsWith('/login')).toBe(true);
        });
    });
});
