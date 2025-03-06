from flask import Blueprint, request, jsonify
import os
from newsapi import NewsApiClient
from utils.auth_middleware import auth_required

news_bp = Blueprint('news', __name__)

# Initialize NewsAPI
newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))

@news_bp.route('/trending', methods=['GET'])
@auth_required
def get_trending_news(current_user):
    """Get trending news related to social and environmental causes"""
    try:
        # Get query parameters
        topic = request.args.get('topic', 'environment')
        page_size = int(request.args.get('pageSize', 5))
        page = int(request.args.get('page', 1))
        
        # Get news from NewsAPI
        news = newsapi.get_everything(
            q=topic,
            language='en',
            sort_by='publishedAt',
            page_size=page_size,
            page=page
        )
        
        return jsonify({
            'success': True,
            'news': news['articles'],
            'totalResults': news['totalResults']
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@news_bp.route('/topics', methods=['GET'])
@auth_required
def get_news_topics(current_user):
    """Get predefined news topics for awareness campaigns"""
    topics = [
        {'id': 'environment', 'name': 'Environment', 'icon': 'leaf'},
        {'id': 'climate', 'name': 'Climate Change', 'icon': 'thermometer'},
        {'id': 'health', 'name': 'Health', 'icon': 'heart'},
        {'id': 'education', 'name': 'Education', 'icon': 'book'},
        {'id': 'poverty', 'name': 'Poverty', 'icon': 'dollar-sign'},
        {'id': 'equality', 'name': 'Equality', 'icon': 'users'},
        {'id': 'water', 'name': 'Clean Water', 'icon': 'droplet'},
        {'id': 'energy', 'name': 'Renewable Energy', 'icon': 'zap'},
        {'id': 'wildlife', 'name': 'Wildlife Conservation', 'icon': 'github'},
        {'id': 'ocean', 'name': 'Ocean Conservation', 'icon': 'anchor'}
    ]
    
    return jsonify({
        'success': True,
        'topics': topics
    }), 200

