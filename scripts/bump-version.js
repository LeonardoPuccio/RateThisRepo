/**
 * Version bumping script for RateThisRepo
 * 
 * This script automatically updates the version in both package.json and manifest.json
 * Usage: node bump-version.js [patch|minor|major]
 */

const fs = require('fs');
const path = require('path');

// Function to read JSON file
function readJsonFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// Function to write JSON file
function writeJsonFile(filePath, content) {
  const stringContent = JSON.stringify(content, null, 2);
  fs.writeFileSync(filePath, stringContent);
}

// Function to increment version
function incrementVersion(version, type) {
  const parts = version.split('.').map(part => parseInt(part, 10));
  
  switch (type) {
    case 'major':
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1] += 1;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2] += 1;
      break;
  }
  
  return parts.join('.');
}

// Main function
function bumpVersion() {
  try {
    // Get version bump type from command line args
    const bumpType = process.argv[2] || 'patch';
    
    if (!['patch', 'minor', 'major'].includes(bumpType)) {
      console.error('Invalid bump type. Use "patch", "minor", or "major".');
      process.exit(1);
    }
    
    // File paths
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const manifestJsonPath = path.join(__dirname, '..', 'src', 'manifest.json');
    
    // Read files
    const packageJson = readJsonFile(packageJsonPath);
    const manifestJson = readJsonFile(manifestJsonPath);
    
    // Current versions
    const currentPackageVersion = packageJson.version;
    const currentManifestVersion = manifestJson.version;
    
    console.log(`Current package.json version: ${currentPackageVersion}`);
    console.log(`Current manifest.json version: ${currentManifestVersion}`);
    
    // Calculate new version
    const newVersion = incrementVersion(currentPackageVersion, bumpType);
    console.log(`Bumping ${bumpType} version to: ${newVersion}`);
    
    // Update versions
    packageJson.version = newVersion;
    manifestJson.version = newVersion;
    
    // Write files
    writeJsonFile(packageJsonPath, packageJson);
    writeJsonFile(manifestJsonPath, manifestJson);
    
    console.log('Version successfully updated in both files!');
  } catch (error) {
    console.error('Error updating version:', error);
    process.exit(1);
  }
}

// Run the function
bumpVersion();
