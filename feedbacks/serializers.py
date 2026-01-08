from rest_framework import serializers
from .models import Feedback
from orders.models import Order
from clinic.models import Device


class CreateFeedbackSerializer(serializers.Serializer):
    """
    Serializer for creating feedback from kiosk/iPad
    """
    device_uid = serializers.CharField(required=True)
    satisfaction_rating = serializers.IntegerField(min_value=1, max_value=5, required=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_device_uid(self, value):
        """Validate device exists and is active"""
        try:
            Device.objects.get(device_uid=value, is_active=True)
        except Device.DoesNotExist:
            raise serializers.ValidationError("Device not found or inactive")
        return value


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for Feedback model (read-only for staff)
    """
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_placed_at = serializers.DateTimeField(source='order.placed_at', read_only=True)
    order_delivered_at = serializers.DateTimeField(source='order.delivered_at', read_only=True)
    room_code = serializers.CharField(source='room.code', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True, allow_null=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    staff_email = serializers.CharField(source='staff.email', read_only=True, allow_null=True)

    class Meta:
        model = Feedback
        fields = [
            'id',
            'order',
            'order_id',
            'order_placed_at',
            'order_delivered_at',
            'room',
            'room_code',
            'patient',
            'patient_name',
            'staff',
            'staff_name',
            'staff_email',
            'satisfaction_rating',
            'comment',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
