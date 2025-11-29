// src/components/AppHeader.tsx
import { useLocation, useNavigate } from "react-router-dom";
import "../cssFile/AppHeader.css";

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current route
  const current = location.pathname;

  const steps = [
    { id: 1, name: "بيانات العميل", path: "/" },
    { id: 2, name: "تقييم الاستدامة", path: "/details" },
    { id: 3, name: "حاسبة القرض", path: "/loan" },
  ];

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <div className="app-header__logo-circle">
            <span>CL</span>
          </div>

          <div className="app-header__brand-text">
            <div className="app-header__title">أداة فحص طلبات القروض</div>
            <div className="app-header__subtitle">
              CLIMAT ACC – WFP Loan Screening Tool
            </div>
          </div>
        </div>

        <div className="app-header__meta">
          <div className="app-header__tag">Graduation Project</div>
          <div className="app-header__status">
            <span className="app-header__status-dot" />
            <span className="app-header__status-text">Prototype v1.0</span>
          </div>
        </div>
      </div>

      {/* Stepper navigation */}
      <div className="app-header__nav-wrapper">
        <nav className="app-header__nav">
          {steps.map((step) => {
            const isActive = current === step.path;

            return (
              <button
                key={step.id}
                onClick={() => navigate(step.path)}
                className={
                  isActive
                    ? "app-header__nav-item app-header__nav-item--active"
                    : "app-header__nav-item"
                }
              >
                <span className="step-number">{step.id}</span>
                {step.name}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
 