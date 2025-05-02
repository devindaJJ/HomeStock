from flask_apscheduler import APScheduler
from alerts import check_low_stock, check_expiration
from extensions import scheduler

def init_scheduler(app):
    """Initialize the scheduler with the Flask app."""
    scheduler.init_app(app)
    scheduler.start()
    
    # Schedule daily alert checks
    scheduler.add_job(
        id='check_stock_alerts',
        func=check_low_stock,
        trigger='interval',
        hours=24,
        replace_existing=True
    )
    
    scheduler.add_job(
        id='check_expiration_alerts',
        func=check_expiration,
        trigger='interval',
        hours=24,
        replace_existing=True
    ) 