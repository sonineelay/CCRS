from fastapi import APIRouter, HTTPException
from bson import json_util
import json
from bson.objectid import ObjectId
from database import officers_collection
from models import Officer,Status
from datetime import datetime


router = APIRouter()

# Retrieve and return a list of officers
@router.get("/officers", summary="Getting all Officers List", tags=["Officers"])
def get_officer_list():
    officers = officers_collection.find()
    return json.loads(json_util.dumps(list(officers)))




# Retrieve and return a specific officer by ID
@router.get("/officers/{officer_id}", summary="Getting officer details by ID", tags=["Officers"])
def get_officer(officer_id: str):
    officer = officers_collection.find_one({"officer_id": officer_id})
    if officer:
        return json.loads(json_util.dumps(officer))
    else:
        raise HTTPException(status_code=404, detail="officer not found")


# Create a new officer
@router.post("/officer", summary="Creating a new Officer", tags=["Officers"])
def create_officer(officer: Officer):
    try:
        last_officer = officers_collection.find_one(sort=[("officer_id", -1)])
        count = int(last_officer["officer_id"].split("OFFCR")[1]) + 1 if last_officer else 1
        
        officer.officer_id = f"OFFCR{count:03}"
        officers_collection.insert_one(officer.dict())
        # officer.status = Status.registered
        
        return {"message": "officer created successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# Update a specific officer by ID
@router.put("/officers/{officer_id}", summary="Updating a Officer by ID", tags=["Officers"])
def update_officer(officer_id: str, officer: Officer):
    # Find the existing Officer
    existing_officer = officers_collection.find_one({"officer_id": officer_id})

    if Officer:
        # Ensure Officer_id is not updated
        officer_dict = officer.dict(exclude_unset=True)
        
        # Update the Officer
        result = officers_collection.update_one(
            {"officer_id": officer_id},
            {"$set": officer_dict}
        )

        if result.modified_count > 0:
            return {"message": "Officer updated successfully"}
        else:
            return {"message": "Officer details are the same, no update performed"}
    else:
        # Officer not found, raise HTTP 404 error
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Officer not found")  


# Delete a specific officer by ID 
'''
DELETING officerS CODE IS WORKING BUT DUE TO LEGAL ISSUES NOT ALLOWING IT
'''
# @router.delete("/officers/{officer_id}", summary="Deleting a officer by ID", tags=["officers"])
# def delete_officer(officer_id: str):
#     existing_officer = officers_collection.find_one({"officer_id": officer_id})
#     if existing_officer:
#         officers_collection.delete_one({"officer_id": officer_id})
#         return {"message": "officer deleted successfully"}
#     else:
#         raise HTTPException(status_code=404, detail="officer not found")
