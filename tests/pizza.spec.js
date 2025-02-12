import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

test('buy pizza with login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Order now' }).click();
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('1');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('diner');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await page.getByRole('button', { name: 'Pay now' }).click();
    await expect(page.getByRole('main')).toContainText('0.008 ₿');
    await expect(page.getByRole('heading')).toContainText('Here is your JWT Pizza!');
    await expect(page.getByRole('list')).toContainText('delivery');
    await expect(page.getByRole('main')).toContainText('Verify');
    await expect(page.getByRole('main')).toContainText('Order more');
    await expect(page.getByRole('main')).toContainText('order ID:');
    await expect(page.getByRole('main')).toContainText('pie count:');
    await expect(page.getByRole('main')).toContainText('total:');
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page.locator('h3')).toContainText('valid');
    await expect(page.locator('#hs-jwt-modal')).toContainText('Close');
    await page.getByRole('button', { name: 'Close' }).click();
    await page.getByRole('button', { name: 'Order more' }).click();
  });

  test('purchase with login', async ({ page }) => {
    await page.route('*/**/api/order/menu', async (route) => {
      const menuRes = [
        { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
        { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: menuRes });
    });
  
    await page.route('*/**/api/franchise', async (route) => {
      const franchiseRes = [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ];
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    });
  
    await page.route('*/**/api/auth', async (route) => {
      const loginReq = { email: 'd@jwt.com', password: 'a' };
      const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    });
  
    await page.route('*/**/api/order', async (route) => {
      const orderReq = {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
      };
      const orderRes = {
        order: {
          items: [
            { menuId: 1, description: 'Veggie', price: 0.0038 },
            { menuId: 2, description: 'Pepperoni', price: 0.0042 },
          ],
          storeId: '4',
          franchiseId: 2,
          id: 23,
        },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(orderReq);
      await route.fulfill({ json: orderRes });
    });
  
    await page.goto('/');
  
    // Go to order page
    await page.getByRole('button', { name: 'Order now' }).click();
  
    // Create order
    await expect(page.locator('h2')).toContainText('Awesome is a click away');
    await page.getByRole('combobox').selectOption('4');
    await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
    await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
    await expect(page.locator('form')).toContainText('Selected pizzas: 2');
    await page.getByRole('button', { name: 'Checkout' }).click();
  
    // Login
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('d@jwt.com');
    await page.getByPlaceholder('Email address').press('Tab');
    await page.getByPlaceholder('Password').fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
  
    // Pay
    await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
    await expect(page.locator('tbody')).toContainText('Veggie');
    await expect(page.locator('tbody')).toContainText('Pepperoni');
    await expect(page.locator('tfoot')).toContainText('0.008 ₿');
    await page.getByRole('button', { name: 'Pay now' }).click();
  
    // Check balance
    await expect(page.getByText('0.008')).toBeVisible();
  });

  test('register new user', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const requestData = await route.request().postDataJSON();
      
      const mockResponse = {
        user: {
          id: 100,
          name: 'fakename',
          email: 'fake@jwt.com',
          roles: [{ role: 'diner' }]
        },
        token: 'fake'
      };
  
      if (route.request().method() === 'POST') {
        expect(requestData).toMatchObject({
          name: 'fakename',
          email: 'fake@jwt.com',
          password: 'fake'
        });
  
        await route.fulfill({ json: mockResponse });
      } else {
        await route.continue();
      }
    });
  
    await page.goto('http://localhost:5173/');
    
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('fakename');
    await page.getByRole('textbox', { name: 'Email address' }).fill('fake@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('fake');
    await page.getByRole('button', { name: 'Register' }).click();
  
    await page.getByRole('link', { name: 'f', exact: true }).click();
    await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
    await expect(page.getByRole('main')).toContainText('name:');
    await expect(page.getByRole('main')).toContainText('fake');
    await expect(page.getByRole('main')).toContainText('email:');
    await expect(page.getByRole('main')).toContainText('fake@jwt.com');
    await expect(page.getByRole('main')).toContainText('role:');
    await expect(page.getByRole('main')).toContainText('diner');
    await expect(page.getByRole('main')).toContainText('How have you lived this long without having a pizza? Buy one now!');
    await page.getByRole('link', { name: 'Buy one' }).click();
  });


test('check if footer tab works', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('main')).toContainText('The secret sauce');
    await page.getByRole('link', { name: 'History' }).click();
    await page.getByText('Mama Rucci, my my').click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
  });


  test('create a franchise as an admin', async ({ page }) => {
    await page.route('*/**/api/auth', async (route) => {
      const requestData = await route.request().postDataJSON();
      
      const mockResponse = {
        user: {
          id: 100,
          name: 'notfake',
          email: 'notfake@jwt.com',
          roles: [{ role: 'admin' }]
        },
        token: 'notfake'
      };
  
      if (route.request().method() === 'PUT') {
        expect(requestData).toMatchObject({
          email: 'notfake@jwt.com',
          password: 'notfake'
        });
  
        await route.fulfill({ json: mockResponse });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/franchises', async (route) => {
      const requestData = await route.request().postDataJSON();
      
      const mockFranchiseResponse = {
        id: 1,
        name: 'UVU',
        adminEmail: 'notfake@jwt.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      if (route.request().method() === 'POST') {
        expect(requestData).toMatchObject({
          name: 'notfake',
          adminEmail: 'notfake@jwt.com'
        });
  
        await route.fulfill({ json: mockFranchiseResponse });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({ 
          json: [mockFranchiseResponse]
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.getByRole('heading')).toContainText('Welcome back');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('notfake@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('notfake');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByRole('list')).toContainText('home');
    await page.getByText('The web\'s best pizza', { exact: true }).click();
    await expect(page.getByRole('heading')).toContainText('The web\'s best pizza');
    await expect(page.locator('#navbar-dark')).toContainText('Admin');
    await expect(page.getByLabel('Global')).toContainText('n');
    await page.getByRole('link', { name: 'n' ,exact: true }).click();
    await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
    await expect(page.getByRole('main')).toContainText('notfake');
    await expect(page.getByRole('main')).toContainText('notfake@jwt.com');
    await expect(page.getByRole('main')).toContainText('admin');
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
    await expect(page.locator('thead')).toContainText('Franchise');
    await expect(page.locator('thead')).toContainText('Franchisee');
    await expect(page.locator('thead')).toContainText('Store');
    await expect(page.locator('thead')).toContainText('Revenue');
    await expect(page.locator('thead')).toContainText('Action');
    await expect(page.getByRole('main')).toContainText('Add Franchise');
    await page.getByRole('button', { name: 'Add Franchise' }).click();
    await expect(page.getByRole('list')).toContainText('create-franchise');
    await expect(page.getByRole('heading')).toContainText('Create franchise');
    await expect(page.locator('form')).toContainText('Want to create franchise?');
    await page.getByRole('textbox', { name: 'franchise name' }).click();
    await page.getByRole('textbox', { name: 'franchise name' }).fill('UVU');
    await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
    await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('notfake@jwt.com');
    await expect(page.locator('form')).toContainText('Create');
    await page.getByRole('button', { name: 'Create' }).click();

  });

test('test docs', async ({ page }) => {
await page.goto('http://localhost:5173/docs');
await expect(page.getByRole('list')).toContainText('docs');
await expect(page.getByRole('main')).toContainText('JWT Pizza API');
await expect(page.getByRole('main')).toContainText('[POST] /api/auth');
await expect(page.getByRole('main')).toContainText('Response');
await expect(page.getByRole('main')).toContainText('[PUT] /api/auth');
await expect(page.getByRole('main')).toContainText('🔐 [PUT] /api/auth/:userId');
await page.getByRole('heading', { name: '🔐 [DELETE] /api/auth' }).click();
await expect(page.getByRole('main')).toContainText('🔐 [DELETE] /api/auth');
await expect(page.getByRole('main')).toContainText('[GET] /api/order/menu');
await expect(page.getByRole('main')).toContainText('🔐 [PUT] /api/order/menu');
await expect(page.getByRole('main')).toContainText('🔐 [GET] /api/order');
await expect(page.getByRole('main')).toContainText('🔐 [POST] /api/order');
await expect(page.getByRole('main')).toContainText('[GET] /api/franchise');
await expect(page.getByRole('main')).toContainText('🔐 [GET] /api/franchise/:userId');
await expect(page.getByRole('main')).toContainText('🔐 [POST] /api/franchise');
await expect(page.getByRole('main')).toContainText('service: http://localhost:3000');
await expect(page.getByRole('main')).toContainText('https://pizza-factory.cs329.click');
  });

test('login and logout with mock data', async ({ page }) => {
  await page.route('**/api/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          id: '123',
          email: 'fake@fake.com',
          name: 'Test User'
        },
        token: 'fake-jwt-token'
      })
    });
  });

  await page.route('**/api/logout', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true
      })
    });
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  
  await page.getByRole('textbox', { name: 'Email address' }).fill('fake@fake.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('fake');

  await page.getByRole('button', { name: 'Login' }).click();
  
  await page.getByRole('link', { name: 'Logout' }).click();

  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});