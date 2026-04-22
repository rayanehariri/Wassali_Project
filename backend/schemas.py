from marshmallow import EXCLUDE, Schema, ValidationError, fields, validate

from api_response import fail


class BaseSchema(Schema):
    class Meta:
        unknown = EXCLUDE


class RegisterSchema(BaseSchema):
    username = fields.Str(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=5))
    role = fields.Str(
        required=False,
        validate=validate.OneOf(["admin", "client", "deliverer"]),
        load_default="client",
    )


class LoginSchema(BaseSchema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)


class ForgotPasswordSchema(BaseSchema):
    email = fields.Email(required=True)


class ResetPasswordSchema(BaseSchema):
    token = fields.Str(required=True, validate=validate.Length(min=10, max=200))
    new_password = fields.Str(required=True, validate=validate.Length(min=5))


class RegisterStartSchema(BaseSchema):
    username = fields.Str(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    phone = fields.Str(required=True, validate=validate.Length(min=8, max=32))
    password = fields.Str(required=True, validate=validate.Length(min=5))
    role = fields.Str(
        required=False,
        validate=validate.OneOf(["client", "deliverer"]),
        load_default="client",
    )


class RegisterVerifySchema(BaseSchema):
    pending_id = fields.Str(required=True)
    code = fields.Str(required=True, validate=validate.Length(min=4, max=8))


class ResendPhoneCodeSchema(BaseSchema):
    pending_id = fields.Str(required=True)


class ChangeUsernameSchema(BaseSchema):
    new_username = fields.Str(required=True, validate=validate.Length(min=3))


class ChangePasswordSchema(BaseSchema):
    old_password = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=5))


class RefreshTokenSchema(BaseSchema):
    refresh_token = fields.Str(required=True)


class CreateDeliverySchema(BaseSchema):
    client_id = fields.Str(required=True)
    pickup_address = fields.Str(required=True)
    dropoff_address = fields.Str(required=True)
    description_of_order = fields.Str(required=True)
    price = fields.Float(required=True)


class CreateRequestSchema(BaseSchema):
    client_id = fields.Str(required=True)
    pickup = fields.Str(required=True)
    dropoff = fields.Str(required=True)
    description = fields.Str(required=True)
    price = fields.Float(required=True)
    pickup_lat = fields.Float(load_default=None, allow_none=True)
    pickup_lng = fields.Float(load_default=None, allow_none=True)
    dropoff_lat = fields.Float(load_default=None, allow_none=True)
    dropoff_lng = fields.Float(load_default=None, allow_none=True)


class RegisterEmailStartSchema(BaseSchema):
    username = fields.Str(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=5))
    role = fields.Str(
        required=False,
        validate=validate.OneOf(["client", "deliverer"]),
        load_default="client",
    )


class SelectDelivererSchema(BaseSchema):
    deliverer_id = fields.Str(required=True)


class SubmitVerificationSchema(BaseSchema):
    vehicleType = fields.Str(required=True, validate=validate.OneOf(["car", "motorcycle", "bicycle", "scooter"]))
    makeModel = fields.Str(required=True, validate=validate.Length(min=2))
    licensePlate = fields.Str(required=True, validate=validate.Length(min=3))
    idCardName = fields.Str(required=True)
    licenseName = fields.Str(required=True)
    registrationName = fields.Str(required=True)
    # Relative paths returned by POST /verification/upload (under verifications/<deliverer_id>/…)
    idCardPath = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=512))
    licensePath = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=512))
    registrationPath = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=512))


class CancelDeliverySchema(BaseSchema):
    delivery_id = fields.Str(required=True)
    client_id = fields.Str(required=True)


class AcceptDeliverySchema(BaseSchema):
    deliverer_id = fields.Str(required=True)


class DropDeliverySchema(BaseSchema):
    delivery_id = fields.Str(required=True)
    deliverer_id = fields.Str(required=True)


class DeleteUserSchema(BaseSchema):
    password = fields.Str(required=True)
    role = fields.Str(
        required=True,
        validate=validate.OneOf(["admin", "client", "deliverer"]),
    )


class RejectDeliverySchema(BaseSchema):
    admin_id = fields.Str(required=True)
    reason = fields.Str(required=True, validate=validate.Length(min=3))


def validate_payload(schema: Schema, payload: dict | None):
    if payload is None:
        return None, fail("Request body is required", 400, code="VALIDATION_ERROR")
    try:
        return schema.load(payload), None
    except ValidationError as err:
        return None, fail(
            message="Validation failed",
            status=400,
            errors=err.messages,
            code="VALIDATION_ERROR",
        )
