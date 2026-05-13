API_PREFIX = "/api"
AUTH_PREFIX = "/api/auth"
BOARDS_PREFIX = "/api/boards"

AUTH_SIGNUP = "/signup"
AUTH_LOGIN = "/login"
AUTH_REFRESH = "/refresh"
AUTH_LOGOUT = "/logout"
AUTH_ME = "/me"
AUTH_RESEND_VERIFICATION = "/resend-verification"
AUTH_VERIFY_EMAIL = "/verify-email"

BOARD_ROOT = ""
BOARD_BY_ID = "/<uuid:board_id>"
BOARD_INVITATIONS = "/<uuid:board_id>/invitations"
BOARD_INVITATION_BY_TOKEN = "/<uuid:board_id>/invitations/<uuid:token>"
BOARD_INVITATION_CANCEL = "/<uuid:board_id>/invitations/<uuid:invitation_id>/cancel"
BOARD_MEMBERS = "/<uuid:board_id>/members"
BOARD_MEMBER_BY_ID = "/<uuid:board_id>/members/<uuid:member_id>"

MY_INVITATIONS = "/invitations/me"
INVITATION_ACCEPT = "/invitations/<token>/accept"
INVITATION_DECLINE = "/invitations/<token>/decline"
INVITATION_PREVIEW = "/invitations/<token>"

BOARD_LISTS = "/boards/<uuid:board_id>/lists"
BOARD_LISTS_REORDER = "/boards/<uuid:board_id>/lists/reorder"
LIST_BY_ID = "/lists/<uuid:list_id>"

LIST_CARDS = "/lists/<uuid:list_id>/cards"
CARD_BY_ID = "/cards/<uuid:card_id>"
CARD_MOVE = "/cards/<uuid:card_id>/move"

CARD_ASSIGNEES = "/cards/<uuid:card_id>/assignees"
CARD_ASSIGNEE_BY_ID = "/cards/<uuid:card_id>/assignees/<uuid:user_id>"

BOARD_LABELS = "/boards/<uuid:board_id>/labels"
CARD_LABELS = "/cards/<uuid:card_id>/labels"
CARD_LABEL_BY_ID = "/cards/<uuid:card_id>/labels/<uuid:label_id>"

CARD_COMMENTS = "/cards/<uuid:card_id>/comments"
COMMENT_BY_ID = "/comments/<uuid:comment_id>"

ADMIN_PREFIX = "/api/admin"

ADMIN_USERS = "/users"
ADMIN_USER_BY_ID = "/users/<uuid:user_id>"
ADMIN_BOARDS = "/boards"
ADMIN_BOARD_BY_ID = "/boards/<uuid:board_id>"

MY_INVITATION_ACCEPT = "/invitations/me/<uuid:invitation_id>/accept"
MY_INVITATION_DECLINE = "/invitations/me/<uuid:invitation_id>/decline"