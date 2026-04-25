import uuid
from __init__ import Role, users_collection, deliveries_collection, DeliveryStatus
from pymongo.errors import DuplicateKeyError


class Delivery:
    """Manages delivery lifecycle: create, accept, reject, cancel, mark delivered."""

    def __init__(
        self,
        client_id: str,
        pickup_address: str,
        dropoff_address: str,
        description_of_order: str,
        price: float,
    ) -> None:
        self.id = str(uuid.uuid4())
        self.client_id = client_id
        self.deliverer_id = None
        self.status = DeliveryStatus.PENDING
        self.pickup_address = pickup_address
        self.dropoff_address = dropoff_address
        self.description_of_order = description_of_order
        self.price = price

    def __repr__(self) -> str:
        """Debug representation of delivery."""
        return (
            f"Delivery({self.status}, {self.pickup_address}, "
            f"{self.dropoff_address}, {self.description_of_order}, {self.price})"
        )

    def to_dict(self) -> dict:
        """Convert Delivery object to MongoDB document."""
        return {
            "_id": self.id,
            "client_id": self.client_id,
            "deliverer_id": self.deliverer_id,
            "status": self.status.value,
            "pickup_address": self.pickup_address,
            "dropoff_address": self.dropoff_address,
            "description_of_order": self.description_of_order,
            "price": self.price,
        }

    def create(self) -> dict:
        """Save delivery to database."""
        try:
            deliveries_collection.insert_one(self.to_dict())
            return {"success": True, "message": "Delivery created successfully"}
        except DuplicateKeyError:
            return {"success": False, "message": "Delivery already exists"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def accept(delivery_id: str, deliverer_id: str) -> dict:
        """Assign deliverer to a pending delivery."""
        try:
            result = deliveries_collection.find_one_and_update(
                {"_id": delivery_id, "status": DeliveryStatus.PENDING.value},
                {
                    "$set": {
                        "deliverer_id": deliverer_id,
                        "status": DeliveryStatus.ACCEPTED.value,
                    }
                },
            )
            if not result:
                delivery = deliveries_collection.find_one({"_id": delivery_id})
                if not delivery:
                    return {"success": False, "message": "Delivery does not exist"}
                return {"success": False, "message": "Delivery is not pending"}
            return {"success": True, "message": "Delivery accepted successfully"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def reject_by_admin(delivery_id: str, admin_id: str, reason: str) -> dict:
        """Reject a delivery by admin with reason."""
        admin = users_collection.find_one({"_id": admin_id})
        if not admin:
            return {"success": False, "message": "Admin not found"}
        if admin["role"] != Role.ADMIN.value:
            return {"success": False, "message": "Admin only privileges"}

        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery not found"}

        deliveries_collection.update_one(
            {"_id": delivery_id},
            {
                "$set": {
                    "status": DeliveryStatus.REJECTED.value,
                    "rejected_reason": reason,
                    "rejected_by_admin": admin_id,
                }
            },
        )
        return {"success": True, "message": "Delivery rejected by the admin"}

    @staticmethod
    def cancel_by_client(delivery_id: str, client_id: str) -> dict:
        """Cancel a pending delivery by the owning client."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery not found"}

        if delivery["client_id"] != client_id:
            return {
                "success": False,
                "message": "You can only cancel your own deliveries",
            }

        if delivery["status"] not in [DeliveryStatus.PENDING.value, DeliveryStatus.ACCEPTED.value]:
            return {
                "success": False,
                "message": "Only awaiting pickup deliveries can be cancelled",
            }

        deliveries_collection.update_one(
            {"_id": delivery_id},
            {
                "$set": {
                    "status": DeliveryStatus.CANCELLED.value,
                    "cancelled_by": "client",
                    "cancelled_by_id": client_id,
                }
            },
        )
        return {"success": True, "message": "Delivery cancelled successfully"}

    @staticmethod
    def drop_by_deliverer(delivery_id: str, deliverer_id: str) -> dict:
        """Drop an accepted delivery by the assigned deliverer."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery not found"}

        if delivery["deliverer_id"] != deliverer_id:
            return {
                "success": False,
                "message": "You can only drop deliveries assigned to you",
            }

        if delivery["status"] != DeliveryStatus.ACCEPTED.value:
            return {
                "success": False,
                "message": "Only accepted deliveries can be dropped",
            }

        deliveries_collection.update_one(
            {"_id": delivery_id},
            {"$set": {"status": DeliveryStatus.PENDING.value, "deliverer_id": None}},
        )
        return {"success": True, "message": "Delivery dropped successfully"}

    @staticmethod
    def mark_as_delivered(delivery_id: str) -> dict:
        """Mark an in-transit delivery as delivered."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery not found"}

        if delivery["status"] != DeliveryStatus.IN_TRANSIT.value:
            return {"success": False, "message": "Delivery must be in transit first"}

        deliveries_collection.find_one_and_update(
            {"_id": delivery_id}, {"$set": {"status": DeliveryStatus.DELIVERED.value}}
        )
        return {"success": True, "message": "Delivery marked as delivered"}

    @staticmethod
    def mark_as_in_transit(delivery_id: str, deliverer_id: str) -> dict:
        """Move an accepted delivery (awaiting pickup) to in_transit."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery not found"}
        if delivery.get("deliverer_id") != deliverer_id:
            return {"success": False, "message": "Not assigned to this deliverer"}
        if delivery["status"] != DeliveryStatus.ACCEPTED.value:
            return {"success": False, "message": "Only awaiting pickup deliveries can start transit"}
        deliveries_collection.update_one(
            {"_id": delivery_id},
            {"$set": {"status": DeliveryStatus.IN_TRANSIT.value}},
        )
        return {"success": True, "message": "Delivery is now in transit"}

    @staticmethod
    def cancel_by_deliverer(delivery_id: str, deliverer_id: str) -> dict:
        """Deliverer can cancel only while awaiting pickup (accepted)."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery not found"}
        if delivery.get("deliverer_id") != deliverer_id:
            return {"success": False, "message": "You can only cancel your assigned delivery"}
        if delivery.get("status") != DeliveryStatus.ACCEPTED.value:
            return {"success": False, "message": "You can cancel only while awaiting pickup"}
        deliveries_collection.update_one(
            {"_id": delivery_id},
            {
                "$set": {
                    "status": DeliveryStatus.CANCELLED.value,
                    "cancelled_by": "deliverer",
                    "cancelled_by_id": deliverer_id,
                }
            },
        )
        return {"success": True, "message": "Delivery cancelled by deliverer"}

    @staticmethod
    def track(delivery_id: str) -> dict:
        """Get current status and details of a delivery."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if not delivery:
            return {"success": False, "message": "Delivery does not exist"}
        return {"success": True, "delivery": delivery}

    @staticmethod
    def find_available() -> dict:
        """Get all pending deliveries available for acceptance."""
        deliveries = list(
            deliveries_collection.find({"status": DeliveryStatus.PENDING.value})
        )
        if not deliveries:
            return {"success": False, "message": "No delivery available"}
        return {"success": True, "deliveries": deliveries}


def main() -> None:
    """Test delivery lifecycle."""
    d = Delivery(
        client_id="client-uuid-123",
        pickup_address="Oran",
        dropoff_address="Sidi bel abbes",
        description_of_order="books",
        price=500.00,
    )
    print(d.create())
    print(Delivery.find_available())
    print(Delivery.track(d.id))
    print(Delivery.accept(d.id, "fake-deliverer-uuid-456"))
    print(Delivery.accept(d.id, "fake-deliverer-uuid-456"))
    print(Delivery.mark_as_delivered(d.id))
    print(Delivery.track(d.id))


if __name__ == "__main__":
    main()
