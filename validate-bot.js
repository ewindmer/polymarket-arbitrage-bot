/**
 * Simple validation script to check bot code structure
 * Run with: node validate-bot.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Bot Code Structure...\n');

const checks = [];
let hasErrors = false;

// Check 1: Required files exist
const requiredFiles = [
    'src/index.ts',
    'src/config/env.ts',
    'src/config/db.ts',
    'src/services/tradeMonitor.ts',
    'src/services/tradeExecutor.ts',
    'src/utils/createClobClient.ts',
    'src/utils/postOrder.ts',
    'src/utils/fetchData.ts',
    'src/utils/getMyBalance.ts',
    'package.json',
    'tsconfig.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    checks.push({ file, exists });
    if (exists) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        hasErrors = true;
    }
});

// Check 2: Check key functions in tradeMonitor.ts
console.log('\n🔍 Checking tradeMonitor.ts implementation...');
try {
    const tradeMonitorContent = fs.readFileSync('src/services/tradeMonitor.ts', 'utf8');
    if (tradeMonitorContent.includes('fetchTradeData')) {
        console.log('  ✅ fetchTradeData function exists');
    } else {
        console.log('  ❌ fetchTradeData function missing');
        hasErrors = true;
    }
    if (tradeMonitorContent.includes('await fetchData')) {
        console.log('  ✅ fetchTradeData uses fetchData');
    } else {
        console.log('  ⚠️  fetchTradeData might not be implemented');
    }
} catch (e) {
    console.log('  ❌ Could not read tradeMonitor.ts');
    hasErrors = true;
}

// Check 3: Check key functions in tradeExecutor.ts
console.log('\n🔍 Checking tradeExecutor.ts implementation...');
try {
    const tradeExecutorContent = fs.readFileSync('src/services/tradeExecutor.ts', 'utf8');
    if (tradeExecutorContent.includes('doTrading')) {
        console.log('  ✅ doTrading function exists');
    } else {
        console.log('  ❌ doTrading function missing');
        hasErrors = true;
    }
    if (tradeExecutorContent.includes('await postOrder')) {
        console.log('  ✅ doTrading calls postOrder');
    } else {
        console.log('  ⚠️  doTrading might not execute trades');
    }
    if (tradeExecutorContent.includes('condition')) {
        console.log('  ✅ Trading condition logic exists');
    }
} catch (e) {
    console.log('  ❌ Could not read tradeExecutor.ts');
    hasErrors = true;
}

// Check 4: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
        '@polymarket/clob-client',
        'axios',
        'dotenv',
        'ethers',
        'mongoose',
        'ora'
    ];
    requiredDeps.forEach(dep => {
        const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
        if (hasDep) {
            console.log(`  ✅ ${dep}`);
        } else {
            console.log(`  ⚠️  ${dep} - check if needed`);
        }
    });
} catch (e) {
    console.log('  ❌ Could not read package.json');
    hasErrors = true;
}

// Check 5: Check for .env file
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env')) {
    console.log('  ✅ .env file exists');
    try {
        const envContent = fs.readFileSync('.env', 'utf8');
        const requiredVars = [
            'USER_ADDRESS',
            'PROXY_WALLET',
            'PRIVATE_KEY',
            'CLOB_HTTP_URL',
            'MONGO_URI',
            'RPC_URL',
            'USDC_CONTRACT_ADDRESS'
        ];
        requiredVars.forEach(variable => {
            if (envContent.includes(variable)) {
                console.log(`  ✅ ${variable}`);
            } else {
                console.log(`  ⚠️  ${variable} - not found in .env`);
            }
        });
    } catch (e) {
        console.log('  ⚠️  Could not read .env file');
    }
} else {
    console.log('  ⚠️  .env file not found - create one from env.example');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
    console.log('❌ Validation found some issues. Please fix them before running the bot.');
    process.exit(1);
} else {
    console.log('✅ Basic validation passed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Install dependencies: npm install');
    console.log('  2. Create .env file with your configuration');
    console.log('  3. Start MongoDB');
    console.log('  4. Run the bot: npm run dev');
    process.exit(0);
}

