from django.db import models


class Question(models.Model):
	DIFFICULTY_CHOICES = [
		('easy', 'Easy'),
		('medium', 'Medium'),
		('hard', 'Hard'),
	]
	question_text = models.TextField()
	answer_a = models.CharField(max_length=255)
	answer_b = models.CharField(max_length=255)
	answer_c = models.CharField(max_length=255)
	answer_d = models.CharField(max_length=255)
	correct_answer = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')])
	hint = models.TextField(blank=True)
	category = models.CharField(max_length=100)
	difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)

	def __str__(self):
		return self.question_text

class Quiz(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	total_questions = models.PositiveIntegerField()
	correct_answers = models.PositiveIntegerField(default=0)

class QuizQuestion(models.Model):
	quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='quiz_questions')
	question = models.ForeignKey(Question, on_delete=models.CASCADE)
	selected_answer = models.CharField(max_length=1, choices=[('A','A'),('B','B'),('C','C'),('D','D')], blank=True, null=True)
	is_correct = models.BooleanField(default=False)

	def __str__(self):
		return f"Quiz {self.quiz.id} - Q: {self.question.id}"
