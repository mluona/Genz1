export function formatRelativeArabicDate(dateInput: Date | string | undefined): string {
  if (!dateInput) return 'مؤخراً';
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'منذ قليل';

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSecs < 60) {
    return 'منذ ثوانٍ';
  }
  if (diffMins < 60) {
    if (diffMins === 1) return 'منذ دقيقة';
    if (diffMins === 2) return 'منذ دقيقتين';
    if (diffMins >= 3 && diffMins <= 10) return `منذ ${diffMins} دقائق`;
    return `منذ ${diffMins} دقيقة`;
  }
  if (diffHours < 24) {
    if (diffHours === 1) return 'منذ ساعة';
    if (diffHours === 2) return 'منذ ساعتين';
    if (diffHours >= 3 && diffHours <= 10) return `منذ ${diffHours} ساعات`;
    return `منذ ${diffHours} ساعة`;
  }
  if (diffDays < 30) {
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays === 2) return 'منذ يومين';
    if (diffDays >= 3 && diffDays <= 10) return `منذ ${diffDays} أيام`;
    return `منذ ${diffDays} يوماً`;
  }
  if (diffMonths < 12) {
    if (diffMonths === 1) return 'منذ شهر';
    if (diffMonths === 2) return 'منذ شهرين';
    if (diffMonths >= 3 && diffMonths <= 10) return `منذ ${diffMonths} أشهر`;
    return `منذ ${diffMonths} شهراً`;
  }
  if (diffYears === 1) return 'منذ سنة';
  if (diffYears === 2) return 'منذ سنتين';
  if (diffYears >= 3 && diffYears <= 10) return `منذ ${diffYears} سنوات`;
  return `منذ ${diffYears} سنة`;
}
