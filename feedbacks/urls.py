from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicFeedbackViewSet, FeedbackManagementViewSet

# Staff router (auth required)
staff_router = DefaultRouter()
staff_router.register(r'feedbacks', FeedbackManagementViewSet, basename='feedback')

urlpatterns = [
    # Public endpoint - POST /api/public/orders/{order_id}/feedback/
    path('public/orders/<int:order_id>/feedback/', PublicFeedbackViewSet.as_view({'post': 'create_feedback'}), name='public-feedback-create'),

    # Staff endpoints
    path('', include(staff_router.urls)),
]
