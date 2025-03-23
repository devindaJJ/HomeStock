import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReminderManager = () => {
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState({
    user_id: '',
    reminder_text: '',
    due_date: '',
    is_completed: false,
  });
  const [reminderToEdit, setReminderToEdit] = useState({
    reminder_id: '',
    reminder_text: '',
    due_date: '',
    is_completed: false,
  });

  // Fetch all reminders
  const fetchReminders = async () => {
    try {
      const response = await axios.get('/reminders');
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  // Add new reminder
  const handleAddReminder = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/reminders', newReminder);
      setNewReminder({
        user_id: '',
        reminder_text: '',
        due_date: '',
        is_completed: false,
      });
      fetchReminders();
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  // Update reminder
  const handleUpdateReminder = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/reminders/${reminderToEdit.reminder_id}`, reminderToEdit);
      setReminderToEdit({
        reminder_id: '',
        reminder_text: '',
        due_date: '',
        is_completed: false,
      });
      fetchReminders();
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  // Delete reminder
  const handleDeleteReminder = async (reminder_id) => {
    try {
      await axios.delete(`/reminders/${reminder_id}`);
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Reminder Manager</h1>

      {/* Add Reminder Form */}
      <form onSubmit={handleAddReminder} className="mb-6 p-4 border border-gray-200 rounded">
        <h2 className="text-lg mb-2">Add New Reminder</h2>
        <div className="mb-2">
          <label className="block">User ID:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newReminder.user_id}
            onChange={(e) => setNewReminder({ ...newReminder, user_id: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Reminder Text:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={newReminder.reminder_text}
            onChange={(e) => setNewReminder({ ...newReminder, reminder_text: e.target.value })}
            required
          />
        </div>
        <div className="mb-2">
          <label className="block">Due Date:</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={newReminder.due_date}
            onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Reminder</button>
      </form>

      {/* Reminders List */}
      <h2 className="text-lg mb-2">Reminders</h2>
      <table className="min-w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Reminder Text</th>
            <th className="border p-2">Due Date</th>
            <th className="border p-2">Completed</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((reminder) => (
            <tr key={reminder.reminder_id}>
              <td className="border p-2">{reminder.reminder_id}</td>
              <td className="border p-2">{reminder.user_id}</td>
              <td className="border p-2">{reminder.reminder_text}</td>
              <td className="border p-2">{reminder.due_date}</td>
              <td className="border p-2">{reminder.is_completed ? 'Yes' : 'No'}</td>
              <td className="border p-2">
                <button
                  onClick={() => setReminderToEdit(reminder)}
                  className="bg-yellow-500 text-white p-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReminder(reminder.reminder_id)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Reminder Form */}
      {reminderToEdit.reminder_id && (
        <form onSubmit={handleUpdateReminder} className="mt-6 p-4 border border-gray-200 rounded">
          <h2 className="text-lg mb-2">Update Reminder</h2>
          <div className="mb-2">
            <label className="block">Reminder Text:</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={reminderToEdit.reminder_text}
              onChange={(e) => setReminderToEdit({ ...reminderToEdit, reminder_text: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block">Due Date:</label>
            <input
              type="date"
              className="border p-2 w-full"
              value={reminderToEdit.due_date}
              onChange={(e) => setReminderToEdit({ ...reminderToEdit, due_date: e.target.value })}
              required
            />
          </div>
          <div className="mb-2">
            <label className="block">Completed:</label>
            <input
              type="checkbox"
              className="border p-2"
              checked={reminderToEdit.is_completed}
              onChange={(e) => setReminderToEdit({ ...reminderToEdit, is_completed: e.target.checked })}
            />
          </div>
          <button type="submit" className="bg-green-500 text-white p-2 rounded">Update Reminder</button>
        </form>
      )}
    </div>
  );
};

export default ReminderManager;
