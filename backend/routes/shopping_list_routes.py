from flask import Blueprint, request, jsonify
from db import db
from models.shopping_list import ShoppingListItem
from flask_cors import cross_origin
from datetime import datetime
import jwt
import os

shopping_list_routes = Blueprint('shopping_list_routes', __name__)

def get_user_id_from_token(request):
    """Extract user_id from JWT token in request headers"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        secret_key = os.environ.get('JWT_SECRET_KEY', 'your-secret-key')
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Get all shopping list items
@shopping_list_routes.route('/shopping-list', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_shopping_list():
    """Get all shopping list items for the user or all items if no user is authenticated"""
    try:
        user_id = get_user_id_from_token(request)
        
        # If user is authenticated, get only their items
        if user_id:
            items = ShoppingListItem.query.filter_by(user_id=user_id).all()
        else:
            # Get all items if no user is authenticated (for development)
            items = ShoppingListItem.query.all()
        
        items_list = [item.to_dict() for item in items]
        return jsonify(items_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add a new shopping list item
@shopping_list_routes.route('/shopping-list', methods=['POST'])
@cross_origin(supports_credentials=True)
def add_shopping_list_item():
    """Add a new item to the shopping list"""
    try:
        data = request.get_json()
        user_id = get_user_id_from_token(request)
        
        # Validate required fields
        if not data.get('name'):
            return jsonify({"error": "Item name is required"}), 400
        
        # Create new shopping list item
        new_item = ShoppingListItem(
            name=data.get('name'),
            quantity=data.get('quantity', 1),
            unit=data.get('unit', 'pcs'),
            category=data.get('category', 'groceries'),
            priority=data.get('priority', 'medium'),
            purchased=data.get('purchased', False),
            notes=data.get('notes', ''),
            user_id=user_id
        )
        
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Update a shopping list item
@shopping_list_routes.route('/shopping-list/<int:id>', methods=['PUT'])
@cross_origin(supports_credentials=True)
def update_shopping_list_item(id):
    """Update an existing shopping list item"""
    try:
        data = request.get_json()
        user_id = get_user_id_from_token(request)
        
        # Find the item
        item = ShoppingListItem.query.get(id)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        
        # Check if user has access to this item (if user_id is set)
        if item.user_id and user_id and item.user_id != user_id:
            return jsonify({"error": "Unauthorized to update this item"}), 403
        
        # Update item fields
        if 'name' in data and data['name']:
            item.name = data['name']
        if 'quantity' in data:
            item.quantity = data['quantity']
        if 'unit' in data:
            item.unit = data['unit']
        if 'category' in data:
            item.category = data['category']
        if 'priority' in data:
            item.priority = data['priority']
        if 'purchased' in data:
            item.purchased = data['purchased']
        if 'notes' in data:
            item.notes = data['notes']
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Delete a shopping list item
@shopping_list_routes.route('/shopping-list/<int:id>', methods=['DELETE'])
@cross_origin(supports_credentials=True)
def delete_shopping_list_item(id):
    """Delete a shopping list item"""
    try:
        user_id = get_user_id_from_token(request)
        
        # Find the item
        item = ShoppingListItem.query.get(id)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        
        # Check if user has access to this item (if user_id is set)
        if item.user_id and user_id and item.user_id != user_id:
            return jsonify({"error": "Unauthorized to delete this item"}), 403
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({"message": "Item deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Toggle purchase status of a shopping list item
@shopping_list_routes.route('/shopping-list/<int:id>/toggle', methods=['PATCH'])
@cross_origin(supports_credentials=True)
def toggle_purchased_status(id):
    """Toggle the purchased status of a shopping list item"""
    try:
        data = request.get_json()
        user_id = get_user_id_from_token(request)
        
        # Find the item
        item = ShoppingListItem.query.get(id)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        
        # Check if user has access to this item (if user_id is set)
        if item.user_id and user_id and item.user_id != user_id:
            return jsonify({"error": "Unauthorized to update this item"}), 403
        
        # Update purchased status
        if 'purchased' in data:
            item.purchased = data['purchased']
        else:
            item.purchased = not item.purchased
        
        item.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500 