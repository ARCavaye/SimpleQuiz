from rest_framework import serializers
from .models import Question, Quiz, QuizQuestion

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class QuizQuestionSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'selected_answer', 'is_correct']

class QuizSerializer(serializers.ModelSerializer):
    quiz_questions = QuizQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Quiz
        fields = ['id', 'created_at', 'total_questions', 'correct_answers', 'quiz_questions']
