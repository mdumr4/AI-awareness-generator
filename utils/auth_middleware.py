from functools import wraps
from flask import request, jsonify
from firebase_admin import auth

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'No token provided'}), 401
        
        id_token = auth_header.split('Bearer ')[1]
        
        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            
            # Get the user
            user = auth.get_user(decoded_token['uid'])
            
            # Add the user to the request
            current_user = {
                'uid': user.uid,
                'email': user.email,
                'displayName': user.display_name
            }
            
            # Call the wrapped function with the user
            return f(current_user=current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 401
    
    return decorated_function

