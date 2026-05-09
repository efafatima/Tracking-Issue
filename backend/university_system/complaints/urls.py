
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ComplaintViewSet,
    submit_complaint_ml,
    suggest_complaint,
    bot_submit_complaint,
    bot_complaint_status,
    student_stats,
    student_complaints,
    complaint_detail,
    add_comment,
    notifications,
    mark_notification_read,
    complaint_analytics,
    hod_admin_review,
    hod_trend_analytics,
    hod_category_analytics,
    hod_stats,
     
    get_ready_for_assignment_complaints,
    admin_assign_teacher,
    update_complaint_priority,
    set_deadline,
    escalate_complaint,
    admin_reject_solved,
    admin_finalize,
    admin_trend_analytics,
    teacher_performance_analytics,
    teacher_workload_analytics,

    get_pending_complaints,
    get_solved_complaints,
    update_complaint_status,
    get_teacher_complaints,
    add_teacher_comment,


    # hod_analytics,
    delete_complaint,
    get_activity_feed,
    rate_complaint,
    weekly_report,
    weekly_report_pdf,
    get_teachers,
    category_routes,


    dsa_stats,
dsa_pending_complaints,
dsa_review_complaint,
)

router = DefaultRouter()
router.register('complaints', ComplaintViewSet, basename='complaints')

urlpatterns = [
    path('', include(router.urls)),

    # ── CORE ─────────────────────────
    path('submit/', submit_complaint_ml),
    path('suggest/', suggest_complaint),
    path("student/", student_complaints, name="student-complaints"),
    path("student/stats/", student_stats, name="student-stats"),
    path("<int:id>/detail/", complaint_detail),
    path("<int:id>/comments/", add_comment),
    path("notifications/", notifications),
    path("notifications/<int:id>/read/", mark_notification_read),

    # ── ANALYTICS ─────────────────────
    path('student/analytics/', complaint_analytics),
    # path('hod/analytics/', hod_analytics),
    path('hod/trend/', hod_trend_analytics),
    path('hod/category/', hod_category_analytics),
    path("hod/stats/", hod_stats, name="hod-stats"),

    # ── HOD / ADMIN REVIEW ────────────
    path('<int:id>/hod-review/', hod_admin_review),

    # ── ADMIN WORKFLOW ────────────────
    path('<int:id>/assign/', admin_assign_teacher),
    path('<int:id>/priority/', update_complaint_priority),
    path('<int:id>/deadline/', set_deadline),
    path('<int:id>/escalate/', escalate_complaint),
    
    path('ready/', get_ready_for_assignment_complaints, name='admin-ready-complaints'),
    path('admin/trend/', admin_trend_analytics, name='admin-trend'),
    path('admin/teachers/', teacher_performance_analytics, name='teacher-performance'),
    
    # ✔ SOLVED FLOW (FIXED CLEAN)
    path('solved/', get_solved_complaints, name='solved-complaints'),
    path('<int:id>/reject-solved/', admin_reject_solved, name='reject-solved'),
    path('<int:id>/finalize/', admin_finalize, name='finalize'),
     # ── ACTIVITY ──────────────────────
    path('activity/', get_activity_feed),

    # ── PENDING ───────────────────────
    path('pending/', get_pending_complaints),

   
    # ── Teacher  WORKFLOW ────────────────
    path("teacher/", get_teacher_complaints, name="teacher-complaints"),
    path("<int:id>/status/", update_complaint_status, name="update-status"),
    path("<int:id>/comment/", add_teacher_comment, name="teacher-comment"),

    path('teacher/workload/', teacher_workload_analytics, name='teacher-workload'),






    # ── OTHER ACTIONS ─────────────────
    path('<int:id>/delete/', delete_complaint),
    path('<int:pk>/rate/', rate_complaint),

    # ── REPORTS ────────────────────────
    path('weekly-report/', weekly_report),
    path('weekly-report/pdf/', weekly_report_pdf),

    # ADMIN: teachers list
    path('teachers/', get_teachers),
    path("category-routes/", category_routes),

    # BOT endpoints
    path('bot/submit/', bot_submit_complaint, name='bot-submit'),
    path('bot/status/', bot_complaint_status, name='bot-status'),



     path("dsa/stats/",              dsa_stats,              name="dsa-stats"),
    path("dsa/pending/",            dsa_pending_complaints,  name="dsa-pending-complaints"),
    path("dsa/review/<int:id>/",    dsa_review_complaint,    name="dsa-review-complaint"),

  

]
