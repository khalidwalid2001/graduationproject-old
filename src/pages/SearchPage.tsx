import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { people, type Person } from "../mockData";
import  "../../src/cssFile/SearchPage.css";
export default function SearchPage() {
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState("");
  const [searchNationalId, setSearchNationalId] = useState("");

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredOptions = useMemo(() => {
    return people.filter((p) => {
      if (searchName && !p.name.includes(searchName)) return false;
      if (searchNationalId && !p.nationalId.includes(searchNationalId))
        return false;
      return true;
    });
  }, [searchName, searchNationalId]);

  const handleSelect = (id: number) => {
    const found = people.find((p) => p.id === id) || null;
    setSelectedPerson(found);
  };

  const handleNext = () => {
    if (!selectedPerson) return;
    navigate("/details", { state: { person: selectedPerson } });
  };

  return (
    <div className="page page--centered">
      <div className="card search-card">
        <div className="card__header">
          <h1 className="page-title">البحث عن شخص</h1>
        </div>

        {/* Search Fields */}
        <div className="filters-grid">
          <div className="form-field">
            <label className="form-label">البحث بالاسم</label>
            <input
              className="text-input"
              placeholder="اكتب اسم الشخص"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">البحث بالرقم الوطني</label>
            <input
              className="text-input"
              placeholder="1234567890"
              value={searchNationalId}
              onChange={(e) => setSearchNationalId(e.target.value)}
            />
          </div>
        </div>

        {/* Dropdown List */}
        <div className="form-field" style={{ marginTop: 12 }}>
          <label className="form-label">اختر من النتائج</label>
          <select
            className="text-input"
            onChange={(e) => handleSelect(Number(e.target.value))}
          >
            <option value="">-- اختر شخص --</option>
            {filteredOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.nationalId}
              </option>
            ))}
          </select>
        </div>

        {/* Auto-filled Fields after selecting */}
        {selectedPerson && (
          <div className="selected-card">
            <h3>المعلومات المختارة</h3>
            <div className="detail-grid">
              <div><strong>الاسم:</strong> {selectedPerson.name}</div>
              <div><strong>الرقم الوطني:</strong> {selectedPerson.nationalId}</div>
              <div><strong>الجنس:</strong> {selectedPerson.gender}</div>
              <div><strong>العمر:</strong> {selectedPerson.age}</div>
              <div><strong>الشركة:</strong> {selectedPerson.company}</div>
              <div><strong>المحافظة:</strong> {selectedPerson.governorate}</div>
            </div>
          </div>
        )}

        {/* Next Button */}
        <div className="card__footer">
          <button
            className="btn btn-primary"
            disabled={!selectedPerson}
            onClick={handleNext}
          >
            التالي
          </button>
        </div>
      </div>
    </div>
  );
}
 
