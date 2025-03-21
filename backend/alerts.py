from datetime import datetime, timedelta
from models.stock import StockItem, Alert
from db import db

def check_low_stock(threshold=5):
    """Check for low stock items and create alerts."""
    low_stock_items = StockItem.query.filter(StockItem.quantity < threshold).all()
    for item in low_stock_items:
        message = f"Low stock alert: {item.name} has only {item.quantity} units left."
        alert = Alert(message=message)
        db.session.add(alert)
    db.session.commit()

def check_expiration(days_before=7):
    """Check for items nearing expiration and create alerts."""
    today = datetime.utcnow().date()
    expiration_threshold = today + timedelta(days=days_before)
    expiring_items = StockItem.query.filter(StockItem.expiration_date <= expiration_threshold).all()
    for item in expiring_items:
        message = f"Expiration alert: {item.name} expires on {item.expiration_date}."
        alert = Alert(message=message)
        db.session.add(alert)
    db.session.commit()

    