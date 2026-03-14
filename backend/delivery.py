import uuid
from __init__ import deliveries_collection, DeliveryStatus
from pymongo.errors import DuplicateKeyError


class Delivery:
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
        return f"Delivery({self.status}, {self.pickup_address}, {self.dropoff_address}, {self.description_of_order}, {self.price})"

    def to_dict(self) -> dict:
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
        deliverer_data: dict = self.to_dict()
        try:
            deliveries_collection.insert_one(deliverer_data)
            return {"success": True, "message": " Delivery created successfully"}
        except DuplicateKeyError:
            return {"success": False, "message": "Delivery already exists"}
        except Exception as e:
            return {"success": False, "message": str(e)}

    @staticmethod
    def accept(delivery_id: str, deliverer_id: str) -> dict:
        try:
            deliverer_data = deliveries_collection.find_one({"_id": delivery_id})
            if deliverer_data is None:
                return {"success": False, "message": "Delivery does not exist"}
            elif deliverer_data["status"] != DeliveryStatus.PENDING.value:
                return {"success": False, "message": "Delivery is not pending"}
            else:
                deliveries_collection.update_one(
                    {"_id": delivery_id},
                    {
                        "$set": {
                            "deliverer_id": deliverer_id,
                            "status": DeliveryStatus.ACCEPTED,
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
    def reject(delivery_id: str) -> dict:
        delivery_data = deliveries_collection.find_one({"_id": delivery_id})
        if delivery_data is None:
            return {"success": False, "message": "Delivery does not exist"}
        deliveries_collection.find_one_and_update(
            {"_id": delivery_id}, {"$set": {"status": DeliveryStatus.REJECTED}}
        )
        return {"success": True, "message": "Delivery rejected"}

    @staticmethod
    def mark_as_delivered(delivery_id: str) -> dict:
        deliveries_collection.find_one_and_update(
            {"_id": delivery_id}, {"$set": {"status": DeliveryStatus.DELIVERED}}
        )
        return {"success": True, "message": "Delivery marked as delivered"}

    @staticmethod
    def track(delivery_id: str) -> dict:
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
        delivery_data = deliveries_collection.find(
            {"status": DeliveryStatus.PENDING.value}
        )
        if delivery_data is None:
            return {"success": False, "message": "No delivery available"}
        else:
            results = list(delivery_data)
            return {"success": True, "deliveries": results}


def main() -> None:
    # 1. Create a delivery
    d = Delivery(
        client_id="fake-client-uuid-123",
        pickup_address="Oran",
        dropoff_address="Sidi bel abbes",
        description_of_order="box of shoes",
        price=3650.75,
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

    # 8. Reject it
    print(Delivery.reject(d.id))

    # 9. Track again to confirm status is rejected should fail
    print(Delivery.track(str(12365498)))


if __name__ == "__main__":
    main()
