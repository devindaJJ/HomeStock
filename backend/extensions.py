from flask_mail import Mail
from flask_apscheduler import APScheduler

mail = Mail()
scheduler = APScheduler()

# Dictionary to store reset tokens (in production, use a database)
reset_tokens = {} 