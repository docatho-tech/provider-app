export const fetchImageFromUri = async (uri : string, fileName : string) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  // Create a File object from the blob
  const file = new File([blob], fileName || 'image.jpg', {
    type: blob.type || 'image/jpeg'
  });
  return file;
};

export const getFormattedDate = (date : Date | string, format : 'DD-MM-YYYY' | 'YYYY-MM-DD' = 'DD-MM-YYYY') => {
  if (!date) return '';

  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'numeric' });
  const year = dateObj.getFullYear();

  switch (format) {
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}-${month}-${year}`;
  } 
}

export const replaceUrlParams = (url : string, params : Record<string, string | number>) => {
  return url.replace(/:(\w+)/g, (match, p1) => params[p1]?.toString() || match);
}

export const DecimalToNumber = (value : string) => {
  return Number(value).toFixed(0);
}

export const getNextPageNumberFromURL = (nextPageURL : string) : number | null => {
  const url = new URL(nextPageURL);
  const page = url.searchParams.get('page');
  return page ? Number(page) : null;
}

export const getFormattedPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
}