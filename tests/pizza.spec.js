import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
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

test('test docs with mocked APIs', async ({ page }) => {
  await page.route('**/version.json', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "20000101.000000"
      })
    });
  });

  await page.route('**/api/docs', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: JSON.stringify({
        version: "20240518.154317",
        endpoints: [
          {
            "method": "POST",
            "path": "/api/auth",
            "description": "Register a new user",
            "example": "curl -X POST localhost:3000/api/auth -d '{\"name\":\"pizza diner\", \"email\":\"d@jwt.com\", \"password\":\"diner\"}' -H 'Content-Type: application/json'",
            "response": {
              "user": {
                "id": 2,
                "name": "pizza diner",
                "email": "d@jwt.com",
                "roles": [
                  {
                    "role": "diner"
                  }
                ]
              },
              "token": "tttttt"
            }
          },
          {
            "method": "PUT",
            "path": "/api/auth",
            "description": "Login existing user",
            "example": "curl -X PUT localhost:3000/api/auth -d '{\"email\":\"a@jwt.com\", \"password\":\"admin\"}' -H 'Content-Type: application/json'",
            "response": {
              "user": {
                "id": 1,
                "name": "常用名字",
                "email": "a@jwt.com",
                "roles": [
                  {
                    "role": "admin"
                  }
                ]
              },
              "token": "tttttt"
            }
          },
          {
            "method": "PUT",
            "path": "/api/auth/:userId",
            "requiresAuth": true,
            "description": "Update user",
            "example": "curl -X PUT localhost:3000/api/auth/1 -d '{\"email\":\"a@jwt.com\", \"password\":\"admin\"}' -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt'",
            "response": {
              "id": 1,
              "name": "常用名字",
              "email": "a@jwt.com",
              "roles": [
                {
                  "role": "admin"
                }
              ]
            }
          },
          {
            "method": "DELETE",
            "path": "/api/auth",
            "requiresAuth": true,
            "description": "Logout a user",
            "example": "curl -X DELETE localhost:3000/api/auth -H 'Authorization: Bearer tttttt'",
            "response": {
              "message": "logout successful"
            }
          },
          {
            "method": "GET",
            "path": "/api/order/menu",
            "description": "Get the pizza menu",
            "example": "curl localhost:3000/api/order/menu",
            "response": [
              {
                "id": 1,
                "title": "Veggie",
                "image": "pizza1.png",
                "price": 0.0038,
                "description": "A garden of delight"
              }
            ]
          },
          {
            "method": "PUT",
            "path": "/api/order/menu",
            "requiresAuth": true,
            "description": "Add an item to the menu",
            "example": "curl -X PUT localhost:3000/api/order/menu -H 'Content-Type: application/json' -d '{ \"title\":\"Student\", \"description\": \"No topping, no sauce, just carbs\", \"image\":\"pizza9.png\", \"price\": 0.0001 }'  -H 'Authorization: Bearer tttttt'",
            "response": [
              {
                "id": 1,
                "title": "Student",
                "description": "No topping, no sauce, just carbs",
                "image": "pizza9.png",
                "price": 0.0001
              }
            ]
          },
          {
            "method": "GET",
            "path": "/api/order",
            "requiresAuth": true,
            "description": "Get the orders for the authenticated user",
            "example": "curl -X GET localhost:3000/api/order  -H 'Authorization: Bearer tttttt'",
            "response": {
              "dinerId": 4,
              "orders": [
                {
                  "id": 1,
                  "franchiseId": 1,
                  "storeId": 1,
                  "date": "2024-06-05T05:14:40.000Z",
                  "items": [
                    {
                      "id": 1,
                      "menuId": 1,
                      "description": "Veggie",
                      "price": 0.05
                    }
                  ]
                }
              ],
              "page": 1
            }
          },
          {
            "method": "POST",
            "path": "/api/order",
            "requiresAuth": true,
            "description": "Create a order for the authenticated user",
            "example": "curl -X POST localhost:3000/api/order -H 'Content-Type: application/json' -d '{\"franchiseId\": 1, \"storeId\":1, \"items\":[{ \"menuId\": 1, \"description\": \"Veggie\", \"price\": 0.05 }]}'  -H 'Authorization: Bearer tttttt'",
            "response": {
              "order": {
                "franchiseId": 1,
                "storeId": 1,
                "items": [
                  {
                    "menuId": 1,
                    "description": "Veggie",
                    "price": 0.05
                  }
                ],
                "id": 1
              },
              "jwt": "1111111111"
            }
          },
          {
            "method": "GET",
            "path": "/api/franchise",
            "description": "List all the franchises",
            "example": "curl localhost:3000/api/franchise",
            "response": [
              {
                "id": 1,
                "name": "pizzaPocket",
                "admins": [
                  {
                    "id": 4,
                    "name": "pizza franchisee",
                    "email": "f@jwt.com"
                  }
                ],
                "stores": [
                  {
                    "id": 1,
                    "name": "SLC",
                    "totalRevenue": 0
                  }
                ]
              }
            ]
          },
          {
            "method": "GET",
            "path": "/api/franchise/:userId",
            "requiresAuth": true,
            "description": "List a user's franchises",
            "example": "curl localhost:3000/api/franchise/4  -H 'Authorization: Bearer tttttt'",
            "response": [
              {
                "id": 2,
                "name": "pizzaPocket",
                "admins": [
                  {
                    "id": 4,
                    "name": "pizza franchisee",
                    "email": "f@jwt.com"
                  }
                ],
                "stores": [
                  {
                    "id": 4,
                    "name": "SLC",
                    "totalRevenue": 0
                  }
                ]
              }
            ]
          },
          {
            "method": "POST",
            "path": "/api/franchise",
            "requiresAuth": true,
            "description": "Create a new franchise",
            "example": "curl -X POST localhost:3000/api/franchise -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt' -d '{\"name\": \"pizzaPocket\", \"admins\": [{\"email\": \"f@jwt.com\"}]}'",
            "response": {
              "name": "pizzaPocket",
              "admins": [
                {
                  "email": "f@jwt.com",
                  "id": 4,
                  "name": "pizza franchisee"
                }
              ],
              "id": 1
            }
          }
        ],
        config: {
          factory: "https://pizza-factory.cs329.click",
          db: "127.0.0.1"
        }
      })
    });
  });

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

test('login and logout with mocked data', async ({ page }) => {
  await page.route('**/version.json', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "20000101.000000"
      })
    });
  });

  await page.route('**/api/auth', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "user": {
          "id": 808,
          "name": "test",
          "email": "test@test.com",
          "roles": [
            {
              "role": "diner"
            }
          ]
        },
        "token": "testtoken"
      })
    });
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('test@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});


test('franchise create and delete as admin', async ({ page }) => {
  await page.route('**/version.json', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "20000101.000000"
      })
    });
  });

  await page.route('**/api/auth', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "user": {
          "id": 100,
          "name": "testadmin",
          "email": "testadmin@test.com",
          "roles": [
            {
              "role": "admin"
            },
            {
              "objectId": 10,
              "role": "franchisee"
            },
          ]
        },
        "token": "testadmin"
      })
    });
  });

  let isFirstGet = true;

  await page.route('**/api/franchise', async route => {
    const method = route.request().method();
    
    if (method === 'GET') {
      if (isFirstGet) {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            {
              "id": 20,
              "name": "testfranchise",
              "admins": [
                {
                  "id": 1,
                  "name": "testadmin",
                  "email": "testadmin@test.com"
                }
              ],
              "stores": []
            },
            {
              "id": 16,
              "name": "kitty",
              "admins": [
                {
                  "id": 1,
                  "name": "testadmin",
                  "email": "testadmin@test.com"
                }
              ],
              "stores": []
            }
          ])
        });
        isFirstGet = false;
      } else {
        // Second GET response after creating franchise
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([
            {
              "id": 21,
              "name": "mikan",
              "admins": [
                {
                  "id": 100,
                  "name": "testadmin",
                  "email": "testadmin@test.com"
                }
              ],
              "stores": []
            },
            {
              "id": 20,
              "name": "testfranchise",
              "admins": [
                {
                  "id": 1,
                  "name": "testadmin",
                  "email": "testadmin@test.com"
                }
              ],
              "stores": []
            },
            {
              "id": 16,
              "name": "kitty",
              "admins": [
                {
                  "id": 1,
                  "name": "testadmin",
                  "email": "testadmin@test.com"
                }
              ],
              "stores": []
            }
          ])
        });
      }
    } else if (method === 'POST') {
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Origin': 'http://localhost:5173',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "name": "mikan",
          "admins": [
            {
              "email": "testadmin@test.com",
              "id": 100,
              "name": "testadmin"
            }
          ],
          "id": 21
        })
      });
    }
  });

  await page.route('**/api/franchise/21', async route => {
    await route.fulfill({
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "message": "franchise deleted"
      })
    });
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('testadmin@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('mikan');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('testadmin@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByRole('row', { name: 'mikan testadmin Close' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('list')).toContainText('close-franchise');
  await page.getByRole('button', { name: 'Close' }).click();
});
