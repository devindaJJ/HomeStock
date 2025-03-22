"""This file defines the User model"""
from db import db

#item model
class Item(db.Model):
    __tablename__ = 'items'  # Ensure this matches the table name in the database

    item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # item_id as primary key
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Foreign key to users
    name = db.Column(db.String(255), nullable=False)  # Adjusted to 255 chars as in your SQL
    quantity = db.Column(db.Integer, nullable=False)  # Integer type for quantity
    category = db.Column(db.String(255), nullable=False)  # Adjusted to 255 chars for category
    expiration_date = db.Column(db.Date)  # Date field for expiration_date
    notes = db.Column(db.Text)  # Text field for notes

    # Define the relationship to the User model
    user = db.relationship('User', backref=db.backref('items', lazy=True))

    def to_json(self):
        return {
            "item_id": self.item_id,
            "user_id": self.user_id,
            "name": self.name,
            "quantity": self.quantity,
            "category": self.category,
            "expiration_date": self.expiration_date.strftime('%Y-%m-%d') if self.expiration_date else None,  # Format the date
            "notes": self.notes
        }

    