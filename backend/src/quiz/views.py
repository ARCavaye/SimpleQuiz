
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Question, Quiz, QuizQuestion
from .serializers import QuestionSerializer, QuizSerializer
import random

class QuestionViewSet(viewsets.ModelViewSet):
	queryset = Question.objects.all()
	serializer_class = QuestionSerializer

	@action(detail=False, methods=['post'])
	def ingest(self, request):
		"""Ingest one or more questions from JSON objects."""
		data = request.data
		if not isinstance(data, list):
			data = [data]
		serializer = QuestionSerializer(data=data, many=True)
		if serializer.is_valid():
			serializer.save()
			return Response({'status': 'questions ingested', 'count': len(serializer.data)})
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuizViewSet(viewsets.ModelViewSet):
	queryset = Quiz.objects.all()
	serializer_class = QuizSerializer

	@action(detail=False, methods=['post'])
	def generate(self, request):
		"""Generate a quiz with filters and number of questions."""
		num_questions = int(request.data.get('num_questions', 5))
		categories = request.data.get('categories', None)
		difficulties = request.data.get('difficulties', None)
		qs = Question.objects.all()
		if categories:
			qs = qs.filter(category__in=categories)
		if difficulties:
			qs = qs.filter(difficulty__in=difficulties)
		questions = list(qs)
		if len(questions) < num_questions:
			return Response({'error': 'Not enough questions for quiz.'}, status=400)
		selected = random.sample(questions, num_questions)
		quiz = Quiz.objects.create(total_questions=num_questions)
		for q in selected:
			QuizQuestion.objects.create(quiz=quiz, question=q)
		return Response({'quiz_id': quiz.id})

	@action(detail=True, methods=['post'])
	def answer(self, request, pk=None):
		"""Record an answer for a quiz question."""
		quiz = self.get_object()
		qq_id = request.data.get('quiz_question_id')
		answer = request.data.get('selected_answer')
		try:
			qq = QuizQuestion.objects.get(id=qq_id, quiz=quiz)
		except QuizQuestion.DoesNotExist:
			return Response({'error': 'QuizQuestion not found.'}, status=404)
		qq.selected_answer = answer
		qq.is_correct = (answer == qq.question.correct_answer)
		qq.save()
		if qq.is_correct:
			quiz.correct_answers += 1
			quiz.save()
		return Response({'is_correct': qq.is_correct, 'hint': qq.question.hint})

	@action(detail=True, methods=['get'])
	def results(self, request, pk=None):
		quiz = self.get_object()
		incorrect_categories = list(quiz.quiz_questions.filter(is_correct=False).values_list('question__category', flat=True))
		# Serialize quiz_questions for per-question correctness
		from .serializers import QuizQuestionSerializer
		quiz_questions = QuizQuestionSerializer(quiz.quiz_questions.all(), many=True).data
		return Response({
			'total_correct': quiz.correct_answers,
			'incorrect_categories': incorrect_categories,
			'quiz_questions': quiz_questions,
		})
