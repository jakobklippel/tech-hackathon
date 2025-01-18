from fastapi import APIRouter

router = APIRouter()

@router.get("/jobs")
async def root():
    return {"message": "Hello World"}