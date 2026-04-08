import random
from __init__ import verification_codes
from typing import List
from datetime import datetime, timedelta


def rand_code_list() -> List[int]:
    """Generate a list of 8 random digits (0-9) for verification code."""
    return [random.randint(0, 9) for _ in range(8)]


def list_to_integer(digit_list: List[int]) -> int:
    """Convert a list of digits into a single integer."""
    if not isinstance(digit_list, list):
        raise TypeError("Input must be a list of integers")

    for digit in digit_list:
        if not isinstance(digit, int) or digit < 0 or digit > 9:
            raise ValueError("Each element must be an integer between 0 and 9")

    return int("".join(map(str, digit_list)))


class VerificationCodes:
    """Manages verification code generation and validation with expiration."""

    _verification_store: dict = {}

    def __init__(self, user_id: str, email: str) -> None:
        self.user_id = user_id
        self.email = email

    @staticmethod
    def generate_code(user_id: str, email: str) -> int:
        """Generate and store a 8-digit verification code valid for 15 minutes."""
        if not user_id or not isinstance(user_id, str):
            raise ValueError("Valid user_id is required")
        if not email or not isinstance(email, str) or "@" not in email:
            raise ValueError("Valid email address is required")

        code = list_to_integer(rand_code_list())
        expires_at = datetime.now() + timedelta(minutes=15)

        VerificationCodes._verification_store[f"{user_id}:{email}"] = {
            "code": code,
            "expires_at": expires_at,
            "used": False,
        }
        try:
            result = verification_codes.insert_one({"user_id": user_id, "email": email, "code": code, "expires_at": expires_at, "used": False})
            print(f"Inserted verification code with ID: {result.inserted_id}")
            print(f"Collection count: {verification_codes.count_documents({})}")
        except Exception as e:
            print(f"Failed to insert verification code: {e}")
            raise ValueError(e)
        return code

    @staticmethod
    def _get_valid_code_data(user_id: str, email: str, code: int) -> dict | None:
        """Get stored code data if valid and not expired."""
        if not user_id or not email or not code:
            return None

        key = f"{user_id}:{email}"
        stored_data = VerificationCodes._verification_store.get(key)

        if not stored_data:
            return None

        if datetime.now() > stored_data["expires_at"]:
            del VerificationCodes._verification_store[key]
            return None

        return stored_data

    @staticmethod
    def verify_code(user_id: str, email: str, code: int) -> bool:
        """Verify if the provided code matches and is valid."""
        stored_data = VerificationCodes._get_valid_code_data(user_id, email, code)
        if not stored_data or stored_data["used"]:
            return False
        return stored_data["code"] == code

    @staticmethod
    def use_code(user_id: str, email: str, code: int) -> bool:
        """Verify and mark code as used."""
        stored_data = VerificationCodes._get_valid_code_data(user_id, email, code)
        if not stored_data or stored_data["used"]:
            return False
        if stored_data["code"] != code:
            return False

        stored_data["used"] = True
        verification_codes.update_one({"user_id": user_id, "email": email, "code": code}, {"$set": {"used": True}})
        return True

    @staticmethod
    def cleanup_expired_codes() -> None:
        """Remove all expired verification codes from store (memory only)."""
        now = datetime.now()
        expired_keys = [
            key
            for key, data in VerificationCodes._verification_store.items()
            if now > data["expires_at"]
        ]
        for key in expired_keys:
            del VerificationCodes._verification_store[key]
        verification_codes.delete_many({"expires_at": {"$lt": now}})

    @staticmethod

    def cleanup_all_codes()->dict:
        """Remove all verification codes"""
        verification_codes.delete_many({})
        return {"success":True , "message":"All codes deleted"}
