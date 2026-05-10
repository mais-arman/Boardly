from flask import current_app
from flask_mail import Message
from app.extensions import mail


class EmailService:

    @staticmethod
    def send_board_invitation(invitation):
        frontend_url = current_app.config["FRONTEND_URL"]
        invitation_link = f"{frontend_url}/accept-invitation/{invitation.token}"

        subject = "You have been invited to Boardly"

        body = f"""
Hello,

You have been invited to collaborate on a Boardly board.

Role: {invitation.role.value}

Open this link to accept or decline the invitation:
{invitation_link}

This invitation expires at:
{invitation.expires_at}

If you do not recognize this invitation, you can ignore this email.

Boardly Team
"""

        message = Message(
            subject=subject,
            recipients=[invitation.email],
            body=body,
        )

        mail.send(message)