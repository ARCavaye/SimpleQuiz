import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress, Chip } from '@mui/material';
import { API_URL } from './config';

export default function QuizInterface() {
  const [quizId, setQuizId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Quiz options
  const [numQuestions, setNumQuestions] = useState(5);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableDifficulties, setAvailableDifficulties] = useState(['easy','medium','hard']);

  useEffect(() => {
    // Fetch available categories
    fetch(`${API_URL}/questions/`)
      .then(res => res.json())
      .then(data => {
        const cats = Array.from(new Set(data.map(q => q.category)));
        setAvailableCategories(cats);
      });
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setQuizId(null);
    setQuestions([]);
    setCurrent(0);
    setAnswer(null);
    setFeedback(null);
    setShowHint(false);
    try {
      const res = await fetch(`${API_URL}/quizzes/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_questions: numQuestions,
          categories,
          difficulties,
        }),
      });
      const data = await res.json();
      if (res.ok && data.quiz_id) {
        setQuizId(data.quiz_id);
        // Fetch quiz questions
        const quizRes = await fetch(`${API_URL}/quizzes/${data.quiz_id}/`);
        const quizData = await quizRes.json();
        setQuestions(quizData.quiz_questions);
      } else {
        setError(data.error || 'Failed to generate quiz.');
      }
    } catch {
      setError('Failed to connect to API.');
    }
    setLoading(false);
  };

  const submitAnswer = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const qq = questions[current];
      const res = await fetch(`${API_URL}/quizzes/${quizId}/answer/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_question_id: qq.id,
          selected_answer: answer,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.is_correct ? 'Correct!' : 'Incorrect!');
        setShowHint(false);
        if (!data.is_correct && data.hint) setShowHint(true);
      } else {
        setFeedback('Error submitting answer.');
      }
    } catch {
      setFeedback('Failed to connect to API.');
    }
    setLoading(false);
  };

  const nextQuestion = () => {
    setAnswer(null);
    setFeedback(null);
    setShowHint(false);
    setCurrent(prev => prev + 1);
  };

  const finishQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/quizzes/${quizId}/results/`);
      const data = await res.json();
      setResults(data);
      if (data.quiz_questions) {
        setQuestions(data.quiz_questions);
      }
    } catch {
      setResults({ error: 'Failed to fetch results.' });
    }
    setLoading(false);
  };

  // Quiz options UI
  if (!quizId) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Start a Quiz</Typography>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography>Select number of questions:</Typography>
          <Button variant={numQuestions === 5 ? 'contained' : 'outlined'} onClick={() => setNumQuestions(5)}>5</Button>
          <Button variant={numQuestions === 10 ? 'contained' : 'outlined'} onClick={() => setNumQuestions(10)} sx={{ ml: 1 }}>10</Button>
          <Button variant={numQuestions === 20 ? 'contained' : 'outlined'} onClick={() => setNumQuestions(20)} sx={{ ml: 1 }}>20</Button>
          <Typography sx={{ mt: 2 }}>Select categories:</Typography>
          {availableCategories.map(cat => (
            <Chip key={cat} label={cat} color={categories.includes(cat) ? 'primary' : 'default'} onClick={() => setCategories(categories.includes(cat) ? categories.filter(c => c !== cat) : [...categories, cat])} sx={{ mr: 1, mb: 1 }} />
          ))}
          <Typography sx={{ mt: 2 }}>Select difficulties:</Typography>
          {availableDifficulties.map(diff => (
            <Chip key={diff} label={diff} color={difficulties.includes(diff) ? 'primary' : 'default'} onClick={() => setDifficulties(difficulties.includes(diff) ? difficulties.filter(d => d !== diff) : [...difficulties, diff])} sx={{ mr: 1, mb: 1 }} />
          ))}
        </Paper>
        <Button variant="contained" onClick={startQuiz} disabled={loading}>Start Quiz</Button>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Box>
    );
  }

  // Quiz results UI
  if (results) {
    const totalQuestions = questions.length || (results.total_questions || 0);
    const totalCorrect = results.total_correct || 0;
    const percent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Quiz Results</Typography>
        <Alert severity="success">
          Total correct: {totalCorrect} / {totalQuestions} ({percent}% correct)
        </Alert>
        {results.incorrect_categories && results.incorrect_categories.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>Categories missed: {Array.from(new Set(results.incorrect_categories)).join(', ')}</Alert>
        )}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Question Summary</Typography>
          <Paper sx={{ p: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '4px' }}>Question</th>
                  <th style={{ textAlign: 'left', padding: '4px' }}>Correct Answer</th>
                  <th style={{ textAlign: 'left', padding: '4px' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((qq, idx) => {
                  const correctLetter = qq.question.correct_answer;
                  const correctText = qq.question[`answer_${correctLetter.toLowerCase()}`];
                  // Always use backend is_correct field for result column
                  const resultIcon = qq.is_correct === true ? '✔️' : qq.is_correct === false ? '❌' : '';
                  return (
                    <tr key={qq.id} style={{ background: resultIcon === '✔️' ? '#e0ffe0' : resultIcon === '❌' ? '#ffe0e0' : 'inherit' }}>
                      <td style={{ padding: '4px' }}>{idx + 1}</td>
                      <td style={{ padding: '4px' }}>{qq.question.question_text}</td>
                      <td style={{ padding: '4px' }}>{correctText}</td>
                      <td style={{ padding: '4px' }}>{resultIcon}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Paper>
        </Box>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>Start New Quiz</Button>
      </Box>
    );
  }

  // Quiz question UI
  const qq = questions[current];
  if (!qq) return <CircularProgress />;
  const q = qq.question;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Question {current + 1} of {questions.length}</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
          <Chip label={`Category: ${q.category}`} color="info" size="small" />
          <Chip label={`Difficulty: ${q.difficulty}`} color="warning" size="small" />
        </Box>
        <Typography variant="h6">{q.question_text}</Typography>
        <Box sx={{ mt: 2 }}>
          {['A','B','C','D'].map(opt => {
            let color = 'primary';
            let variant = answer === opt ? 'contained' : 'outlined';
            let sxOverride = {};
            // After incorrect answer, highlight correct and incorrect with full background
            if (feedback) {
              const correctLetter = q.correct_answer;
              if (opt === correctLetter) {
                color = 'success';
                variant = 'contained';
                sxOverride = {
                  backgroundColor: 'var(--mui-palette-success-main, #2e7d32) !important',
                  color: '#fff !important',
                  fontWeight: 700,
                  boxShadow: 2,
                  '&.MuiButton-contained': {
                    backgroundColor: 'var(--mui-palette-success-main, #2e7d32) !important',
                    color: '#fff !important',
                  },
                  '&:hover': {
                    backgroundColor: 'var(--mui-palette-success-dark, #1b5e20) !important',
                  },
                };
              } else if (feedback !== 'Correct!' && answer === opt) {
                color = 'error';
                variant = 'contained';
                sxOverride = {
                  backgroundColor: 'var(--mui-palette-error-main, #d32f2f) !important',
                  color: '#fff !important',
                  fontWeight: 700,
                  boxShadow: 2,
                  '&.MuiButton-contained': {
                    backgroundColor: 'var(--mui-palette-error-main, #d32f2f) !important',
                    color: '#fff !important',
                  },
                  '&:hover': {
                    backgroundColor: 'var(--mui-palette-error-dark, #9a0007) !important',
                  },
                };
              } else {
                color = 'primary';
                variant = 'outlined';
                sxOverride = {};
              }
            }
            return (
              <Button
                key={opt}
                variant={variant}
                color={color}
                onClick={async () => {
                  setAnswer(opt);
                  if (!feedback) {
                    setLoading(true);
                    setFeedback(null);
                    try {
                      const qq = questions[current];
                      const res = await fetch(`${API_URL}/quizzes/${quizId}/answer/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          quiz_question_id: qq.id,
                          selected_answer: opt,
                        }),
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setFeedback(data.is_correct ? 'Correct!' : 'Incorrect!');
                        setShowHint(false);
                        if (!data.is_correct && data.hint) setShowHint(true);
                      } else {
                        setFeedback('Error submitting answer.');
                      }
                    } catch {
                      setFeedback('Failed to connect to API.');
                    }
                    setLoading(false);
                  }
                }}
                sx={{
                  mr: 2,
                  mb: 1,
                  ...sxOverride,
                }}
                disabled={!!feedback || loading}
              >
                {opt}: {q[`answer_${opt.toLowerCase()}`]}
              </Button>
            );
          })}
        </Box>
        <Button variant="text" sx={{ mt: 2 }} onClick={() => setShowHint(true)}>Show Hint</Button>
        {showHint && <Alert severity="info" sx={{ mt: 2 }}>{q.hint}</Alert>}
      </Paper>
      {feedback && <Alert severity={feedback === 'Correct!' ? 'success' : 'error'} sx={{ mb: 2 }}>{feedback}</Alert>}
      {/* Submit Answer button removed: answer is checked immediately */}
      {feedback && current < questions.length - 1 && (
        <Button variant="contained" sx={{ mt: 2 }} onClick={nextQuestion}>Next Question</Button>
      )}
      {feedback && current === questions.length - 1 && (
        <Button variant="contained" sx={{ mt: 2 }} onClick={finishQuiz}>Finish Quiz</Button>
      )}
    </Box>
  );
}
