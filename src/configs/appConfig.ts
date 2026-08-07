export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Cinema Booking",
  apiEndpoint: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",

  pageSizeOptions: [10, 20, 50, 100],
  defaultPageSize: 10,

  defaultDateWithoutSeparators: 'YYYYMMDD',
  defaultDateFormat: 'YYYY-MM-DD',
  defaultDateMonth: 'MM/DD',
  defaultTimeFormat: 'HH:mm',
  defaultMonthFormatForReport: 'YYYYMM',
  defaultMonthFormat: 'MM/YYYY',
  defaultDateTimeFormat: 'YYYY-MM-DD HH:mm',
  defaultDateTimeFormatA: 'YYYY-MM-DD HH:mm A',
  dafaultTimeFormat: 'HH:mm A',
  defaultStringifyFormat: 'YYYY-MM-DDTHH:mm:ss',
  dateMonthYearFormat: 'YYYY-MM-DD',

  defaultListParams: { page: 0, size: 10, sort: 'created_at,desc' },

};
