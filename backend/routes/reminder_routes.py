""" A directory to store Flask route handlers (views)"""
from flask import Blueprint, request, jsonify
from db import db
from models.reminder import Reminder
from datetime import datetime

reminder_routes = Blueprint('reminder_routes', __name__)

@reminder_routes.route('/reminders', methods=['POST'])
def create_reminder():
    data = request.get_json()
    
    # Convert due_date to datetime object
    try:
        due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')  # Assuming the date format is 'YYYY-MM-DD'
    except ValueError:
        return jsonify({"message": "Invalid date format, please use YYYY-MM-DD"}), 400

    new_reminder = Reminder(
        user_id=data['user_id'],
        reminder_text=data['reminder_text'],
        due_date=due_date,
        is_completed=data.get('is_completed', False)
    )
    db.session.add(new_reminder)
    db.session.commit()
    return jsonify({"message": "Reminder created successfully!"}), 201

@reminder_routes.route('/reminders', methods=['GET'])
def get_all_reminders():
    reminders = Reminder.query.all()
    reminder_list = [{
        "reminder_id": reminder.reminder_id,
        "user_id": reminder.user_id,
        "reminder_text": reminder.reminder_text,
        "due_date": reminder.due_date.strftime('%Y-%m-%d'),  # Formatting date
        "is_completed": reminder.is_completed,
        "created_at": reminder.created_at.strftime('%Y-%m-%d %H:%M:%S'),  # Formatting timestamp
        "updated_at": reminder.updated_at.strftime('%Y-%m-%d %H:%M:%S')  # Formatting timestamp
    } for reminder in reminders]
    return jsonify(reminder_list), 200

@reminder_routes.route('/reminders/<int:reminder_id>', methods=['GET'])
def get_reminder(reminder_id):
    reminder = Reminder.query.get(reminder_id)
    if reminder:
        return jsonify({
            "reminder_id": reminder.reminder_id,
            "user_id": reminder.user_id,
            "reminder_text": reminder.reminder_text,
            "due_date": reminder.due_date.strftime('%Y-%m-%d'),  # Formatting date
            "is_completed": reminder.is_completed,
            "created_at": reminder.created_at.strftime('%Y-%m-%d %H:%M:%S'),  # Formatting timestamp
            "updated_at": reminder.updated_at.strftime('%Y-%m-%d %H:%M:%S')  # Formatting timestamp
        }), 200
    return jsonify({"message": "Reminder not found!"}), 404

@reminder_routes.route('/reminders/<int:reminder_id>', methods=['PUT'])
def update_reminder(reminder_id):
    reminder = Reminder.query.get(reminder_id)
    if reminder:
        data = request.get_json()
        
        # Convert due_date to datetime object if provided
        if 'due_date' in data:
            try:
                reminder.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
            except ValueError:
                return jsonify({"message": "Invalid date format, please use YYYY-MM-DD"}), 400
        
        reminder.reminder_text = data.get('reminder_text', reminder.reminder_text)
        reminder.is_completed = data.get('is_completed', reminder.is_completed)
        db.session.commit()
        return jsonify({"message": "Reminder updated successfully!"}), 200
    return jsonify({"message": "Reminder not found!"}), 404

@reminder_routes.route('/reminders/<int:reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    reminder = Reminder.query.get(reminder_id)
    if reminder:
        db.session.delete(reminder)
        db.session.commit()
        return jsonify({"message": "Reminder deleted successfully!"}), 200
    return jsonify({"message": "Reminder not found!"}), 404
