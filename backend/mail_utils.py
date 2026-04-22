"""Optional SMTP email. If MAIL_SERVER is unset, only logs — no real email is sent."""
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def is_mail_configured() -> bool:
    return bool((os.getenv("MAIL_SERVER") or "").strip())


def send_mail(to_addr: str, subject: str, text_body: str, html_body: str | None = None) -> bool:
    server = (os.getenv("MAIL_SERVER") or "").strip()
    if not server:
        print(f"\n[MAIL DEV — no MAIL_SERVER] To: {to_addr}\nSubject: {subject}\n{text_body}\n")
        return False

    port = int(os.getenv("MAIL_PORT", "587"))
    user = (os.getenv("MAIL_USERNAME") or "").strip()
    password = (os.getenv("MAIL_PASSWORD") or "").strip()
    use_tls = os.getenv("MAIL_USE_TLS", "true").lower() in ("1", "true", "yes")
    sender = (os.getenv("MAIL_DEFAULT_SENDER") or user or "noreply@wassali.local").strip()

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_addr
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    if html_body:
        msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        with smtplib.SMTP(server, port, timeout=30) as smtp:
            smtp.ehlo()
            if use_tls:
                smtp.starttls()
                smtp.ehlo()
            if user and password:
                smtp.login(user, password)
            smtp.sendmail(sender, [to_addr], msg.as_string())
        return True
    except Exception as e:
        # Keep app flow working; caller will fall back to dev_notice.
        print(
            f"\n[MAIL ERROR] Failed to send.\n"
            f"Server: {server}:{port} TLS={use_tls}\n"
            f"User: {user or '(none)'} Sender: {sender}\n"
            f"To: {to_addr}\n"
            f"Error: {type(e).__name__}: {e}\n"
        )
        return False
