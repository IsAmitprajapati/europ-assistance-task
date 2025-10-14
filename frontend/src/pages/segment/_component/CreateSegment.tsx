import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box
} from "@mui/material";
import api from "../../../utils/Axios";
import { endpoints } from "../../../utils/endpoint";

export default function CreateSegment({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOpen = () => {
    setOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    setOpen(false);
    setSegmentName("");
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!segmentName.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post(endpoints.segment, {
        name: segmentName.trim()
      });

      if (response.data && response.data.success) {
        setSuccess("Segment created successfully!");

        if (onCreated) {
          onCreated();
        }

        //after 1s close the dialog box
        setTimeout(() => {
          handleClose();
        }, 1000);
        
      } else {
        setError(
          response.data?.message || "An unexpected error occurred. Please try again."
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "An error occurred. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" onClick={handleOpen}>
    Create Segment
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Create Segment</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="normal"
            label="Segment Name"
            fullWidth
            value={segmentName}
            onChange={e => setSegmentName(e.target.value)}
            disabled={loading}
            variant="outlined"
            error={Boolean(error)}
            helperText={error ? error : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!segmentName.trim() || loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}