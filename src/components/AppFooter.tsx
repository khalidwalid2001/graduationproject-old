// src/components/AppFooter.tsx
import "../cssFile/AppFooter.css";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        {/* العمود الأول: اسم المشروع */}
        <div className="app-footer__col app-footer__col--brand">
          <div className="app-footer__project">
            أداة فحص طلبات القروض – CLIMAT ACC
          </div>
          <div className="app-footer__subtitle">
            نموذج أولي لتقييم الأثر المناخي والمالي لطلبات القروض.
          </div>
        </div>

        {/* العمود الثاني: معلومات أكاديمية */}
        <div className="app-footer__col app-footer__col--meta">
          <div className="app-footer__line">
            <span className="app-footer__label">نوع العمل:</span>
            <span>مشروع تخرج أكاديمي (Prototype)</span>
          </div>
          <div className="app-footer__line">
            <span className="app-footer__label">الغرض:</span>
            <span>لأغراض تعليمية وعرض المفهوم فقط، بدون استخدام إنتاجي.</span>
          </div>
        </div>

        {/* العمود الثالث: حقوق / سنة / تقنيات */}
        <div className="app-footer__col app-footer__col--right">
          <div className="app-footer__year">© {year}</div>
          <div className="app-footer__tech">
            Built with <span>React</span> &amp; <span>TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
 