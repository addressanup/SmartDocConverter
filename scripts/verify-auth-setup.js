#!/usr/bin/env node

/**
 * Authentication Setup Verification Script
 * Run this to verify all authentication files are in place
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  // Core configuration
  'src/lib/auth.ts',
  'src/lib/auth-utils.ts',
  'src/middleware.ts',

  // API routes
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/auth/register/route.ts',

  // Components
  'src/components/auth/LoginForm.tsx',
  'src/components/auth/RegisterForm.tsx',
  'src/components/auth/UserMenu.tsx',
  'src/components/providers/SessionProvider.tsx',

  // Pages
  'src/app/(auth)/layout.tsx',
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/page.tsx',

  // Hooks and types
  'src/hooks/useAuth.ts',
  'src/types/next-auth.d.ts',

  // Documentation
  'AUTH_SETUP.md',
  'QUICK_START_AUTH.md',
  'AUTHENTICATION_FILES.md',
];

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
];

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

console.log('🔍 Verifying NextAuth.js Authentication Setup...\n');

// Check files
let missingFiles = [];
let existingFiles = [];

console.log('📁 Checking required files:');
requiredFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    console.log(`  ✅ ${file}`);
    existingFiles.push(file);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    missingFiles.push(file);
  }
});

console.log();

// Check package.json for dependencies
console.log('📦 Checking dependencies:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

const requiredPackages = [
  'next-auth',
  '@auth/prisma-adapter',
  'bcrypt',
  '@types/bcrypt',
  '@prisma/client',
  'react-hook-form',
  '@hookform/resolvers',
  'zod',
];

let missingPackages = [];
requiredPackages.forEach((pkg) => {
  if (deps[pkg]) {
    console.log(`  ✅ ${pkg} (${deps[pkg]})`);
  } else {
    console.log(`  ❌ ${pkg} - MISSING`);
    missingPackages.push(pkg);
  }
});

console.log();

// Check .env file
console.log('⚙️  Checking environment variables:');
const envPath = path.join(process.cwd(), '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });

  console.log('  Required:');
  requiredEnvVars.forEach((envVar) => {
    if (envVars[envVar] && envVars[envVar] !== '' && !envVars[envVar].includes('your-')) {
      console.log(`  ✅ ${envVar}`);
    } else if (envVars[envVar]) {
      console.log(`  ⚠️  ${envVar} - SET BUT NEEDS CONFIGURATION`);
    } else {
      console.log(`  ❌ ${envVar} - MISSING`);
    }
  });

  console.log('  Optional:');
  optionalEnvVars.forEach((envVar) => {
    if (envVars[envVar] && envVars[envVar] !== '' && !envVars[envVar].includes('your-')) {
      console.log(`  ✅ ${envVar}`);
    } else {
      console.log(`  ⚠️  ${envVar} - NOT CONFIGURED (optional)`);
    }
  });
} else {
  console.log('  ❌ .env file not found');
  console.log('  💡 Copy .env.example to .env and configure it');
}

console.log();

// Check Prisma schema
console.log('🗄️  Checking Prisma schema:');
const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const requiredModels = ['User', 'Account', 'Session', 'VerificationToken'];

  requiredModels.forEach((model) => {
    if (schema.includes(`model ${model}`)) {
      console.log(`  ✅ ${model} model exists`);
    } else {
      console.log(`  ❌ ${model} model - MISSING`);
    }
  });
} else {
  console.log('  ❌ prisma/schema.prisma not found');
}

console.log();

// Summary
console.log('📊 Summary:');
console.log(`  Files: ${existingFiles.length}/${requiredFiles.length} present`);
console.log(`  Missing files: ${missingFiles.length}`);
console.log(`  Missing packages: ${missingPackages.length}`);

console.log();

if (missingFiles.length === 0 && missingPackages.length === 0) {
  console.log('✅ Authentication setup verification PASSED!');
  console.log();
  console.log('Next steps:');
  console.log('1. Configure .env file with your database URL and NextAuth secret');
  console.log('2. Run: npm run db:push (to create database tables)');
  console.log('3. Run: npm run dev (to start development server)');
  console.log('4. Visit: http://localhost:3000/register (to create a test account)');
  console.log();
  console.log('📚 Documentation:');
  console.log('  - QUICK_START_AUTH.md - Quick reference guide');
  console.log('  - AUTH_SETUP.md - Comprehensive documentation');
  console.log('  - AUTHENTICATION_FILES.md - File listing');
  process.exit(0);
} else {
  console.log('❌ Authentication setup verification FAILED!');
  console.log();
  if (missingFiles.length > 0) {
    console.log('Missing files:');
    missingFiles.forEach((file) => console.log(`  - ${file}`));
    console.log();
  }
  if (missingPackages.length > 0) {
    console.log('Missing packages:');
    missingPackages.forEach((pkg) => console.log(`  - ${pkg}`));
    console.log();
    console.log('Run: npm install');
  }
  process.exit(1);
}
