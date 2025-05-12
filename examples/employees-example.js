/**
 * Example script for working with employees using the Minimax client
 * 
 * This script demonstrates how to use the Minimax client to get all employees,
 * filter employees, and perform other employee-related operations.
 * It uses environment variables for authentication credentials.
 * 
 * To run this script:
 * 1. Create a .env file with your Minimax credentials (see .env.example)
 * 2. Run the script: npm run example:employees
 */

// Load environment variables
require('dotenv').config();

// Import the MinimaxClient
const { MinimaxClient } = require('../dist/index');

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
    await client.authenticate();
    
    // Get all employees
    const employees = await client.employees.getAll();
    console.log('Employees:', JSON.stringify(employees, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
