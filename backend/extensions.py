from flask_mail import Mail

mail = Mail()

# Dictionary to store reset tokens (in production, use a database)
reset_tokens = {} 