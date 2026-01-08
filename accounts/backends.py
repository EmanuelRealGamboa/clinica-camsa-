from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate using email
    instead of username.
    """

    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        """
        Authenticate a user based on email address as the username.

        Args:
            request: The request object
            username: Can be either username or email
            password: The user's password
            email: The user's email (if provided separately)
            **kwargs: Additional keyword arguments

        Returns:
            User object if authentication successful, None otherwise
        """
        # If email is provided explicitly, use it
        # Otherwise, treat username parameter as email
        email_to_check = email or username

        if email_to_check is None or password is None:
            return None

        try:
            # Try to fetch the user by searching for the email
            user = User.objects.get(email=email_to_check)

            # Check the password
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            User().set_password(password)
            return None

        return None
