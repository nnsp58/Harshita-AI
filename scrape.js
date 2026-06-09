const axios = require('axios');
axios.get('https://www.sarkariresult.com/')
  .then(res => {
    const html = res.data;
    // SarkariResult has a Latest Jobs div. We can look for "Latest Jobs" and grab the next few links.
    // Let's just find links that have text like "Online Form", "Admit Card", etc.
    const matches = [...html.matchAll(/<a href=\"(.*?)\".*?>(.*?)<\/a>/gi)];
    const jobs = matches.map(m => m[2].replace(/<[^>]+>/g, '').trim()).filter(text => text.includes('Online Form') || text.includes('Recruitment') || text.includes('Apply'));
    console.log(jobs.slice(0, 10));
  })
  .catch(console.error);
