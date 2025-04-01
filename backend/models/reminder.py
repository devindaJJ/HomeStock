"""This file defines the User model"""
from db import db
from models.user import User

class Reminder(db.Model):
    __tablename__ = 'reminders'
    reminder_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Corrected reference here
    reminder_text = db.Column(db.String(255), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationship with the User model
    user = db.relationship('User', backref='reminders')
