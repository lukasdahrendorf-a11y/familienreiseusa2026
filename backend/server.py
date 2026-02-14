from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Anthropic API Key
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: str  # "parent" or "child"
    emoji: str = "👤"
    color: str = "#264653"

class FamilyMemberCreate(BaseModel):
    name: str
    role: str
    emoji: str = "👤"
    color: str = "#264653"

class TripPhoto(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: Optional[str] = None

class Trip(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    location: str
    latitude: float
    longitude: float
    start_date: str
    end_date: Optional[str] = None
    photos: List[TripPhoto] = []
    status: str = "planned"  # "planned", "ongoing", "completed"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TripCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    latitude: float
    longitude: float
    start_date: str
    end_date: Optional[str] = None
    photos: List[TripPhoto] = []
    status: str = "planned"

class PackingItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    checked: bool = False
    category: str = "general"

class PackingList(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    trip_id: Optional[str] = None
    title: str
    items: List[PackingItem] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PackingListCreate(BaseModel):
    trip_id: Optional[str] = None
    title: str
    items: List[PackingItem] = []

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Chat Models
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Family Travel Journal API"}

# Family Members
@api_router.get("/family", response_model=List[FamilyMember])
async def get_family_members():
    members = await db.family_members.find({}, {"_id": 0}).to_list(100)
    return members

@api_router.post("/family", response_model=FamilyMember)
async def create_family_member(member: FamilyMemberCreate):
    member_obj = FamilyMember(**member.model_dump())
    doc = member_obj.model_dump()
    await db.family_members.insert_one(doc)
    return member_obj

@api_router.delete("/family/{member_id}")
async def delete_family_member(member_id: str):
    result = await db.family_members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted"}

# Trips
@api_router.get("/trips", response_model=List[Trip])
async def get_trips():
    trips = await db.trips.find({}, {"_id": 0}).to_list(100)
    return trips

@api_router.post("/trips", response_model=Trip)
async def create_trip(trip: TripCreate):
    trip_obj = Trip(**trip.model_dump())
    doc = trip_obj.model_dump()
    await db.trips.insert_one(doc)
    return trip_obj

@api_router.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@api_router.put("/trips/{trip_id}", response_model=Trip)
async def update_trip(trip_id: str, trip_update: TripCreate):
    existing = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    update_data = trip_update.model_dump()
    await db.trips.update_one({"id": trip_id}, {"$set": update_data})
    updated_trip = await db.trips.find_one({"id": trip_id}, {"_id": 0})
    return updated_trip

@api_router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: str):
    result = await db.trips.delete_one({"id": trip_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    return {"message": "Trip deleted"}

# Packing Lists
@api_router.get("/packing-lists", response_model=List[PackingList])
async def get_packing_lists():
    lists = await db.packing_lists.find({}, {"_id": 0}).to_list(100)
    return lists

@api_router.post("/packing-lists", response_model=PackingList)
async def create_packing_list(packing_list: PackingListCreate):
    list_obj = PackingList(**packing_list.model_dump())
    doc = list_obj.model_dump()
    await db.packing_lists.insert_one(doc)
    return list_obj

@api_router.get("/packing-lists/{list_id}", response_model=PackingList)
async def get_packing_list(list_id: str):
    packing_list = await db.packing_lists.find_one({"id": list_id}, {"_id": 0})
    if not packing_list:
        raise HTTPException(status_code=404, detail="Packing list not found")
    return packing_list

@api_router.put("/packing-lists/{list_id}", response_model=PackingList)
async def update_packing_list(list_id: str, list_update: PackingListCreate):
    existing = await db.packing_lists.find_one({"id": list_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Packing list not found")
    
    update_data = list_update.model_dump()
    await db.packing_lists.update_one({"id": list_id}, {"$set": update_data})
    updated_list = await db.packing_lists.find_one({"id": list_id}, {"_id": 0})
    return updated_list

@api_router.delete("/packing-lists/{list_id}")
async def delete_packing_list(list_id: str):
    result = await db.packing_lists.delete_one({"id": list_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Packing list not found")
    return {"message": "Packing list deleted"}

# Toggle packing item
@api_router.patch("/packing-lists/{list_id}/items/{item_id}/toggle")
async def toggle_packing_item(list_id: str, item_id: str):
    packing_list = await db.packing_lists.find_one({"id": list_id}, {"_id": 0})
    if not packing_list:
        raise HTTPException(status_code=404, detail="Packing list not found")
    
    items = packing_list.get("items", [])
    for item in items:
        if item["id"] == item_id:
            item["checked"] = not item["checked"]
            break
    
    await db.packing_lists.update_one({"id": list_id}, {"$set": {"items": items}})
    return {"message": "Item toggled"}

# Status (keeping original)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# Initialize family members if empty
@api_router.post("/init-family")
async def init_family():
    count = await db.family_members.count_documents({})
    if count == 0:
        default_family = [
            {"id": str(uuid.uuid4()), "name": "Lukas", "role": "parent", "emoji": "👨", "color": "#264653"},
            {"id": str(uuid.uuid4()), "name": "Laura", "role": "parent", "emoji": "👩", "color": "#E76F51"},
            {"id": str(uuid.uuid4()), "name": "Kind 1", "role": "child", "emoji": "👦", "color": "#2A9D8F"},
            {"id": str(uuid.uuid4()), "name": "Kind 2", "role": "child", "emoji": "👧", "color": "#E9C46A"},
            {"id": str(uuid.uuid4()), "name": "Kind 3", "role": "child", "emoji": "🧒", "color": "#F4A261"},
        ]
        # Insert without returning documents to avoid ObjectId issues
        for member in default_family:
            await db.family_members.insert_one(member.copy())
        return {"message": "Family initialized"}
    return {"message": "Family already exists"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
