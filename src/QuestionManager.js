import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { API_URL } from './config';
import IngestQuestions from './IngestQuestions';

function EditDialog({ open, question, onClose, onSave }) {
  const [form, setForm] = useState(question || {});
  useEffect(() => { setForm(question || {}); }, [question]);
  if (!question) return null;
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => onSave(form);
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Question</DialogTitle>
      <DialogContent>
        <TextField margin="dense" label="Question Text" name="question_text" value={form.question_text || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Answer A" name="answer_a" value={form.answer_a || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Answer B" name="answer_b" value={form.answer_b || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Answer C" name="answer_c" value={form.answer_c || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Answer D" name="answer_d" value={form.answer_d || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Correct Answer (A/B/C/D)" name="correct_answer" value={form.correct_answer || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Hint" name="hint" value={form.hint || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Category" name="category" value={form.category || ''} onChange={handleChange} fullWidth />
        <TextField margin="dense" label="Difficulty (easy/medium/hard)" name="difficulty" value={form.difficulty || ''} onChange={handleChange} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editQ, setEditQ] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showIngest, setShowIngest] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/questions/`);
      const data = await res.json();
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch questions.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const handleEdit = (q) => { setEditQ(q); setEditOpen(true); };
  const handleEditSave = async (form) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/questions/${form.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEditOpen(false);
        fetchQuestions();
      } else {
        setError('Failed to save changes.');
      }
    } catch {
      setError('Failed to save changes.');
    }
    setSaving(false);
  };
  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      const res = await fetch(`${API_URL}/questions/${id}/`, { method: 'DELETE' });
      if (res.ok) {
        setQuestions(questions.filter(q => q.id !== id));
      } else {
        setError('Failed to delete question.');
      }
    } catch {
      setError('Failed to delete question.');
    }
    setDeleteId(null);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Question Manager</Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setShowIngest(!showIngest)}>
          {showIngest ? 'Hide Ingest Questions' : 'Ingest Questions'}
        </Button>
      </Box>
      <Collapse in={showIngest} timeout="auto" unmountOnExit>
        <Paper sx={{ p: 2, mb: 2 }}>
          <IngestQuestions onSuccess={fetchQuestions} />
        </Paper>
      </Collapse>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Question</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Difficulty</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.map(q => (
                <TableRow key={q.id}>
                  <TableCell>{q.id}</TableCell>
                  <TableCell>{q.question_text}</TableCell>
                  <TableCell>{q.category}</TableCell>
                  <TableCell>{q.difficulty}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(q)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(q.id)} disabled={deleteId === q.id}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <EditDialog open={editOpen} question={editQ} onClose={() => setEditOpen(false)} onSave={handleEditSave} />
      {saving && <CircularProgress sx={{ mt: 2 }} />}
    </Box>
  );
}
