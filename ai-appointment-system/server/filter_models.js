const fs = require('fs');
try {
    const data = fs.readFileSync('model_names.json', 'utf8');
    const models = JSON.parse(data);

    console.log("--- FILTERED MODELS ---");
    models.forEach(m => {
        if (m.includes('flash') || m.includes('pro') || m.includes('gemma')) {
            console.log(m);
        }
    });
} catch (e) {
    console.error(e.message);
}
