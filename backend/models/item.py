"""This file defines the Item model"""
from db import db

# Item model
class Item(db.Model):
    __tablename__ = 'Items'  # Ensure this matches the table name in the database

    item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Primary key with auto-increment
    item_name = db.Column(db.String(255), nullable=False)  # String with max 255 characters
    category = db.Column(db.String(255), nullable=False)  # Adjusted to 255 chars for category
    quantity = db.Column(db.Integer, nullable=False)  # Integer type for quantity
    location = db.Column(db.String(255), nullable=False)  # Adjusted to 255 chars for category
    purchase_date = db.Column(db.Date)  # Changed from Text to Date (if storing dates)
    expiry_date = db.Column(db.Date)  # Date field for expiration_date
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)  # Foreign key to users table

    # Define the relationship to the User model
    user = db.relationship('User', backref=db.backref('Items', lazy=True))

    def to_json(self):
        """Converts the Item object to a JSON-friendly dictionary."""
        return {
            "item_id": self.item_id,
            "user_id": self.user_id,
            "item_name": self.item_name,
            "category": self.category,
            "quantity": self.quantity,
            "location": self.location,
            "purchase_date": self.purchase_date.strftime('%Y-%m-%d') if self.purchase_date else None,
            "expiry_date": self.expiry_date.strftime('%Y-%m-%d') if self.expiry_date else None,  # Format the date
        }
