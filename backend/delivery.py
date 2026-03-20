import uuid
from __init__ import Role, users_collection, deliveries_collection, DeliveryStatus
from pymongo.errors import DuplicateKeyError


class Delivery:
    """Represents a delivery request with full lifecycle management."""

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
        """Debugging representation showing delivery info."""
        return f"Delivery({self.status}, {self.pickup_address}, {self.dropoff_address}, {self.description_of_order}, {self.price})"

    def to_dict(self) -> dict:
        """Converts the Delivery object into a Dictionary for MongoDB."""
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
        """Save delivery to database. Returns success status and message."""
        delivery_data: dict = self.to_dict()
        try:
            deliveries_collection.insert_one(delivery_data)
            return {"success": True, "message": " Delivery created successfully"}
        except DuplicateKeyError:
            return {"success": False, "message": "Delivery already exists"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def accept(delivery_id: str, deliverer_id: str) -> dict:
        """Assign deliverer to a pending delivery. Fails if delivery doesn't exist or isn't pending."""
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

            if result is None:
                delivery = deliveries_collection.find_one({"_id": delivery_id})
                if delivery is None:
                    return {"success": False, "message": "Delivery does not exist"}
                else:
                    return {"success": False, "message": "Delivery is not pending"}

            return {
                "success": True,
                "message": "Delivery accepted successfully",
            }

        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def reject_by_admin(delivery_id: str, admin_id: str, reason: str) -> dict:
        admin = users_collection.find_one({"_id": admin_id})
        if admin is None:
            return {"success": False, "message": "Admin not found"}
        if admin["role"] != Role.ADMIN.value:
            return {"success": False, "message": "Admin only privileges"}

        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if delivery is None:
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
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if delivery is None:
            return {"success": False, "message": "Delivery not found"}

        if delivery["client_id"] != client_id:
            return {
                "success": False,
                "message": "You can only cancel your own deliveries",
            }

        if delivery["status"] != DeliveryStatus.PENDING.value:
            return {
                "success": False,
                "message": "Only pending deliveries can be cancelled",
            }

        deliveries_collection.update_one(
            {"_id": delivery_id}, {"$set": {"status": DeliveryStatus.CANCELLED.value}}
        )
        return {"success": True, "message": "Delivery cancelled successfully"}

    @staticmethod
    def drop_by_deliverer(delivery_id: str, deliverer_id: str) -> dict:
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if delivery is None:
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
        """Mark accepted delivery as completed."""
        delivery = deliveries_collection.find_one({"_id": delivery_id})
        if delivery is None:
            return {"success": False, "message": "Delivery not found"}
        if delivery["status"] != DeliveryStatus.ACCEPTED.value:
            return {
                "success": False,
                "message": "Delivery is not accepted",
            }

        deliveries_collection.find_one_and_update(
            {"_id": delivery_id}, {"$set": {"status": DeliveryStatus.DELIVERED.value}}
        )
        return {"success": True, "message": "Delivery marked as delivered"}

    @staticmethod
    def track(delivery_id: str) -> dict:
        """Get current status and details of a delivery."""
        delivery_data = deliveries_collection.find_one({"_id": delivery_id})
        if delivery_data is None:
            return {"success": False, "message": "Delivery does not exist"}
        else:
            return {
                "success": True,
                "delivery": delivery_data,
            }

    @staticmethod
    def find_available() -> dict:
        """Get all pending deliveries available for acceptance."""
        delivery_data = deliveries_collection.find(
            {"status": DeliveryStatus.PENDING.value}
        )
        results = list(delivery_data)
        if len(results) == 0:
            return {"success": False, "message": "No delivery available"}
        else:
            return {"success": True, "deliveries": results}


def main() -> None:
    # test the function sees the lifecycle of the delivery
    # 1. Create a delivery
    d = Delivery(
        client_id="client-uuid-123",
        pickup_address="Oran",
        dropoff_address="Sidi bel abbes",
        description_of_order="books",
        price=500.00,
    )
    print(d.create())

    # 2. Find available deliveries
    print(Delivery.find_available())

    # 3. Track it
    print(Delivery.track(d.id))

    # 4. Accept it
    print(Delivery.accept(d.id, "fake-deliverer-uuid-456"))

    # 5. Try to accept again (should fail)
    print(Delivery.accept(d.id, "fake-deliverer-uuid-456"))

    # 6. Mark as delivered
    print(Delivery.mark_as_delivered(d.id))

    # 7. Track again to confirm status is delivered
    print(Delivery.track(d.id))


if __name__ == "__main__":
    main()
