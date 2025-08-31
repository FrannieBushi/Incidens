from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List  
from contextlib import asynccontextmanager
import sys
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware  

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

@app.get("/users/", response_model=List[schemas.UserResponse])
async def get_users(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="No autorizado")
    result = await db.execute(select(models.User))
    return result.scalars().all()

@app.post("/users/", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="No autorizado")
    return await crud.create_user(db, user)

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
async def update_user(user_id: int, user: schemas.UserUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="No autorizado")
    return await crud.update_user(db, user_id, user)

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role_id != 1:
        raise HTTPException(status_code=403, detail="No autorizado")
    success = await crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado"}

@app.get("/offices/", response_model=List[schemas.OfficeResponse])
async def get_offices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Office))
    return result.scalars().all()

@app.get("/user-roles/", response_model=List[schemas.UserRoleResponse])
async def get_user_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.UserRole))
    return result.scalars().all()

@app.get("/incident-statuses/", response_model=List[schemas.IncidentStatusResponse])
async def get_incident_statuses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.IncidentStatus))
    return result.scalars().all()

@app.get("/device-types/", response_model=List[schemas.DeviceTypeResponse])
async def get_device_types(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.DeviceType))
    return result.scalars().all()

@app.get("/incidents/", response_model=List[schemas.IncidentResponse])
async def get_incidents(db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = await db.execute(select(models.Incident))
    return result.scalars().all()

@app.post("/incidents/", response_model=schemas.IncidentResponse)
async def create_incident(incident: schemas.IncidentCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return await crud.create_incident(db, incident)

@app.put("/incidents/{incident_id}", response_model=schemas.IncidentResponse)
async def update_incident(incident_id: int, incident: schemas.IncidentUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return await crud.update_incident(db, incident_id, incident)

@app.delete("/incidents/{incident_id}")
async def delete_incident(incident_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    success = await crud.delete_incident(db, incident_id)
    if not success:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    return {"message": "Incidencia eliminada"}