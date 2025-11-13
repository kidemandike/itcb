# crud/__init__.py

from .crud_user import (
    get_user_by_email,
    get_user_by_id,
    get_all_users,
    create_user,
    update_user,
    delete_user,
)

from .crud_department import (
    get_department_by_id,
    get_department_by_name,
    get_all_departments,
    create_department,
    update_department,
    delete_department,
)

from .crud_course import (
    get_all_courses,
    get_course_by_id,
    get_course_by_code,
    get_courses_by_instructor_id,
    get_courses_by_department_name,
    get_course_by_id_and_instructor,
    create_course,
)

from .crud_registration import (
    create_course_registration,
    get_course_registration_by_id,
    get_course_registration_by_user_and_course,
    get_all_course_registrations,
    get_user_course_registrations,
    get_registrations_by_course_id,
    update_course_registration_status,
    update_course_registration_completion,
    update_registration_control_no,
    delete_course_registration,
)

from .crud_room import (
    # Conference Room
    get_conference_room,
    get_conference_room_by_name,
    get_conference_rooms,
    create_conference_room,
    update_conference_room,
    delete_conference_room,
    # Room Booking
    create_room_booking,
    get_room_booking_by_id,
    get_all_room_bookings,
    get_user_bookings,
    check_room_availability,
    update_booking_status,
    update_booking_control_no,
    delete_room_booking,
)

from .crud_certificate import (
    get_all_certificate_applications,
    get_certificate_application_by_user_id,
    get_certificate_application_by_id,
    create_certificate_application,
    update_certificate_application_status,
    update_certificate_control_number,
)

from .crud_driving import (
    # Driving Course
    create_driving_course,
    get_driving_courses,
    get_driving_course,
    get_available_driving_courses,
    update_driving_course,
    delete_driving_course,
    # Driving Application
    create_driving_application,
    get_driving_applications,
    get_driving_application,
    get_driving_applications_by_course,
    get_driving_applications_by_user,
    update_driving_application,
    bulk_update_application_status,
    get_pending_certificate_requests,
    generate_driving_school_reports,
)