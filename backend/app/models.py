from sqlalchemy import Column, Integer, String, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import relationship

from backend.app.database import Base
from .database import Base


# ========================
# AUXILIARY TABLES
# ========================

class Office(Base):
    __tablename__ = "office"

    office_id = Column(Integer, primary_key=True, index=True)
    city = Column(String(100), nullable=False)

    users = relationship("User", back_populates="office", cascade="all, delete")
    devices = relationship("Device", back_populates="office", cascade="all, delete")
    incidents = relationship("Incident", back_populates="office", cascade="all, delete")


class UserRole(Base):
    __tablename__ = "user_role"

    role_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


class DeviceType(Base):
    __tablename__ = "device_type"

    type_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    devices = relationship("Device", back_populates="type")


class IncidentStatus(Base):
    __tablename__ = "incident_status"

    status_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    incidents = relationship("Incident", back_populates="status")
    history = relationship("IncidentHistory", back_populates="status")


# ========================
# MAIN TABLES
# ========================

class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    office_id = Column(Integer, ForeignKey("office.office_id", ondelete="SET NULL"))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role_id = Column(Integer, ForeignKey("user_role.role_id"), nullable=False)

    office = relationship("Office", back_populates="users")
    role = relationship("UserRole", back_populates="users")
    owned_devices = relationship("Device", back_populates="owner")
    reported_incidents = relationship("Incident", foreign_keys="[Incident.reporter_id]", back_populates="reporter")
    resolved_incidents = relationship("Incident", foreign_keys="[Incident.resolver_id]", back_populates="resolver")


class Device(Base):
    __tablename__ = "device"

    device_id = Column(Integer, primary_key=True, index=True)
    office_id = Column(Integer, ForeignKey("office.office_id", ondelete="CASCADE"))
    owner_id = Column(Integer, ForeignKey("user.user_id", ondelete="SET NULL"))
    type_id = Column(Integer, ForeignKey("device_type.type_id"), nullable=False)

    office = relationship("Office", back_populates="devices")
    owner = relationship("User", back_populates="owned_devices")
    type = relationship("DeviceType", back_populates="devices")
    incidents = relationship("Incident", back_populates="device")


class Incident(Base):
    __tablename__ = "incident"

    incident_id = Column(Integer, primary_key=True, index=True)
    opened_at = Column(TIMESTAMP, nullable=False)
    status_id = Column(Integer, ForeignKey("incident_status.status_id"), nullable=False)
    description = Column(Text, nullable=False)
    reporter_id = Column(Integer, ForeignKey("user.user_id", ondelete="SET NULL"))
    resolver_id = Column(Integer, ForeignKey("user.user_id", ondelete="SET NULL"))
    office_id = Column(Integer, ForeignKey("office.office_id", ondelete="CASCADE"))
    device_id = Column(Integer, ForeignKey("device.device_id", ondelete="SET NULL"))
    resolved_at = Column(TIMESTAMP)

    status = relationship("IncidentStatus", back_populates="incidents")
    reporter = relationship("User", foreign_keys=[reporter_id], back_populates="reported_incidents")
    resolver = relationship("User", foreign_keys=[resolver_id], back_populates="resolved_incidents")
    office = relationship("Office", back_populates="incidents")
    device = relationship("Device", back_populates="incidents")
    history = relationship("IncidentHistory", back_populates="incident", cascade="all, delete")


# ========================
# INCIDENT HISTORY
# ========================

class IncidentHistory(Base):
    __tablename__ = "incident_history"

    history_id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incident.incident_id", ondelete="CASCADE"))
    status_id = Column(Integer, ForeignKey("incident_status.status_id"), nullable=False)
    date = Column(TIMESTAMP, nullable=False)
    comment = Column(Text)

    incident = relationship("Incident", back_populates="history")
    status = relationship("IncidentStatus", back_populates="history")