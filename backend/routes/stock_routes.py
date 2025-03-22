from flask import Blueprint, request, jsonify
from db import db
from models.stock import StockItem, Alert
from datetime import datetime

stock_routes = Blueprint('stock_routes', __name__)

# Add a new stock item
@stock_routes.route('/stock', methods=['POST'])
def add_stock_item():
    data = request.get_json()
    new_item = StockItem(
        name=data['name'],
        quantity=data['quantity'],
        expiration_date=datetime.strptime(data['expiration_date'], '%Y-%m-%d').date()
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({"message": "Stock item added successfully!"}), 201

# Get all stock items
@stock_routes.route('/stock', methods=['GET'])
def get_all_stock_items():
    stock_items = StockItem.query.all()
    stock_list = [{
        "stock_id": item.stock_id,
        "name": item.name,
        "quantity": item.quantity,
        "expiration_date": item.expiration_date.strftime('%Y-%m-%d')
    } for item in stock_items]
    return jsonify(stock_list), 200

# Check for alerts
@stock_routes.route('/alerts/check', methods=['POST'])
def check_alerts():
    from alerts import check_low_stock, check_expiration
    check_low_stock()
    check_expiration()
    return jsonify({"message": "Alerts checked successfully!"}), 200

# Get active alerts
@stock_routes.route('/alerts', methods=['GET'])
def get_active_alerts():
    active_alerts = Alert.query.filter_by(is_active=True).all()
    alert_list = [{
        "alert_id": alert.alert_id,
        "message": alert.message,
        "created_at": alert.created_at.strftime('%Y-%m-%d %H:%M:%S')
    } for alert in active_alerts]
    return jsonify(alert_list), 200