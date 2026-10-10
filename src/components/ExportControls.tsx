import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileImage, FileText } from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportControlsProps {
  ganttChartRef: React.RefObject<HTMLDivElement>;
  metricsRef: React.RefObject<HTMLDivElement>;
}

export function ExportControls({ ganttChartRef, metricsRef }: ExportControlsProps) {
  const exportAsImage = async (elementRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (!elementRef.current) {
      toast.error("Nothing to export");
      return;
    }

    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success(`${filename} exported as PNG!`);
    } catch (error) {
      toast.error("Failed to export image");
      console.error(error);
    }
  };

  const exportAsPDF = async () => {
    if (!ganttChartRef.current || !metricsRef.current) {
      toast.error("Nothing to export");
      return;
    }

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      
      // Gantt Chart
      const ganttCanvas = await html2canvas(ganttChartRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const ganttImg = ganttCanvas.toDataURL("image/png");
      const ganttWidth = 280;
      const ganttHeight = (ganttCanvas.height * ganttWidth) / ganttCanvas.width;
      pdf.addImage(ganttImg, "PNG", 10, 10, ganttWidth, ganttHeight);

      // Metrics
      pdf.addPage();
      const metricsCanvas = await html2canvas(metricsRef.current, {
        backgroundColor: "#0f172a",
        scale: 2,
      });
      const metricsImg = metricsCanvas.toDataURL("image/png");
      const metricsWidth = 280;
      const metricsHeight = (metricsCanvas.height * metricsWidth) / metricsCanvas.width;
      pdf.addImage(metricsImg, "PNG", 10, 10, metricsWidth, metricsHeight);

      pdf.save("algovista-report.pdf");
      toast.success("Report exported as PDF!");
    } catch (error) {
      toast.error("Failed to export PDF");
      console.error(error);
    }
  };

  return (
    <Card className="p-4 bg-card/50 backdrop-blur border-border flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Download className="h-4 w-4" />
        <span className="text-sm font-medium">Export:</span>
      </div>
      
      <Button
        onClick={() => exportAsImage(ganttChartRef, "gantt-chart")}
        variant="outline"
        size="sm"
        className="border-border hover:bg-muted/50"
      >
        <FileImage className="h-4 w-4 mr-2" />
        Gantt as PNG
      </Button>

      <Button
        onClick={() => exportAsImage(metricsRef, "metrics")}
        variant="outline"
        size="sm"
        className="border-border hover:bg-muted/50"
      >
        <FileImage className="h-4 w-4 mr-2" />
        Metrics as PNG
      </Button>

      <Button
        onClick={exportAsPDF}
        variant="outline"
        size="sm"
        className="border-border hover:bg-muted/50"
      >
        <FileText className="h-4 w-4 mr-2" />
        Full Report PDF
      </Button>
    </Card>
  );
}
