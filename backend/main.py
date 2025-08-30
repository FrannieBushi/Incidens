from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
import sys
from pathlib import Path

current_file = Path(__file__)
backend_dir = current_file.parent
project_root = backend_dir.parent

sys.path.insert(0, str(project_root))
sys.path.insert(0, str(backend_dir))

from app import schemas, crud, models, auth
from app.database import get_db
from app.dependencies import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up application...")
    
    try:
        from app.init_db import init_db
        await init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")
        raise
    
    try:
        from scripts.create_admin import create_admin_user
        await create_admin_user()
        print("Admin user created successfully")
    except Exception as e:
        print(f"Admin creation failed (run manually): {e}")
        print("Run: python scripts/create_admin.py")
    
    yield
    
    print("Shutting down application...")

app = FastAPI(
    title="Incidens API",
    lifespan=lifespan
)

@app.post("/login/")
async def login(credentials: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    user = await crud.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me/", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/")
async def root():
    return {"message": "Incidens API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running normally"}