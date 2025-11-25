import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../../lib/supabaseClient';
import CountdownTimer from './CountdownTimer';

export default function RegistrationSlots() {
  const [slots, setSlots] = useState({
    'open-age': { total: 12, registered: 0, available: 12, percentage: 0, isOpen: true, deadline: null },
    'u17': { total: 12, registered: 0, available: 12, percentage: 0, isOpen: true, deadline: null }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
    
    // Set up real-time subscription for slot updates
    const subscription = supabaseClient
      .channel('registration-slots')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registration_slots'
        },
        () => {
          console.log('Registration slots table changed, refetching...');
          fetchSlots();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Debug: Log when slots state changes
  useEffect(() => {
    console.log('Slots state updated:', slots);
  }, [slots]);

  const fetchSlots = async () => {
    try {
      console.log('Fetching slots from registration_slots table...');
      // Query directly from registration_slots table
      const { data, error } = await supabaseClient
        .from('registration_slots')
        .select('category, total_slots, filled_slots, available_slots, registration_open, status');

      console.log('Registration slots query result:', { data, error });

      if (error) {
        console.error('Error fetching registration_slots:', error);
        throw error;
      }

      if (data && data.length > 0) {
        // Map the table data to our component state
        const slotsData = {};
        data.forEach(slot => {
          const total = slot.total_slots || 12;
          const registered = slot.filled_slots || 0;
          const available = slot.available_slots || 0;
          const percentage = total > 0 ? Math.round((registered / total) * 100) : 0;

          slotsData[slot.category] = {
            total,
            registered,
            available,
            percentage,
            isOpen: slot.registration_open !== false,
            deadline: null // Add deadline if available in table
          };
        });
        console.log('Final slots data from table:', slotsData);
        setSlots(slotsData);
      } else {
        console.log('No data returned from registration_slots table, using defaults');
        // Use defaults if table is empty
        const defaultSlots = {
          'open-age': { total: 12, registered: 0, available: 12, percentage: 0, isOpen: true, deadline: null },
          'u17': { total: 12, registered: 0, available: 12, percentage: 0, isOpen: true, deadline: null }
        };
        setSlots(defaultSlots);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      // On error, use defaults
      const fallbackSlots = {
        'open-age': {
          total: 12,
          registered: 0,
          available: 12,
          percentage: 0,
          isOpen: true,
          deadline: null
        },
        'u17': {
          total: 12,
          registered: 0,
          available: 12,
          percentage: 0,
          isOpen: true,
          deadline: null
        }
      };
      setSlots(fallbackSlots);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'green';
    if (percentage > 25) return 'orange';
    return 'red';
  };

  const getStatusText = (available) => {
    if (available === 0) return 'Full';
    if (available <= 3) return 'Almost Full';
    return 'Available';
  };

  const fallbackDeadline = '2025-12-31T23:59:59+05:30';
  const registrationDeadline = slots['open-age']?.deadline || slots['u17']?.deadline || fallbackDeadline;
  const formattedDeadline = new Date(registrationDeadline).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="registration-slots-container">
        <div className="slots-loading">
          <div className="spinner-small"></div>
          <span>Loading slots...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-slots-container">
      <h3 className="slots-title">
        <i className="fas fa-users"></i> Registration Status
      </h3>

      <div className="slots-deadline-card">
        <CountdownTimer targetDate={registrationDeadline} label="Registration closes in" />
        <p className="deadline-date">
          Deadline: {formattedDeadline}
        </p>
      </div>
      
      <div className="slots-grid">
        {/* Open Age Category */}
        <div className="slot-card">
          <div className="slot-header">
            <h4>Open Age</h4>
            <span className={`slot-status ${getStatusColor(slots['open-age'].available, slots['open-age'].total)}`}>
              {getStatusText(slots['open-age'].available)}
            </span>
          </div>
          
          <div className="slot-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${slots['open-age'].percentage}%`,
                  background: slots['open-age'].available === 0 
                    ? 'linear-gradient(135deg, #ef5350, #e53935)' 
                    : 'linear-gradient(135deg, #4f8cff, #6ecdee)'
                }}
              />
            </div>
            <div className="progress-text">
              {slots['open-age'].registered} / {slots['open-age'].total} teams registered
            </div>
          </div>
          
          <div className="slot-footer">
            <div className="slot-stat">
              <i className="fas fa-check-circle"></i>
              <span className="slot-stat-value">{slots['open-age'].registered}</span>
              <span className="slot-stat-label">Registered</span>
            </div>
            <div className="slot-stat">
              <i className="fas fa-clock"></i>
              <span className="slot-stat-value">{slots['open-age'].available}</span>
              <span className="slot-stat-label">Remaining</span>
            </div>
          </div>
        </div>

        {/* U17 Category */}
        <div className="slot-card">
          <div className="slot-header">
            <h4>Under 17</h4>
            <span className={`slot-status ${getStatusColor(slots['u17'].available, slots['u17'].total)}`}>
              {getStatusText(slots['u17'].available)}
            </span>
          </div>
          
          <div className="slot-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${slots['u17'].percentage}%`,
                  background: slots['u17'].available === 0 
                    ? 'linear-gradient(135deg, #ef5350, #e53935)' 
                    : 'linear-gradient(135deg, #4f8cff, #6ecdee)'
                }}
              />
            </div>
            <div className="progress-text">
              {slots['u17'].registered} / {slots['u17'].total} teams registered
            </div>
          </div>
          
          <div className="slot-footer">
            <div className="slot-stat">
              <i className="fas fa-check-circle"></i>
              <span className="slot-stat-value">{slots['u17'].registered}</span>
              <span className="slot-stat-label">Registered</span>
            </div>
            <div className="slot-stat">
              <i className="fas fa-clock"></i>
              <span className="slot-stat-value">{slots['u17'].available}</span>
              <span className="slot-stat-label">Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {(slots['open-age'].available === 0 || slots['u17'].available === 0) && (
        <div className="slots-notice">
          <i className="fas fa-info-circle"></i>
          {slots['open-age'].available === 0 && slots['u17'].available === 0 
            ? 'Both categories are now full. Registration is closed.'
            : slots['open-age'].available === 0
            ? 'Open Age category is full. U17 slots still available!'
            : 'U17 category is full. Open Age slots still available!'
          }
        </div>
      )}
    </div>
  );
}

