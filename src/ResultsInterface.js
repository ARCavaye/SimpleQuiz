import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Collapse, IconButton } from '@mui/material';
import { API_URL } from './config';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function ResultsInterface() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [quizDetails, setQuizDetails] = useState({});
  
  useEffect(() => {
    async function fetchQuizzes() {
      setLoading(true);
      setError(null);
      try {
        const quizRes = await fetch(`${API_URL}/quizzes/`);
        const quizList = await quizRes.json();
        setQuizzes(Array.isArray(quizList) ? quizList.reverse() : []);
      } catch {
        setError('Failed to fetch quizzes.');
      }
      setLoading(false);
    }
    fetchQuizzes();
  }, []);

  const handleExpand = async (quizId) => {
    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
      return;
    }
    setExpandedQuizId(quizId);
    if (!quizDetails[quizId]) {
      try {
        const res = await fetch(`${API_URL}/quizzes/${quizId}/results/`);
        const data = await res.json();
        setQuizDetails(prev => ({ ...prev, [quizId]: data }));
      } catch {
        setQuizDetails(prev => ({ ...prev, [quizId]: { error: 'Failed to fetch details.' } }));
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!quizzes.length) return <Alert severity="info">No quizzes taken yet.</Alert>;

  // Compute top 5 incorrect categories across all quizzes
  const incorrectCategoryCounts = {};
  quizzes.forEach(qz => {
    if (qz.quiz_questions) {
      qz.quiz_questions.forEach(qq => {
        if (qq.is_correct === false && qq.question && qq.question.category) {
          incorrectCategoryCounts[qq.question.category] = (incorrectCategoryCounts[qq.question.category] || 0) + 1;
        }
      });
    }
  });
  const topIncorrectCategories = Object.entries(incorrectCategoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Quiz History</Typography>
      {topIncorrectCategories.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, background: '#fffde7' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Top 5 Incorrect Categories</Typography>
          {topIncorrectCategories.map(([cat, count], idx) => (
            <Box key={cat} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 500, minWidth: 32 }}>{idx + 1}.</Typography>
              <Typography sx={{ flexGrow: 1 }}>{cat}</Typography>
              <Typography color="error" sx={{ fontWeight: 600 }}>{count} incorrect</Typography>
            </Box>
          ))}
        </Paper>
      )}
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Date</TableCell>
                <TableCell>Questions</TableCell>
                <TableCell>Correct</TableCell>
                <TableCell>Score (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map((quiz) => {
                const total = quiz.total_questions || (quiz.quiz_questions ? quiz.quiz_questions.length : 0);
                const correct = quiz.correct_answers || quiz.total_correct || 0;
                const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <React.Fragment key={quiz.id}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleExpand(quiz.id)}>
                          {expandedQuizId === quiz.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{quiz.created_at ? new Date(quiz.created_at).toLocaleString() : '-'}</TableCell>
                      <TableCell>{total}</TableCell>
                      <TableCell>{correct}</TableCell>
                      <TableCell>{percent}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandedQuizId === quiz.id} timeout="auto" unmountOnExit>
                          <Box sx={{ m: 2 }}>
                            {quizDetails[quiz.id] ? (
                              quizDetails[quiz.id].error ? (
                                <Alert severity="error">{quizDetails[quiz.id].error}</Alert>
                              ) : (
                                <>
                                  <Alert severity="success" sx={{ mb: 2 }}>
                                    Total correct: {quizDetails[quiz.id].total_correct} / {quizDetails[quiz.id].quiz_questions ? quizDetails[quiz.id].quiz_questions.length : quizDetails[quiz.id].total_questions || 0}
                                  </Alert>
                                  {quizDetails[quiz.id].incorrect_categories && quizDetails[quiz.id].incorrect_categories.length > 0 && (
                                    <Alert severity="warning" sx={{ mb: 2 }}>
                                      Categories missed: {Array.from(new Set(quizDetails[quiz.id].incorrect_categories)).join(', ')}
                                    </Alert>
                                  )}
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>Question</TableCell>
                                        <TableCell>Correct Answer</TableCell>
                                        <TableCell>Result</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {quizDetails[quiz.id].quiz_questions && quizDetails[quiz.id].quiz_questions.map((qq, idx) => {
                                        const correctLetter = qq.question.correct_answer;
                                        const correctText = qq.question[`answer_${correctLetter.toLowerCase()}`];
                                        const resultIcon = qq.is_correct === true ? '✔️' : qq.is_correct === false ? '❌' : '';
                                        return (
                                          <TableRow key={qq.id} sx={{ background: resultIcon === '✔️' ? '#e0ffe0' : resultIcon === '❌' ? '#ffe0e0' : 'inherit' }}>
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell>{qq.question.question_text}</TableCell>
                                            <TableCell>{correctText}</TableCell>
                                            <TableCell>{resultIcon}</TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </>
                              )
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}><CircularProgress size={24} sx={{ mr: 2 }} />Loading...</Box>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
