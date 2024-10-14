# Generated by Django 4.2.7 on 2024-10-14 21:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_openaiapimetrics'),
    ]

    operations = [
        migrations.CreateModel(
            name='OpenAIAPIStatistics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query', models.CharField(max_length=255, unique=True)),
                ('count', models.IntegerField(default=0)),
                ('average_response_time_ms', models.FloatField(default=0.0)),
                ('max_response_time_ms', models.FloatField(default=0.0)),
                ('min_response_time_ms', models.FloatField(default=0.0)),
            ],
        ),
    ]
