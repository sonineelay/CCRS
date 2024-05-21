from fastapi import APIRouter, HTTPException
from bson import json_util
import json
from bson.objectid import ObjectId
from database import complainants_collection
from models import Complainant

router = APIRouter()

# Retrieve and return a list of complainants
@router.get("/complainants", summary="Getting all Complainant List", tags=["Complainants"])
def get_complainant_list():
    complainant = complainants_collection.find()
    return json.loads(json_util.dumps(list(complainant)))


# Retrieve and return a specific complainant by ID
@router.get("/complainants/{complainant_id}", summary="Getting Complainant details by ID", tags=["Complainants"])
def get_complainant(complainant_id: str):
    complainant = complainants_collection.find_one({"complainant_id": complainant_id})
    if complainant:
        return json.loads(json_util.dumps(complainant))
    else:
        raise HTTPException(status_code=404, detail="Complainant not found")


# Create a new complainant
@router.post("/complainant", summary="Creating a new Complainant", tags=["Complainants"])
def create_complainant(complainant: Complainant):
    try:
        last_complainant = complainants_collection.find_one(sort=[("complainant_id", -1)])
        count = int(last_complainant["complainant_id"].split("CMPLNANT")[1]) + 1 if last_complainant else 1

        complainant.complainant_id = f"CMPLNANT{count:03}"
        complainants_collection.insert_one(complainant.dict())
        
        return {"message": "Complainant created successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


# Update a specific complainant by ID
@router.put("/complainants/{complainant_id}", summary="Updating a Complainant by ID", tags=["Complainants"])
def update_complainant(complainant_id: str, updated_complainant: Complainant):
    # Find the existing complainant
    existing_complainant = complainants_collection.find_one({"complainant_id": complainant_id})

    if existing_complainant:
        # Ensure complainant_id is not updated
        updated_complainant_dict = updated_complainant.dict(exclude_unset=True)
        
        # Update the complainant
        result = complainants_collection.update_one(
            {"complainant_id": complainant_id},
            {"$set": updated_complainant_dict}
        )

        if result.modified_count > 0:
            return {"message": "Complainant updated successfully"}
        else:
            return {"message": "Complainant details are the same, no update performed"}
    else:
        # Complainant not found, raise HTTP 404 error
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complainant not found")  

# Delete a specific complainant by ID 
'''
DELETING COMPLAINANTS CODE IS WORKING BUT DUE TO LEGAL ISSUES NOT ALLOWING IT
'''
# @router.delete("/complainants/{complainant_id}", summary="Deleting a Complainant by ID", tags=["Complainants"])
# def delete_complainant(complainant_id: str):
#     existing_complainant = complainants_collection.find_one({"complainant_id": complainant_id})
#     if existing_complainant:
#         complainants_collection.delete_one({"complainant_id": complainant_id})
#         return {"message": "Complainant deleted successfully"}
#     else:
#         raise HTTPException(status_code=404, detail="Complainant not found")
