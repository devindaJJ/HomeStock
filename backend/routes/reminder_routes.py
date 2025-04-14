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
    
    if 'title' not in data:
       return jsonify({"message": "Title is required!"}), 400

    new_reminder = Reminder(
        title=data['title'],
        user_id=data['user_id'],
        reminder_text=data['reminder_text'],
        due_date=due_date,
        reminder_time=datetime.strptime(data['reminder_time'], "%H:%M:%S").time() if 'reminder_time' in data else None,
        is_completed=data.get('is_completed', False)
    )
    db.session.add(new_reminder)
    db.session.commit()

    # Return the created reminder data
    return jsonify({
        "reminder_id": new_reminder.reminder_id,
        "title": new_reminder.title,
        "user_id": new_reminder.user_id,
        "reminder_text": new_reminder.reminder_text,
        "due_date": new_reminder.due_date.strftime('%Y-%m-%d'),
        "reminder_time": new_reminder.reminder_time.strftime('%H:%M:%S') if new_reminder.reminder_time else None,
        "is_completed": new_reminder.is_completed,
        "created_at": new_reminder.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": new_reminder.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }), 201

@reminder_routes.route('/reminders', methods=['GET'])
def get_all_reminders():
    reminders = Reminder.query.all()
    reminder_list = [{
        "reminder_id": reminder.reminder_id,
        "title":reminder.title,
        "user_id": reminder.user_id,
        "reminder_text": reminder.reminder_text,
        "due_date": reminder.due_date.strftime('%Y-%m-%d'),  # Formatting date
        "reminder_time": reminder.reminder_time.strftime('%H:%M:%S') if reminder.reminder_time else None,
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
            "title":reminder.title,
            "user_id": reminder.user_id,
            "reminder_text": reminder.reminder_text,
            "due_date": reminder.due_date.strftime('%Y-%m-%d'),  # Formatting date
            "reminder_time": reminder.reminder_time.strftime('%H:%M:%S') if reminder.reminder_time else None,
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

        # Update fields
        if 'title' in data:
            reminder.title = data['title']
        if 'reminder_text' in data:
            reminder.reminder_text = data['reminder_text']
        if 'reminder_time' in data:
            reminder.reminder_time = datetime.strptime(data['reminder_time'], "%H:%M:%S").time() if data['reminder_time'] else None
        if 'is_completed' in data:
            reminder.is_completed = data['is_completed']

        db.session.commit()

        # Return the updated reminder data
        return jsonify({
            "reminder_id": reminder.reminder_id,
            "title": reminder.title,
            "user_id": reminder.user_id,
            "reminder_text": reminder.reminder_text,
            "due_date": reminder.due_date.strftime('%Y-%m-%d'),
            "reminder_time": reminder.reminder_time.strftime('%H:%M:%S') if reminder.reminder_time else None,
            "is_completed": reminder.is_completed,
            "created_at": reminder.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_at": reminder.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }), 200
    return jsonify({"message": "Reminder not found!"}), 404

@reminder_routes.route('/reminders/<int:reminder_id>', methods=['DELETE'])
def delete_reminder(reminder_id):
    reminder = Reminder.query.get(reminder_id)
    if reminder:
        db.session.delete(reminder)
        db.session.commit()
        return jsonify({"message": "Reminder deleted successfully!"}), 200
    return jsonify({"message": "Reminder not found!"}), 404
