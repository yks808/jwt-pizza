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
| View franchise<br/>(as diner)                       | franchiseDashboad.tsx| [GET] /api/franchise/${user.id}| SELECT objectId FROM userRole WHERE role='franchisee'|
| Logout                                              | logout.tsx         |[DELETE] /api/auth | SELECT userId FROM auth WHERE token=? <br> DELETE FROM auth WHERE token=?|
| View About page                                     | about.tsx          |  none             | none         |
| View History page                                   | historty.tsx       |  none             | none         |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          | [PUT] /api/auth   | SELECT * FROM user WHERE email=? <br> SELECT * FROM userRole WHERE userId=? <br> INSERT INTO auth (token, userId) VALUES (?, ?)|
| View franchise<br/>(as franchisee)                  |                    | [GET] /api/franchise/${user.id}  | SELECT objectId FROM userRole WHERE role='franchisee' AND userId=? <br> SELECT id, name FROM franchise WHERE id in (${franchiseIds.join(',')}) <br> SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee'  |
| Create a store                                      | createStore.tsx  <br><br>  franchiseDashboad.tsx | [POST] /api/franchise/${franchise.id}/store <br><br> [GET] /api/franchise/${user.id}| INSERT INTO store (franchiseId, name) VALUES (?, ?) <br><br> SELECT objectId FROM userRole WHERE role='franchisee' AND userId=? <br> SELECT id, name FROM franchise WHERE id in (${franchiseIds.join(',')}) <br> SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee'|
| Close a store                                       | closeStore.tsx| [DElETE] /api/franchise/${franchise.id}/store/${store.id}`|          DELETE FROM store WHERE franchiseId=? AND id=?|
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | [PUT] /api/auth    | SELECT * FROM user WHERE email=? <br> SELECT * FROM userRole WHERE userId=? <br> INSERT INTO auth (token, userId) VALUES (?, ?)|
| View Admin page                                     | adminDashboad.tsx  | [GET] /api/franchise| SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee'|
| Create a franchise for t@jwt.com                    | createFranchise.tsx| [POST] /api/franchise <br> [GET] /api/franchise      | SELECT id, name FROM user WHERE email=? <br> INSERT INTO franchise (name) VALUES (?) <br> INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?) <br> SELECT id, name FROM franchise<br> SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx | [DELETE] /api/franchise/${franchise.id} <br> [GET] /api/franchise  | DELETE FROM store WHERE franchiseId=? <br> DELETE FROM userRole WHERE objectId=? <br> DELETE FROM franchise WHERE id=? <br> SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee' <br>           | 
