import os
import uvicorn
from app.config import settings

if __name__ == "__main__":
    # Render assigns the port dynamically through the PORT environment variable
    port = int(os.environ.get("PORT", settings.PORT))
    host = os.environ.get("HOST", settings.HOST)
    
    print(f"🚀 Starting PrepMate AI Backend on {host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
