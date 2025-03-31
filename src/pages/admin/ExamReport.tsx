import { Button } from '@/components/ui/button';
import api from '@/apis/axiosInterceptor';

export default function ReportButton() {
  const handleCreate = async () => {
    try {
      await api.post('/reports');
      window.alert('Report generated!');
    } catch (error) {
      console.error('Error generating reports:', error);
      window.alert('There was an error generating reports.');
    }
  };

  const handleSend = async () => {
    try {
      await api.post('/reports/send');
      window.alert('Report sent!');
    } catch (error) {
      console.error('Error sending reports:', error);
      window.alert('There was an error generating reports.');
    }
  };

  const handleDownload = async () => {
    const fileUrl = `${import.meta.env.VITE_API_BASE_URL}/files/reports/reports.zip`;

    try {
      const response = await fetch(fileUrl);
      console.log('received response', response);

      // Convert response to a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reports.zip'; // Set the filename
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download the report.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-background p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-primary">Reports</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={handleCreate}
          className="w-full transition-colors hover:bg-primary/90"
        >
          Create Reports
        </Button>
        <Button
          onClick={handleSend}
          variant="outline"
          className="w-full transition-colors text-white bg-indigo-500 hover:bg-fuchsia-500 hover:text-white"
        >
          Send Reports
        </Button>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full transition-colors hover:bg-secondary/80"
        >
          Download Reports
        </Button>
      </div>
    </div>
  );
}
