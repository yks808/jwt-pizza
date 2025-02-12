import { test, expect } from '@playwright/test';

test('franchise dashboad without login', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('list')).toContainText('franchise-dashboard');
  await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
  await expect(page.getByRole('alert')).toContainText('If you are already a franchisee, pleaseloginusing your franchise account');
  await expect(page.locator('thead')).toContainText('Year');
  await page.getByRole('columnheader', { name: 'Profit' }).click();
  await expect(page.locator('thead')).toContainText('Profit');
  await expect(page.locator('thead')).toContainText('Costs');
  await expect(page.locator('thead')).toContainText('Franchise Fee');
  await page.getByRole('heading', { name: 'Unleash Your Potential' }).click();
  await expect(page.getByRole('main')).toContainText('Unleash Your Potential');
  await page.getByRole('link', { name: '-555-5555' }).click();
  await page.getByRole('link', { name: 'login', exact: true }).click();
});