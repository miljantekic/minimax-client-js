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
    
    // Get all received invoices
    const journals = await client.journals.getAll({
        dateFrom: '2025-04-29',
        dateTo: '2025-04-29',
        journalType: 'BT',
    });
    console.log('Journals:', journals.length);

    const journalEntries = await client.journals.getAllJournalEntries({
        dateFrom: '2025-04-29',
        dateTo: '2025-04-29',
        journalType: 'BT',
    });
    console.log('Journal entries:', journalEntries.length);

    const journalTypes = await client.journalTypes.getAll();

    console.log(JSON.stringify(journalTypes, null, 2))
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
