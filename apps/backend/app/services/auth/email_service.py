from flask import current_app
from flask_mail import Message
from app.extensions import mail

class EmailService:
    @staticmethod
    def send_email_verification(user, raw_token):
        frontend_url = current_app.config["FRONTEND_URL"]
        verification_link = f"{frontend_url}/verify-email?token={raw_token}"

        message = Message(
            subject="Verify your Boardly email",
            recipients=[user.email],
            body=f"""
Hello {user.name},

Welcome to Boardly.

Please verify your email:
{verification_link}

This link expires at:
{user.email_verification_expires_at}

If you did not create this account, you can ignore this email.

Boardly Team
""",
        )

        mail.send(message)

    @staticmethod
    def send_board_invitation(invitation, raw_token):
        frontend_url = current_app.config["FRONTEND_URL"]
        invitation_link = f"{frontend_url}/accept-invitation?token={raw_token}"

        message = Message(
            subject="You have been invited to Boardly",
            recipients=[invitation.email],
            body=f"""
Hello,

You have been invited to collaborate on a Boardly board.

Role: {invitation.role.value}

Open this link to accept or decline the invitation:
{invitation_link}

This invitation expires at:
{invitation.expires_at}

Boardly Team
""",
        )

        mail.send(message)