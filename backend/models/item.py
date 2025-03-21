"""This file defines the User model"""
from app import db

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(10), nullable=False)

    def to_json(self):
        return{
            "id":self.id,
            "name":self.name,
            "quantity":self.quantity,
            "description":self.description,
            "category":self.category,
            
        }

    