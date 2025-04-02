import { test, expect, beforeAll, afterAll } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import dbService from './dbService'; // Import the singleton instance

const testDbPath = path.resolve('./test_resume_app.db'); // Absolute path for reliability

// Ensure NODE_ENV is set correctly for the dbService initialization logic
process.env.NODE_ENV = 'test';

beforeAll(() => {
  // Clean up any old test database file before starting
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
    console.log(`Deleted existing test database: ${testDbPath}`);
  }
  // dbService instance is created automatically when imported, 
  // using the test DB path because NODE_ENV is 'test'.
  // We just need to ensure it's ready.
  console.log(`Test database initialized at: ${testDbPath}`);
});

afterAll(() => {
  // Close the database connection
  dbService.close(); 
  // Clean up the test database file after all tests run
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
    console.log(`Deleted test database: ${testDbPath}`);
  } else {
    console.log(`Test database file not found for deletion: ${testDbPath}`);
  }
  // Reset NODE_ENV to its original state or undefined
  process.env.NODE_ENV = undefined; 
});

test.describe('DbService Work History', () => {
  test('should get initial work history if available', () => {
    // The initial history is inserted during initialization if the setting doesn't exist.
    // We rely on the import '../../data/workHistory' having some default content.
    const initialHistory = dbService.getWorkHistory();
    // Check if it's a string (meaning it was found and read)
    expect(typeof initialHistory).toBe('string'); 
    // You might add a more specific check based on expected initial content if desired
    expect(initialHistory?.length).toBeGreaterThan(0); 
  });

  test('should save and retrieve updated work history', () => {
    const newWorkHistory = `
# Updated Work History - ${new Date().toISOString()}

## Company B
- Position: Senior Developer
- Dates: 2020 - Present
- Responsibilities: Led team, developed features.

## Company A
- Position: Junior Developer
- Dates: 2018 - 2020
- Responsibilities: Fixed bugs, learned stuff.
    `;

    // Save the new work history
    const saveResult = dbService.saveWorkHistory(newWorkHistory);
    expect(saveResult).toBe(true); // Check if save operation reported success

    // Retrieve the work history
    const retrievedHistory = dbService.getWorkHistory();

    // Verify the retrieved content matches the saved content
    expect(retrievedHistory).toBe(newWorkHistory);
  });

  test('should update existing work history', () => {
    const firstUpdate = "Initial content for update test.";
    const secondUpdate = `Second update. Replaced first. ${Date.now()}`;

    // First save
    expect(dbService.saveWorkHistory(firstUpdate)).toBe(true);
    expect(dbService.getWorkHistory()).toBe(firstUpdate);

    // Second save (should overwrite)
    expect(dbService.saveWorkHistory(secondUpdate)).toBe(true);
    expect(dbService.getWorkHistory()).toBe(secondUpdate);
  });
}); 