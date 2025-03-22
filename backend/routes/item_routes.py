""" A directory to store Flask route handlers (views)"""
from flask import Blueprint, request, jsonify
from db import db
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
        required_fields = ["name", "quantity", "description", "category"]
        for field in required_fields:
            if field not in data:
               return jsonify({"error":f'Missing required field: {field}'}), 400

    
        name = data.get("name")
        quantity = data.get("quantity")
        description = data.get("description")
        category = data.get("category")

        new_item = Item(name=name, quantity=quantity, description=description, category=category)

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
@item_routes.route("/api/items/<int:id>",methods=["PATCH"])
def update_item(id):
    try:
        item = Item.query.get(id)
        if item is None:
            return jsonify({"error": "Item not found"}), 404
        
        data = request.json

        item.name = data.get("name",item.name)
        item.quantity = data.get("quantity",item.quantity)
        item.description = data.get("description",item.description)
        item.category = data.get("category",item.category)

        db.session.commit()
        return jsonify(item.to_json()),200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}),500

# Search items by name
@item_routes.route("/api/items/search", methods=["GET"])
def search_items():
    name = request.args.get("name")

    if not name:
        return jsonify({"error": "Search name is required"}), 400

    items = Item.query.filter(Item.name.ilike(f"%{name}%")).all()
    result = [item.to_json() for item in items]
    return jsonify(result), 200
