
import { useState, useEffect } from 'react';
import { Incident, ChatMessage, LiveUpdate } from '../types';
import { Header } from './Header';
import { IncidentList } from './IncidentList';
import { AIChat } from './AIChat';
import { LiveFeed } from './LiveFeed';
import { IncidentDetailModal } from './IncidentDetailModal';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import IncidentForm, { IncidentFormData } from './IncidentForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { apiClient } from '../api/client';
import { toast } from 'sonner';

export function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // CRUD state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Set up WebSocket for real-time updates
  useEffect(() => {
    apiClient.connectWebSocket((data) => {
      console.log('WebSocket update:', data);

      if (data.type === 'connected') {
        console.log('WebSocket connected to incidents');
      }

      if (
        data.type === 'incident_created' ||
        data.type === 'incident_updated' ||
        data.type === 'incident_deleted'
      ) {
        setTimeout(() => {
          loadData();
          setIsSyncing(false);
        }, 5500);
      }
    });

    return () => {
      apiClient.disconnectWebSocket();
    };
  }, []);

  const loadData = async () => {
    try {
      const [incidentsData, updatesData] = await Promise.all([
        apiClient.getIncidents(),
        apiClient.getLiveUpdates()
      ]);

      setIncidents(incidentsData);
      setLiveUpdates(updatesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);

      toast.error('Failed to load data', {
        description: 'Make sure the backend server is running'
      });

      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      const aiResponse = await apiClient.sendChatMessage(message, chatMessages);
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to get AI response');
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      handleSendMessage(query);
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedIncident) return;

    try {
      const updated = await apiClient.updateIncident(
        selectedIncident.id,
        { status: 'resolved' }
      );

      setIncidents(prev =>
        prev.map(inc => inc.id === updated.id ? updated : inc)
      );

      setSelectedIncident(null);

      toast.success(`${selectedIncident.id} marked as resolved`);

      const newUpdate: LiveUpdate = {
        id: `lu-${Date.now()}`,
        incidentId: selectedIncident.id,
        message: `${selectedIncident.id} resolved`,
        timestamp: new Date(),
        type: 'resolved'
      };

      setLiveUpdates(prev => [newUpdate, ...prev].slice(0, 10));

      loadData();
    } catch (error) {
      console.error('Failed to mark resolved:', error);
      toast.error('Failed to mark incident as resolved');
    }
  };

  // Create Incident
  const handleCreateIncident = async (data: IncidentFormData) => {
    try {
      const newIncident = await apiClient.createIncident(data);

      const optimisticIncident = {
        ...newIncident,
        _syncing: true
      } as Incident;

      setIncidents(prev => [optimisticIncident, ...prev]);
      setShowCreateModal(false);
      setIsSyncing(true);

      toast.success('Incident created', {
        description: 'Syncing with intelligence layer...'
      });

      setTimeout(() => {
        loadData();
        setIsSyncing(false);
        toast.success('Incident synced successfully');
      }, 5500);

    } catch (error) {
      console.error('Failed to create incident:', error);
      throw error;
    }
  };

  // Update Incident
  const handleUpdateIncident = async (data: IncidentFormData) => {
    if (!editingIncident) return;

    try {
      const updated = await apiClient.updateIncident(editingIncident.id, data);

      setIncidents(prev =>
        prev.map(inc => inc.id === updated.id ? updated : inc)
      );

      setEditingIncident(null);

      toast.success('Incident updated successfully');

      loadData();
    } catch (error) {
      console.error('Failed to update incident:', error);
      throw error;
    }
  };

  // Delete Incident
  const handleDeleteIncident = async () => {
    if (!deletingIncident) return;

    try {
      await apiClient.deleteIncident(deletingIncident.id);

      setIncidents(prev =>
        prev.filter(inc => inc.id !== deletingIncident.id)
      );

      setDeletingIncident(null);

      toast.success('Incident deleted successfully');

      loadData();
    } catch (error) {
      console.error('Failed to delete incident:', error);
      toast.error('Failed to delete incident');
    }
  };

  // Escalate Incident
  const handleEscalate = async () => {
    if (!selectedIncident) return;

    try {
      const updated = await apiClient.updateIncident(
        selectedIncident.id,
        { severity: 'critical' }
      );

      setIncidents(prev =>
        prev.map(inc => inc.id === updated.id ? updated : inc)
      );

      if (selectedIncident.id === updated.id) {
        setSelectedIncident(updated);
      }

      toast.warning(`${selectedIncident.id} escalated to CRITICAL severity`);

      const newUpdate: LiveUpdate = {
        id: `lu-${Date.now()}`,
        incidentId: selectedIncident.id,
        message: `${selectedIncident.id} escalated to critical`,
        timestamp: new Date(),
        type: 'escalated'
      };

      setLiveUpdates(prev => [newUpdate, ...prev].slice(0, 10));

      loadData();
    } catch (error) {
      console.error('Failed to escalate:', error);
      toast.error('Failed to escalate incident');
    }
  };

  const stats = {
    totalActive: incidents.length,
    criticalCount: incidents.filter(
      inc => inc.severity === 'critical'
    ).length,
    avgResolutionTime: '2.4h'
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col bg-[#080f1e] overflow-hidden">
        <Header
          onSearch={handleSearch}
          notificationCount={0}
        />

        <div className="flex-1 flex items-center justify-center bg-[#080f1e]">
          <LoadingState />
        </div>
      </div>
    );
  }

  // Empty State
  if (incidents.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#080f1e]">
        <EmptyState />
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="h-screen w-full flex flex-col bg-[#080f1e] overflow-hidden">

      <Header
        onSearch={handleSearch}
        notificationCount={stats.criticalCount}
      />

      <div className="flex-1 flex overflow-hidden bg-[#080f1e]">

        <IncidentList
          incidents={incidents}
          onSelectIncident={setSelectedIncident}
          selectedIncidentId={selectedIncident?.id}
          onNewIncident={() => setShowCreateModal(true)}
        />

        <AIChat
          messages={chatMessages}
          onSendMessage={handleSendMessage}
        />

        <LiveFeed
          updates={liveUpdates}
          stats={stats}
          lastAIContext={{
            mode: chatMessages.filter(m => m.sender === 'ai').slice(-1)[0]?.mode || 'Reasoning',
            dataSource: chatMessages.filter(m => m.sender === 'ai').slice(-1)[0]?.dataSource || 'Supabase',
            contextSize: chatMessages.filter(m => m.sender === 'ai').slice(-1)[0]?.contextSize || null
          }}
        />

      </div>

      {/* Incident Details */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onAskAI={handleSendMessage}
          onMarkResolved={handleMarkResolved}
          onEscalate={handleEscalate}
          onEdit={() => {
            setEditingIncident(selectedIncident);
            setSelectedIncident(null);
          }}
          onDelete={() => {
            setDeletingIncident(selectedIncident);
            setSelectedIncident(null);
          }}
        />
      )}

      {/* Create Incident */}
      {showCreateModal && (
        <IncidentForm
          onSubmit={handleCreateIncident}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Incident */}
      {editingIncident && (
        <IncidentForm
          incident={editingIncident}
          onSubmit={handleUpdateIncident}
          onCancel={() => setEditingIncident(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingIncident && (
        <DeleteConfirmDialog
          incidentTitle={deletingIncident.title}
          onConfirm={handleDeleteIncident}
          onCancel={() => setDeletingIncident(null)}
        />
      )}

    </div>
  );
}
