/**
 * Example script for creating and issuing an invoice using the Minimax client
 * 
 * This script demonstrates how to use the Minimax client to get all invoices.
 * It uses environment variables for authentication credentials.
 * 
 * To run this script:
 * 1. Create a .env file with your Minimax credentials (see .env.example)
 * 2. Run the script: npm run example:invoice
 */

// Load environment variables
require('dotenv').config();

// Import the MinimaxClient
const { MinimaxClient } = require('../dist/index');

// Check for required environment variables
const requiredEnvVars = [
  'MINIMAX_CLIENT_ID',
  'MINIMAX_CLIENT_SECRET',
  'MINIMAX_USERNAME',
  'MINIMAX_PASSWORD'
];

// Optional environment variables
const optionalEnvVars = [
  'ORGANIZATION_IDENTIFIER'
];

// Log optional variables if present
for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`Found optional environment variable: ${envVar}`);
  }
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: Missing required environment variable ${envVar}`);
    console.error('Please create a .env file with your Minimax credentials (see .env.example)');
    process.exit(1);
  }
}

async function main() {
  // Initialize the client with credentials from environment variables
  const client = new MinimaxClient({
    clientId: process.env.MINIMAX_CLIENT_ID,
    clientSecret: process.env.MINIMAX_CLIENT_SECRET,
    username: process.env.MINIMAX_USERNAME,
    password: process.env.MINIMAX_PASSWORD,
    organizationIdentifier: process.env.ORGANIZATION_IDENTIFIER
  });

  try {
    console.log('Authenticating with Minimax API...');
    await client.authenticate();
    console.log('Authentication successful');
    
    // Get all received invoices
    console.log('Getting all received invoices...');
    const invoices = await client.receivedInvoices.getAll();
    console.log('Received invoices:', JSON.stringify(invoices, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
