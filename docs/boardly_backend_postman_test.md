# Boardly Backend Postman Test Plan

## Base URL

Base URL:
http://localhost:8001


## Global Headers

Use these headers for all protected endpoints after login:

Authorization: Bearer {{access_token}}
Content-Type: application/json


# 1. Auth

## 1.1 Signup User 1

POST {{base_url}}/api/auth/signup

Body:

```json
{
  "name": "Mais",
  "email": "mais2004@gmail.com",
  "password": "12345678"
}


## 1.2 Login User 1

POST {{base_url}}/api/auth/login

Body:

```json
{
  "email": "mais2004@gmail.com",
  "password": "12345678"
}
```


## 1.3 Get Current User

GET {{base_url}}/api/auth/me


## 1.4 Refresh Token

POST {{base_url}}/api/auth/refresh

Headers:
Authorization: Bearer {{refresh_token}}


# 2. Boards CRUD

## 2.1 Create Board

POST {{base_url}}/api/boards

Body:

```json
{
  "title": "Graduation Project",
  "description": "Boardly backend tasks"
}
```

## 2.2 Get My Boards

GET {{base_url}}/api/boards


## 2.3 Get Board By ID

GET {{base_url}}/api/boards/{{board_id}}


## 2.4 Update Board

PATCH {{base_url}}/api/boards/{{board_id}}

Body:

```json
{
  "title": "Updated Graduation Project",
  "description": "Updated board description"
}
```

# 3. Members / Invitations

## 3.1 Signup User 2

POST {{base_url}}/api/auth/signup

Body:

```json
{
  "name": "Sara",
  "email": "sara@gmail.com",
  "password": "12345678"
}
```

## 3.2 Login User 2

POST {{base_url}}/api/auth/login

Body:

```json
{
  "email": "sara@gmail.com",
  "password": "12345678"
}
```

## 3.3 Invite User 2 To Board

Use User 1 token.

POST {{base_url}}/api/boards/{{board_id}}/invitations

Headers:
Authorization: Bearer {{access_token}}

Body:

```json
{
  "email": "sara@gmail.com",
  "role": "editor"
}
```

## 3.4 Get My Invitations As User 2

Use User 2 token.

GET {{base_url}}/api/invitations/me

Headers:
Authorization: Bearer {{user2_access_token}}


## 3.5 Accept Invitation As User 2

POST {{base_url}}/api/invitations/{{invitation_token}}/accept

Headers:
Authorization: Bearer {{user2_access_token}}


## 3.6 Get Board Members

Use User 1 token.

GET {{base_url}}/api/boards/{{board_id}}/members


## 3.7 Update Member Role

PATCH {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}

Body:

```json
{
  "role": "viewer"
}
```

## 3.8 Permission Test: Viewer Cannot Create List

Use User 2 token after changing role to viewer.

POST {{base_url}}/api/boards/{{board_id}}/lists

Headers:
Authorization: Bearer {{user2_access_token}}

Body:

```json
{
  "title": "Should Fail"
}
```

## 3.9 Update Member Back To Editor

Use User 1 token.

PATCH {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}

Body:

```json
{
  "role": "editor"
}
```

# 4. Lists CRUD

## 4.1 Create List 1

POST {{base_url}}/api/boards/{{board_id}}/lists

Body:

```json
{
  "title": "To Do"
}
```

## 4.2 Create List 2

POST {{base_url}}/api/boards/{{board_id}}/lists

Body:

```json
{
  "title": "In Progress"
}
```

## 4.3 Get Board Lists

GET {{base_url}}/api/boards/{{board_id}}/lists


## 4.4 Get Single List

GET {{base_url}}/api/lists/{{list1_id}}


## 4.5 Update List

PATCH {{base_url}}/api/lists/{{list1_id}}

Body:

```json
{
  "title": "Backlog"
}
```

## 4.6 Reorder Lists

PATCH {{base_url}}/api/boards/{{board_id}}/lists/reorder

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

# 5. Cards CRUD + Move Logic

## 5.1 Create Card 1

POST {{base_url}}/api/lists/{{list1_id}}/cards

Body:

```json
{
  "title": "Design database schema",
  "description": "Create tables and relationships",
  "due_date": "2026-06-01T12:00:00+00:00"
}
```

## 5.2 Create Card 2

POST {{base_url}}/api/lists/{{list1_id}}/cards

Body:

```json
{
  "title": "Implement auth APIs",
  "description": "Signup, login, refresh, logout"
}
```

## 5.3 Get Cards In List

GET {{base_url}}/api/lists/{{list1_id}}/cards


## 5.4 Get Single Card

GET {{base_url}}/api/cards/{{card1_id}}


## 5.5 Update Card

PATCH {{base_url}}/api/cards/{{card1_id}}

Body:

```json
{
  "title": "Updated database schema task",
  "description": "Updated description",
  "due_date": "2026-06-05T15:30:00+00:00"
}
```

## 5.6 Move Card To Another List

PATCH {{base_url}}/api/cards/{{card1_id}}/move

Body:

```json
{
  "target_list_id": "{{list2_id}}",
  "position": 0
}
```

# 6. Assignees

## 6.1 Add Assignee

POST {{base_url}}/api/cards/{{card1_id}}/assignees

Body:

```json
{
  "user_id": "{{user2_id}}"
}
```

## 6.2 Remove Assignee

DELETE {{base_url}}/api/cards/{{card1_id}}/assignees/{{user2_id}}


# 7. Labels

## 7.1 Create Label

POST {{base_url}}/api/boards/{{board_id}}/labels

Body:

```json
{
  "name": "Urgent",
  "color": "#FF0000"
}
```

## 7.2 Get Board Labels

GET {{base_url}}/api/boards/{{board_id}}/labels


## 7.3 Apply Label To Card

POST {{base_url}}/api/cards/{{card1_id}}/labels

Body:

```json
{
  "label_id": "{{label_id}}"
}
```

## 7.4 Get Card With Labels

GET {{base_url}}/api/cards/{{card1_id}}


## 7.5 Remove Label From Card

DELETE {{base_url}}/api/cards/{{card1_id}}/labels/{{label_id}}

# 8. Comments

## 8.1 Create Comment

POST {{base_url}}/api/cards/{{card1_id}}/comments

Body:

```json
{
  "content": "This task should be finished today."
}
```

## 8.2 Get Card Comments

GET {{base_url}}/api/cards/{{card1_id}}/comments

## 8.3 Delete Comment

DELETE {{base_url}}/api/comments/{{comment_id}}

# 9. Negative / Security Tests

## 9.1 Request Without Token

GET {{base_url}}/api/boards

## 9.2 Invalid Board ID

GET {{base_url}}/api/boards/00000000-0000-0000-0000-000000000000

## 9.3 Duplicate Label Name

POST {{base_url}}/api/boards/{{board_id}}/labels

Body:

```json
{
  "name": "Urgent",
  "color": "#00FF00"
}
```

## 9.4 Duplicate Pending Invitation

POST {{base_url}}/api/boards/{{board_id}}/invitations

Body:

```json
{
  "email": "sara@gmail.com",
  "role": "editor"
}
```

## 9.5 Accept Invitation With Wrong Account

Login with another user who is not the invited email, then:

POST {{base_url}}/api/invitations/{{invitation_token}}/accept


## 9.6 Apply Label From Another Board

Use a label_id from a different board:

POST {{base_url}}/api/cards/{{card1_id}}/labels

Body:

```json
{
  "label_id": "LABEL_FROM_ANOTHER_BOARD"
}
```

# 10. Cleanup

## 10.1 Delete Card

DELETE {{base_url}}/api/cards/{{card1_id}}

## 10.2 Delete List

DELETE {{base_url}}/api/lists/{{list1_id}}

## 10.3 Delete Member

DELETE {{base_url}}/api/boards/{{board_id}}/members/{{member_id}}

## 10.4 Delete Board

DELETE {{base_url}}/api/boards/{{board_id}}

