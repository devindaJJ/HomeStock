"""This file defines the User model"""
from db import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """User model for user management."""
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')

    def __init__(self, username, email, password, role='user'):
        self.username = username
        self.email = email
        self.set_password(password)
        self.role = role

    def set_password(self, password: str) -> None:
        """Hashes and sets the user's password."""
        self.password = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password: str) -> bool:
        """Checks if the provided password matches the stored hash."""
        return check_password_hash(self.password, password)

    def save(self) -> bool:
        """Saves the user to the database."""
        try:
            db.session.add(self)
            db.session.commit()
            return True
        except Exception as e:
            print(f"Error saving user: {e}")
            db.session.rollback()
            return False

    def to_dict(self) -> dict:
        """Converts the user object to a dictionary."""
        return {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'role': self.role
        }
    