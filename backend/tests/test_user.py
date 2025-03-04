"""This file contains unit tests for user-related functionality"""

import unittest
from app import create_app
from app.models.user import User
from app import db

class UserTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_create_user(self):
        user = User(username='testuser', email='test@example.com', password='password')
        db.session.add(user)
        db.session.commit()
        self.assertEqual(user.username, 'testuser')

if __name__ == '__main__':
    unittest.main()