from flask import Blueprint, request, jsonify
from firebase_admin import auth
import json

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with email and password"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('name')
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'uid': user.uid,
                'email': user.email,
                'displayName': user.display_name
            }
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """This endpoint doesn't actually log in the user - Firebase Auth handles that client-side.
    This is just for verifying tokens sent from the client."""
    try:
        data = request.json
        id_token = data.get('idToken')
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Get the user
        user = auth.get_user(uid)
        
        return jsonify({
            'success': True,
            'user': {
                'uid': user.uid,
                'email': user.email,
                'displayName': user.display_name
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 401

@auth_bp.route('/user', methods=['GET'])
def get_user():
    """Get user details from a token"""
    try:
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'No token provided'}), 401
        
        id_token = auth_header.split('Bearer ')[1]
        
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        # Get the user
        user = auth.get_user(uid)
        
        return jsonify({
            'success': True,
            'user': {
                'uid': user.uid,
                'email': user.email,
                'displayName': user.display_name
            }
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 401

