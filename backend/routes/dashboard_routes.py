from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.item import Item
from models.user import User
from datetime import datetime, timedelta
from db import db

dashboard_routes = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_routes.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get total items count
        total_items = Item.query.filter_by(user_id=current_user_id).count()

        # Get items expiring in next 7 days
        today = datetime.now().date()
        week_later = today + timedelta(days=7)
        expiring_soon = Item.query.filter(
            Item.user_id == current_user_id,
            Item.expiry_date.isnot(None),
            Item.expiry_date <= week_later,
            Item.expiry_date >= today
        ).count()

        # Get expired items count
        expired_items = Item.query.filter(
            Item.user_id == current_user_id,
            Item.expiry_date.isnot(None),
            Item.expiry_date < today
        ).count()

        # Get items by location
        items_by_location = db.session.query(
            Item.location, db.func.count(Item.id)
        ).filter(
            Item.user_id == current_user_id
        ).group_by(Item.location).all()

        location_stats = {loc: count for loc, count in items_by_location}

        return jsonify({
            'total_items': total_items,
            'expiring_soon': expiring_soon,
            'expired_items': expired_items,
            'items_by_location': location_stats
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_routes.route('/expiring-items', methods=['GET'])
@jwt_required()
def get_expiring_items():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        today = datetime.now().date()
        week_later = today + timedelta(days=7)
        
        expiring_items = Item.query.filter(
            Item.user_id == current_user_id,
            Item.expiry_date.isnot(None),
            Item.expiry_date <= week_later,
            Item.expiry_date >= today
        ).all()

        items_data = []
        for item in expiring_items:
            items_data.append({
                'id': item.id,
                'name': item.name,
                'quantity': item.quantity,
                'location': item.location,
                'expiry_date': item.expiry_date.strftime('%Y-%m-%d') if item.expiry_date else None,
                'days_until_expiry': (item.expiry_date - today).days if item.expiry_date else None
            })

        return jsonify(items_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500 