# n-dizi CSC Automation Tool

🚀 **AI-powered CSC center automation system** - "1 आदमी = 10 आदमी का काम"

## 🎯 Vision

Automate 100+ CSC center tasks with AI agents that handle multiple users simultaneously, auto-fill forms, process documents, and ensure error-free submissions.

## 🏗️ Architecture

```
Frontend (Web/Mobile)
    ↓
Backend (Node.js API)
    ↓
Queue System (Redis + BullMQ)
    ↓
Multi-Agent System
    ↓
Playwright + AI + Document Engine
```

## 🤖 Agents

### 1. Controller Agent
- **Purpose**: Task management and queue handling
- **Features**:
  - Add/manage tasks for multiple users
  - Priority queue system
  - Real-time status tracking
  - Queue statistics

### 2. Browser Agent
- **Purpose**: Automated form filling
- **Features**:
  - Smart field detection
  - Auto-fill personal, contact, address data
  - Gender/marital/category normalization
  - Manual approval before submit

### 3. Document AI Agent
- **Purpose**: Extract data from documents
- **Features**:
  - PDF text extraction
  - Image OCR processing
  - AI-powered data structuring
  - Multi-document merging

### 4. Validator Agent
- **Purpose**: Error detection and validation
- **Features**:
  - Field validation rules
  - Cross-field consistency checks
  - Age/gender verification
  - Document format validation

### 5. Notifier Agent
- **Purpose**: Alert system
- **Features**:
  - Captcha detection alerts
  - Validation error notifications
  - Task completion updates
  - Manual review requests

### 6. File Processor Agent
- **Purpose**: File optimization
- **Features**:
  - Photo resizing/compression
  - PDF optimization
  - Format validation
  - Batch processing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Redis server
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. **Install Playwright browsers:**
```bash
npx playwright install
```

4. **Start Redis server:**
```bash
redis-server
```

5. **Run the system:**
```bash
npm start
```

## 📊 Usage Examples

### Add a Task
```javascript
const taskId = await controller.addTask('user_123', {
  formUrl: 'https://csc-form.example.com',
  userData: userDataObject,
  priority: 1
});
```

### Process Documents
```javascript
const result = await docAI.processUserDocuments('user_123', {
  aadhaar: './uploads/aadhaar.pdf',
  photo: './uploads/photo.jpg'
});
```

### Validate Data
```javascript
const validation = validator.validateUserData(userData);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}
```

## 📂 Data Structure

### User Data JSON
```json
{
  "personal": {
    "fullName": "Nar Narayan Singh",
    "firstName": "Nar",
    "lastName": "Singh",
    "gender": "male",
    "dob": "2000-01-01",
    "maritalStatus": "single",
    "category": "general"
  },
  "contact": {
    "email": "narayan@gmail.com",
    "phone": "9876543210"
  },
  "address": {
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "pincode": "226001"
  },
  "documents": {
    "aadhaar": "123456789012",
    "pan": "ABCDE1234F"
  }
}
```

## 🔐 Security Features

- ✅ Sensitive data encryption
- ✅ Manual approval before submission
- ✅ Input validation and sanitization
- ✅ File type and size restrictions
- ✅ Audit logging

## 📈 Business Model

- **Basic Plan**: ₹499/month - Single user, basic automation
- **Pro Plan**: ₹999/month - Multi-user, advanced AI features
- **Enterprise**: Custom pricing - Full CSC automation suite

## 🎯 Key Features

- ✅ Multi-user task management
- ✅ AI document processing
- ✅ Smart form auto-fill
- ✅ Real-time validation
- ✅ Queue-based processing
- ✅ Notification system
- ✅ File optimization
- ✅ Manual override capability

## 🚧 Development Phases

### Phase 1 ✅ (DONE)
- Browser automation
- Smart form filling

### Phase 2 🔄 (Current)
- Document AI integration
- Multi-agent system

### Phase 3 📋 (Next)
- Queue system optimization
- Parallel processing

### Phase 4 📋 (Future)
- Cloud sync (Supabase)
- Multi-device support

### Phase 5 📋 (Future)
- Full SaaS platform
- Advanced AI features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## 📄 License

ISC License - see LICENSE file for details.

## 📞 Support

For support and questions:
- Email: support@n-dizi.com
- Issues: GitHub Issues

---

**Made with ❤️ for CSC operators everywhere**