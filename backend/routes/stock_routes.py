from flask import Blueprint, request, jsonify
from db import db
from models.stock import StockItem, Alert
from datetime import datetime
from alerts import check_low_stock, check_expiration  # Import alert functions at the top

stock_routes = Blueprint('stock_routes', __name__)

# Add a new stock item
@stock_routes.route('/stock', methods=['POST'])
def add_stock_item():
    """
    Add a new stock item to the database.
    """
    data = request.get_json()

    # Validate required fields
    if not all(key in data for key in ['name', 'quantity', 'expiration_date']):
        return jsonify({"error": "Missing required fields (name, quantity, expiration_date)"}), 400

    try:
        # Create a new stock item
        new_item = StockItem(
            name=data['name'],
            quantity=data['quantity'],
            expiration_date=datetime.strptime(data['expiration_date'], '%Y-%m-%d').date()
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify({"message": "Stock item added successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all stock items
@stock_routes.route('/stock', methods=['GET'])
def get_all_stock_items():
    """
    Retrieve all stock items from the database.
    """
    try:
        stock_items = StockItem.query.all()
        stock_list = [{
            "stock_id": item.stock_id,
            "name": item.name,
            "quantity": item.quantity,
            "expiration_date": item.expiration_date.strftime('%Y-%m-%d')
        } for item in stock_items]
        return jsonify(stock_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Delete a stock item by ID
@stock_routes.route('/stock/<int:stock_id>', methods=['DELETE'])
def delete_stock_item(stock_id):
    """
    Delete a stock item by its ID.
    """
    try:
        item = StockItem.query.get(stock_id)
        if item:
            db.session.delete(item)
            db.session.commit()
            return jsonify({"message": f"Stock item {stock_id} deleted successfully!"}), 200
        return jsonify({"error": "Stock item not found."}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@stock_routes.route('/stock/<int:stock_id>', methods=['PUT'])
def update_stock_item(stock_id):
    """
    Update an existing stock item
    """
    data = request.get_json()
    stock_item = StockItem.query.get(stock_id)
    
    if not stock_item:
        return jsonify({"error": "Stock item not found"}), 404

    try:
        if 'name' in data:
            stock_item.name = data['name']
        if 'quantity' in data:
            stock_item.quantity = data['quantity']
        if 'expiration_date' in data:
            stock_item.expiration_date = datetime.strptime(data['expiration_date'], '%Y-%m-%d').date()
        
        db.session.commit()
        return jsonify({
            "message": "Stock item updated successfully",
            "stock_id": stock_item.stock_id,
            "name": stock_item.name,
            "quantity": stock_item.quantity,
            "expiration_date": stock_item.expiration_date.strftime('%Y-%m-%d') if stock_item.expiration_date else None
        }), 200
    except ValueError as e:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Check for alerts
@stock_routes.route('/alerts/check', methods=['POST'])
def check_alerts():
    """
    Check for low stock and expiration alerts.
    """
    try:
        check_low_stock()  # Check for low stock alerts
        check_expiration()  # Check for expiration alerts
        return jsonify({"message": "Alerts checked successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get active alerts
@stock_routes.route('/alerts', methods=['GET'])
def get_active_alerts():
    """
    Retrieve all active alerts from the database.
    """
    try:
        active_alerts = Alert.query.filter_by(is_active=True).all()
        alert_list = [{
            "alert_id": alert.alert_id,
            "message": alert.message,
            "created_at": alert.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for alert in active_alerts]
        return jsonify(alert_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500