# Boardly Backend Postman Test Plan - Updated Version

## Base URL

```txt
http://localhost:8001
```

In Postman, create an environment and add:

```txt
base_url = http://localhost:8001
access_token =
refresh_token =
user1_access_token =
user2_access_token =
user3_access_token =
super_admin_access_token =
board_id =
list1_id =
list2_id =
card1_id =
card2_id =
label_id =
comment_id =
member_id =
invitation_id =
user2_id =
```

---

## Global Headers

For protected endpoints use:

```txt
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

For User 1 requests:

```txt
Authorization: Bearer {{user1_access_token}}
```

For User 2 requests:

```txt
Authorization: Bearer {{user2_access_token}}
```

For Super Admin requests:

```txt
Authorization: Bearer {{super_admin_access_token}}
```

---

# 1. Authentication

## 1.1 Signup User 1 / Owner

```http
POST {{base_url}}/api/auth/signup
```

Body:

```json
{
  "name": "Mais",
  "email": "mais2004@gmail.com",
  "password": "12345678"
}
```

Expected:

```txt
201 Created
```

Save from response:

```txt
user1_access_token = data.access_token
refresh_token = data.refresh_token
```

---

## 1.2 Login User 1 / Owner

```http
POST {{base_url}}/api/auth/login
```

Body:

```json
{
  "email": "mais2004@gmail.com",
  "password": "12345678"
}
```

Expected:

```txt
200 OK
```

Save:

```txt
user1_access_token = data.access_token
refresh_token = data.refresh_token
```

---

## 1.3 Login With Non-existing Account

```http
POST {{base_url}}/api/auth/login
```

Body:

```json
{
  "email": "notfound@gmail.com",
  "password": "12345678"
}
```

Expected:

```txt
401 Unauthorized
This account does not exist. Please sign up first.
```

---

## 1.4 Login With Wrong Password

```http
POST {{base_url}}/api/auth/login
```

Body:

```json
{
  "email": "mais2004@gmail.com",
  "password": "wrongpassword"
}
```

Expected:

```txt
401 Unauthorized
Incorrect password. Please try again.
```

---

## 1.5 Get Current User

```http
GET {{base_url}}/api/auth/me
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 1.6 Refresh Token

```http
POST {{base_url}}/api/auth/refresh
```

Headers:

```txt
Authorization: Bearer {{refresh_token}}
```

Expected:

```txt
200 OK
```

---

## 1.7 Logout

```http
POST {{base_url}}/api/auth/logout
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

After logout, test any protected endpoint with the same token. It should fail.

---

# 2. Boards CRUD

## 2.1 Create Board

Use User 1 token.

```http
POST {{base_url}}/api/boards
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "Graduation Project",
  "description": "Boardly backend and frontend tasks",
  "background_color": "#0f4c81"
}
```

Expected:

```txt
201 Created
```

Save:

```txt
board_id = data.id
```

Important expected data:

```txt
role = owner
members_count = 1
```

---

## 2.2 Get My Boards

```http
GET {{base_url}}/api/boards
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 2.3 Get Board By ID

```http
GET {{base_url}}/api/boards/{{board_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 2.4 Update Board

```http
PATCH {{base_url}}/api/boards/{{board_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "Updated Graduation Project",
  "description": "Updated board description",
  "background_color": "#7c3aed"
}
```

Expected:

```txt
200 OK
```

---

# 3. Members and Invitations

## 3.1 Signup User 2 / Collaborator

```http
POST {{base_url}}/api/auth/signup
```

Body:

```json
{
  "name": "Sara",
  "email": "sara@gmail.com",
  "password": "12345678"
}
```

Save:

```txt
user2_id = data.user.id
user2_access_token = data.access_token
```

---

## 3.2 Login User 2

```http
POST {{base_url}}/api/auth/login
```

Body:

```json
{
  "email": "sara@gmail.com",
  "password": "12345678"
}
```

Save:

```txt
user2_access_token = data.access_token
```

---

## 3.3 Invite User 2 To Board

Use User 1 token.

```http
POST {{base_url}}/api/boards/{{board_id}}/invitations
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "email": "sara@gmail.com",
  "role": "editor"
}
```

Expected:

```txt
201 Created or 200 OK
```

Save:

```txt
invitation_id = data.id
```

Note:

The newer flow supports accepting invitations by invitation ID using `/api/invitations/me/{{invitation_id}}/accept`.

---

## 3.4 Get My Invitations As User 2

```http
GET {{base_url}}/api/invitations/me
```

Headers:

```txt
Authorization: Bearer {{user2_access_token}}
```

Expected:

```txt
200 OK
```

Save:

```txt
invitation_id = data[0].id
```

---

## 3.5 Accept Invitation As User 2 - New Flow

```http
POST {{base_url}}/api/invitations/me/{{invitation_id}}/accept
```

Headers:

```txt
Authorization: Bearer {{user2_access_token}}
```

Expected:

```txt
200 OK
```

Expected response:

```txt
data.role = editor
```

---

## 3.6 Decline Invitation As User 2

Only test this with another pending invitation.

```http
POST {{base_url}}/api/invitations/me/{{invitation_id}}/decline
```

Headers:

```txt
Authorization: Bearer {{user2_access_token}}
```

Expected:

```txt
200 OK
```

---

## 3.7 Get Board Members

Use User 1 token.

```http
GET {{base_url}}/api/boards/{{board_id}}/members
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

Save User 2 membership id:

```txt
member_id = data member where user.email = sara@gmail.com
```

---

## 3.8 Update Member Role To Viewer

Use User 1 token.

```http
PATCH {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "role": "viewer"
}
```

Expected:

```txt
200 OK
```

---

## 3.9 Permission Test - Viewer Cannot Create List

Use User 2 token after changing role to viewer.

```http
POST {{base_url}}/api/boards/{{board_id}}/lists
```

Headers:

```txt
Authorization: Bearer {{user2_access_token}}
```

Body:

```json
{
  "title": "Should Fail"
}
```

Expected:

```txt
403 Forbidden
```

---

## 3.10 Update Member Back To Editor

Use User 1 token.

```http
PATCH {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "role": "editor"
}
```

Expected:

```txt
200 OK
```

---

# 4. Lists CRUD

## 4.1 Create List 1

Use Owner or Editor token.

```http
POST {{base_url}}/api/boards/{{board_id}}/lists
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "To Do"
}
```

Save:

```txt
list1_id = data.id
```

---

## 4.2 Create List 2

```http
POST {{base_url}}/api/boards/{{board_id}}/lists
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "In Progress"
}
```

Save:

```txt
list2_id = data.id
```

---

## 4.3 Get Board Lists

```http
GET {{base_url}}/api/boards/{{board_id}}/lists
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 4.4 Get Single List

```http
GET {{base_url}}/api/lists/{{list1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 4.5 Update List

```http
PATCH {{base_url}}/api/lists/{{list1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "Backlog"
}
```

Expected:

```txt
200 OK
```

---

## 4.6 Reorder Lists

```http
PATCH {{base_url}}/api/boards/{{board_id}}/lists/reorder
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "lists": [
    {
      "id": "{{list1_id}}",
      "position": 1
    },
    {
      "id": "{{list2_id}}",
      "position": 0
    }
  ]
}
```

Expected:

```txt
200 OK
```

---

# 5. Cards CRUD and Move Logic

## 5.1 Create Card 1

```http
POST {{base_url}}/api/lists/{{list1_id}}/cards
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "Design database schema",
  "description": "Create tables and relationships",
  "due_date": "2026-06-01T12:00:00+00:00"
}
```

Save:

```txt
card1_id = data.id
```

---

## 5.2 Create Card 2

```http
POST {{base_url}}/api/lists/{{list1_id}}/cards
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "Implement auth APIs",
  "description": "Signup, login, refresh, logout"
}
```

Save:

```txt
card2_id = data.id
```

---

## 5.3 Get Cards In List

```http
GET {{base_url}}/api/lists/{{list1_id}}/cards
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 5.4 Get Single Card

```http
GET {{base_url}}/api/cards/{{card1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 5.5 Update Card

```http
PATCH {{base_url}}/api/cards/{{card1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "title": "Updated database schema task",
  "description": "Updated description",
  "due_date": "2026-06-05T15:30:00+00:00"
}
```

Expected:

```txt
200 OK
```

---

## 5.6 Move Card To Another List

```http
PATCH {{base_url}}/api/cards/{{card1_id}}/move
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "target_list_id": "{{list2_id}}",
  "position": 0
}
```

Expected:

```txt
200 OK
```

---

# 6. Assignees

## 6.1 Add Assignee

```http
POST {{base_url}}/api/cards/{{card1_id}}/assignees
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "user_id": "{{user2_id}}"
}
```

Expected:

```txt
200 OK
```

Expected:

```txt
data.assignees contains Sara
```

---

## 6.2 Remove Assignee

```http
DELETE {{base_url}}/api/cards/{{card1_id}}/assignees/{{user2_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

# 7. Labels

## 7.1 Create Label

```http
POST {{base_url}}/api/boards/{{board_id}}/labels
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "name": "Urgent",
  "color": "#FF0000"
}
```

Save:

```txt
label_id = data.id
```

---

## 7.2 Get Board Labels

```http
GET {{base_url}}/api/boards/{{board_id}}/labels
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 7.3 Apply Label To Card

```http
POST {{base_url}}/api/cards/{{card1_id}}/labels
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "label_id": "{{label_id}}"
}
```

Expected:

```txt
200 OK
```

---

## 7.4 Get Card With Labels

```http
GET {{base_url}}/api/cards/{{card1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

Expected:

```txt
data.labels contains Urgent
```

---

## 7.5 Remove Label From Card

```http
DELETE {{base_url}}/api/cards/{{card1_id}}/labels/{{label_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

# 8. Comments

## 8.1 Create Comment

```http
POST {{base_url}}/api/cards/{{card1_id}}/comments
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "content": "This task should be finished today."
}
```

Save:

```txt
comment_id = data.id
```

Expected:

```txt
201 Created
```

Expected response now includes:

```txt
data.user.name
data.user.email
```

---

## 8.2 Get Card Comments

```http
GET {{base_url}}/api/cards/{{card1_id}}/comments
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 8.3 Delete Comment

```http
DELETE {{base_url}}/api/comments/{{comment_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

# 9. Admin Panel Tests

These endpoints require a user with:

```txt
role = super_admin
```

If you do not have a super admin yet, update a user in the database or create a seed.

---

## 9.1 Get Admin Users

```http
GET {{base_url}}/api/admin/users
```

Headers:

```txt
Authorization: Bearer {{super_admin_access_token}}
```

Expected:

```txt
200 OK
```

---

## 9.2 Update User Role

```http
PATCH {{base_url}}/api/admin/users/{{user2_id}}
```

Headers:

```txt
Authorization: Bearer {{super_admin_access_token}}
```

Body:

```json
{
  "role": "user"
}
```

Expected:

```txt
200 OK
```

---

## 9.3 Get Admin Boards

```http
GET {{base_url}}/api/admin/boards
```

Headers:

```txt
Authorization: Bearer {{super_admin_access_token}}
```

Expected:

```txt
200 OK
```

---

## 9.4 Delete Board As Super Admin

```http
DELETE {{base_url}}/api/admin/boards/{{board_id}}
```

Headers:

```txt
Authorization: Bearer {{super_admin_access_token}}
```

Expected:

```txt
200 OK
```

Important:

This should delete the board and related:

```txt
members
invitations
lists
cards
comments
labels
card_labels
card_assignees
```

---

# 10. Negative / Security Tests

## 10.1 Request Without Token

```http
GET {{base_url}}/api/boards
```

Expected:

```txt
401 Unauthorized
```

---

## 10.2 Invalid Board ID

```http
GET {{base_url}}/api/boards/00000000-0000-0000-0000-000000000000
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
404 Not Found
```

---

## 10.3 Duplicate Label Name

```http
POST {{base_url}}/api/boards/{{board_id}}/labels
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "name": "Urgent",
  "color": "#00FF00"
}
```

Expected:

```txt
409 Conflict
```

---

## 10.4 Duplicate Pending Invitation

```http
POST {{base_url}}/api/boards/{{board_id}}/invitations
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "email": "sara@gmail.com",
  "role": "editor"
}
```

Expected:

```txt
409 Conflict
```

This only applies if Sara already has a pending invitation and has not accepted it yet.

---

## 10.5 Accept Invitation With Wrong Account

Create another user who is not the invited email, then use that token:

```http
POST {{base_url}}/api/invitations/me/{{invitation_id}}/accept
```

Expected:

```txt
403 or 400
```

---

## 10.6 Apply Label From Another Board

Use a label id from a different board:

```http
POST {{base_url}}/api/cards/{{card1_id}}/labels
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Body:

```json
{
  "label_id": "LABEL_FROM_ANOTHER_BOARD"
}
```

Expected:

```txt
400 Bad Request
```

---

## 10.7 Viewer Cannot Move Card

After changing Sara to viewer:

```http
PATCH {{base_url}}/api/cards/{{card1_id}}/move
```

Headers:

```txt
Authorization: Bearer {{user2_access_token}}
```

Body:

```json
{
  "target_list_id": "{{list2_id}}",
  "position": 0
}
```

Expected:

```txt
403 Forbidden
```

---

## 10.8 Viewer Cannot Add Comment

If viewer role does not include comment permission:

```http
POST {{base_url}}/api/cards/{{card1_id}}/comments
```

Headers:

```txt
Authorization: Bearer {{user2_access_token}}
```

Body:

```json
{
  "content": "Viewer should not be able to comment."
}
```

Expected:

```txt
403 Forbidden
```

Note:

If your current permissions allow viewers to comment, update this expected result accordingly.

---

# 11. Cleanup

## 11.1 Delete Card

```http
DELETE {{base_url}}/api/cards/{{card1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 11.2 Delete List

```http
DELETE {{base_url}}/api/lists/{{list1_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 11.3 Delete Member

```http
DELETE {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

## 11.4 Delete Board

```http
DELETE {{base_url}}/api/boards/{{board_id}}
```

Headers:

```txt
Authorization: Bearer {{user1_access_token}}
```

Expected:

```txt
200 OK
```

---

# 12. Realtime Manual Test

Socket events are not usually tested in Postman like REST endpoints, but you can manually test them from the frontend:

1. Open the same board in two browsers or two accounts.
2. In Account 1, create a list.
3. Account 2 should see the list after realtime invalidation.
4. In Account 1, create a card.
5. Account 2 should see the new card.
6. In Account 1, add a comment.
7. Account 2 should see the updated activity/comments.

Expected backend events:

```txt
list.created
card.created
card.updated
card.moved
comment.created
member.role.updated
board.deleted
```

---

# 13. Final Testing Checklist

Before submission, verify:

```txt
Signup works
Login works
Logout blocks token
Create board works
Board role is owner
Invite member works
Accept invitation by ID works
Viewer cannot edit
Editor can create list/card/comment
Drag and drop saves position
Labels work
Assignees work
Comments show user data
Admin users page works
Admin boards page works
Delete board works with cascade
Realtime updates work between two browsers
```
