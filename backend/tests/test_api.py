"""
Backend API Tests for Family Travel Website (Familie Dahrendorf)
Tests all API endpoints: family, trips, packing-lists, suggestions, chat
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://dahrendorf-trip.preview.emergentagent.com')

class TestHealthAndRoot:
    """Test basic API connectivity"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"API Root response: {data}")


class TestFamilyEndpoints:
    """Test family member CRUD operations"""
    
    def test_get_family_members(self):
        """Test retrieving all family members"""
        response = requests.get(f"{BASE_URL}/api/family")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} family members")
        
        # Verify expected family members exist
        names = [m['name'] for m in data]
        expected_names = ['Lukas', 'Laura', 'Louie', 'Levi', 'Noah']
        for name in expected_names:
            assert name in names, f"Expected family member {name} not found"
        print(f"Family members: {names}")
    
    def test_create_and_delete_family_member(self):
        """Test creating and deleting a family member"""
        # Create
        new_member = {
            "name": "TEST_Member",
            "role": "child",
            "emoji": "🧒",
            "color": "#2A9D8F"
        }
        response = requests.post(f"{BASE_URL}/api/family", json=new_member)
        assert response.status_code == 200
        created = response.json()
        assert created['name'] == new_member['name']
        assert 'id' in created
        member_id = created['id']
        print(f"Created test family member with ID: {member_id}")
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/family/{member_id}")
        assert response.status_code == 200
        print(f"Deleted test family member")


class TestTripsEndpoints:
    """Test trip CRUD operations"""
    
    def test_get_trips(self):
        """Test retrieving all trips"""
        response = requests.get(f"{BASE_URL}/api/trips")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have at least one trip"
        print(f"Found {len(data)} trips")
        
        # Check main trip data
        trip = data[0]
        assert 'title' in trip
        assert 'USA' in trip['title'] or 'Westküste' in trip['title'] or 'Westkuste' in trip['title']
        assert trip['start_date'] == '2026-07-17'
        assert trip['end_date'] == '2026-08-11'
        print(f"Main trip: {trip['title']}")


class TestSuggestionsEndpoints:
    """Test suggestions (Alex' Tipps) endpoints"""
    
    def test_get_suggestions(self):
        """Test retrieving all suggestions"""
        response = requests.get(f"{BASE_URL}/api/suggestions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 3, "Should have exactly 3 suggestions"
        print(f"Found {len(data)} suggestions")
        
        # Check suggestion details
        titles = [s['title'] for s in data]
        expected_titles = ['Mount St. Helens', 'Leavenworth', 'Yellowstone']
        for expected in expected_titles:
            found = any(expected in title for title in titles)
            assert found, f"Expected suggestion '{expected}' not found"
        
        # Verify image URLs
        for sug in data:
            assert 'image_url' in sug
            assert 'customer-assets.emergentagent.com' in sug['image_url'], f"Image URL should be from customer-assets: {sug['image_url']}"
        print(f"Suggestions: {titles}")
    
    def test_toggle_suggestion(self):
        """Test toggling a suggestion"""
        # Get suggestions first
        response = requests.get(f"{BASE_URL}/api/suggestions")
        assert response.status_code == 200
        suggestions = response.json()
        
        if suggestions:
            suggestion_id = suggestions[0]['id']
            initial_state = suggestions[0].get('added_to_trip', False)
            
            # Toggle
            response = requests.patch(f"{BASE_URL}/api/suggestions/{suggestion_id}/toggle")
            assert response.status_code == 200
            data = response.json()
            assert data['added_to_trip'] != initial_state
            print(f"Toggled suggestion {suggestion_id}: added_to_trip = {data['added_to_trip']}")
            
            # Toggle back
            response = requests.patch(f"{BASE_URL}/api/suggestions/{suggestion_id}/toggle")
            assert response.status_code == 200
            print(f"Toggled suggestion back")


class TestPackingListsEndpoints:
    """Test packing list CRUD operations"""
    
    def test_get_packing_lists(self):
        """Test retrieving all packing lists"""
        response = requests.get(f"{BASE_URL}/api/packing-lists")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} packing lists")
        
        if data:
            packing_list = data[0]
            assert 'title' in packing_list
            assert 'items' in packing_list
            print(f"First packing list: {packing_list['title']} with {len(packing_list['items'])} items")
    
    def test_create_update_delete_packing_list(self):
        """Test full CRUD cycle for packing list"""
        # Create
        new_list = {
            "title": "TEST_PackingList",
            "trip_id": None,
            "items": [
                {"id": "test-item-1", "name": "Test Item 1", "checked": False, "category": "sonstiges"}
            ]
        }
        response = requests.post(f"{BASE_URL}/api/packing-lists", json=new_list)
        assert response.status_code == 200
        created = response.json()
        assert created['title'] == new_list['title']
        list_id = created['id']
        print(f"Created test packing list with ID: {list_id}")
        
        # Update
        updated_list = {
            "title": "TEST_PackingList_Updated",
            "trip_id": None,
            "items": [
                {"id": "test-item-1", "name": "Test Item 1 Updated", "checked": True, "category": "kleidung"}
            ]
        }
        response = requests.put(f"{BASE_URL}/api/packing-lists/{list_id}", json=updated_list)
        assert response.status_code == 200
        updated = response.json()
        assert updated['title'] == updated_list['title']
        print(f"Updated packing list")
        
        # Verify with GET
        response = requests.get(f"{BASE_URL}/api/packing-lists/{list_id}")
        assert response.status_code == 200
        fetched = response.json()
        assert fetched['title'] == updated_list['title']
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/packing-lists/{list_id}")
        assert response.status_code == 200
        print(f"Deleted test packing list")
        
        # Verify deletion
        response = requests.get(f"{BASE_URL}/api/packing-lists/{list_id}")
        assert response.status_code == 404


class TestChatEndpoint:
    """Test AI chat endpoint"""
    
    def test_chat_endpoint(self):
        """Test chat with travel assistant"""
        request_data = {
            "message": "Hallo, was kann ich in Yosemite machen?",
            "session_id": None
        }
        response = requests.post(f"{BASE_URL}/api/chat", json=request_data)
        assert response.status_code == 200
        data = response.json()
        assert 'response' in data
        assert 'session_id' in data
        assert len(data['response']) > 0
        print(f"Chat response length: {len(data['response'])} characters")
        print(f"Session ID: {data['session_id']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
