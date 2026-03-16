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
        """Converts the User object into a Dictionary for MongoDB."""
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

    def create(self):
        """Save delivery to database. Returns success status and message."""
        deliverer_data: dict = self.to_dict()
        try:
            deliveries_collection.insert_one(deliverer_data)
            return {"success": True, "message": " Delivery created successfully"}
        except DuplicateKeyError:
            # Extremely rare with UUID, but handle gracefully
            return {"success": False, "message": "Delivery already exists"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def accept(delivery_id: str, deliverer_id: str) -> dict:
        """Assign deliverer to a pending delivery.Fails if delivery doesn't exist or isn't pending."""
        try:
            # Find the delivery in database
            deliverer_data = deliveries_collection.find_one({"_id": delivery_id})

            # Check if delivery exists
            if deliverer_data is None:
                return {"success": False, "message": "Delivery does not exist"}

            # Verify delivery is still available
            elif deliverer_data["status"] != DeliveryStatus.PENDING.value:
                return {"success": False, "message": "Delivery is not pending"}

            # Assign deliverer and update status
            else:
                deliveries_collection.update_one(
                    {"_id": delivery_id},
                    {
                        "$set": {
                            "deliverer_id": deliverer_id,  # Assign deliverer
                            "status": DeliveryStatus.ACCEPTED,  # Change Status
                        }
                    },
                )
                return {
                    "success": True,
                    "message": "Delivery accepted successfully",
                }

        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def reject_by_admin(delivery_id: str, admin_id: str, reason: str) -> dict:
        admin = users_collection.find_one({"_id": admin_id})
        if admin["role"] != Role.ADMIN:
            return {"success": False, "message": "admin only privileges"}

        deliveries_collection.update_one(
            {"_id": delivery_id},
            {
                "$set": {
                    "status": DeliveryStatus.REJECTED,
                    "rejected reason ": reason,
                    "rejected by admin": admin_id,
                }
            },
        )
        return {"success": True, "message": "delivery rejected by the admin"}

    @staticmethod
    def cancel_by_client(delivery_id: str, client_id: str) -> dict:
        pass

    @staticmethod
    def drop_by_deliverer(delivery_id: str, deliverer_id: str):
        pass

    @staticmethod
    def mark_as_delivered(delivery_id: str) -> dict:
        """Mark accepted delivery as completed."""
        deliveries_collection.find_one_and_update(
            {"_id": delivery_id}, {"$set": {"status": DeliveryStatus.DELIVERED}}
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
        if delivery_data is None:
            return {"success": False, "message": "No delivery available"}
        else:
            results = list(delivery_data)
            return {"success": True, "deliveries": results}


def main() -> None:
    # test the function sees the lifecycle of the delivery
    # 1. Create a delivery
    d = Delivery(
        client_id="fake-client-uuid-123",
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
