from fastapi import FastAPI, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app import schemas, crud  
from backend.app.database import engine, Base, get_db 

app = FastAPI()

# Crear tablas si no existen 
'''
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
'''

@app.get("/")
async def root():
    return {"message": "API funcionando en modo async"}

@app.get("/users/", response_model=list[schemas.UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    return await crud.get_users(db)

@app.post("/users/", response_model=schemas.UserResponse)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    return await crud.create_user(db, user)