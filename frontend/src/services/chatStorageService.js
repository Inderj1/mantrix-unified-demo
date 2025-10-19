import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'axis_chat_sessions';
const SESSION_ID_KEY = 'axis_current_session';

class ChatStorageService {
  constructor() {
    this.sessionId = null;
    this.userId = null;
  }

  /**
   * Initialize a new chat session
   * @param {string} userId - The current user ID
   * @returns {string} The session ID
   */
  initSession(userId) {
    // Check if there's an existing session
    const existingSessionId = sessionStorage.getItem(SESSION_ID_KEY);

    if (existingSessionId) {
      this.sessionId = existingSessionId;
      this.userId = userId;

      // Update userId if changed
      const sessions = this.getAllSessions();
      if (sessions[this.sessionId]) {
        sessions[this.sessionId].userId = userId;
        sessions[this.sessionId].lastUpdated = new Date().toISOString();
        this._saveSessions(sessions);
      }
    } else {
      // Create new session
      this.sessionId = uuidv4();
      this.userId = userId;
      sessionStorage.setItem(SESSION_ID_KEY, this.sessionId);

      const sessions = this.getAllSessions();
      sessions[this.sessionId] = {
        sessionId: this.sessionId,
        userId: userId,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        conversations: {},
      };
      this._saveSessions(sessions);
    }

    return this.sessionId;
  }

  /**
   * Save a message to a specific context
   * @param {string} contextKey - The context identifier
   * @param {object} message - The message object { role, content, timestamp }
   */
  saveMessage(contextKey, message) {
    if (!this.sessionId) {
      console.error('Session not initialized');
      return;
    }

    const sessions = this.getAllSessions();
    const session = sessions[this.sessionId];

    if (!session) {
      console.error('Session not found');
      return;
    }

    // Initialize context conversation if it doesn't exist
    if (!session.conversations[contextKey]) {
      session.conversations[contextKey] = [];
    }

    // Add message with timestamp
    const messageWithTimestamp = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    session.conversations[contextKey].push(messageWithTimestamp);
    session.lastUpdated = new Date().toISOString();

    this._saveSessions(sessions);
  }

  /**
   * Get conversation for a specific context
   * @param {string} contextKey - The context identifier
   * @returns {Array} Array of messages
   */
  getConversation(contextKey) {
    if (!this.sessionId) {
      return [];
    }

    const sessions = this.getAllSessions();
    const session = sessions[this.sessionId];

    if (!session || !session.conversations[contextKey]) {
      return [];
    }

    return session.conversations[contextKey];
  }

  /**
   * Clear conversation for a specific context
   * @param {string} contextKey - The context identifier
   */
  clearContext(contextKey) {
    if (!this.sessionId) {
      return;
    }

    const sessions = this.getAllSessions();
    const session = sessions[this.sessionId];

    if (session && session.conversations[contextKey]) {
      delete session.conversations[contextKey];
      session.lastUpdated = new Date().toISOString();
      this._saveSessions(sessions);
    }
  }

  /**
   * Clear entire current session
   */
  clearSession() {
    if (!this.sessionId) {
      return;
    }

    const sessions = this.getAllSessions();
    delete sessions[this.sessionId];
    this._saveSessions(sessions);

    sessionStorage.removeItem(SESSION_ID_KEY);
    this.sessionId = null;
    this.userId = null;
  }

  /**
   * Get all sessions (for the current browser session storage)
   * @returns {object} All sessions
   */
  getAllSessions() {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Get current session
   * @returns {object|null} Current session data
   */
  getCurrentSession() {
    if (!this.sessionId) {
      return null;
    }

    const sessions = this.getAllSessions();
    return sessions[this.sessionId] || null;
  }

  /**
   * Get all contexts in current session
   * @returns {Array} Array of context keys
   */
  getAllContexts() {
    const session = this.getCurrentSession();
    return session ? Object.keys(session.conversations) : [];
  }

  /**
   * Get session ID
   * @returns {string|null} Current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Get user ID
   * @returns {string|null} Current user ID
   */
  getUserId() {
    return this.userId;
  }

  /**
   * Private method to save sessions to sessionStorage
   * @param {object} sessions - Sessions object to save
   */
  _saveSessions(sessions) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }

  /**
   * Clean up old sessions (optional, for maintenance)
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanupOldSessions(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const sessions = this.getAllSessions();
    const now = new Date().getTime();
    let cleaned = false;

    Object.keys(sessions).forEach(sessionId => {
      const session = sessions[sessionId];
      const lastUpdated = new Date(session.lastUpdated).getTime();

      if (now - lastUpdated > maxAge) {
        delete sessions[sessionId];
        cleaned = true;
      }
    });

    if (cleaned) {
      this._saveSessions(sessions);
    }
  }
}

// Create and export a singleton instance
const chatStorageService = new ChatStorageService();
export default chatStorageService;
