import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCopy, FaPlay, FaComments, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './VoiceBotDisplay.css';

const VoiceBotDisplay = ({ cceComments }) => {
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  
  // Parse the cce_comments to extract bot call data
  const parseComments = (comments) => {
    if (!comments) return null;
    
    const lines = comments.split('\n');
    const data = {
      bot: '',
      campaign: '',
      duration: '',
      status: '',
      recording: '',
      summary: '',
      transcript: []
    };
    
    let isTranscript = false;
    
    lines.forEach(line => {
      if (line.startsWith('Bot:')) {
        data.bot = line.replace('Bot:', '').trim();
      } else if (line.startsWith('Campaign:')) {
        data.campaign = line.replace('Campaign:', '').trim();
      } else if (line.startsWith('Duration:')) {
        data.duration = line.replace('Duration:', '').trim();
      } else if (line.startsWith('Status:')) {
        data.status = line.replace('Status:', '').trim();
      } else if (line.startsWith('Recording:')) {
        data.recording = line.replace('Recording:', '').trim();
      } else if (line.startsWith('Summary:')) {
        data.summary = line.replace('Summary:', '').trim();
      } else if (line.startsWith('Transcript:')) {
        isTranscript = true;
      } else if (isTranscript && line.trim()) {
        // Parse transcript line: [10:29:05] bot: Hello! This is Sarah...
        const match = line.match(/\[([^\]]+)\]\s*(\w+):\s*(.+)/);
        if (match) {
          data.transcript.push({
            timestamp: match[1],
            speaker: match[2],
            message: match[3]
          });
        }
      }
    });
    
    return data;
  };
  
  const botData = parseComments(cceComments);
  
  if (!botData || !botData.bot) {
    return null; // Don't show if no bot data
  }

  const hasValidRecordingUrl = botData.recording && botData.recording !== 'N/A' && botData.recording.startsWith('http');
  
  const copyRecordingUrl = () => {
    if (hasValidRecordingUrl) {
      navigator.clipboard.writeText(botData.recording);
      toast.success('Recording URL copied to clipboard!');
    } else {
      toast.info('No recording URL available to copy');
    }
  };
  
  const openRecording = () => {
    if (hasValidRecordingUrl) {
      window.open(botData.recording, '_blank');
    } else {
      toast.info('No recording URL available');
    }
  };

  return (
    <div className="voice-bot-container">
      {/* Bot Info Card */}
      <div className="bot-info-card">
        <div className="info-row">
          <span className="info-label">🤖 Bot Name:</span>
          <span className="info-value">{botData.bot}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">📢 Campaign:</span>
          <span className="info-value">{botData.campaign}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">⏱️ Duration:</span>
          <span className="info-value">{botData.duration}</span>
        </div>
        
        {/* <div className="info-row">
          <span className="info-label">✅ Status:</span>
          <span className={`info-value status-${botData.status.toLowerCase()}`}>
            {botData.status}
          </span>
        </div> */}
      </div>

      {/* Summary Card */}
      {botData.summary && botData.summary !== 'N/A' && (
        <div className="summary-card">
          <div className="summary-header">📝 Call Summary</div>
          <div className="summary-text">{botData.summary}</div>
        </div>
      )}

      {/* Recording Card - Always visible */}
      <div className="recording-card">
        <div className="recording-header">🎵 Call Recording</div>
        
        {/* URL Display */}
        <div className={`recording-url-display ${!hasValidRecordingUrl ? 'no-url' : ''}`}>
          {botData.recording || 'No recording URL available'}
        </div>

        {/* Action Buttons */}
        <div className="recording-actions">
          {/* <button 
            className="recording-btn play-btn"
            onClick={openRecording}
            disabled={!hasValidRecordingUrl}
            title={hasValidRecordingUrl ? "Play Recording" : "No recording available"}
          >
            <FaPlay className="btn-icon" />
            Play Recording
          </button> */}
          <button 
            className="recording-btn copy-btn"
            onClick={copyRecordingUrl}
            disabled={!hasValidRecordingUrl}
            title={hasValidRecordingUrl ? "Copy URL" : "No URL to copy"}
          >
            <FaCopy className="btn-icon" />
            Copy URL
          </button>
        </div>
      </div>

      {/* Transcript Button */}
      {botData.transcript && botData.transcript.length > 0 && (
        <div className="transcript-card">
          <button 
            className="transcript-btn"
            onClick={() => setShowTranscriptModal(true)}
          >
            <FaComments className="btn-icon" />
            Show Transcript ({botData.transcript.length} messages)
          </button>
        </div>
      )}

      {/* Transcript Modal */}
      <Modal 
        show={showTranscriptModal} 
        onHide={() => setShowTranscriptModal(false)}
        size="lg"
        centered
        className="transcript-modal"
      >
        <Modal.Header>
          <Modal.Title>💬 Call Transcript</Modal.Title>
          <button 
            className="modal-close-btn"
            onClick={() => setShowTranscriptModal(false)}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </Modal.Header>
        <Modal.Body className="transcript-body">
          <div className="transcript-chat-container">
            {botData.transcript.map((msg, index) => (
              <div 
                key={index} 
                className={`chat-message ${msg.speaker === 'bot' ? 'bot-message' : 'human-message'}`}
              >
                <div className="message-bubble">
                  <div className="message-header">
                    <span className="speaker-name">
                      {msg.speaker === 'bot' ? '🤖 Bot' : '👤 Customer'}
                    </span>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                  <div className="message-text">{msg.message}</div>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTranscriptModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VoiceBotDisplay;