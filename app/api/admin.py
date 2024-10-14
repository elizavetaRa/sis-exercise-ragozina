from django.contrib import admin

from api.models import Literature
from .models import OpenAIAPIMetrics, OpenAIAPIStatistics


admin.site.register(Literature)


@admin.register(OpenAIAPIMetrics)
class OpenAIMetricsAdmin(admin.ModelAdmin):
    list_display = ('query', 'response_time_ms', 'timestamp')
    ordering = ('-timestamp',)
    search_fields = ('query',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.order_by('-timestamp')  # Show the latest queries first

@admin.register(OpenAIAPIStatistics)
class OpenAIAPIStatisticsAdmin(admin.ModelAdmin):
    list_display = ('query', 'count', 'average_response_time_ms', 'max_response_time_ms', 'min_response_time_ms')
    ordering = ('-count',) 
    search_fields = ('query',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.order_by('-count')  # Show the highest count first
