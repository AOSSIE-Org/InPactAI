from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    Float,
    Text,
    JSON,
    DECIMAL,
    DateTime,
    Boolean,
    TIMESTAMP,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.db import Base
import uuid


def generate_uuid():
    return str(uuid.uuid4())


# User Table (Creators & Brands)
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    # password_hash = Column(Text, nullable=False)  # Removed as Supabase handles auth
    role = Column(String, nullable=False)  # 'creator' or 'brand'
    profile_image = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    is_online = Column(Boolean, default=False)  # ✅ Track if user is online
    last_seen = Column(TIMESTAMP, default=datetime.utcnow)

    audience = relationship("AudienceInsights", back_populates="user", uselist=False)
    sponsorships = relationship("Sponsorship", back_populates="brand")
    posts = relationship("UserPost", back_populates="user")
    applications = relationship("SponsorshipApplication", back_populates="creator")
    payments = relationship(
        "SponsorshipPayment",
        foreign_keys="[SponsorshipPayment.creator_id]",
        back_populates="creator",
    )
    brand_payments = relationship(
        "SponsorshipPayment",
        foreign_keys="[SponsorshipPayment.brand_id]",
        back_populates="brand",
    )


# Audience Insights Table
class AudienceInsights(Base):
    __tablename__ = "audience_insights"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    audience_age_group = Column(JSON)
    audience_location = Column(JSON)
    engagement_rate = Column(Float)
    average_views = Column(Integer)
    time_of_attention = Column(Integer)  # in seconds
    price_expectation = Column(DECIMAL(10, 2))
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="audience")


# Sponsorship Table (For Brands)
class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(String, primary_key=True, default=generate_uuid)
    brand_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_audience = Column(JSON)  # {"age": ["18-24"], "location": ["USA", "UK"]}
    budget = Column(DECIMAL(10, 2))
    engagement_minimum = Column(Float)
    status = Column(String, default="open")
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    brand = relationship("User", back_populates="sponsorships")
    applications = relationship("SponsorshipApplication", back_populates="sponsorship")


# User Posts Table
class UserPost(Base):
    __tablename__ = "user_posts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    post_url = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    engagement_metrics = Column(JSON)  # {"likes": 500, "comments": 100, "shares": 50}
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="posts")


# Sponsorship Applications Table
class SponsorshipApplication(Base):
    __tablename__ = "sponsorship_applications"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    sponsorship_id = Column(String, ForeignKey("sponsorships.id"), nullable=False)
    post_id = Column(String, ForeignKey("user_posts.id"), nullable=True)
    proposal = Column(Text, nullable=False)
    status = Column(String, default="pending")
    applied_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    creator = relationship("User", back_populates="applications")
    sponsorship = relationship("Sponsorship", back_populates="applications")


# Collaborations Table
class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_1_id = Column(String, ForeignKey("users.id"), nullable=False)
    creator_2_id = Column(String, ForeignKey("users.id"), nullable=False)
    collaboration_details = Column(Text, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


# Sponsorship Payments Table
class SponsorshipPayment(Base):
    __tablename__ = "sponsorship_payments"

    id = Column(String, primary_key=True, default=generate_uuid)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    brand_id = Column(String, ForeignKey("users.id"), nullable=False)
    sponsorship_id = Column(String, ForeignKey("sponsorships.id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String, default="pending")
    transaction_date = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    creator = relationship("User", foreign_keys=[creator_id], back_populates="payments")
    brand = relationship(
        "User", foreign_keys=[brand_id], back_populates="brand_payments"
    )


# ============================================================================
# BRAND DASHBOARD MODELS
# ============================================================================

# Brand Profile Table (Extended brand information)
class BrandProfile(Base):
    __tablename__ = "brand_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=True)
    website = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    contact_person = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", backref="brand_profile")


# Campaign Metrics Table (Performance tracking)
class CampaignMetrics(Base):
    __tablename__ = "campaign_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    campaign_id = Column(String, ForeignKey("sponsorships.id"), nullable=False)
    impressions = Column(Integer, nullable=True)
    clicks = Column(Integer, nullable=True)
    conversions = Column(Integer, nullable=True)
    revenue = Column(DECIMAL(10, 2), nullable=True)
    engagement_rate = Column(Float, nullable=True)
    recorded_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    campaign = relationship("Sponsorship", backref="metrics")


# Contracts Table (Contract management)
class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, default=generate_uuid)
    sponsorship_id = Column(String, ForeignKey("sponsorships.id"), nullable=False)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    brand_id = Column(String, ForeignKey("users.id"), nullable=False)
    contract_url = Column(String, nullable=True)
    status = Column(String, default="draft")  # draft, signed, completed, cancelled
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    sponsorship = relationship("Sponsorship", backref="contracts")
    creator = relationship("User", foreign_keys=[creator_id], backref="creator_contracts")
    brand = relationship("User", foreign_keys=[brand_id], backref="brand_contracts")


# Creator Matches Table (AI-powered matching)
class CreatorMatch(Base):
    __tablename__ = "creator_matches"

    id = Column(String, primary_key=True, default=generate_uuid)
    brand_id = Column(String, ForeignKey("users.id"), nullable=False)
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    match_score = Column(Float, nullable=True)
    matched_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    brand = relationship("User", foreign_keys=[brand_id], backref="creator_matches")
    creator = relationship("User", foreign_keys=[creator_id], backref="brand_matches")
