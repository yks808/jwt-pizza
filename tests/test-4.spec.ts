import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('fake@fake.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('fake');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
  await page.getByRole('link', { name: 'Logout' }).click();
});

test.describe('Logout functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the logout API endpoint
    await page.route('**/api/logout', async (route) => {
      await route.fulfill({ 
        status: 200,
        body: JSON.stringify({ success: true })
      });
    });

    // Mock the login API endpoint for setup
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          success: true,
          user: { email: 'fake@fake.com', name: 'Test User' }
        })
      });
    });
  });

  test('should successfully logout and redirect to home page', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:5173/');
    
    // Login first (setup)
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('fake@fake.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('fake');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify user is logged in
    await expect(page.locator('#navbar-dark')).toContainText('Logout');
    
    // Start monitoring network requests
    const logoutPromise = page.waitForResponse('**/api/logout');
    
    // Click logout
    await page.getByRole('link', { name: 'Logout' }).click();
    
    // Wait for the logout API call to complete
    const logoutResponse = await logoutPromise;
    expect(logoutResponse.status()).toBe(200);
    
    // Verify redirect to home page
    await expect(page).toHaveURL('http://localhost:5173/');
    
    // Verify login button is visible (user is logged out)
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    
    // Verify logout link is no longer visible
    await expect(page.locator('#navbar-dark')).not.toContainText('Logout');
  });

  test('should handle logout API failure', async ({ page }) => {
    // Override the logout mock for this specific test
    await page.route('**/api/logout', async (route) => {
      await route.fulfill({ 
        status: 500,
        body: JSON.stringify({ success: false, message: 'Server error' })
      });
    });

    // Go to homepage
    await page.goto('http://localhost:5173/');
    
    // Login first (setup)
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('fake@fake.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('fake');
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Start monitoring network requests
    const logoutPromise = page.waitForResponse('**/api/logout');
    
    // Click logout
    await page.getByRole('link', { name: 'Logout' }).click();
    
    // Wait for the logout API call to complete
    const logoutResponse = await logoutPromise;
    expect(logoutResponse.status()).toBe(500);
    
    // Verify error message is shown (assuming you have error handling UI)
    await expect(page.locator('.error-message')).toBeVisible();
  });
});