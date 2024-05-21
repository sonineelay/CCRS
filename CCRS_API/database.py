from pymongo import MongoClient

# Mongo Connection Setup
mongo_client = MongoClient("mongodb://localhost:27017")
crs_db = mongo_client["CCRS"]

# Collections within the CCRS database
complaints_collection = crs_db["Complaints"]
complainants_collection = crs_db["Complainants"]
officers_collection = crs_db["Officers"]
