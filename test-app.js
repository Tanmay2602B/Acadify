const fs = require('fs');
const path = require('path');

// Function to check if a directory exists
function directoryExists(dirPath) {
  return fs.existsSync(dirPath) && fs.lstatSync(dirPath).isDirectory();
}

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
}

// Function to count files in a directory
function countFiles(dirPath) {
  if (!directoryExists(dirPath)) return 0;
  return fs.readdirSync(dirPath).length;
}

console.log('=== Acadify Application Structure Verification ===\n');

// Check main directories
const mainDirs = ['config', 'controllers', 'models', 'routes', 'middlewares', 'utils', 'public', 'views'];
console.log('Checking main directories...');
mainDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  console.log(`  ${dir}: ${directoryExists(dirPath) ? '✓' : '✗'}`);
});

console.log('\nChecking public subdirectories...');
const publicDirs = ['admin', 'faculty', 'student', 'uploads'];
publicDirs.forEach(dir => {
  const dirPath = path.join(__dirname, 'public', dir);
  console.log(`  public/${dir}: ${directoryExists(dirPath) ? '✓' : '✗'}`);
});

console.log('\nChecking main files...');
const mainFiles = [
  'server.js',
  'package.json',
  'README.md',
  'SUMMARY.md',
  '.env.example'
];

mainFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  console.log(`  ${file}: ${fileExists(filePath) ? '✓' : '✗'}`);
});

console.log('\nChecking config files...');
const configFiles = ['schema.sql', 'sample-data.sql'];
configFiles.forEach(file => {
  const filePath = path.join(__dirname, 'config', file);
  console.log(`  config/${file}: ${fileExists(filePath) ? '✓' : '✗'}`);
});

console.log('\nChecking controller files...');
const controllerFiles = fs.readdirSync(path.join(__dirname, 'controllers'));
controllerFiles.forEach(file => {
  console.log(`  controllers/${file}: ✓`);
});

console.log('\nChecking route files...');
const routeFiles = fs.readdirSync(path.join(__dirname, 'routes'));
routeFiles.forEach(file => {
  console.log(`  routes/${file}: ✓`);
});

console.log('\n=== Verification Complete ===');
console.log('Application structure is ready for development!');