/**
 * Build script for the Minimax client library
 * 
 * This script provides a more detailed build process with console output
 * to help with debugging and ensuring a proper build.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

/**
 * Run a command and log the output
 * @param {string} command - The command to run
 * @param {string} label - A label for the command
 */
function runCommand(command, label) {
  console.log(`${colors.bright}${colors.cyan}Running ${label}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`${colors.bright}${colors.green}✓ ${label} completed successfully${colors.reset}\n`);
    return true;
  } catch (error) {
    console.error(`${colors.bright}${colors.red}✗ ${label} failed${colors.reset}\n`);
    console.error(error);
    return false;
  }
}

/**
 * Check if a directory exists, create it if it doesn't
 * @param {string} dir - The directory to check
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`${colors.yellow}Creating directory: ${dir}${colors.reset}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Verify that no test files are included in the build output
 * @param {string} dir - The directory to check
 * @returns {boolean} - True if no test files are found, false otherwise
 */
function verifyNoTestFiles(dir) {
  console.log(`${colors.bright}${colors.cyan}Verifying no test files in build output...${colors.reset}`);
  let testFilesFound = false;
  
  function checkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Check if directory name indicates test files
        if (item === '__tests__' || item === 'test' || item === 'tests') {
          console.log(`${colors.bright}${colors.red}Found test directory in build output: ${itemPath}${colors.reset}`);
          testFilesFound = true;
        } else {
          // Recursively check subdirectories
          checkDir(itemPath);
        }
      } else if (stats.isFile()) {
        // Check if file name indicates test files
        if (item.includes('.test.') || item.includes('.spec.')) {
          console.log(`${colors.bright}${colors.red}Found test file in build output: ${itemPath}${colors.reset}`);
          testFilesFound = true;
        }
      }
    }
  }
  
  checkDir(dir);
  
  if (!testFilesFound) {
    console.log(`${colors.bright}${colors.green}✓ No test files found in build output${colors.reset}\n`);
    return true;
  }
  
  return false;
}

/**
 * Main build function
 */
async function build() {
  console.log(`\n${colors.bright}${colors.magenta}=== Building Minimax Client Library ===${colors.reset}\n`);
  
  // Clean the dist directory
  if (runCommand('npm run clean', 'Clean dist directory')) {
    
    // Ensure the dist directory exists
    ensureDirectoryExists(path.join(__dirname, 'dist'));
    
    // Run linting
    runCommand('npm run lint', 'Lint code');
    
    // Build the project
    if (runCommand('rollup -c', 'Build with Rollup')) {
      console.log(`${colors.bright}${colors.green}Build completed successfully!${colors.reset}`);
      
      // Verify no test files in the build output
      const distDir = path.join(__dirname, 'dist');
      const noTestFiles = verifyNoTestFiles(distDir);
      
      if (noTestFiles) {
        // List the generated files
        const files = fs.readdirSync(distDir);
        
        console.log(`\n${colors.bright}${colors.cyan}Generated files:${colors.reset}`);
        files.forEach(file => {
          const filePath = path.join(distDir, file);
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            const size = (stats.size / 1024).toFixed(2);
            console.log(`${colors.dim}- ${file} (${size} KB)${colors.reset}`);
          }
        });
        
        console.log(`\n${colors.bright}${colors.green}The library is ready for use!${colors.reset}`);
      } else {
        console.log(`\n${colors.bright}${colors.red}Warning: Test files were found in the build output.${colors.reset}`);
        console.log(`${colors.yellow}Please check your build configuration to ensure test files are excluded.${colors.reset}`);
      }
    }
  }
}

// Run the build
build().catch(error => {
  console.error(`${colors.bright}${colors.red}Build failed with error:${colors.reset}`, error);
  process.exit(1);
});
