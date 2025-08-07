#!/usr/bin/env node

/**
 * Ziota Deployment Verification Script
 * Checks if all components are properly configured for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Ziota deployment configuration...\n');

const checks = [];

// Check 1: Vercel configuration
function checkVercelConfig() {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.builds && vercelConfig.routes) {
      checks.push({ name: 'Vercel Configuration', status: '✅', details: 'vercel.json properly configured' });
    } else {
      checks.push({ name: 'Vercel Configuration', status: '❌', details: 'vercel.json missing required fields' });
    }
  } catch (error) {
    checks.push({ name: 'Vercel Configuration', status: '❌', details: 'vercel.json not found or invalid' });
  }
}

// Check 2: Frontend build script
function checkFrontendBuild() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
    if (packageJson.scripts && packageJson.scripts['vercel-build']) {
      checks.push({ name: 'Frontend Build Script', status: '✅', details: 'vercel-build script configured' });
    } else {
      checks.push({ name: 'Frontend Build Script', status: '❌', details: 'vercel-build script missing' });
    }
  } catch (error) {
    checks.push({ name: 'Frontend Build Script', status: '❌', details: 'frontend/package.json not found' });
  }
}

// Check 3: Environment examples
function checkEnvironmentFiles() {
  const envFiles = ['.env.example', 'frontend/.env.example'];
  let allFound = true;
  
  envFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      allFound = false;
    }
  });
  
  if (allFound) {
    checks.push({ name: 'Environment Examples', status: '✅', details: 'All .env.example files present' });
  } else {
    checks.push({ name: 'Environment Examples', status: '⚠️', details: 'Some .env.example files missing' });
  }
}

// Check 4: Key components
function checkKeyComponents() {
  const components = [
    'frontend/src/components/Personal.js',
    'frontend/src/components/ANN.js',
    'frontend/src/components/CSECore.js',
    'frontend/src/components/SubjectDetail.js',
    'frontend/src/components/SubjectPage.js'
  ];
  
  let allFound = true;
  let details = [];
  
  components.forEach(component => {
    if (fs.existsSync(component)) {
      const content = fs.readFileSync(component, 'utf8');
      if (content.includes('AuthService.getApiToken') && content.includes('uploadToCloudinary')) {
        details.push(`${path.basename(component)}: ✅`);
      } else {
        details.push(`${path.basename(component)}: ⚠️ (missing API integration)`);
        allFound = false;
      }
    } else {
      details.push(`${path.basename(component)}: ❌ (not found)`);
      allFound = false;
    }
  });
  
  checks.push({ 
    name: 'Key Components', 
    status: allFound ? '✅' : '⚠️', 
    details: details.join(', ')
  });
}

// Check 5: Backend routes
function checkBackendRoutes() {
  try {
    const subjectRoutes = fs.readFileSync('routes/subjectRoutes.js', 'utf8');
    if (subjectRoutes.includes('unifiedAuth')) {
      checks.push({ name: 'Backend Routes', status: '✅', details: 'Subject routes use unifiedAuth middleware' });
    } else {
      checks.push({ name: 'Backend Routes', status: '❌', details: 'Subject routes not using unifiedAuth' });
    }
  } catch (error) {
    checks.push({ name: 'Backend Routes', status: '❌', details: 'routes/subjectRoutes.js not found' });
  }
}

// Check 6: CORS configuration
function checkCORSConfig() {
  try {
    const serverJs = fs.readFileSync('server.js', 'utf8');
    if (serverJs.includes('vercel.app') && serverJs.includes('credentials: true')) {
      checks.push({ name: 'CORS Configuration', status: '✅', details: 'CORS properly configured for Vercel' });
    } else {
      checks.push({ name: 'CORS Configuration', status: '⚠️', details: 'CORS may need Vercel domain configuration' });
    }
  } catch (error) {
    checks.push({ name: 'CORS Configuration', status: '❌', details: 'server.js not found' });
  }
}

// Run all checks
checkVercelConfig();
checkFrontendBuild();
checkEnvironmentFiles();
checkKeyComponents();
checkBackendRoutes();
checkCORSConfig();

// Display results
console.log('📋 Deployment Verification Results:\n');
checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  console.log(`   ${check.details}\n`);
});

// Summary
const passed = checks.filter(c => c.status === '✅').length;
const warnings = checks.filter(c => c.status === '⚠️').length;
const failed = checks.filter(c => c.status === '❌').length;

console.log('📊 Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Failed: ${failed}\n`);

if (failed === 0) {
  console.log('🎉 Your project is ready for Vercel deployment!');
  console.log('📖 See VERCEL_DEPLOYMENT_READY.md for deployment instructions.');
} else {
  console.log('🚨 Please fix the failed checks before deploying.');
}
