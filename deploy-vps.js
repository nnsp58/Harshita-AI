const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();
const path = require('path');

async function deploy() {
  try {
    console.log('Connecting to VPS...');
    await ssh.connect({
      host: '77.237.243.12',
      username: 'root',
      password: 'Singh@123'
    });
    console.log('Connected!');

    console.log('Uploading app.tar.gz...');
    await ssh.putFile(path.join(__dirname, 'app.tar.gz'), '/tmp/app.tar.gz');
    console.log('Upload complete!');

    console.log('Extracting and preparing on VPS...');
    await ssh.execCommand('rm -rf /tmp/harshita-ai-brain && mkdir -p /tmp/harshita-ai-brain');
    await ssh.execCommand('tar -xzf /tmp/app.tar.gz -C /tmp/harshita-ai-brain');

    console.log('Running deployment script...');
    const result = await ssh.execCommand('cd /tmp/harshita-ai-brain && chmod +x deploy-production.sh && dos2unix deploy-production.sh || true && ./deploy-production.sh', {
      onStdout: (chunk) => process.stdout.write(chunk.toString('utf8')),
      onStderr: (chunk) => process.stderr.write(chunk.toString('utf8'))
    });
    
    console.log('Deployment script finished with code', result.code);
    ssh.dispose();
  } catch (err) {
    console.error('Deployment failed:', err);
    ssh.dispose();
  }
}
deploy();
