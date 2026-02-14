import requests
import sys
from datetime import datetime
import json

class FamilyTravelAPITester:
    def __init__(self, base_url="https://dahrendorf-trip.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.family_member_id = None
        self.trip_id = None
        self.packing_list_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, description=""):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        if description:
            print(f"   Description: {description}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json() if response.content else {}
                    return success, response_data
                except:
                    return success, {"message": "Non-JSON response"}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test(
            "API Root",
            "GET",
            "",
            200,
            description="Check if API is responding"
        )

    def test_init_family(self):
        """Test family initialization"""
        return self.run_test(
            "Initialize Family",
            "POST",
            "init-family",
            200,
            description="Initialize default family members"
        )

    def test_get_family(self):
        """Test getting family members"""
        return self.run_test(
            "Get Family Members",
            "GET",
            "family",
            200,
            description="Retrieve all family members"
        )

    def test_create_family_member(self):
        """Test creating a new family member"""
        member_data = {
            "name": "Test Member",
            "role": "child", 
            "emoji": "👶",
            "color": "#E9C46A"
        }
        success, response = self.run_test(
            "Create Family Member",
            "POST", 
            "family",
            200,
            data=member_data,
            description="Add a new family member"
        )
        if success and 'id' in response:
            self.family_member_id = response['id']
        return success, response

    def test_delete_family_member(self):
        """Test deleting a family member"""
        if not self.family_member_id:
            print("❌ No family member ID to delete")
            return False, {}
        
        return self.run_test(
            "Delete Family Member",
            "DELETE",
            f"family/{self.family_member_id}",
            200,
            description="Remove a family member"
        )

    def test_get_trips(self):
        """Test getting trips"""
        return self.run_test(
            "Get Trips",
            "GET",
            "trips",
            200,
            description="Retrieve all trips"
        )

    def test_create_trip(self):
        """Test creating a new trip"""
        trip_data = {
            "title": "Test Trip to Paris",
            "description": "A wonderful test trip",
            "location": "Paris, France",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "start_date": "2024-06-01",
            "end_date": "2024-06-07",
            "status": "planned",
            "photos": []
        }
        success, response = self.run_test(
            "Create Trip",
            "POST",
            "trips",
            200,
            data=trip_data,
            description="Add a new trip"
        )
        if success and 'id' in response:
            self.trip_id = response['id']
        return success, response

    def test_get_trip_by_id(self):
        """Test getting a specific trip"""
        if not self.trip_id:
            print("❌ No trip ID to retrieve")
            return False, {}
        
        return self.run_test(
            "Get Trip by ID",
            "GET",
            f"trips/{self.trip_id}",
            200,
            description="Retrieve specific trip"
        )

    def test_update_trip(self):
        """Test updating a trip"""
        if not self.trip_id:
            print("❌ No trip ID to update")
            return False, {}
        
        updated_data = {
            "title": "Updated Test Trip to Paris",
            "description": "An updated wonderful test trip",
            "location": "Paris, France",
            "latitude": 48.8566,
            "longitude": 2.3522,
            "start_date": "2024-07-01",
            "end_date": "2024-07-07",
            "status": "ongoing",
            "photos": []
        }
        return self.run_test(
            "Update Trip",
            "PUT",
            f"trips/{self.trip_id}",
            200,
            data=updated_data,
            description="Update trip details"
        )

    def test_get_packing_lists(self):
        """Test getting packing lists"""
        return self.run_test(
            "Get Packing Lists",
            "GET",
            "packing-lists",
            200,
            description="Retrieve all packing lists"
        )

    def test_create_packing_list(self):
        """Test creating a packing list"""
        list_data = {
            "title": "Test Packing List",
            "trip_id": self.trip_id,
            "items": [
                {
                    "name": "Passport",
                    "checked": False,
                    "category": "dokumente"
                },
                {
                    "name": "T-Shirts",
                    "checked": False,
                    "category": "kleidung"
                }
            ]
        }
        success, response = self.run_test(
            "Create Packing List",
            "POST",
            "packing-lists",
            200,
            data=list_data,
            description="Add a new packing list"
        )
        if success and 'id' in response:
            self.packing_list_id = response['id']
        return success, response

    def test_get_packing_list_by_id(self):
        """Test getting a specific packing list"""
        if not self.packing_list_id:
            print("❌ No packing list ID to retrieve")
            return False, {}
        
        return self.run_test(
            "Get Packing List by ID",
            "GET",
            f"packing-lists/{self.packing_list_id}",
            200,
            description="Retrieve specific packing list"
        )

    def test_toggle_packing_item(self):
        """Test toggling a packing list item"""
        if not self.packing_list_id:
            print("❌ No packing list ID to toggle item")
            return False, {}
        
        # First get the list to find an item ID
        success, list_data = self.test_get_packing_list_by_id()
        if not success or not list_data.get('items'):
            print("❌ No items in packing list to toggle")
            return False, {}
        
        item_id = list_data['items'][0]['id']
        return self.run_test(
            "Toggle Packing Item",
            "PATCH",
            f"packing-lists/{self.packing_list_id}/items/{item_id}/toggle",
            200,
            description="Toggle item checked state"
        )

    def test_delete_trip(self):
        """Test deleting a trip"""
        if not self.trip_id:
            print("❌ No trip ID to delete")
            return False, {}
        
        return self.run_test(
            "Delete Trip",
            "DELETE",
            f"trips/{self.trip_id}",
            200,
            description="Remove a trip"
        )

    def test_delete_packing_list(self):
        """Test deleting a packing list"""
        if not self.packing_list_id:
            print("❌ No packing list ID to delete")
            return False, {}
        
        return self.run_test(
            "Delete Packing List",
            "DELETE",
            f"packing-lists/{self.packing_list_id}",
            200,
            description="Remove a packing list"
        )

def main():
    print("🚀 Starting Family Travel API Tests")
    print("=" * 50)
    
    tester = FamilyTravelAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_init_family,
        tester.test_get_family,
        tester.test_create_family_member,
        tester.test_delete_family_member,
        tester.test_get_trips,
        tester.test_create_trip,
        tester.test_get_trip_by_id,
        tester.test_update_trip,
        tester.test_get_packing_lists,
        tester.test_create_packing_list,
        tester.test_get_packing_list_by_id,
        tester.test_toggle_packing_item,
        tester.test_delete_trip,
        tester.test_delete_packing_list,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Backend API Test Results:")
    print(f"   Total tests: {tester.tests_run}")
    print(f"   Passed: {tester.tests_passed}")
    print(f"   Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())