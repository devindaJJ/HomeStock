from db import db
from datetime import datetime

class ShoppingListItem(db.Model):
    __tablename__ = 'shopping_list_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Float, nullable=False, default=1)
    unit = db.Column(db.String(20), nullable=False, default='pcs')
    category = db.Column(db.String(50), nullable=False, default='groceries')
    priority = db.Column(db.String(20), nullable=False, default='medium')
    purchased = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    
    def to_dict(self):
        """Convert the model instance to a dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit': self.unit,
            'category': self.category,
            'priority': self.priority,
            'purchased': self.purchased,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 