"""Alembic environment. The connection string comes from DATABASE_URL (backend/.env)."""

from logging.config import fileConfig

from sqlalchemy import create_engine, pool

from alembic import context
from app.core.config import get_settings
from app.db.models import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Emit SQL without connecting (`alembic upgrade head --sql`)."""
    context.configure(
        url="postgresql+psycopg://",
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    url = get_settings().sqlalchemy_url
    if not url:
        raise RuntimeError("DATABASE_URL is not set. Add it to backend/.env (see .env.example).")
    engine = create_engine(url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
