from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status")
async def auth_status():
    """Authentication scaffold for future JWT/session support."""
    return {
        "authenticated": False,
        "message": "Demo mode — reports are stored locally without login.",
    }
