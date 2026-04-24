"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import carsData from "./All.json";

// ─── TYPES (mirrors cars/page.tsx exactly) ────────────────────────────────────
interface JsonCar {
  car_id: number;
  city: string;
  price: number;
  makeYear: string;
  registrationYear: string;
  make: string;
  model: string;
  fuelType: string;
  KmDriven: number;
  transmission: string;
  bodyType: string;
  no_of_owner: string;
  groundClearance: string;
  bootSpace: string;
  seatingRows: string;
  wheelBase: string;
  length: string;
  FrontTyreSize: string;
  rearTyreSize: string;
  doors: string;
  height: string;
  width: string;
  kerbWeight: string;
  gearBox: string;
  gears: string;
  displacement: string;
  mileageARAI: string;
  maxPower: string;
  maxTorque: string;
  cylinders: string;
  drive: string;
  valveConfig: string;
  turbo: string;
  suspensionFront: string;
  suspensionRear: string;
  steeringAdjType: string;
  steeringAdj: string;
  frontBrake: string | null;
  rearBrake: string | null;
  steeringType: string;
  alloyWheels: string;
  core_rating: number;
  support_rating: number;
  interior_rating: number;
  exterior_rating: number;
  wear_rating: number;
  all_images: string;
  bg_removed_img: string;
  thumbnails: string;
}

interface ApiCar {
  id: string;
  car_id: number;
  make: string;
  model: string;
  make_year: string;
  registration_year: string;
  price: string;
  fuel_type: string;
  transmission: string;
  km_driven: number;
  mileage_arai: string;
  body_type: string;
  city: string;
  thumbnails: string;
  bg_removed_img: string;
  all_images: string;
  cylinders: string;
  displacement: string;
  doors: string;
  drive: string;
  front_tyre_size: string;
  rear_tyre_size: string;
  front_brake: string | null;
  rear_brake: string | null;
  gear_box: string;
  gears: string;
  ground_clearance: string;
  height: string;
  kerb_weight: string;
  length: string;
  max_power: string;
  max_torque: string;
  no_of_owner: string;
  seating_rows: string;
  steering_adj: string;
  steering_adj_type: string;
  steering_type: string;
  suspension_front: string;
  suspension_rear: string;
  turbo: string;
  valve_config: string;
  wheel_base: string;
  width: string;
  boot_space: string;
  alloy_wheels: string;
  core_rating: string;
  exterior_rating: string;
  interior_rating: string;
  wear_rating: string;
  support_rating: string;
}

// ─── MAPPER ───────────────────────────────────────────────────────────────────
function mapJsonCarToApiCar(c: JsonCar, index: number): ApiCar {
  return {
    id: String(c.car_id ?? index),
    car_id: c.car_id,
    make: c.make,
    model: c.model,
    make_year: c.makeYear,
    registration_year: c.registrationYear,
    price: String(c.price),
    fuel_type: c.fuelType,
    transmission: c.transmission,
    km_driven: c.KmDriven,
    mileage_arai: c.mileageARAI,
    body_type: c.bodyType,
    city: c.city,
    thumbnails: c.thumbnails,
    bg_removed_img: c.bg_removed_img,
    all_images: c.all_images,
    cylinders: c.cylinders,
    displacement: c.displacement,
    doors: c.doors,
    drive: c.drive,
    front_tyre_size: c.FrontTyreSize,
    rear_tyre_size: c.rearTyreSize,
    front_brake: c.frontBrake,
    rear_brake: c.rearBrake,
    gear_box: c.gearBox,
    gears: c.gears,
    ground_clearance: c.groundClearance,
    height: c.height,
    kerb_weight: c.kerbWeight,
    length: c.length,
    max_power: c.maxPower,
    max_torque: c.maxTorque,
    no_of_owner: c.no_of_owner,
    seating_rows: c.seatingRows,
    steering_adj: c.steeringAdj,
    steering_adj_type: c.steeringAdjType,
    steering_type: c.steeringType,
    suspension_front: c.suspensionFront,
    suspension_rear: c.suspensionRear,
    turbo: c.turbo,
    valve_config: c.valveConfig,
    wheel_base: c.wheelBase,
    width: c.width,
    boot_space: c.bootSpace,
    alloy_wheels: c.alloyWheels,
    core_rating: String(c.core_rating),
    exterior_rating: String(c.exterior_rating),
    interior_rating: String(c.interior_rating),
    wear_rating: String(c.wear_rating),
    support_rating: String(c.support_rating),
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatINR(val: string | number | null | undefined): string {
  const num = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (!num || isNaN(num)) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function capitalize(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function getFuelIcon(fuelType: string): string {
  const f = (fuelType || "").toLowerCase();
  if (f === "electric") return "EV";
  if (f === "hybrid") return "HY";
  return "ICE";
}

function parseYear(makeYear: string): number {
  if (!makeYear) return 0;
  const parts = makeYear.split("-");
  const yr = parseInt(parts[parts.length - 1]);
  return yr < 100 ? 2000 + yr : yr;
}

// ─── COUNTER HOOK ─────────────────────────────────────────────────────────────
function useCounter(target: number, ref: React.RefObject<Element>) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        let c = 0;
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          c = Math.min(c + step, target);
          setCount(c);
          if (c >= target) clearInterval(timer);
        }, 30);
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, ref]);
  return count;
}

function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useCounter(target, ref as React.RefObject<Element>);
  const display =
    count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
  return <span ref={ref}>{display}</span>;
}

// ─── CAR MODAL (full detail view, same as cars/page.tsx) ─────────────────────
function CarModal({ car, onClose }: { car: ApiCar; onClose: () => void }) {
  const imgList = car.all_images
    ? car.all_images
        .split(",")
        .filter((u) => /\.(jpe?g|png|JPG)$/i.test(u.trim()))
    : [];
  const [activeImg, setActiveImg] = useState(
    car.bg_removed_img || car.thumbnails || "",
  );

  const rows: [string, string][] = [
    ["Front Tyre Size", car.front_tyre_size ?? "—"],
    ["Rear Tyre Size", car.rear_tyre_size ?? "—"],
    ["Km Driven", String(car.km_driven)],
    ["Body Type", capitalize(car.body_type ?? "")],
    ["Boot Space", car.boot_space ?? "—"],
    ["Car ID", String(car.car_id ?? "—")],
    ["City", car.city ?? "—"],
    ["Core Rating", car.core_rating ?? "—"],
    ["Cylinders", car.cylinders ?? "—"],
    ["Displacement", car.displacement ?? "—"],
    ["Doors", car.doors ?? "—"],
    ["Drive", car.drive ?? "—"],
    ["Exterior Rating", car.exterior_rating ?? "—"],
    ["Front Brake", car.front_brake ?? "—"],
    ["Fuel Type", capitalize(car.fuel_type ?? "")],
    ["Gear Box", car.gear_box ?? "—"],
    ["Gears", car.gears ?? "—"],
    ["Ground Clearance", car.ground_clearance ?? "—"],
    ["Height", car.height ?? "—"],
    ["Interior Rating", car.interior_rating ?? "—"],
    ["Kerb Weight", car.kerb_weight ?? "—"],
    ["Length", car.length ?? "—"],
    ["Make", car.make ?? "—"],
    ["Make Year", car.make_year ?? "—"],
    ["Max Power", car.max_power ?? "—"],
    ["Max Torque", car.max_torque ?? "—"],
    ["Mileage (ARAI)", car.mileage_arai ?? "—"],
    ["Model", car.model ?? "—"],
    ["No of Owners", car.no_of_owner ?? "—"],
    ["Price", formatINR(car.price)],
    ["Rear Brake", car.rear_brake ?? "—"],
    ["Registration Year", car.registration_year ?? "—"],
    ["Seating Rows", car.seating_rows ?? "—"],
    ["Steering Adjustment", car.steering_adj ?? "—"],
    ["Steering Adj Type", car.steering_adj_type ?? "—"],
    ["Steering Type", car.steering_type ?? "—"],
    ["Support Rating", car.support_rating ?? "—"],
    ["Suspension Front", car.suspension_front ?? "—"],
    ["Suspension Rear", car.suspension_rear ?? "—"],
    ["Transmission", capitalize(car.transmission ?? "")],
    ["Turbo", car.turbo ?? "—"],
    ["Valve Config", car.valve_config ?? "—"],
    ["Wear Rating", car.wear_rating ?? "—"],
    ["Wheel Base", car.wheel_base ?? "—"],
    ["Width", car.width ?? "—"],
    ["Alloy Wheels", car.alloy_wheels ?? "—"],
  ];

  return (
    <div
      className="modal-overlay open"
      id="carModal"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "carModal") onClose();
      }}
    >
      <div className="modal" style={{ maxWidth: "750px" }}>
        <div className="modal-header">
          <h2>
            {car.make_year} {car.make} {car.model}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {/* Main image */}
          <div className="detail-car-image">
            <img
              src={activeImg || car.thumbnails}
              alt={`${car.make_year} ${car.make} ${car.model}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "var(--radius-lg)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = car.thumbnails;
              }}
            />
          </div>

          {/* Thumbnail strip */}
          {imgList.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {imgList.slice(0, 10).map((url, idx) => (
                <img
                  key={idx}
                  src={url.trim()}
                  alt={`view-${idx}`}
                  onClick={() => setActiveImg(url.trim())}
                  style={{
                    width: 64,
                    height: 48,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    flexShrink: 0,
                    border:
                      activeImg === url.trim()
                        ? "2px solid var(--blue)"
                        : "2px solid transparent",
                    opacity: activeImg === url.trim() ? 1 : 0.6,
                    transition: "all 0.2s",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ))}
            </div>
          )}

          {/* Quick specs */}
          <div className="detail-specs-grid">
            {[
              ["Yr", "Year", car.make_year ?? "—"],
              [
                "KM",
                "KM Driven",
                car.km_driven != null
                  ? `${Math.round(car.km_driven / 1000)}k km`
                  : "—",
              ],
              [
                getFuelIcon(car.fuel_type),
                "Fuel",
                capitalize(car.fuel_type ?? ""),
              ],
              ["AT", "Transmission", capitalize(car.transmission ?? "")],
            ].map(([icon, label, val]) => (
              <div className="detail-spec" key={label}>
                <div className="detail-spec-icon">{icon}</div>
                <div className="detail-spec-label">{label}</div>
                <div className="detail-spec-val">{val}</div>
              </div>
            ))}
          </div>

          {/* Ratings */}
          <div className="detail-features">
            <h4>Ratings</h4>
            <div className="feature-tags">
              {[
                `Core: ${car.core_rating ?? "—"}`,
                `Exterior: ${car.exterior_rating ?? "—"}`,
                `Interior: ${car.interior_rating ?? "—"}`,
                `Wear: ${car.wear_rating ?? "—"}`,
                `Support: ${car.support_rating ?? "—"}`,
              ].map((tag) => (
                <span key={tag} className="feature-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Price + actions */}
          <div className="detail-price-row">
            <div>
              <div
                style={{
                  fontSize: ".8rem",
                  color: "var(--text-light)",
                  marginBottom: ".25rem",
                }}
              >
                Listed Price
              </div>
              <div className="detail-price">{formatINR(car.price)}</div>
            </div>
            <div className="detail-actions">
              <Link href="/booking" className="btn btn-outline btn-sm">
                Test Drive
              </Link>
              <Link href="/booking" className="btn btn-primary">
                Buy Now
              </Link>
            </div>
          </div>

          {/* Full specs table */}
          <div className="full-specs-section">
            <h3 className="full-specs-title">Full Specifications</h3>
            <div className="full-specs-table">
              {rows.map(([k, v]) => (
                <div className="spec-row" key={k}>
                  <span className="spec-key">{k}</span>
                  <span className="spec-val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURED CAR CARD ────────────────────────────────────────────────────────
function FeaturedCarCard({
  car,
  onDetails,
}: {
  car: ApiCar;
  onDetails: (car: ApiCar) => void;
}) {
  return (
    <div className="car-card">
      <div className="car-card-image">
        <img
          src={car.bg_removed_img || car.thumbnails}
          alt={`${car.make_year} ${car.make} ${car.model}`}
          loading="lazy"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            if (el.src !== car.thumbnails) el.src = car.thumbnails;
          }}
        />
        <div className="img-overlay" />
        {car.city && (
          <div className="car-badge-overlay">
            <span className="car-badge badge-certified">{car.city}</span>
          </div>
        )}
      </div>
      <div className="car-card-body">
        <div className="car-category-label">
          {capitalize(car.body_type || "")}
        </div>
        <div className="car-make-model">
          {car.make} {car.model}
        </div>
        <div className="car-specs-row">
          <div className="car-spec-pill">
            <span>
              {(car.fuel_type || "").toLowerCase() === "electric"
                ? "EV"
                : "fuel"}
            </span>
            {capitalize(car.fuel_type || "")}
          </div>
          <div className="car-spec-pill">
            <span>tx</span>
            {capitalize(car.transmission || "")}
          </div>
          <div className="car-spec-pill">
            <span>km</span>
            {car.km_driven != null
              ? `${Math.round(car.km_driven / 1000)}k km`
              : "—"}
          </div>
        </div>
        <div className="car-card-footer">
          <div className="car-price">{formatINR(car.price)}</div>
          <div className="car-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onDetails(car)}
            >
              Details
            </button>
            <Link href="/booking" className="btn btn-primary btn-sm">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [allCars, setAllCars] = useState<ApiCar[]>([]);
  const [modalCar, setModalCar] = useState<ApiCar | null>(null);
  const [herocar, setHeroCar] = useState<ApiCar | null>(null);

  useEffect(() => {
    const raw = Array.isArray(carsData) ? carsData : [carsData];
    const mapped = (raw as JsonCar[]).map((c, i) => mapJsonCarToApiCar(c, i));
    setAllCars(mapped);
    // Hero: pick the car with highest core_rating
    const top = [...mapped].sort(
      (a, b) => parseFloat(b.core_rating) - parseFloat(a.core_rating),
    )[0];
    setHeroCar(top ?? null);
  }, []);

  // Featured: top 6 by core_rating
  const featured = [...allCars]
    .sort((a, b) => parseFloat(b.core_rating) - parseFloat(a.core_rating))
    .slice(0, 6);

  // Unique makes for brands strip
  const uniqueMakes = Array.from(
    new Set(allCars.map((c) => c.make).filter(Boolean)),
  )
    .sort()
    .slice(0, 7);

  const brandIcons: Record<string, string> = {
    BMW: "⚫",
    Mercedes: "⭐",
    Toyota: "🔷",
    Honda: "🔵",
    Audi: "🔶",
    Hyundai: "🟦",
    Ford: "🟥",
    Kia: "🟩",
    Maruti: "🔴",
    Tata: "🟠",
    Mahindra: "🟤",
    Volkswagen: "⬛",
  };

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">⭐ #1 Trusted Used Car Platform</div>
              <h1 className="hero-title">
                Find Your Perfect
                <br />
                <span className="highlight">Dream Car</span>
                <br />
                At Best Price
              </h1>
              <p className="hero-subtitle">
                Explore{" "}
                {allCars.length > 0
                  ? `${allCars.length.toLocaleString()}+`
                  : "2,500+"}{" "}
                certified pre-owned vehicles. Get instant price predictions,
                book a test drive, and drive home today.
              </p>
              <div className="hero-actions">
                <Link href="/cars" className="btn btn-primary btn-lg">
                  Browse Cars →
                </Link>
                <Link href="/predict" className="btn btn-white btn-lg">
                  Predict My Car Price
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-number">
                    {allCars.length > 0
                      ? allCars.length.toLocaleString()
                      : "2,500"}
                    <span style={{ color: "var(--gold-light)" }}>+</span>
                  </div>
                  <div className="hero-stat-label">Cars Available</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">
                    15K<span style={{ color: "var(--gold-light)" }}>+</span>
                  </div>
                  <div className="hero-stat-label">Happy Customers</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-number">
                    98<span style={{ color: "var(--gold-light)" }}>%</span>
                  </div>
                  <div className="hero-stat-label">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Car Card — driven by top-rated JSON car */}
            <div className="hero-visual">
              <div className="hero-car-card">
                <div className="hero-floating-badge">✓ Top Rated</div>
                <div
                  className="hero-car-visual"
                  style={{
                    background: "linear-gradient(135deg,#1e3a5f,#0a192f)",
                  }}
                >
                  {herocar ? (
                    <img
                      src={herocar.bg_removed_img || herocar.thumbnails}
                      alt={`${herocar.make} ${herocar.model}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = herocar.thumbnails;
                      }}
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&h=340&q=85"
                      alt="Featured Car"
                    />
                  )}
                </div>
                <div className="hero-car-info">
                  <div className="hero-car-name">
                    {herocar
                      ? `${herocar.make} ${herocar.model}`
                      : "Toyota Camry XSE"}
                  </div>
                  <div className="hero-car-year">
                    {herocar
                      ? `${herocar.make_year} · ${capitalize(herocar.fuel_type)} · ${capitalize(herocar.transmission)}`
                      : "2022 · Petrol · Automatic"}
                  </div>
                  <div className="hero-car-price">
                    {herocar ? formatINR(herocar.price) : "₹28.50 L"}
                  </div>
                  <div className="hero-car-tags">
                    {herocar ? (
                      <>
                        <span className="hero-car-tag">
                          {herocar.km_driven != null
                            ? `${Math.round(herocar.km_driven / 1000)}k km`
                            : "—"}
                        </span>
                        <span className="hero-car-tag">{herocar.city}</span>
                        <span className="hero-car-tag">
                          {capitalize(herocar.body_type)}
                        </span>
                        <span className="hero-car-tag">
                          ⭐ {herocar.core_rating}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="hero-car-tag">28,000 km</span>
                        <span className="hero-car-tag">Silver</span>
                        <span className="hero-car-tag">Sunroof</span>
                        <span className="hero-car-tag">Backup Cam</span>
                      </>
                    )}
                  </div>
                  {herocar && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "0.75rem", width: "100%" }}
                      onClick={() => setModalCar(herocar)}
                    >
                      View Full Details
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ───────────────────────────────────────────────────────── */}
      <section className="search-section">
        <div className="container">
          <div className="search-wrapper">
            <form
              className="search-bar"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = "/cars";
              }}
            >
              <div className="search-field">
                <label data-icon="📍">Make</label>
                <select id="s-make">
                  <option value="">Any Make</option>
                  {uniqueMakes.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="search-field">
                <label data-icon="🚗">Model</label>
                <select id="s-model">
                  <option value="">Any Model</option>
                  {Array.from(
                    new Set(allCars.map((c) => c.model).filter(Boolean)),
                  )
                    .sort()
                    .slice(0, 20)
                    .map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                </select>
              </div>
              <div className="search-field">
                <label data-icon="💰">Max Budget</label>
                <input
                  type="number"
                  id="s-price"
                  placeholder="e.g. 30,00,000"
                />
              </div>
              <div className="search-field">
                <label data-icon="📅">Year</label>
                <select id="s-year">
                  <option value="">Any Year</option>
                  {Array.from(
                    new Set(allCars.map((c) => c.make_year).filter(Boolean)),
                  )
                    .sort()
                    .reverse()
                    .slice(0, 10)
                    .map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                </select>
              </div>
              <div className="search-btn-wrap">
                <button type="submit">🔍 Search Cars</button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── BRANDS ───────────────────────────────────────────────────────── */}
      <section className="brands-strip">
        <div className="container">
          <div className="brands-title">Trusted Brands Available</div>
          <div className="brands-row">
            {uniqueMakes.map((name) => (
              <div className="brand-item" key={name}>
                <span className="brand-icon">{brandIcons[name] ?? "🚘"}</span>{" "}
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            {[
              { target: allCars.length || 2500, label: "Cars in Stock" },
              { target: 15000, label: "Happy Customers" },
              { target: uniqueMakes.length || 50, label: "Brands Available" },
              { target: 12, label: "Years Experience", noPlus: true },
            ].map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-number" data-target={s.target}>
                  <Counter target={s.target} />
                  {!s.noPlus && <span className="stat-plus">+</span>}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CARS ────────────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">🚗 Featured Cars</div>
            <h2 className="section-title">Handpicked for You</h2>
            <p className="section-subtitle">
              Top-rated vehicles from our inventory, thoroughly inspected and
              ready to drive.
            </p>
          </div>
          {featured.length === 0 ? (
            <div className="cars-grid">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="car-card"
                  style={{
                    opacity: 0.4,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                >
                  <div
                    style={{
                      height: 200,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 12,
                    }}
                  />
                  <div style={{ padding: "1rem" }}>
                    <div
                      style={{
                        height: 14,
                        background: "rgba(255,255,255,0.07)",
                        borderRadius: 6,
                        marginBottom: "0.5rem",
                        width: "60%",
                      }}
                    />
                    <div
                      style={{
                        height: 18,
                        background: "rgba(255,255,255,0.07)",
                        borderRadius: 6,
                        width: "80%",
                      }}
                    />
                  </div>
                  <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.2} }`}</style>
                </div>
              ))}
            </div>
          ) : (
            <div className="cars-grid">
              {featured.map((car) => (
                <FeaturedCarCard
                  key={car.id}
                  car={car}
                  onDetails={setModalCar}
                />
              ))}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/cars" className="btn btn-outline btn-lg">
              View All{" "}
              {allCars.length > 0
                ? `${allCars.length.toLocaleString()}+`
                : "2,500+"}{" "}
              Cars →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">✨ Why AutoDrive</div>
            <h2 className="section-title">Everything You Need in One Place</h2>
            <p className="section-subtitle">
              From browsing to buying, we&#39;ve made every step simple, safe,
              and transparent.
            </p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: "🔍",
                title: "AI Price Predictor",
                desc: "Get an instant, accurate estimate for your current car's market value using our intelligent pricing algorithm.",
                link: "/predict",
                linkText: "Try it now →",
              },
              {
                icon: "🚦",
                title: "Book a Test Drive",
                desc: "Schedule a test drive online in minutes. Choose your date, time, and location — we'll handle the rest.",
                link: "/booking",
                linkText: "Book now →",
                gold: true,
              },
              {
                icon: "✅",
                title: "Certified & Inspected",
                desc: "Every car goes through a 150-point inspection. Full service history, no hidden surprises.",
                link: "/cars",
                linkText: "Browse certified →",
                green: true,
              },
              {
                icon: "💳",
                title: "Easy Financing",
                desc: "Flexible payment plans and financing options. Get pre-approved in minutes without affecting your credit score.",
                link: "#",
                linkText: "Calculate EMI →",
              },
              {
                icon: "🛡️",
                title: "Vehicle Warranty",
                desc: "All certified cars come with a 12-month warranty and 30-day return guarantee for peace of mind.",
                link: "#",
                linkText: "Learn more →",
                gold: true,
              },
              {
                icon: "📱",
                title: "Reserve Online",
                desc: "Secure your desired car with a small refundable deposit. Fully online, no paperwork required.",
                link: "/booking",
                linkText: "Reserve now →",
                green: true,
              },
            ].map((f) => (
              <div className="feature-card" key={f.title}>
                <div
                  className={`feature-icon${f.gold ? " gold" : f.green ? " green" : ""}`}
                >
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link href={f.link} className="feature-link">
                  {f.linkText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--primary)" }}>
        <div className="container">
          <div className="section-header">
            <div
              className="section-badge"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                borderColor: "rgba(255,255,255,0.1)",
              }}
            >
              🗺️ How It Works
            </div>
            <h2 className="section-title" style={{ color: "white" }}>
              Drive Home in 4 Easy Steps
            </h2>
            <p
              className="section-subtitle"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              The fastest, most transparent car buying experience — entirely
              online.
            </p>
          </div>
          <div className="grid-4" style={{ marginTop: "3rem" }}>
            {[
              {
                icon: "🔍",
                step: "Step 01",
                title: "Browse & Choose",
                desc: "Filter by make, model, year, and budget to find your perfect match.",
                bg: "rgba(37,99,235,0.2)",
                border: "rgba(37,99,235,0.4)",
              },
              {
                icon: "📅",
                step: "Step 02",
                title: "Book Test Drive",
                desc: "Schedule a test drive at our showroom or your location — your choice.",
                bg: "rgba(245,158,11,0.15)",
                border: "rgba(245,158,11,0.3)",
              },
              {
                icon: "💰",
                step: "Step 03",
                title: "Get Financed",
                desc: "Choose your payment plan, trade in your old car, and finalize the deal.",
                bg: "rgba(16,185,129,0.15)",
                border: "rgba(16,185,129,0.3)",
              },
              {
                icon: "🔑",
                step: "Step 04",
                title: "Drive Home",
                desc: "We'll deliver your car or you can pick it up. Enjoy your new ride!",
                bg: "rgba(99,102,241,0.15)",
                border: "rgba(99,102,241,0.3)",
              },
            ].map((s) => (
              <div key={s.step} style={{ textAlign: "center", color: "white" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    background: s.bg,
                    border: `2px solid ${s.border}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "0 auto 1.25rem",
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--gold-light)",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: ".5rem",
                  }}
                >
                  {s.step}
                </div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: ".6rem",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: ".88rem",
                    color: "rgba(255,255,255,.5)",
                    lineHeight: 1.7,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">💬 Testimonials</div>
            <h2 className="section-title">What Our Customers Say</h2>
          </div>
          <div className="testimonials-grid">
            {[
              {
                stars: "★★★★★",
                text: '"The price predictor was spot-on! Got ₹2,00,000 more than I expected for my old Honda. The entire process was smooth and transparent."',
                name: "Ahmad Hassan",
                role: "Bought a Toyota Camry",
                avatarBg: "#dbeafe",
                avatarColor: "#1d4ed8",
                avatar: "👨",
              },
              {
                stars: "★★★★★",
                text: '"Booked a test drive in 2 minutes. The car was exactly as described — no hidden issues. Drove it home the same day. Highly recommended!"',
                name: "Sarah Al-Rashid",
                role: "Bought a BMW 3 Series",
                avatarBg: "#dcfce7",
                avatarColor: "#15803d",
                avatar: "👩",
              },
              {
                stars: "★★★★☆",
                text: '"Best car buying experience ever. The financing was easy and the team was super helpful. Got a great deal on a certified Hyundai Elantra."',
                name: "Omar Khalid",
                role: "Bought a Hyundai Elantra",
                avatarBg: "#fef3c7",
                avatarColor: "#b45309",
                avatar: "🧑",
              },
            ].map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">{t.stars}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div
                    className="testimonial-avatar"
                    style={{ background: t.avatarBg, color: t.avatarColor }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Find Your Next Car?</h2>
          <p>
            Join 15,000+ happy customers who found their dream car on AutoDrive.
          </p>
          <div className="cta-actions">
            <Link href="/cars" className="btn btn-gold btn-lg">
              Browse Cars Now
            </Link>
            <Link href="/predict" className="btn btn-white btn-lg">
              Predict My Car Value
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link
                href="/"
                className="nav-logo"
                style={{ marginBottom: ".5rem" }}
              >
                <div className="nav-logo-icon">🚗</div>
                <span className="nav-logo-text">
                  Auto<span>Drive</span>
                </span>
              </Link>
              <p>
                Your trusted marketplace for premium certified pre-owned
                vehicles. Transparent, fast, and hassle-free.
              </p>
              <div className="footer-social">
                <a href="#" className="social-btn">
                  f
                </a>
                <a href="#" className="social-btn">
                  in
                </a>
                <a href="#" className="social-btn">
                  tw
                </a>
                <a href="#" className="social-btn">
                  yt
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Browse</h4>
              <div className="footer-links">
                {[
                  "All Cars",
                  "Certified Cars",
                  "SUVs & Trucks",
                  "Sedans",
                  "Electric Cars",
                ].map((l) => (
                  <Link key={l} href="/cars" className="footer-link">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <div className="footer-links">
                <Link href="/predict" className="footer-link">
                  Price Predictor
                </Link>
                <Link href="/booking" className="footer-link">
                  Test Drive
                </Link>
                <Link href="/booking" className="footer-link">
                  Car Reservation
                </Link>
                <a href="#" className="footer-link">
                  EMI Calculator
                </a>
                <a href="#" className="footer-link">
                  Car Inspection
                </a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <div className="footer-links">
                <a href="#about" className="footer-link">
                  About Us
                </a>
                <a href="#" className="footer-link">
                  Careers
                </a>
                <a href="#" className="footer-link">
                  Contact
                </a>
                <a href="#" className="footer-link">
                  Privacy Policy
                </a>
                <a href="#" className="footer-link">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div>© 2026 AutoDrive. All rights reserved.</div>
            <div>
              📍 123 Auto Plaza, Downtown · 📞 +1 (800) AUTO-DRV · ✉️
              hello@autodrive.com
            </div>
          </div>
        </div>
      </footer>

      {/* ── CAR DETAIL MODAL ─────────────────────────────────────────────── */}
      {modalCar && (
        <CarModal car={modalCar} onClose={() => setModalCar(null)} />
      )}
    </>
  );
}
