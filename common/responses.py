from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST, code=None, details=None):
    """Standardized error response format"""
    data = {'error': message}
    if code:
        data['code'] = code
    if details:
        data['details'] = details
    return Response(data, status=status_code)


def server_error_response(exc, context=None):
    """Safe 500 error response that logs the real error"""
    logger.error(
        'Internal server error',
        exc_info=exc,
        extra={'context': context}
    )
    return Response(
        {'error': 'Error interno del servidor. Intente nuevamente.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
