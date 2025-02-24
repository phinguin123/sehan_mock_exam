import { Button } from '@/components/ui/button';
import api from '@/apis/axiosInterceptor';

export default function ReportButton() {
  const handleCreateAndSend = async () => {
    try {
      await api.post('/reports');
      window.alert('Report generated!');
    } catch (error) {
      console.error('Error generating reports:', error);
      window.alert('There was an error generating reports.');
    }
  };

  const handleDownload = async () => {
    try {
      // Make a GET request to download the report
      const response = await api.get('/reports', { responseType: 'blob' });

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reports.zip'); // Filename for the download
      document.body.appendChild(link);
      link.click(); // Trigger the click event to download the file

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      window.alert('Report downloaded!');
    } catch (error) {
      console.error('Error downloading reports:', error);
      window.alert('There was an error downloading the reports.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-background p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-primary">Reports</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={handleCreateAndSend}
          className="w-full transition-colors hover:bg-primary/90"
        >
          Create and Send Reports
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
