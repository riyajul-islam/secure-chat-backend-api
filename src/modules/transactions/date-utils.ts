// বাংলাদেশ সময় (GMT+6) সম্পর্কিত হেল্পার ফাংশন

/**
 * তারিখকে বাংলাদেশ সময়ের শুরু (00:00:00) এবং শেষ (23:59:59) এ কনভার্ট করে UTC তে রিটার্ন করে
 */
export const getBangladeshDateRange = (date: Date): { start: Date; end: Date } => {
  // বাংলাদেশ সময় (GMT+6)
  const BANGIADESH_OFFSET = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  // ইনপুট তারিখকে বাংলাদেশ সময় ধরে নিচ্ছি
  const bangladeshDate = new Date(date);
  
  // বাংলাদেশ সময়ের শুরু (00:00:00)
  const bangladeshStart = new Date(bangladeshDate);
  bangladeshStart.setHours(0, 0, 0, 0);
  
  // বাংলাদেশ সময়ের শেষ (23:59:59.999)
  const bangladeshEnd = new Date(bangladeshDate);
  bangladeshEnd.setHours(23, 59, 59, 999);
  
  // UTC তে কনভার্ট করুন (বাংলাদেশ সময় থেকে 6 ঘন্টা বিয়োগ)
  const utcStart = new Date(bangladeshStart.getTime() - BANGIADESH_OFFSET);
  const utcEnd = new Date(bangladeshEnd.getTime() - BANGIADESH_OFFSET);
  
  return { start: utcStart, end: utcEnd };
};

/**
 * নির্দিষ্ট দিনের সংখ্যা আগে থেকে বাংলাদেশ সময়ের রেঞ্জ বের করে
 */
export const getLastDaysRange = (days: number): { start: Date; end: Date } => {
  const now = new Date();
  
  // বর্তমান বাংলাদেশ সময়
  const bangladeshNow = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  
  // আজকের বাংলাদেশ সময়ের শেষ
  const bangladeshEnd = new Date(bangladeshNow);
  bangladeshEnd.setHours(23, 59, 59, 999);
  
  // 'days' দিন আগের বাংলাদেশ সময়ের শুরু
  const bangladeshStart = new Date(bangladeshNow);
  bangladeshStart.setDate(bangladeshStart.getDate() - days);
  bangladeshStart.setHours(0, 0, 0, 0);
  
  // UTC তে কনভার্ট
  const BANGIADESH_OFFSET = 6 * 60 * 60 * 1000;
  const utcStart = new Date(bangladeshStart.getTime() - BANGIADESH_OFFSET);
  const utcEnd = new Date(bangladeshEnd.getTime() - BANGIADESH_OFFSET);
  
  return { start: utcStart, end: utcEnd };
};

/**
 * তারিখ রেঞ্জ থেকে বাংলাদেশ সময় অনুযায়ী UTC রেঞ্জ বের করে
 */
export const getDateRangeFromStrings = (dateFromStr: string, dateToStr: string): { start: Date; end: Date } => {
  // ইনপুট স্ট্রিং থেকে তারিখ পার্স করুন (ধরে নিচ্ছি YYYY-MM-DD ফরম্যাট)
  const [fromYear, fromMonth, fromDay] = dateFromStr.split('-').map(Number);
  const [toYear, toMonth, toDay] = dateToStr.split('-').map(Number);
  
  // বাংলাদেশ সময়ের শুরু এবং শেষ
  const bangladeshStart = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0));
  const bangladeshEnd = new Date(Date.UTC(toYear, toMonth - 1, toDay, 23, 59, 59, 999));
  
  // UTC তে কনভার্ট (বাংলাদেশ UTC+6, তাই 6 ঘন্টা বিয়োগ)
  const BANGIADESH_OFFSET = 6 * 60 * 60 * 1000;
  const utcStart = new Date(bangladeshStart.getTime() - BANGIADESH_OFFSET);
  const utcEnd = new Date(bangladeshEnd.getTime() - BANGIADESH_OFFSET);
  
  return { start: utcStart, end: utcEnd };
};