from rest_framework import serializers
from .models import Feedback
from clinic.models import Device, PatientAssignment


class CreateFeedbackSerializer(serializers.Serializer):
    """
    Serializer for creating feedback from kiosk/iPad
    New structure: ratings for products, staff, and stay
    """
    patient_assignment_id = serializers.IntegerField(required=True)
    product_ratings = serializers.DictField(
        child=serializers.DictField(child=serializers.IntegerField(min_value=0, max_value=5)),
        required=True,
        help_text='Ratings for products: {order_id: {product_id: rating (0-5)}}'
    )
    staff_rating = serializers.IntegerField(min_value=0, max_value=5, required=True)
    stay_rating = serializers.IntegerField(min_value=0, max_value=5, required=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_patient_assignment_id(self, value):
        """Validate patient assignment exists and is active"""
        try:
            assignment = PatientAssignment.objects.get(id=value, is_active=True)
        except PatientAssignment.DoesNotExist:
            raise serializers.ValidationError("Patient assignment not found or inactive")
        return value


class FeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for Feedback model (read-only for staff)
    """
    patient_assignment_id = serializers.IntegerField(source='patient_assignment.id', read_only=True)
    room_code = serializers.CharField(source='room.code', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True, allow_null=True)
    staff_name = serializers.CharField(source='staff.full_name', read_only=True, allow_null=True)
    staff_email = serializers.CharField(source='staff.email', read_only=True, allow_null=True)

    class Meta:
        model = Feedback
        fields = [
            'id',
            'patient_assignment',
            'patient_assignment_id',
            'room',
            'room_code',
            'patient',
            'patient_name',
            'staff',
            'staff_name',
            'staff_email',
            'product_ratings',
            'staff_rating',
            'stay_rating',
            'comment',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
