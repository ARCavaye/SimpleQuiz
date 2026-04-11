import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper } from '@mui/material';
import { API_URL } from './config';

export default function IngestQuestions() {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    let data;
    try {
      data = JSON.parse(jsonInput);
    } catch (err) {
      setError('Invalid JSON format.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/questions/ingest/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (res.ok) {
        setResult(`Successfully ingested ${resData.count} question(s).`);
      } else {
        setError(JSON.stringify(resData));
      }
    } catch (err) {
      setError('Failed to connect to API.');
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Paste question JSON below:</Typography>
      <Paper elevation={2} sx={{ p: 2, mb: 2, background: '#f5f5f5' }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Example format:</Typography>
        <pre style={{ fontSize: 13, margin: 0 }}>
{`[
  {
    "question_text": "What is the capital of France?",
    "answer_a": "Paris",
    "answer_b": "London",
    "answer_c": "Berlin",
    "answer_d": "Madrid",
    "correct_answer": "A",
    "hint": "It's known as the city of lights.",
    "category": "Geography",
    "difficulty": "easy"
  }
]`}
        </pre>
      </Paper>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Questions JSON"
          multiline
          minRows={8}
          fullWidth
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained">Ingest</Button>
      </form>
      {result && <Alert severity="success" sx={{ mt: 2 }}>{result}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
}
