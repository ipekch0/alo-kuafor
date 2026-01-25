const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoUrl = 'https://github.com/ipekch0/alo-kuafor.git';
const tempDir = path.join(__dirname, 'temp_repo_check');

try {
    console.log(`--- Verifying Remote Repository Structure ---`);
    console.log(`Repo: ${repoUrl}`);

    if (fs.existsSync(tempDir)) {
        console.log('Cleaning up old temp dir...');
        fs.rmSync(tempDir, { recursive: true, force: true });
    }

    console.log('Cloning repository...');
    execSync(`git clone ${repoUrl} "${tempDir}"`, { stdio: 'inherit' });

    console.log('\n--- ROOT CONTENTS ---');
    const rootFiles = fs.readdirSync(tempDir);
    console.log(rootFiles.join('\n'));

    const serverPath = path.join(tempDir, 'server');
    if (fs.existsSync(serverPath) && fs.lstatSync(serverPath).isDirectory()) {
        console.log('\n✅ "server" directory FOUND in root.');
        console.log('--- SERVER CONTENTS ---');
        console.log(fs.readdirSync(serverPath).join('\n'));
    } else {
        console.log('\n❌ "server" directory NOT FOUND in root!');

        // Search recursively/deeply if not in root
        console.log('\nSearching subdirectories...');
        // (Simple check for one level deep)
        rootFiles.forEach(file => {
            const subPath = path.join(tempDir, file);
            if (fs.lstatSync(subPath).isDirectory() && file !== '.git') {
                const subFiles = fs.readdirSync(subPath);
                if (subFiles.includes('server')) {
                    console.log(`⚠️ FOUND "server" nested inside "${file}"!`);
                    console.log(`Render Path should be: ${file}/server`);
                }
            }
        });
    }

} catch (error) {
    console.error('❌ Error verifying repo:', error.message);
} finally {
    // Cleanup
    if (fs.existsSync(tempDir)) {
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.log('Cleanup failed (permission?), please delete temp_repo_check manually.');
        }
    }
}
