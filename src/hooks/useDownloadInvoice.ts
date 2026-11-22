import { API_ENDPOINTS } from "@/constants/APIEndpoints";
import { replaceUrlParams } from "@/utils/base";
import useDownloadFile from "./useDownloadFile";

/** The order invoice PDF — the auth/save/share dance lives in useDownloadFile. */
const useDownloadInvoice = () => {
  const { downloadFile, isDownloading } = useDownloadFile();

  const downloadInvoice = (orderId: number | string, orderNumber?: string) =>
    downloadFile({
      endpoint: replaceUrlParams(API_ENDPOINTS.ORDER_INVOICE, { orderId }),
      fileName: `invoice-${orderNumber || orderId}.pdf`,
      mimeType: "application/pdf",
      dialogTitle: "Invoice",
      UTI: "com.adobe.pdf",
    });

  return { downloadInvoice, isDownloading };
};

export default useDownloadInvoice;
