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

# Suggestion Models (Alex' Vorschläge)
class Suggestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    location: str
    latitude: float
    longitude: float
    duration: str  # e.g. "1 Tag", "+4-5 Tage"
    image_url: str
    highlights: List[str] = []
    is_extension: bool = False  # True for Yellowstone (adds days to trip)
    added_to_trip: bool = False

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

# ==================== SUGGESTIONS (Alex' Vorschläge) ====================

@api_router.get("/suggestions", response_model=List[Suggestion])
async def get_suggestions():
    suggestions = await db.suggestions.find({}, {"_id": 0}).to_list(100)
    return suggestions

@api_router.patch("/suggestions/{suggestion_id}/toggle")
async def toggle_suggestion(suggestion_id: str):
    suggestion = await db.suggestions.find_one({"id": suggestion_id}, {"_id": 0})
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    new_status = not suggestion.get("added_to_trip", False)
    await db.suggestions.update_one({"id": suggestion_id}, {"$set": {"added_to_trip": new_status}})
    return {"message": "Suggestion toggled", "added_to_trip": new_status}

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

# ==================== AI CHAT ====================

# System prompt for the travel assistant
TRAVEL_ASSISTANT_PROMPT = """Du bist ein freundlicher Reise-Assistent für die Familie Dahrendorf (Lukas, Laura und ihre 3 Söhne).

Die Familie plant einen 26-tägigen Roadtrip an der USA Westküste im Sommer 2026:
- Start: Las Vegas (17.-18. Juli 2026)
- Los Angeles & Disneyland (19.-21. Juli)
- Sequoia National Park (22.-23. Juli)
- Yosemite National Park (24.-26. Juli)
- San Francisco (27.-28. Juli) - hier Wohnmobil-Übernahme
- Redwood National Park (29.-31. Juli)
- Oregon Coast (1.-3. August)
- Olympic National Park (4.-6. August)
- Alex' Tipps: Mount St. Helens & Leavenworth (7.-8. August)
- Seattle (9.-11. August) - Ende & Rückflug

Optionale Verlängerung: Yellowstone National Park (+4-5 Tage)

Du hilfst bei:
- Tipps für Familienreisen mit Kindern
- Restaurant-Empfehlungen
- Aktivitäten an jedem Ort
- Packlisten-Vorschläge
- Wetter und beste Reisezeiten
- Junior Ranger Programme in Nationalparks
- Hotelbuchungen und Campingplätze

Antworte immer auf Deutsch, freundlich und familienorientiert. Halte Antworten kompakt aber hilfreich."""

# Store chat sessions in memory (for demo purposes)
chat_sessions = {}

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())
    
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured")
    
    try:
        # Get or create chat instance for this session
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=ANTHROPIC_API_KEY,
                session_id=session_id,
                system_message=TRAVEL_ASSISTANT_PROMPT
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Store in database for persistence
        chat_record = {
            "session_id": session_id,
            "user_message": request.message,
            "assistant_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_history.insert_one(chat_record)
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str):
    history = await db.chat_history.find(
        {"session_id": session_id}, 
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    return history

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

@app.on_event("startup")
async def init_database():
    """Initialize database with default data on startup"""
    logger.info("Checking database initialization...")
    
    # Initialize family if empty
    family_count = await db.family_members.count_documents({})
    if family_count == 0:
        logger.info("Initializing family members...")
        default_family = [
            {"id": str(uuid.uuid4()), "name": "Lukas", "role": "parent", "emoji": "👨", "color": "#264653"},
            {"id": str(uuid.uuid4()), "name": "Laura", "role": "parent", "emoji": "👩", "color": "#E76F51"},
            {"id": str(uuid.uuid4()), "name": "Louie", "role": "child", "emoji": "👦", "color": "#2A9D8F"},
            {"id": str(uuid.uuid4()), "name": "Levi", "role": "child", "emoji": "👦", "color": "#E9C46A"},
            {"id": str(uuid.uuid4()), "name": "Noah", "role": "child", "emoji": "👦", "color": "#F4A261"},
        ]
        for member in default_family:
            await db.family_members.insert_one(member.copy())
        logger.info("Family initialized!")
    
    # Initialize trips if empty
    trips_count = await db.trips.count_documents({})
    if trips_count == 0:
        logger.info("Initializing USA Westküste 2026 trip...")
        default_trips = [
            {"id": str(uuid.uuid4()), "title": "USA Westküste 2026 - Family Road Trip", "description": "26-tägiger Familien-Roadtrip für Lukas, Laura, Louie, Levi & Noah.\n\n🗓️ 17. Juli - 11. August 2026\n\n📍 ROUTE:\n• Tag 1-2: Las Vegas - Ankunft, Strip, Helikopterflug\n• Tag 3-5: Los Angeles - Disneyland, Hollywood, Santa Monica\n• Tag 6-7: Sequoia NP - General Sherman Tree\n• Tag 8-10: Yosemite NP - El Capitan, Half Dome\n• Tag 11-12: San Francisco - Cable Car, Alcatraz\n• Tag 13-15: Redwood NP - Avenue of the Giants\n• Tag 16-18: Oregon Coast - Cannon Beach\n• Tag 19-21: Olympic NP - Hoh Rainforest\n• Tag 24-26: Seattle - Space Needle", "location": "Las Vegas → Seattle (USA Westküste)", "latitude": 39.5, "longitude": -119.5, "start_date": "2026-07-17", "end_date": "2026-08-11", "status": "planned", "photos": [{"id": "p1", "url": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800&q=80", "caption": "Las Vegas"}], "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        for trip in default_trips:
            await db.trips.insert_one(trip.copy())
        logger.info(f"Initialized {len(default_trips)} trip!")
    
    # Initialize suggestions (Alex' Vorschläge) if empty
    suggestions_count = await db.suggestions.count_documents({})
    if suggestions_count == 0:
        logger.info("Initializing Alex suggestions...")
        default_suggestions = [
            {
                "id": str(uuid.uuid4()),
                "title": "Mount St. Helens",
                "description": "Der Vulkan, dessen Nordseite 1980 weggesprengt wurde - eine Explosion 500-mal stärker als Hiroshima! Johnston Ridge Observatory mit Blick direkt in den Krater.",
                "location": "Mount St. Helens, Washington",
                "latitude": 46.1914,
                "longitude": -122.1956,
                "duration": "1 Tag",
                "image_url": "https://customer-assets.emergentagent.com/job_family-travel-hub/artifacts/34y8hl7i_IMG_2693.jpeg",
                "highlights": ["Johnston Ridge Observatory", "Blick in den Krater", "Interaktive Ausstellungen", "Umgestürzte Baumstämme"],
                "is_extension": False,
                "added_to_trip": False
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Leavenworth - Little Bavaria",
                "description": "Ein komplettes bayerisches Dorf mitten in den Cascade Mountains! Fachwerkhäuser, Biergärten, Brezeln - als wärt ihr in Garmisch gelandet.",
                "location": "Leavenworth, Washington",
                "latitude": 47.5962,
                "longitude": -120.6615,
                "duration": "1-2 Tage",
                "image_url": "https://customer-assets.emergentagent.com/job_family-travel-hub/artifacts/e9libzqo_IMG_2692.jpeg",
                "highlights": ["Bayerische Biergärten", "Nussknacker-Museum", "Tubing am Wenatchee River", "Wandern in den Cascades"],
                "is_extension": False,
                "added_to_trip": False
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Yellowstone National Park",
                "description": "Der älteste Nationalpark der Welt - sitzt auf einem Supervulkan! Old Faithful, Grand Prismatic Spring, Mammoth Hot Springs und wilde Tiere.",
                "location": "Yellowstone National Park, Wyoming",
                "latitude": 44.4280,
                "longitude": -110.5885,
                "duration": "+4-5 Tage",
                "image_url": "https://customer-assets.emergentagent.com/job_family-travel-hub/artifacts/95zuar5m_IMG_2694.webp",
                "highlights": ["Old Faithful Geysir", "Grand Prismatic Spring", "Mammoth Hot Springs", "Bisons im Lamar Valley", "Junior Ranger Badge"],
                "is_extension": True,
                "added_to_trip": False
            }
        ]
        for suggestion in default_suggestions:
            await db.suggestions.insert_one(suggestion.copy())
        logger.info(f"Initialized {len(default_suggestions)} suggestions!")
    
    # Initialize packing list if empty
    packing_count = await db.packing_lists.count_documents({})
    if packing_count == 0:
        logger.info("Initializing packing list...")
        packing_list = {
            "id": str(uuid.uuid4()),
            "title": "USA Westkuste 2026 - Packliste",
            "trip_id": None,
            "items": [
                {"id": "i1", "name": "Reisepässe für alle 5", "checked": False, "category": "dokumente"},
                {"id": "i2", "name": "ESTA Genehmigungen", "checked": False, "category": "dokumente"},
                {"id": "i3", "name": "Führerschein (international)", "checked": False, "category": "dokumente"},
                {"id": "i4", "name": "Kreditkarten", "checked": False, "category": "dokumente"},
                {"id": "i5", "name": "Wanderschuhe (5x)", "checked": False, "category": "kleidung"},
                {"id": "i6", "name": "Regenjacken", "checked": False, "category": "kleidung"},
                {"id": "i7", "name": "Badekleidung", "checked": False, "category": "kleidung"},
                {"id": "i8", "name": "Kamera + Ladegerät", "checked": False, "category": "elektronik"},
                {"id": "i9", "name": "Tablet für Autofahrten", "checked": False, "category": "elektronik"},
                {"id": "i10", "name": "Fernglas (Wildtiere!)", "checked": False, "category": "elektronik"},
                {"id": "i11", "name": "Sonnencreme LSF 50", "checked": False, "category": "toilettenartikel"},
                {"id": "i12", "name": "Reiseapotheke", "checked": False, "category": "toilettenartikel"},
                {"id": "i13", "name": "Junior Ranger Hefte", "checked": False, "category": "kinder"},
                {"id": "i14", "name": "Snacks für Autofahrten", "checked": False, "category": "essen"},
            ],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.packing_lists.insert_one(packing_list.copy())
        logger.info("Packing list initialized!")
    
    logger.info("Database initialization complete!")
