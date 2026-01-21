import React, { useState, useMemo } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaCopy, FaComments, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './VoiceBotDisplay.css';

// ✅ BEST PRACTICE: Define outside component
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting timestamp:', e);
    return 'Invalid time';
  }
};

const VoiceBotDisplay = ({ cceComments }) => {
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  
  // Parse the cce_comments to extract bot call data
  const botData = useMemo(() => {
    if (!cceComments) return null;
    
    console.log('=== PARSING CCE COMMENTS ===');
    console.log('Raw cceComments:', cceComments);
    
    try {
      // First, try to find JSON data in the comments
      const jsonMatch = cceComments.match(/Bot:\s*({[\s\S]*})/);
      
      console.log('JSON Match found:', jsonMatch ? 'YES' : 'NO');
      
      if (jsonMatch) {
        // Parse JSON format
        const parsed = JSON.parse(jsonMatch[1]);
        console.log('Parsed data:', parsed);
        console.log('Original messages count:', parsed.messages?.length || 0);
        
        // Deduplicate messages
        const uniqueMessages = [];
        const seen = new Set();
        
        if (parsed.messages && Array.isArray(parsed.messages)) {
          parsed.messages.forEach((msg, idx) => {
            // Create unique key from speaker + message content
            const key = `${msg.speaker}:${msg.message.trim()}`;
            
            if (!seen.has(key)) {
              seen.add(key);
              uniqueMessages.push(msg);
              console.log(`Message ${idx}: Added unique message`);
            } else {
              console.log(`Message ${idx}: Skipped duplicate`);
            }
          });
        }
        
        console.log('Unique messages count:', uniqueMessages.length);
        
        // Format timestamps for display
        const formattedMessages = uniqueMessages.map(msg => ({
          ...msg,
          formattedTime: formatTimestamp(msg.timestamp)
        }));
        
        console.log('Final formatted messages:', formattedMessages);
        
        return {
          bot: parsed.bot_name || 'Voice Bot',
          campaign: parsed.campaign_name || 'N/A',
          duration: parsed.duration || 'N/A',
          status: parsed.status || 'N/A',
          recording: parsed.recording_url || '',
          summary: parsed.summary || '',
          transcript: formattedMessages,
          messageCount: formattedMessages.length
        };
      } else {
        // Fallback to plain text parsing (your old format)
        console.log('Using plain text fallback parsing');
        const lines = cceComments.split('\n');
        const data = {
          bot: '',
          campaign: '',
          duration: '',
          status: '',
          recording: '',
          summary: '',
          transcript: [],
          messageCount: 0
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
            const match = line.match(/\[([^\]]+)\]\s*(\w+):\s*(.+)/);
            if (match) {
              data.transcript.push({
                timestamp: match[1],
                formattedTime: match[1],
                speaker: match[2],
                message: match[3]
              });
            }
          }
        });
        
        data.messageCount = data.transcript.length;
        console.log('Plain text parsed data:', data);
        return data;
      }
    } catch (error) {
      console.error('Error parsing voice bot data:', error);
      return null;
    }
  }, [cceComments]);
  
  console.log('Final botData:', botData);
  console.log('Transcript length:', botData?.transcript?.length);
  
  if (!botData || !botData.bot) {
    console.log('No botData or bot name, returning null');
    return null;
  }

  const hasValidRecordingUrl = botData.recording && 
                               botData.recording !== 'N/A' && 
                               botData.recording.startsWith('http');
  
  const copyRecordingUrl = () => {
    if (hasValidRecordingUrl) {
      navigator.clipboard.writeText(botData.recording);
      toast.success('Recording URL copied to clipboard!');
    } else {
      toast.info('No recording URL available to copy');
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
      </div>

      {/* Summary Card */}
      {botData.summary && botData.summary !== 'N/A' && (
        <div className="summary-card">
          <div className="summary-header">📝 Call Summary</div>
          <div className="summary-text">{botData.summary}</div>
        </div>
      )}

      {/* Recording Card - SIMPLIFIED */}
      <div className="recording-card">
        <div className="recording-header">🎵 Call Recording</div>
        
        {/* URL Display */}
        <div className={`recording-url-display ${!hasValidRecordingUrl ? 'no-url' : ''}`}>
          {botData.recording || 'No recording URL available'}
        </div>

        {/* Copy Button */}
        <div className="recording-actions">
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
            onClick={() => {
              console.log('Opening transcript modal with messages:', botData.transcript);
              setShowTranscriptModal(true);
            }}
          >
            <FaComments className="btn-icon" />
            Show Transcript ({botData.messageCount} unique messages)
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
          <Modal.Title>💬 Call Transcript ({botData.messageCount} unique messages)</Modal.Title>
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
            {console.log('Rendering messages:', botData.transcript)}
            {botData.transcript && botData.transcript.length > 0 ? (
              botData.transcript.map((msg, index) => {
                console.log(`Rendering message ${index}:`, msg);
                return (
                  <div 
                    key={`${msg.speaker}-${index}-${msg.timestamp || index}`}
                    className={`chat-message ${msg.speaker === 'bot' ? 'bot-message' : 'human-message'}`}
                  >
                    <div className="message-bubble">
                      <div className="message-header">
                        <span className="speaker-name">
                          {msg.speaker === 'bot' ? '🤖 Bot' : '👤 Customer'}
                        </span>
                        <span className="message-time">{msg.formattedTime}</span>
                      </div>
                      <div className="message-text">{msg.message}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-messages">No messages to display</div>
            )}
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