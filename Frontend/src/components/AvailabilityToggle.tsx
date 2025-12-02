import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

type AvailabilityStatus = 'available' | 'busy' | 'not_looking';

interface AvailabilityData {
  status: AvailabilityStatus;
  message: string;
}

export default function AvailabilityToggle() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilityData>({
    status: 'available',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('availability_status, availability_message')
          .eq('id', user?.id)
          .single();

        if (error) {
          console.error('Error loading availability:', error);
          // If columns don't exist, just use defaults
          setAvailability({ status: 'available', message: '' });
          return;
        }

        if (data) {
          setAvailability({
            status: data.availability_status || 'available',
            message: data.availability_message || ''
          });
          setShowMessage(!!data.availability_message);
        }
      } catch (error) {
        console.error('Error loading availability:', error);
        setAvailability({ status: 'available', message: '' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      void loadAvailability();
    }
  }, [user]);

  const updateAvailability = async (newStatus: AvailabilityStatus, newMessage?: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          availability_status: newStatus,
          availability_message: newMessage || availability.message || null
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error updating availability:', error);
        alert(`Failed to update availability status.\n\nError: ${error.message}\n\nPlease run the SQL migration in Supabase first. Check AVAILABILITY_STATUS_GUIDE.md for instructions.`);
        setSaving(false);
        return;
      }

      setAvailability({
        status: newStatus,
        message: newMessage !== undefined ? newMessage : availability.message
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update availability status.\n\nError: ${errorMessage}\n\nPlease run the SQL migration in Supabase first.`);
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status: AvailabilityStatus) => {
    switch (status) {
      case 'available':
        return {
          icon: CheckCircle,
          color: 'bg-green-500',
          textColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Available for Work',
          description: 'Brands can see you\'re actively looking for collaborations'
        };
      case 'busy':
        return {
          icon: Clock,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Currently Busy',
          description: 'You\'ll still appear in searches but marked as busy'
        };
      case 'not_looking':
        return {
          icon: XCircle,
          color: 'bg-gray-500',
          textColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Not Looking',
          description: 'You won\'t appear in brand searches'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentConfig = getStatusConfig(availability.status);
  const Icon = currentConfig.icon;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Availability Status</h3>
          <p className="text-sm text-gray-600 mt-1">Let brands know if you're open to collaborations</p>
        </div>
        <div className={`p-2 rounded-full ${currentConfig.color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Status Options */}
      <div className="space-y-3 mb-4">
        {(['available', 'busy', 'not_looking'] as AvailabilityStatus[]).map((status) => {
          const config = getStatusConfig(status);
          const StatusIcon = config.icon;
          const isSelected = availability.status === status;

          return (
            <button
              key={status}
              onClick={() => updateAvailability(status)}
              disabled={saving}
              className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? `${config.borderColor} ${config.bgColor}`
                  : 'border-gray-200 hover:border-gray-300'
              } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`p-2 rounded-full ${isSelected ? config.color : 'bg-gray-200'}`}>
                <StatusIcon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium ${isSelected ? config.textColor : 'text-gray-700'}`}>
                  {config.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{config.description}</div>
              </div>
              {isSelected && (
                <CheckCircle className={`h-5 w-5 ${config.textColor}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Custom Message */}
      <div className="border-t pt-4">
        <button
          onClick={() => setShowMessage(!showMessage)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-2"
        >
          {showMessage ? '− Hide' : '+ Add'} Custom Message
        </button>

        {showMessage && (
          <div className="mt-2">
            <textarea
              value={availability.message}
              onChange={(e) => setAvailability({ ...availability, message: e.target.value })}
              onBlur={() => updateAvailability(availability.status, availability.message)}
              placeholder="e.g., 'Available starting February 2026' or 'Only open to tech brands'"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              rows={2}
              maxLength={150}
            />
            <div className="text-xs text-gray-500 mt-1">
              {availability.message.length}/150 characters
            </div>
          </div>
        )}
      </div>

      {/* Current Status Preview */}
      <div className={`mt-4 p-3 rounded-lg ${currentConfig.bgColor} border ${currentConfig.borderColor}`}>
        <div className="text-xs font-medium text-gray-600 mb-1">Brands will see:</div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${currentConfig.bgColor} ${currentConfig.textColor}`}>
            <Icon className="h-3 w-3" />
            {currentConfig.label}
          </span>
          {availability.message && (
            <span className="text-xs text-gray-600 italic">"{availability.message}"</span>
          )}
        </div>
      </div>
    </div>
  );
}
