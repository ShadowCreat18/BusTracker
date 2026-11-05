const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'www'); 

function obfuscateDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            obfuscateDirectory(filePath);
        } else if (file.endsWith('.js')) {
            console.log(`Ofuscando: ${file}...`);
            const code = fs.readFileSync(filePath, 'utf8');
            const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
                compact: true,
                controlFlowFlattening: false,
                deadCodeInjection: false,
                identifierNamesGenerator: 'hexadecimal',
                renameGlobals: false,
                simplify: true,
                splitStrings: false,
                stringArray: true,
                stringArrayEncoding: ['none'],
                stringArrayThreshold: 0.5,
                unicodeEscapeSequence: false
            }).getObfuscatedCode();

            fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
        }
    });
}

console.log('--- Iniciando Ofuscación de BusTracker ---');
if (fs.existsSync(targetDir)) {
    obfuscateDirectory(targetDir);
    console.log('--- Ofuscación completada con éxito ---');
} else {
    console.error('La carpeta www no existe. Corre npm run build primero.');
}
