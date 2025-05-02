from datetime import datetime, timedelta
from models.stock import StockItem, Alert
from db import db
from flask import current_app
from flask_mail import Message
from extensions import mail
import traceback

def send_alert_email(subject, message):
    """Send an alert email to configured recipients."""
    try:
        print(f"Attempting to send email with subject: {subject}")
        if not current_app.config['ALERT_EMAIL_RECIPIENTS']:
            print("No alert recipients configured")
            return
        
        msg = Message(
            subject=subject,
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=current_app.config['ALERT_EMAIL_RECIPIENTS']
        )
        msg.body = message
        print(f"Sending email to: {current_app.config['ALERT_EMAIL_RECIPIENTS']}")
        mail.send(msg)
        print("Email sent successfully")
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        raise

def check_low_stock(threshold=None):
    """Check for low stock items and create alerts."""
    try:
        if threshold is None:
            threshold = current_app.config['ALERT_LOW_STOCK_THRESHOLD']
        
        print(f"Checking for low stock items (threshold: {threshold})")
        low_stock_items = StockItem.query.filter(StockItem.quantity < threshold).all()
        print(f"Found {len(low_stock_items)} low stock items")
        
        for item in low_stock_items:
            message = f"Low stock alert: {item.name} has only {item.quantity} units left."
            alert = Alert(message=message)
            db.session.add(alert)
            
            # Send email alert
            email_subject = f"Low Stock Alert: {item.name}"
            email_message = f"""
            Low Stock Alert!
            
            Item: {item.name}
            Current Quantity: {item.quantity}
            Threshold: {threshold}
            
            Please restock this item as soon as possible.
            """
            send_alert_email(email_subject, email_message)
        
        db.session.commit()
        print("Low stock check completed")
    except Exception as e:
        print(f"Error in check_low_stock: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        db.session.rollback()
        raise

def check_expiration(days_before=None):
    """Check for items nearing expiration and create alerts."""
    try:
        if days_before is None:
            days_before = current_app.config['ALERT_DAYS_BEFORE_EXPIRATION']
        
        print(f"Checking for items expiring within {days_before} days")
        today = datetime.utcnow().date()
        expiration_threshold = today + timedelta(days=days_before)
        expiring_items = StockItem.query.filter(StockItem.expiration_date <= expiration_threshold).all()
        print(f"Found {len(expiring_items)} items nearing expiration")
        
        for item in expiring_items:
            message = f"Expiration alert: {item.name} expires on {item.expiration_date}."
            alert = Alert(message=message)
            db.session.add(alert)
            
            # Send email alert
            email_subject = f"Expiration Alert: {item.name}"
            email_message = f"""
            Expiration Alert!
            
            Item: {item.name}
            Expiration Date: {item.expiration_date}
            Days Until Expiration: {(item.expiration_date - today).days}
            
            Please take action before this item expires.
            """
            send_alert_email(email_subject, email_message)
        
        db.session.commit()
        print("Expiration check completed")
    except Exception as e:
        print(f"Error in check_expiration: {str(e)}")
        print("Full traceback:")
        print(traceback.format_exc())
        db.session.rollback()
        raise

    