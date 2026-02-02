import { useState } from 'react';
import api from '../../utils/Api';

const BackupRestore = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const backups = [
    { id: '1', name: 'backup-2026-02-02-10-30.zip', size: '45.2 MB', date: '2026-02-02 10:30:00', type: 'Full' },
    { id: '2', name: 'backup-2026-02-01-10-30.zip', size: '44.8 MB', date: '2026-02-01 10:30:00', type: 'Full' },
    { id: '3', name: 'backup-2026-01-31-10-30.zip', size: '44.5 MB', date: '2026-01-31 10:30:00', type: 'Full' }
  ];

  const handleCreateBackup = async () => {
    if (!confirm('Are you sure you want to create a backup? This may take several minutes.')) return;

    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post('/backup/create');
      setMessage({ type: 'success', text: 'Backup created successfully!' });
      // In a real app, you'd refresh the backup list here
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create backup. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupId: string, filename: string) => {
    try {
      const response = await api.get(`/backup/download/${backupId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Failed to download backup');
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('WARNING: Restoring a backup will overwrite all current data. Are you sure you want to continue?')) return;

    setLoading(true);
    setMessage(null);
    try {
      await api.post(`/backup/restore/${backupId}`);
      setMessage({ type: 'success', text: 'Backup restored successfully! The system will reload.' });
      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to restore backup. Please try again.' });
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) return;

    try {
      await api.delete(`/backup/${backupId}`);
      setMessage({ type: 'success', text: 'Backup deleted successfully!' });
      // In a real app, you'd refresh the backup list here
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete backup.' });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('Uploading and restoring a backup will overwrite all current data. Continue?')) {
      event.target.value = '';
      return;
    }

    setLoading(true);
    setMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('backup', file);

    try {
      await api.post('/backup/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        }
      });
      setMessage({ type: 'success', text: 'Backup uploaded and restored successfully!' });
      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload backup.' });
    } finally {
      setLoading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
        <p className="text-gray-600 mt-2">Manage system backups and restore data</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} border-l-4 rounded-lg p-4`}>
          <div className="flex items-center">
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'} text-xl mr-3`}></i>
            <p className={`${message.type === 'success' ? 'text-green-700' : 'text-red-700'} font-medium`}>{message.text}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-4">
              <i className="fas fa-download text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create Backup</h3>
              <p className="text-sm text-gray-600">Generate a full system backup</p>
            </div>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Backup...
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle mr-2"></i>
                Create New Backup
              </>
            )}
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mr-4">
              <i className="fas fa-upload text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload Backup</h3>
              <p className="text-sm text-gray-600">Upload and restore from file</p>
            </div>
          </div>
          <label className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium cursor-pointer">
            <i className="fas fa-cloud-upload-alt mr-2"></i>
            Select Backup File
            <input
              type="file"
              accept=".zip,.tar.gz"
              onChange={handleFileUpload}
              disabled={loading}
              className="hidden"
            />
          </label>
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backup Schedule Info */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
        <div className="flex items-start">
          <i className="fas fa-info-circle text-blue-500 text-xl mr-3 mt-1"></i>
          <div>
            <h4 className="text-lg font-semibold text-blue-800 mb-2">Automated Backup Schedule</h4>
            <p className="text-sm text-blue-700 mb-2">
              Backups are automatically created daily at 10:30 PM EAT.
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Last 7 days: Daily backups retained</li>
              <li>Last 4 weeks: Weekly backups retained</li>
              <li>Last 12 months: Monthly backups retained</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Available Backups */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="fas fa-history text-gray-600 mr-2"></i>
            Available Backups
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Backup Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className="fas fa-file-archive text-gray-400 mr-3"></i>
                      <span className="text-sm font-medium text-gray-900">{backup.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleDownloadBackup(backup.id, backup.name)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Download"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                    <button
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 disabled:text-gray-400"
                      title="Restore"
                    >
                      <i className="fas fa-undo"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteBackup(backup.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
        <div className="flex items-start">
          <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3 mt-1"></i>
          <div>
            <h4 className="text-lg font-semibold text-red-800 mb-2">Important Warning</h4>
            <p className="text-sm text-red-700 mb-2">
              Restoring a backup will permanently overwrite all current data in the system.
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              <li>Always create a backup before restoring</li>
              <li>Verify backup integrity before restoration</li>
              <li>Notify all users before performing a restore</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
