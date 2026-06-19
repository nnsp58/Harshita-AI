const msg = "prarthi chanchal patni imar hau application to principal atal awasya school";
const lowerMessage = msg.toLowerCase();
const match = /application.*(?:likh|लिख|principal|headmaster|sir|madam)|(?:likh|लिख).*application/i.test(lowerMessage);
console.log("Regex Match:", match);
