import { axiosFetch } from "../api/Fetch";
import { toast } from "sonner";

const API_URL_BASE = "/api";

export async function handleExportCSV() {
  try {
    const response = await axiosFetch<Blob>({
      url: `${API_URL_BASE}/dump-csv`,
      method: "GET",
      responseType: "blob",
    });

    if (!response.data) {
      throw new Error("No data received for CSV");
    }

    const blob = new Blob([response.data], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    const toastId = "export-csv-error";
    toast.error("Å nei!", {
      description:
        "Det kan være du ikke har tilgang til denne funksjonaliteten",
      duration: 5000,
      id: toastId,
    });
  }
}
