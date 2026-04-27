"use client";
import { useState, useCallback } from "react";
import axios from "axios";
import { formatINR } from "@/lib/carData";

const API = "https://khandelwalneev-cars-price-api.hf.space";

// ─── HARDCODE YOUR OPTIONS HERE ──────────────────────────────
// Fill these with values from your training data
const REGIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
];

const MANUFACTURERS = [
  "Maruti",
  "Hyundai",
  "Honda",
  "Toyota",
  "Tata",
  "Mahindra",
  "Ford",
  "Volkswagen",
  "Skoda",
  "Kia",
  "MG",
  "Renault",
  "Nissan",
  "BMW",
  "Mercedes-Benz",
  "Audi",
];

// Add all models you know your model was trained on
const MODELS_BY_MAKE: Record<string, string[]> = {
  Maruti: [
    "Swift",
    "Dzire",
    "Baleno",
    "Alto",
    "WagonR",
    "Vitara Brezza",
    "Ertiga",
    "Celerio",
  ],
  Hyundai: ["i20", "Creta", "Verna", "i10", "Tucson", "Venue", "Aura"],
  Honda: ["City", "Amaze", "WR-V", "Jazz", "CR-V"],
  Toyota: ["Innova", "Fortuner", "Etios", "Corolla", "Camry"],
  Tata: ["Nexon", "Harrier", "Safari", "Altroz", "Tiago", "Tigor"],
  Mahindra: ["Scorpio", "XUV500", "Bolero", "XUV300", "Thar"],
  Ford: ["EcoSport", "Endeavour", "Figo", "Aspire"],
  Volkswagen: ["Polo", "Vento", "Tiguan", "Taigun"],
  Skoda: ["Octavia", "Superb", "Rapid", "Kushaq"],
  Kia: ["Seltos", "Sonet", "Carnival"],
  MG: ["Hector", "ZS EV", "Astor", "Gloster"],
  Renault: ["Kwid", "Duster", "Triber"],
  Nissan: ["Magnite", "Kicks", "Terrano"],
  BMW: ["3 Series", "5 Series", "X1", "X3", "X5"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLA", "GLC"],
  Audi: ["A4", "A6", "Q3", "Q5", "Q7"],
};

const FUEL_TYPES = ["petrol", "diesel", "cng", "electric", "hybrid"];
const TRANSMISSIONS = ["manual", "automatic"];
const BODY_TYPES = [
  "sedan",
  "hatchback",
  "suv",
  "muv",
  "coupe",
  "convertible",
  "pickup",
];
const DRIVETRAINS = ["fwd", "rwd", "awd", "4wd"];
const SEATS = [2, 4, 5, 6, 7, 8, 9];
const ENGINE_CCS = [
  600, 800, 1000, 1197, 1248, 1298, 1373, 1498, 1497, 1582, 1598, 1799, 1968,
  1991, 2000, 2179, 2198, 2393, 2494, 2755, 2999,
];
const CYLINDERS = [2, 3, 4, 5, 6, 8];
const MAX_POWERS = [
  40, 50, 60, 67, 70, 75, 80, 82, 83, 86, 88, 90, 100, 105, 110, 115, 118, 120,
  130, 140, 148, 150, 160, 163, 170, 180, 184, 190, 197, 200, 220, 245, 252,
  265, 282, 300, 340, 380, 402,
];

// ─────────────────────────────────────────────────────────────

interface BreakdownItem {
  l: string;
  v: number;
  cls: "pos" | "neg" | "neu";
}
interface PredictResult {
  price: number;
  low: number;
  high: number;
  confidence: number;
  breakdown: BreakdownItem[];
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field-row">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Sel({
  value,
  onChange,
  disabled,
  items,
  placeholder = "Select…",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  items: (string | number)[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || items.length === 0}
    >
      <option value="">{placeholder}</option>
      {items.map((i) => (
        <option key={String(i)} value={String(i)}>
          {String(i)}
        </option>
      ))}
    </select>
  );
}

export default function PredictPage() {
  const [region, setRegion] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [fuel, setFuel] = useState("");
  const [engineCC, setEngineCC] = useState("");
  const [cylinders, setCylinders] = useState("");
  const [power, setPower] = useState("");
  const [transmission, setTransmission] = useState("");
  const [body, setBody] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [seats, setSeats] = useState("");
  const [km, setKm] = useState(45000);
  const [age, setAge] = useState(7);

  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const isElectric = fuel === "electric";

  const handleMakeChange = useCallback((v: string) => {
    setMake(v);
    setModel("");
    setFuel("");
    setEngineCC("");
    setCylinders("");
    setPower("");
    setTransmission("");
    setBody("");
    setDrivetrain("");
    setSeats("");
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!region || !make || !fuel) {
      showToast("⚠️ Please fill Region, Manufacturer & Fuel Type");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(`${API}/predict_price`, {
        region,
        manufacturer: make,
        model,
        fuel,
        engine_cc: isElectric ? 0 : Number(engineCC),
        max_power: Number(power),
        cylinders: isElectric ? 0 : Number(cylinders),
        transmission,
        body_type: body,
        drive_train: drivetrain,
        seats: Number(seats),
        km_driven: km,
        age,
      });
      if (data.success) {
        setResult(data.result);
        console.log("Prediction result:", data.result);
      } else {
        showToast("❌ " + data.error);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        showToast("❌ " + err.response.data.error);
      } else {
        showToast("❌ Network or server error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-hero" style={{ paddingBottom: "4rem" }}>
        <div className="container">
          <div
            className="section-badge"
            style={{
              background: "rgba(255,255,255,.12)",
              color: "rgba(255,255,255,.85)",
              marginBottom: "1rem",
            }}
          >
            🤖 AI Powered · India Market
          </div>
          <h1 className="page-hero-title">Predict the Price of Your Car</h1>
          <p className="page-hero-sub">
            Get an instant ₹ market valuation for your used car — accurate,
            free, and India-specific.
          </p>
        </div>
      </div>

      <div className="predict-page-wrap" style={{ paddingTop: "2.5rem" }}>
        <div className="container">
          <div className="predict-inner">
            <div className="predict-form-card">
              <h2>Tell Us About Your Car</h2>
              <form onSubmit={handlePredict}>
                <Field label="Region">
                  <Sel
                    value={region}
                    onChange={setRegion}
                    items={REGIONS}
                    placeholder="Select City / Region"
                  />
                </Field>
                <Field label="Manufacturer">
                  <Sel
                    value={make}
                    onChange={handleMakeChange}
                    items={MANUFACTURERS}
                    placeholder="Select Manufacturer"
                  />
                </Field>
                <Field label="Car Model">
                  <Sel
                    value={model}
                    onChange={setModel}
                    items={make ? (MODELS_BY_MAKE[make] ?? []) : []}
                    placeholder={
                      make ? "Select Model" : "Select manufacturer first"
                    }
                    disabled={!make}
                  />
                </Field>
                <Field label="Fuel Type">
                  <Sel
                    value={fuel}
                    onChange={setFuel}
                    items={FUEL_TYPES}
                    placeholder="Select Fuel Type"
                  />
                </Field>
                {!isElectric && (
                  <>
                    <Field label="Engine CC">
                      <Sel
                        value={engineCC}
                        onChange={setEngineCC}
                        items={ENGINE_CCS}
                        disabled={!fuel}
                      />
                    </Field>
                    <Field label="Cylinders">
                      <Sel
                        value={cylinders}
                        onChange={setCylinders}
                        items={CYLINDERS}
                        disabled={!fuel}
                      />
                    </Field>
                  </>
                )}
                <Field label="Max Power (bhp)">
                  <Sel
                    value={power}
                    onChange={setPower}
                    items={MAX_POWERS}
                    disabled={!fuel}
                  />
                </Field>
                <Field label="Transmission">
                  <Sel
                    value={transmission}
                    onChange={setTransmission}
                    items={TRANSMISSIONS}
                    disabled={!fuel}
                  />
                </Field>
                <Field label="Body Type">
                  <Sel
                    value={body}
                    onChange={setBody}
                    items={BODY_TYPES}
                    disabled={!fuel}
                  />
                </Field>
                <Field label="Drive Train">
                  <Sel
                    value={drivetrain}
                    onChange={setDrivetrain}
                    items={DRIVETRAINS}
                    disabled={!fuel}
                  />
                </Field>
                <Field label="Seats">
                  <Sel
                    value={seats}
                    onChange={setSeats}
                    items={SEATS}
                    disabled={!fuel}
                  />
                </Field>
                <Field label={`KM Driven: ${km.toLocaleString("en-IN")} km`}>
                  <input
                    type="range"
                    min={0}
                    max={300000}
                    step={1000}
                    value={km}
                    onChange={(e) => setKm(Number(e.target.value))}
                  />
                </Field>
                <Field label={`Age: ${age} year${age !== 1 ? "s" : ""}`}>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                  />
                </Field>
                <button
                  type="submit"
                  className="predict-submit-btn"
                  style={{ marginTop: "1.75rem" }}
                  disabled={loading}
                >
                  {loading ? "⏳ Predicting…" : "🤖 Predict Price"}
                </button>
              </form>
            </div>

            <div className="result-card">
              <h3>💡 Price Estimate</h3>
              {!result ? (
                <div className="result-placeholder">
                  <div className="ph-icon">🚗</div>
                  <p>
                    Fill in your car details and click{" "}
                    <strong>Predict Price</strong> to get an instant valuation.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="result-est-label">Estimated Market Value</div>
                  <div className="result-price-big">
                    {formatINR(result.price)}
                  </div>
                  <div className="result-price-range">
                    Range: {formatINR(result.low)} — {formatINR(result.high)}
                  </div>
                  <div
                    className="confidence-bar-wrap"
                    style={{ margin: "1rem 0" }}
                  >
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "#e2e8f0",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${result.confidence}%`,
                          background: "var(--primary, #3b82f6)",
                          borderRadius: 3,
                          transition: "width .6s ease",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: ".8rem",
                        color: "#64748b",
                        marginTop: 4,
                      }}
                    >
                      {result.confidence}% confidence
                    </p>
                  </div>
                  <div className="breakdown-list" style={{ marginTop: "1rem" }}>
                    {(result.breakdown ?? []).map((item, i) => (
                      <div key={i} className="breakdown-item">
                        <span className="bi-label">{item.l}</span>
                        <span className={`bi-val ${item.cls}`}>
                          {item.v >= 0 ? "+" : ""}
                          {formatINR(Math.abs(item.v))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast show">
          <span className="toast-text">{toast}</span>
        </div>
      )}
    </>
  );
}
