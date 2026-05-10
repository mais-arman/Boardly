# Boardly Backend Postman Test Plan

Base URL:
http://localhost:8001

Global Headers after login:
Authorization: Bearer {{access_token}}
Content-Type: application/json

## 1. Auth

### 1.1 Signup User 1
POST {{base_url}}/api/auth/signup

Body:
{
  "name": "Mais2004",
  "email": "Mais2004@gmail.com",
  "password": "1234567"
}


### 1.2 Login User 1
POST {{base_url}}/api/auth/login

Body:
{
  "email": "Mais2004@gmail.com",
  "password": "1234567"
}


### 1.3 Get Current User
GET {{base_url}}/api/auth/me

Headers:
Authorization: Bearer {{access_token}}


### 1.4 Refresh Token
POST {{base_url}}/api/auth/refresh

Headers:
Authorization: Bearer {{refresh_token}}


### 1.5 Logout
POST {{base_url}}/api/auth/logout

Headers:
Authorization: Bearer {{access_token}}


## 2. Boards CRUD

### 2.1 Create Board
POST {{base_url}}/api/boards

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "title": "Graduation Project",
  "description": "Boardly backend tasks"
}


### 2.2 Get My Boards
GET {{base_url}}/api/boards


### 2.3 Get Board By ID
GET {{base_url}}/api/boards/{{board_id}}



### 2.4 Update Board
PATCH {{base_url}}/api/boards/{{board_id}}

Body:
{
  "title": "Updated Graduation Project",
  "description": "Updated board description"
}


## 3. Members / Collaboration

### 3.1 Signup User 2
POST {{base_url}}/api/auth/signup

Body:
{
  "name": "Sara",
  "email": "sara@gmail.com",
  "password": "12345678"
}


### 3.2 Login User 2
POST {{base_url}}/api/auth/login

Body:
{
  "email": "sara@gmail.com",
  "password": "12345678"
}


### 3.3 Invite User 2 To Board
POST {{base_url}}/api/boards/{{board_id}}/invitations

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "email": "sara@test.com",
  "role": "editor"
}


### 3.4 Get Board Members
GET {{base_url}}/api/boards/{{board_id}}/members

Headers:
Authorization: Bearer {{access_token}}


### 3.5 Update Member Role
PATCH {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "role": "viewer"
}


### 3.6 Permission Test: Viewer Cannot Create List
POST {{base_url}}/api/boards/{{board_id}}/lists

Headers:
Authorization: Bearer {{user2_access_token}}

Body:
{
  "title": "Should Fail"
}

Expected:
403 Forbidden


### 3.7 Update Member Back To Editor
PATCH {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "role": "editor"
}



## 4. Lists CRUD

### 4.1 Create List 1
POST {{base_url}}/api/boards/{{board_id}}/lists

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "title": "To Do"
}


### 4.2 Create List 2
POST {{base_url}}/api/boards/{{board_id}}/lists

Body:
{
  "title": "In Progress"
}


### 4.3 Get Board Lists
GET {{base_url}}/api/boards/{{board_id}}/lists


### 4.4 Get Single List
GET {{base_url}}/api/lists/{{list1_id}}



### 4.5 Update List
PATCH {{base_url}}/api/lists/{{list1_id}}

Body:
{
  "title": "Backlog"
}



### 4.6 Reorder Lists
PATCH {{base_url}}/api/boards/{{board_id}}/lists/reorder

Body:
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


## 5. Cards CRUD + Move Logic

### 5.1 Create Card 1
POST {{base_url}}/api/lists/{{list1_id}}/cards

Body:
{
  "title": "Design database schema",
  "description": "Create tables and relationships",
  "due_date": "2026-06-01T12:00:00+00:00"
}


### 5.2 Create Card 2
POST {{base_url}}/api/lists/{{list1_id}}/cards

Body:
{
  "title": "Implement auth APIs",
  "description": "Signup, login, refresh, logout"
}


### 5.3 Get Cards In List
GET {{base_url}}/api/lists/{{list1_id}}/cards


### 5.4 Get Single Card
GET {{base_url}}/api/cards/{{card_id}}



### 5.5 Update Card
PATCH {{base_url}}/api/cards/{{card_id}}

Body:
{
  "title": "Updated database schema task",
  "description": "Updated description",
  "due_date": "2026-06-05T15:30:00+00:00"
}


### 5.6 Move Card To Another List
PATCH {{base_url}}/api/cards/{{card_id}}/move

Body:
{
  "target_list_id": "{{list2_id}}",
  "position": 0
}



### 5.7 Move Card Inside Same List
PATCH {{base_url}}/api/cards/{{card_id}}/move

Body:
{
  "target_list_id": "{{list2_id}}",
  "position": 1
}



## 6. Assignees

### 6.1 Add Assignee
POST {{base_url}}/api/cards/{{card_id}}/assignees

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "user_id": "{{user2_id}}"
}


### 6.2 Remove Assignee
DELETE {{base_url}}/api/cards/{{card_id}}/assignees/{{user2_id}}


## 7. Labels

### 7.1 Create Label
POST {{base_url}}/api/boards/{{board_id}}/labels

Body:
{
  "name": "Urgent",
  "color": "#FF0000"
}


### 7.2 Get Board Labels
GET {{base_url}}/api/boards/{{board_id}}/labels



### 7.3 Apply Label To Card
POST {{base_url}}/api/cards/{{card_id}}/labels

Body:
{
  "label_id": "{{label_id}}"
}



### 7.4 Get Card With Labels
GET {{base_url}}/api/cards/{{card_id}}



### 7.5 Remove Label From Card
DELETE {{base_url}}/api/cards/{{card_id}}/labels/{{label_id}}



## 8. Comments

### 8.1 Create Comment
POST {{base_url}}/api/cards/{{card_id}}/comments

Body:
{
  "content": "This task should be finished today."
}


### 8.2 Get Card Comments
GET {{base_url}}/api/cards/{{card_id}}/comments


### 8.3 Delete Comment
DELETE {{base_url}}/api/comments/{{comment_id}}


## 9. Negative / Security Tests

### 9.1 Request Without Token
GET {{base_url}}/api/boards

Expected:
401 Unauthorized

### 9.2 Invalid Board ID
GET {{base_url}}/api/boards/00000000-0000-0000-0000-000000000000

Expected:
404 Not Found or 403 depending on lookup flow.


### 9.3 Duplicate Label Name
POST {{base_url}}/api/boards/{{board_id}}/labels

Body:
{
  "name": "Urgent",
  "color": "#00FF00"
}

Expected:
409 Conflict


### 9.4 Duplicate Member Invitation
POST {{base_url}}/api/boards/{{board_id}}/invitations

Body:
{
  "email": "sara@test.com",
  "role": "editor"
}

Expected:
409 Conflict if already member or pending invitation exists.


### 9.5 Apply Label From Another Board
Use a label_id from a different board.

Expected:
400 Bad Request


## 10. Cleanup

### 10.1 Delete Card
DELETE {{base_url}}/api/cards/{{card_id}}


### 10.2 Delete List
DELETE {{base_url}}/api/lists/{{list1_id}}


### 10.3 Delete Member
DELETE {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}


### 10.4 Delete Board
DELETE {{base_url}}/api/boards/{{board_id}}


