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

/**
 * `₹2,313` by default, which is how the list rows write money.
 *
 * The two options are the other two forms the design uses: a headline figure
 * always carries its paise (`₹12,300.00`), and the Insights cards drop the
 * symbol entirely because the card title already says what the number is.
 */
export const getFormattedPrice = (
  price: number,
  options: { symbol?: boolean; decimals?: 0 | 2 } = {},
): string => {
  const { symbol = true, decimals } = options;
  return new Intl.NumberFormat('en-IN', {
    style: symbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: decimals ?? (symbol ? 0 : 2),
    maximumFractionDigits: decimals ?? 2
  }).format(price);
}