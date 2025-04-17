# logging_config.py
import logging
import os

os.makedirs("logs", exist_ok=True)  # Ensure logs folder exists

# Root logger setup
logging.basicConfig(
    filename="logs/server.log",
    level=logging.DEBUG,
    filemode="a",
    format="%(asctime)s - %(levelname)s - %(message)s",
)
