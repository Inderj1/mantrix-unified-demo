import { useState, useEffect, useCallback } from 'react';

export const useTickets = ({ status, type, priority, searchTerm }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (status && status !== 'All') params.append('status', status);
      if (type && type !== 'All') params.append('ticket_type', type);
      if (priority && priority !== 'All') params.append('priority', priority);
      params.append('limit', '100');

      const response = await fetch(`/api/v1/command-tower/tickets?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        let filteredTickets = data.tickets;

        if (searchTerm && searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          filteredTickets = filteredTickets.filter(
            (ticket) =>
              ticket.title?.toLowerCase().includes(searchLower) ||
              ticket.description?.toLowerCase().includes(searchLower) ||
              ticket.ticket_id?.toString().includes(searchLower) ||
              ticket.source_tile?.toLowerCase().includes(searchLower)
          );
        }

        setTickets(filteredTickets);
      } else {
        setError(data.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [status, type, priority, searchTerm]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const refresh = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refresh };
};

export const createTicket = async (ticketData) => {
  try {
    const response = await fetch('/api/v1/command-tower/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    const data = await response.json();
    return data.success ? data.ticket : null;
  } catch (err) {
    console.error('Error creating ticket:', err);
    return null;
  }
};

export const updateTicketStatus = async (ticketId, status, metadata = {}) => {
  try {
    const response = await fetch(`/api/v1/command-tower/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        metadata,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (err) {
    console.error('Error updating ticket status:', err);
    return false;
  }
};

export const cancelTicket = async (ticketId, reason) => {
  try {
    const response = await fetch(`/api/v1/command-tower/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Cancelled',
        metadata: { cancellation_reason: reason },
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (err) {
    console.error('Error cancelling ticket:', err);
    return false;
  }
};
