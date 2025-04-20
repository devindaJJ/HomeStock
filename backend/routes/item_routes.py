""" A directory to store Flask route handlers (views)"""
from flask import Blueprint, request, jsonify
from db import db
import json
from datetime import datetime  
from models.item import Item


item_routes = Blueprint('item_routes', __name__)

# Get all items
@item_routes.route("/api/items",methods=["GET"])
def get_items():
    items = Item.query.all()
    result = [item.to_json() for item in items]
    return jsonify(result)

#Create a item
@item_routes.route("/api/items",methods=["POST"])
def create_item():
    try:
        data = request.json

        #validations
        required_fields = ["item_name", "category", "quantity", "location", "user_id", "purchase_date", "expiry_date"]
        for field in required_fields:
            if field not in data:
               return jsonify({"error":f'Missing required field: {field}'}), 400

    
        item_name = data.get("item_name")
        category = data.get("category")
        quantity = data.get("quantity")
        location=data.get("location")
        user_id = data.get("user_id")  
        purchase_date=data.get("purchase_date")  # Optional
        expiry_date=data.get("expiry_date") 
    

        new_item = Item(item_name=item_name,category=category, quantity=quantity, location=location, user_id=user_id,)

        db.session.add(new_item)
        db.session.commit()

        return jsonify({"msg":"Item added successfully"}),201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}), 500
    
# Delete a item
@item_routes.route("/api/items/<int:id>",methods=["DELETE"])
def delete_item(id):
    try:
        item = Item.query.get(id)
        if item is None:
            return jsonify({"error": "Item not found"}), 404

        db.session.delete(item)
        db.session.commit()

        return jsonify({"msg":"Item deleted"}),200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}),500
    
# Update a item 
@item_routes.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    """Update an existing inventory item"""
    item = Item.query.get(item_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json()
    
    try:
        # Update only the fields that are provided
        if 'item_name' in data:
            item.item_name = data['item_name']
        if 'category' in data:
            item.category = data['category']
        if 'quantity' in data:
            item.quantity = data['quantity']
        if 'location' in data:
            item.location = data['location']
        
        # Handle date fields
        if 'purchase_date' in data:
            item.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date() if data['purchase_date'] else None
        if 'expiry_date' in data:
            item.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date() if data['expiry_date'] else None
        
        db.session.commit()
        return jsonify(item.to_json()), 200
    except ValueError as e:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Search items by name
@item_routes.route("/api/items/search", methods=["GET"])
def search_items():
    name = request.args.get("name")

    if not name:
        return jsonify({"error": "Search name is required"}), 400

    items = Item.query.filter(Item.name.ilike(f"%{name}%")).all()
    result = [item.to_json() for item in items]
    return jsonify(result), 200
