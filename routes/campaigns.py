from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import os
from langchain.llms import HuggingFaceHub
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import requests
import json
import uuid
from datetime import datetime
from utils.auth_middleware import auth_required

campaigns_bp = Blueprint('campaigns', __name__)
db = firestore.client()

# Initialize Hugging Face LLM
repo_id = "meta-llama/Llama-2-7b-chat-hf"  # You can change this to the model you want to use
llm = HuggingFaceHub(
    repo_id=repo_id,
    model_kwargs={"temperature": 0.7, "max_length": 500}
)

# Create prompt template for awareness campaigns
campaign_template = """
Create an awareness campaign about {topic}. The campaign should include:
1. A catchy title
2. A brief introduction about why this topic is important
3. Key facts and statistics
4. How people can help or take action
5. A powerful closing statement

Make it persuasive, informative, and inspiring.
"""
campaign_prompt = PromptTemplate(
    input_variables=["topic"],
    template=campaign_template
)
campaign_chain = LLMChain(llm=llm, prompt=campaign_prompt)

# Create prompt for image generation
image_prompt_template = """
Create a prompt for an AI image generator to create an awareness campaign poster about {topic}.
The prompt should describe a powerful, visually appealing image that represents the cause.
Keep it under 100 words and focus on visual elements.
"""
image_prompt_chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate(
        input_variables=["topic"],
        template=image_prompt_template
    )
)

@campaigns_bp.route('/generate', methods=['POST'])
@auth_required
def generate_campaign(current_user):
    """Generate a new awareness campaign using AI"""
    try:
        data = request.json
        topic = data.get('topic')
        
        if not topic:
            return jsonify({
                'success': False,
                'message': 'Topic is required'
            }), 400
        
        # Generate campaign text using LangChain + LLaMA
        campaign_text = campaign_chain.run(topic=topic)
        
        # Generate image prompt
        image_prompt = image_prompt_chain.run(topic=topic)
        
        # Generate image using Hugging Face Stable Diffusion API
        image_url = generate_image(image_prompt)
        
        # Create campaign in database
        campaign_id = str(uuid.uuid4())
        campaign = {
            'id': campaign_id,
            'userId': current_user['uid'],
            'topic': topic,
            'text': campaign_text,
            'imageUrl': image_url,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
        
        db.collection('campaigns').document(campaign_id).set(campaign)
        
        return jsonify({
            'success': True,
            'campaign': campaign
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

def generate_image(prompt):
    """Generate an image using Hugging Face Stable Diffusion API"""
    try:
        API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1"
        headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
        
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": prompt}
        )
        
        # For a real implementation, you would save this image to a storage service
        # and return the URL. For simplicity, we'll just return a placeholder.
        return f"https://via.placeholder.com/600x400?text={prompt.replace(' ', '+')}"
    except Exception as e:
        print(f"Error generating image: {e}")
        return "https://via.placeholder.com/600x400?text=Image+Generation+Failed"

@campaigns_bp.route('/list', methods=['GET'])
@auth_required
def list_campaigns(current_user):
    """List all campaigns for the current user"""
    try:
        campaigns_ref = db.collection('campaigns').where('userId', '==', current_user['uid']).order_by('createdAt', direction='DESCENDING')
        campaigns = [doc.to_dict() for doc in campaigns_ref.stream()]
        
        return jsonify({
            'success': True,
            'campaigns': campaigns
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@campaigns_bp.route('/<campaign_id>', methods=['GET'])
@auth_required
def get_campaign(current_user, campaign_id):
    """Get a specific campaign"""
    try:
        campaign_doc = db.collection('campaigns').document(campaign_id).get()
        
        if not campaign_doc.exists:
            return jsonify({
                'success': False,
                'message': 'Campaign not found'
            }), 404
        
        campaign = campaign_doc.to_dict()
        
        # Check if the campaign belongs to the current user
        if campaign['userId'] != current_user['uid']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized'
            }), 403
        
        return jsonify({
            'success': True,
            'campaign': campaign
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@campaigns_bp.route('/<campaign_id>', methods=['PUT'])
@auth_required
def update_campaign(current_user, campaign_id):
    """Update a campaign"""
    try:
        data = request.json
        
        campaign_doc = db.collection('campaigns').document(campaign_id).get()
        
        if not campaign_doc.exists:
            return jsonify({
                'success': False,
                'message': 'Campaign not found'
            }), 404
        
        campaign = campaign_doc.to_dict()
        
        # Check if the campaign belongs to the current user
        if campaign['userId'] != current_user['uid']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized'
            }), 403
        
        # Update the campaign
        updates = {
            'text': data.get('text', campaign['text']),
            'updatedAt': datetime.now().isoformat()
        }
        
        db.collection('campaigns').document(campaign_id).update(updates)
        
        # Get the updated campaign
        updated_campaign = db.collection('campaigns').document(campaign_id).get().to_dict()
        
        return jsonify({
            'success': True,
            'campaign': updated_campaign
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@campaigns_bp.route('/<campaign_id>', methods=['DELETE'])
@auth_required
def delete_campaign(current_user, campaign_id):
    """Delete a campaign"""
    try:
        campaign_doc = db.collection('campaigns').document(campaign_id).get()
        
        if not campaign_doc.exists:
            return jsonify({
                'success': False,
                'message': 'Campaign not found'
            }), 404
        
        campaign = campaign_doc.to_dict()
        
        # Check if the campaign belongs to the current user
        if campaign['userId'] != current_user['uid']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized'
            }), 403
        
        # Delete the campaign
        db.collection('campaigns').document(campaign_id).delete()
        
        return jsonify({
            'success': True,
            'message': 'Campaign deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@campaigns_bp.route('/regenerate/<campaign_id>', methods=['POST'])
@auth_required
def regenerate_campaign(current_user, campaign_id):
    """Regenerate a campaign"""
    try:
        campaign_doc = db.collection('campaigns').document(campaign_id).get()
        
        if not campaign_doc.exists:
            return jsonify({
                'success': False,
                'message': 'Campaign not found'
            }), 404
        
        campaign = campaign_doc.to_dict()
        
        # Check if the campaign belongs to the current user
        if campaign['userId'] != current_user['uid']:
            return jsonify({
                'success': False,
                'message': 'Unauthorized'
            }), 403
        
        # Regenerate the campaign text
        new_text = campaign_chain.run(topic=campaign['topic'])
        
        # Update the campaign
        updates = {
            'text': new_text,
            'updatedAt': datetime.now().isoformat()
        }
        
        db.collection('campaigns').document(campaign_id).update(updates)
        
        # Get the updated campaign
        updated_campaign = db.collection('campaigns').document(campaign_id).get().to_dict()
        
        return jsonify({
            'success': True,
            'campaign': updated_campaign
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

