const fs = require('fs');
try {
    const data = fs.readFileSync('json_test_results.txt', 'utf8');
    const lines = data.split('\n');
    console.log("--- PASSING MODELS ---");
    lines.forEach(line => {
        if (line.includes('PASS')) {
            console.log(line);
        }
    });
} catch (e) {
    console.error(e);
}
