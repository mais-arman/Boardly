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

Boardly Team
"""

        message = Message(
            subject=subject,
            recipients=[invitation.email],
            body=body,
        )

        mail.send(message)

    @staticmethod
    def send_email_verification(user):
        frontend_url = current_app.config["FRONTEND_URL"]
        verification_link = f"{frontend_url}/verify-email/{user.email_verification_token}"

        subject = "Verify your Boardly email"

        body = f"""
Hello {user.name},

Welcome to Boardly.

Please verify your email address by opening this link:
{verification_link}

This link will expire at:
{user.email_verification_expires_at}

If you did not create this account, you can ignore this email.

Boardly Team
"""

        message = Message(
            subject=subject,
            recipients=[user.email],
            body=body,
        )

        mail.send(message)