from django.db.models.signals import m2m_changed, pre_delete
from django.dispatch import receiver
from .models import Issue, User, Comment
from django.db.models.signals import post_save, post_delete

@receiver(m2m_changed, sender=Issue.assignedTo.through)
def update_assigned_counts(sender, instance, action, pk_set, **kwargs):
    """Actualiza numOpenIssues cuando cambian los 'assignedTo'."""
    if action in ('post_add', 'post_remove', 'post_clear'):
        # users afectados (pk_set vacío en post_clear, usamos all())
        users = User.objects.filter(pk__in=pk_set) if pk_set else instance.assignedTo.all()
        for u in users:
            u.numOpenIssues = u.assigned_issues.count()
            u.save(update_fields=['numOpenIssues'])


@receiver(m2m_changed, sender=Issue.watchers.through)
def update_watchers_counts(sender, instance, action, pk_set, **kwargs):
    if action in ('post_add', 'post_remove', 'post_clear'):
        users = User.objects.filter(pk__in=pk_set) if pk_set else instance.watchers.all()
        for u in users:
            u.numWatchedIssues = u.watching_issues.count()
            u.save(update_fields=['numWatchedIssues'])


@receiver(pre_delete, sender=Issue)
def update_counts_on_issue_delete(sender, instance, **kwargs):
    assigned = list(instance.assignedTo.all())
    watchers = list(instance.watchers.all())

    from django.db import transaction
    def recompute():
        for u in assigned:
            u.numOpenIssues = u.assigned_issues.count()
            u.save(update_fields=['numOpenIssues'])
        for u in watchers:
            u.numWatchedIssues = u.watching_issues.count()
            u.save(update_fields=['numWatchedIssues'])

    transaction.on_commit(recompute)




@receiver(post_save, sender=Comment)
@receiver(post_delete, sender=Comment)
def update_user_comment_count(sender, instance, **kwargs):
    author = instance.author
    author.numComments = Comment.objects.filter(author=author).count()
    author.save(update_fields=['numComments'])