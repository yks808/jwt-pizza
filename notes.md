# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | home.tsx           | none              | none         |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx       | [POST] /api/auth  | INSERT INTO user (name, email, password) VALUES (?, ?, ?) <br> INSERT INTO auth (token, userId) VALUES (?, ?)|
| Login new user<br/>(t@jwt.com, pw: test)            |login.tsx           | [PUT] /api/auth   | SELECT * FROM user WHERE email=? <br> SELECT * FROM userRole WHERE userId=? <br> INSERT INTO auth (token, userId) VALUES (?, ?)|
| Order pizza                                         | menu.tsx <br><br> payment.tsx| [GET] /api/order/menu <br> [GET] /api/franchise <br><br> [POST] /api/order| SELECT * FROM menu <br> SELECT id, name FROM franchise <br><br>INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now()) <br> INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)|
| Verify pizza                                        | delivery.tsx       | [POST] pizzaFactoryUrl + /api/order/verify| none|
| View profile page                                   | dinerDashboard.tsx | [GET] /api/order  | SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=? LIMIT <br> SELECT id, menuId, description, price FROM orderItem WHERE orderId=?|
| View franchise<br/>(as diner)                       | franchiseDashboad.tsx|/api/franchise/${user.id}| SELECT objectId FROM userRole WHERE role='franchisee'|
| Logout                                              | logout.tsx         |[DELETE] /api/auth  | DELETE FROM auth WHERE token=?|
| View About page                                     |                    |                   |              |
| View History page                                   |                    |                   |              |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          | [PUT] /api/auth    | SELECT * FROM user WHERE email=? <br> SELECT * FROM userRole WHERE userId=?|
| View franchise<br/>(as franchisee)                  |                    |                   |              |
| Create a store                                      |                    |                   |              |
| Close a store                                       |                    |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | [PUT] /api/auth    | SELECT * FROM user WHERE email=? <br> SELECT * FROM userRole WHERE userId=?|
| View Admin page                                     |                    |                   |              |
| Create a franchise for t@jwt.com                    |                    |                   |              |
| Close the franchise for t@jwt.com                   |                    |                   |              |
