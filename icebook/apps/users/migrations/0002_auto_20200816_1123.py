# Generated by Django 3.1 on 2020-08-16 11:23

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='profile',
            options={'ordering': ['username']},
        ),
        migrations.RenameField(
            model_name='profile',
            old_name='display_name',
            new_name='username',
        ),
    ]
